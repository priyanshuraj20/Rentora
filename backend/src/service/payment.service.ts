import { Booking } from "../models/booking.model";
import { Payment } from "../models/payment.model";
import { User } from "../models/user.model";
import { AppError } from "../utils/AppError";
import { createNotificationService } from "./notification.service";
import { inspectReturnDamageService } from "./ai.service";
import { IPaymentProvider } from "../payments/interfaces/paymentProvider.interface";
import { RazorpayPaymentProvider } from "../payments/providers/razorpay.provider";
import logger from "../config/logger";
import mongoose from "mongoose";

/**
 * Application Payment Service orchestrating database state transitions & notifications.
 * Depends on IPaymentProvider abstraction (Dependency Inversion Principle - DIP).
 */
export class PaymentService {
  constructor(
    private readonly paymentProvider: IPaymentProvider = new RazorpayPaymentProvider(),
  ) {}

  async createOrder(bookingId: string, renterId: string) {
    if (!mongoose.Types.ObjectId.isValid(bookingId)) {
      throw new AppError("Invalid booking ID format", 400);
    }
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      throw new AppError("Booking not found", 404);
    }

    if (booking.renter_id.toString() !== renterId) {
      throw new AppError("Forbidden: You do not own this booking", 403);
    }

    // Initial payment to confirm booking locks the Refundable Security Deposit in Platform Escrow.
    // If the item requires 0 deposit, charge the rental fee.
    const depositAmount = booking.pricing?.securityDeposit || 0;
    const orderAmount = depositAmount > 0 ? depositAmount : (booking.pricing?.totalAmount || 0);

    const orderResult = await this.paymentProvider.createOrder({
      bookingId: booking._id.toString(),
      amount: orderAmount,
      currency: "INR",
    });

    await Payment.create({
      booking_id: booking._id,
      renter_id: booking.renter_id,
      owner_id: booking.owner_id,
      amount: orderAmount,
      currency: orderResult.currency,
      paymentMethod: "card",
      transactionId: orderResult.orderId,
      paymentStatus: "initiated",
    });

    return orderResult;
  }

  async verifyPayment(
    renterId: string,
    data: {
      bookingId: string;
      orderId: string;
      paymentId: string;
      signature: string;
    },
  ) {
    const isValid = await this.paymentProvider.verifyPayment({
      orderId: data.orderId,
      paymentId: data.paymentId,
      signature: data.signature,
    });

    if (!isValid) {
      await createNotificationService({
        userId: renterId,
        title: "Payment Verification Failed ⚠️",
        message: "Payment verification failed for your booking. Please try again.",
        type: "payment_failed",
        link: `/rentals/${data.bookingId}`,
      });
      throw new AppError("Invalid payment signature verification failed", 400);
    }

    if (!mongoose.Types.ObjectId.isValid(data.bookingId)) {
      throw new AppError("Invalid booking ID format", 400);
    }

    const booking = await Booking.findById(data.bookingId);
    if (!booking) {
      throw new AppError("Booking not found", 404);
    }

    if (booking.payment_status === "paid") {
      return { success: true, message: "Payment already verified" };
    }

    const payment = await Payment.findOne({ booking_id: data.bookingId });
    if (!payment || payment.transactionId !== data.orderId) {
      throw new AppError("Payment order does not match this booking", 403);
    }

    if (booking.renter_id.toString() !== renterId) {
      throw new AppError("Forbidden: You do not own this booking", 403);
    }

    booking.payment_status = "paid";
    booking.booking_status = "confirmed";
    await booking.save();

    await Payment.findOneAndUpdate(
      { booking_id: booking._id },
      {
        paymentStatus: "success",
        transactionId: data.paymentId,
        paidAt: new Date(),
      },
      { new: true },
    );

    // Trigger Notifications
    const verifiedAmount = payment.amount || booking.pricing.securityDeposit || booking.pricing.totalAmount;
    await createNotificationService({
      userId: booking.owner_id.toString(),
      title: "Security Deposit Escrow Locked 🛡️",
      message: `Security Deposit of ₹${verifiedAmount} has been locked in Platform Escrow by renter. Booking is now CONFIRMED!`,
      type: "payment_success",
      link: `/bookings`,
    });

    await createNotificationService({
      userId: renterId,
      title: "Escrow Deposit Secured 🎉",
      message: `Your refundable security deposit of ₹${verifiedAmount} is safely locked in Platform Escrow. Booking is CONFIRMED!`,
      type: "payment_success",
      link: `/rentals`,
    });

    return { success: true, message: "Payment verified successfully" };
  }

  async settleDeposit(bookingId: string, _actorUserId?: string) {
    if (!mongoose.Types.ObjectId.isValid(bookingId)) {
      throw new AppError("Invalid booking ID format", 400);
    }
    const booking = await Booking.findById(bookingId).populate<{ item_id: { title: string } }>("item_id", "title");
    if (!booking) {
      throw new AppError("Booking not found", 404);
    }

    if (booking.depositSettlement?.status === "settled") {
      return {
        success: true,
        message: "Security deposit already settled",
        settlement: booking.depositSettlement,
        damageReport: booking.damageReport,
      };
    }

    const totalDeposit = booking.pricing?.securityDeposit || 0;
    const itemTitle = booking.item_id?.title || "Rental Item";

    // 1. Run AI Damage Inspection comparing handover vs return photos
    const inspection = await inspectReturnDamageService(
      (booking.handoverPhotos || []).map((p: any) => p.url),
      (booking.returnPhotos || []).map((p: any) => p.url),
      itemTitle,
      totalDeposit
    );

    const repairCost = inspection.estimatedRepairCost;
    const refundAmount = Math.max(0, totalDeposit - repairCost);
    const ownerCompensation = repairCost;

    // 2. Fetch original Razorpay payment transaction
    const payment = await Payment.findOne({ booking_id: booking._id, paymentStatus: "success" });
    let refundId = `rfnd_auto_${Date.now()}`;

    if (refundAmount > 0 && payment?.transactionId) {
      try {
        const refundRes = await this.paymentProvider.refundPayment({
          paymentId: payment.transactionId,
          amount: refundAmount,
        });
        refundId = refundRes.refundId;
      } catch (err: any) {
        logger.warn("Refund execution error", { error: err.message });
      }
    }

    // 3. Compensate Owner: Rental Fee + any Repair Cost (from deposit)
    const rentalEarnings = booking.pricing?.ownerEarning || booking.pricing?.baseRate || 0;
    const totalOwnerPayout = rentalEarnings + ownerCompensation;

    if (totalOwnerPayout > 0) {
      await User.findByIdAndUpdate(booking.owner_id, {
        $inc: {
          walletBalance: totalOwnerPayout,
          "owner.totalEarnings": totalOwnerPayout,
        },
      });
    }

    // 4. Autonomous Risk Guard Trigger:
    // If Tier 3 severe damage (total loss / broken item), automatically suspend renter!
    let renterSuspended = false;
    if (inspection.tier === "TIER_3") {
      await User.findByIdAndUpdate(booking.renter_id, {
        isBlocked: true,
      });
      renterSuspended = true;

      await createNotificationService({
        userId: booking.renter_id.toString(),
        title: "Account Suspended by AI Risk Guard 🚨",
        message: "Your account has been automatically suspended due to severe item damage (Tier 3 Total Loss).",
        type: "general",
      });
    }

    // 5. Update booking with damageReport and depositSettlement
    const settlementData = {
      totalDeposit,
      repairDeduction: repairCost,
      refundedToRenter: refundAmount,
      compensatedToOwner: ownerCompensation,
      razorpayRefundId: refundId,
      settledAt: new Date(),
      status: "settled" as const,
    };

    booking.damageReport = {
      tier: inspection.tier,
      severity: inspection.severity,
      summary: inspection.summary,
      findings: inspection.findings,
      estimatedRepairCost: repairCost,
      inspectedAt: new Date(),
      aiInspected: inspection.aiInspected,
    };
    booking.depositSettlement = settlementData;
    await booking.save();

    // 6. Send notifications to Renter and Owner
    await createNotificationService({
      userId: booking.renter_id.toString(),
      title: "Security Deposit Settled 💳",
      message:
        refundAmount > 0
          ? `₹${refundAmount} refunded to your account (Repair deduction: ₹${repairCost}).`
          : `Security deposit of ₹${totalDeposit} was deducted for damages.`,
      type: "payment_success",
      link: `/rentals/${bookingId}`,
    });

    await createNotificationService({
      userId: booking.owner_id.toString(),
      title: "Security Deposit Escrow Released 🛡️",
      message:
        ownerCompensation > 0
          ? `₹${ownerCompensation} repair compensation credited to your wallet.`
          : `Deposit escrow released to renter following clean return inspection.`,
      type: "payment_success",
      link: `/bookings`,
    });

    return {
      success: true,
      message: "Security deposit settled successfully",
      settlement: settlementData,
      damageReport: booking.damageReport,
      renterSuspended,
    };
  }
}

export const defaultPaymentService = new PaymentService();

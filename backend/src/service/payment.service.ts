import { Booking } from "../models/booking.model";
import { Payment } from "../models/payment.model";
import { AppError } from "../utils/AppError";
import { createNotificationService } from "./notification.service";
import { IPaymentProvider } from "../payments/interfaces/paymentProvider.interface";
import { RazorpayPaymentProvider } from "../payments/providers/razorpay.provider";

/**
 * Application Payment Service orchestrating database state transitions & notifications.
 * Depends on IPaymentProvider abstraction (Dependency Inversion Principle - DIP).
 */
export class PaymentService {
  constructor(
    private readonly paymentProvider: IPaymentProvider = new RazorpayPaymentProvider(),
  ) {}

  async createOrder(bookingId: string, renterId: string) {
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      throw new AppError("Booking not found", 404);
    }

    if (booking.renter_id.toString() !== renterId) {
      throw new AppError("Forbidden: You do not own this booking", 403);
    }

    const orderResult = await this.paymentProvider.createOrder({
      bookingId: booking._id.toString(),
      amount: booking.pricing.totalAmount,
      currency: "INR",
    });

    await Payment.create({
      booking_id: booking._id,
      renter_id: booking.renter_id,
      owner_id: booking.owner_id,
      amount: booking.pricing.totalAmount,
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
    await createNotificationService({
      userId: booking.owner_id.toString(),
      title: "Payment Received 💳",
      message: `Payment of ₹${booking.pricing.totalAmount} completed for booking.`,
      type: "payment_success",
      link: `/bookings`,
    });

    await createNotificationService({
      userId: renterId,
      title: "Payment Successful 🎉",
      message: `Your payment of ₹${booking.pricing.totalAmount} for booking was successful.`,
      type: "payment_success",
      link: `/rentals`,
    });

    return { success: true, message: "Payment verified successfully" };
  }
}

export const defaultPaymentService = new PaymentService();

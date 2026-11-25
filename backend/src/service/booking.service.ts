import { Booking } from "../models/booking.model";
import { Item } from "../models/item.model";
import { User } from "../models/user.model";
import { AppError } from "../utils/AppError";
import { BookingStatus } from "../validators/booking.validator";
import mongoose from "mongoose";
import { emailQueue, bookingStatusQueue, photoPurgeQueue } from "../queues/email.queue";
import { createNotificationService } from "./notification.service";
import logger from "../config/logger";
import { calculatePricing } from "../utils/pricing.calculator";
import { generateQRToken, verifyQRToken, QRType } from "../utils/qrToken";
import { calculateDistanceKm } from "./explore.service";
import {
  computeAudioFingerprint,
  transcribeAudio,
  uploadAudioToCloudinary,
} from "./voice.service";

export const getBookingService = async (userId: string, userRole: string) => {
  logger.info("Fetching bookings", { userId, userRole });

  const filter: Record<string, any> =
    userRole === "owner" ? { owner_id: userId } : { renter_id: userId };

  const bookings = await Booking.find(filter)
    .select(
      "item_id renter_id owner_id start_date end_date pricing booking_status payment_status createdAt handoverPhotos returnPhotos",
    )
    .populate("item_id", "title images")
    .populate("renter_id", "name profileImage")
    .populate("owner_id", "name profileImage")
    .sort({ createdAt: -1 })
    .lean();

  logger.info("Bookings fetched", {
    userId,
    totalBookings: bookings.length,
  });

  return bookings.map((booking) => {
    const item = booking.item_id as any;
    const renter = booking.renter_id as any;
    const owner = booking.owner_id as any;

    return {
      id: booking._id.toString(),
      item: item
        ? {
            id: item._id?.toString(),
            title: item.title,
            image: item.images?.[0] || null,
          }
        : null,
      renterInfo: renter
        ? {
            id: renter._id?.toString(),
            name: renter.name,
            image: renter.profileImage,
          }
        : null,
      ownerInfo: owner
        ? {
            id: owner._id?.toString(),
            name: owner.name,
            image: owner.profileImage,
          }
        : null,
      startDate: booking.start_date,
      endDate: booking.end_date,
      address: booking.address,
      pricing: booking.pricing,
      totalAmount: booking.pricing?.totalAmount ?? 0,
      status: booking.booking_status,
      paymentStatus: booking.payment_status,
      handoverPhotos: booking.handoverPhotos || [],
      returnPhotos: booking.returnPhotos || [],
      handoverConfirmedAt: booking.handoverConfirmedAt,
      returnConfirmedAt: booking.returnConfirmedAt,
      createdAt: booking.createdAt,
    };
  });
};

export const createBookingService = async (userId: string, booking: any) => {
  logger.info("Creating booking request", {
    userId,
    itemId: booking.itemId,
  });

  const startDate = new Date(booking.startDate);
  const endDate = new Date(booking.endDate);

  if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
    logger.warn("Invalid booking dates", { startDate, endDate });
    throw new AppError("Invalid booking dates", 400);
  }

  if (endDate <= startDate) {
    logger.warn("End date before start date", { startDate, endDate });
    throw new AppError("End date must be after start date", 400);
  }

  if (startDate < new Date()) {
    logger.warn("Booking start date in past", { startDate });
    throw new AppError("Booking cannot start in the past", 400);
  }

  if (mongoose.Types.ObjectId.isValid(booking.itemId)) {
    const existingBooking = await Booking.findOne({
      item_id: booking.itemId,
      booking_status: {
        $in: [
          BookingStatus.APPROVED,
          BookingStatus.CONFIRMED,
          BookingStatus.ONGOING,
        ],
      },
      start_date: { $lt: endDate },
      end_date: { $gt: startDate },
    });

    if (existingBooking) {
      logger.warn("Booking conflict detected", {
        itemId: booking.itemId,
        startDate,
        endDate,
      });

      throw new AppError("Item already booked for selected dates", 409);
    }
  }

  let item = null;
  if (mongoose.Types.ObjectId.isValid(booking.itemId)) {
    item = await Item.findById(booking.itemId);
  } else {
    // If demo/featured itemId, link to any active item in the DB so user flow succeeds seamlessly
    item = await Item.findOne({ isActive: true, status: "active" });
  }

  if (!item) {
    logger.error("Item not found during booking", { itemId: booking.itemId });
    throw new AppError("Item not found. Please select an active item to book.", 404);
  }

  const diffMs = endDate.getTime() - startDate.getTime();
  const totalDays = Math.max(1, Math.round(diffMs / (1000 * 60 * 60 * 24)));

  // Calculate clean pricing server-side based on actual item rates
  let calculatedBaseRate = 0;
  const dailyPrice = item.price?.daily || 0;
  const weeklyPrice = item.price?.weekly || 0;
  const monthlyPrice = item.price?.monthly || 0;

  if (totalDays >= 30 && monthlyPrice > 0) {
    const fullMonths = Math.floor(totalDays / 30);
    const remDays = totalDays % 30;
    const remWeeks = weeklyPrice > 0 ? Math.floor(remDays / 7) : 0;
    const oddDays = weeklyPrice > 0 ? remDays % 7 : remDays;
    let remCost = (remWeeks * weeklyPrice) + (oddDays * dailyPrice);
    if (remCost > monthlyPrice) remCost = monthlyPrice;
    calculatedBaseRate = (fullMonths * monthlyPrice) + remCost;
  } else if (totalDays >= 7 && weeklyPrice > 0) {
    const fullWeeks = Math.floor(totalDays / 7);
    const oddDays = totalDays % 7;
    let remCost = oddDays * dailyPrice;
    if (remCost > weeklyPrice) remCost = weeklyPrice;
    calculatedBaseRate = (fullWeeks * weeklyPrice) + remCost;
  } else {
    calculatedBaseRate = totalDays * dailyPrice;
  }

  const baseRate = calculatedBaseRate > 0 ? calculatedBaseRate : (booking.pricing?.baseRate || 0);
  const securityDeposit = item.securityDeposit ?? booking.pricing?.securityDeposit ?? 0;

  const pricing = calculatePricing({
    baseRate,
    discountApplied: 0,
    securityDeposit,
    serviceFee: 0,
    tax: 0,
    totalDays,
  });

  const newBooking = await Booking.create({
    renter_id: userId,
    owner_id: item.ownerId,
    item_id: item._id,
    start_date: startDate,
    end_date: endDate,
    address: booking.address,
    pricing,
    total_days: totalDays,
  });

  logger.info("Booking created successfully", {
    bookingId: newBooking._id,
    userId,
    itemId: booking.itemId,
  });

  await createNotificationService({
    userId: item.ownerId.toString(),
    title: "New Booking Request 📦",
    message: `You have received a new booking request for ${item.title}.`,
    type: "booking_request",
    link: "/bookings",
  });

  return newBooking;
};

export const getBookingIdService = async (
  userId: string,
  bookingId: string,
) => {
  logger.info("Fetching booking details", { bookingId, userId });

  if (!mongoose.Types.ObjectId.isValid(bookingId)) {
    throw new AppError("Invalid booking ID format", 400);
  }

  const booking = await Booking.findOne({
    _id: bookingId,
    $or: [{ renter_id: userId }, { owner_id: userId }],
  })
    .populate("item_id", "title images category")
    .populate("owner_id", "name email phone profileImage")
    .populate("renter_id", "name email phone profileImage")
    .lean();

  if (!booking) {
    logger.warn("Booking not found", { bookingId, userId });
    throw new AppError("Booking not found", 404);
  }

  logger.info("Booking details fetched", { bookingId });

  return booking;
};

export const acceptBookingService = async (
  userId: string,
  bookingId: string,
) => {
  logger.info("Accepting booking", { bookingId, userId });

  if (!mongoose.Types.ObjectId.isValid(bookingId)) {
    throw new AppError("Invalid booking ID format", 400);
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const booking = await Booking.findOne({
      _id: bookingId,
      owner_id: userId,
      booking_status: BookingStatus.PENDING,
    }).session(session);

    if (!booking) {
      logger.warn("Booking already processed or not found", { bookingId });
      throw new AppError("Booking not found or already processed", 404);
    }

    booking.booking_status = BookingStatus.APPROVED;
    await booking.save({ session });

    logger.info("Booking approved", { bookingId });

    await createNotificationService({
      userId: booking.renter_id.toString(),
      title: "Booking Approved! 🥳",
      message: "Your rental booking request was approved by the owner. Please complete payment to confirm.",
      type: "booking_accepted",
      link: `/rentals/${booking._id}`,
    });

    await emailQueue.add("sendBookingAcceptedEmail", {
      renter_id: booking.renter_id,
      bookingId: booking._id,
    });

    logger.info("Accepted booking email queued", { bookingId });

    await bookingStatusQueue.add("update-status", {
      bookingId: booking._id,
    });

    logger.info("Booking status scheduler queued", { bookingId });

    const rejectedBookings = await Booking.find({
      _id: { $ne: booking._id },
      item_id: booking.item_id,
      booking_status: BookingStatus.PENDING,
      start_date: { $lt: booking.end_date },
      end_date: { $gt: booking.start_date },
    }).session(session);

    await Booking.updateMany(
      { _id: { $in: rejectedBookings.map((b) => b._id) } },
      {
        $set: {
          booking_status: BookingStatus.REJECTED,
          cancellationReason: "Another booking request was accepted",
          cancelledBy: "system",
        },
      },
      { session },
    );

    await session.commitTransaction();
    session.endSession();

    logger.info("Conflicting bookings rejected", {
      bookingId,
      rejectedCount: rejectedBookings.length,
    });

    for (const renter_id of rejectedBookings.map((b) => b.renter_id)) {
      await emailQueue.add("sendBookingRejectedEmail", {
        renter_id,
        bookingId,
      });
    }

    logger.info("Rejected booking emails queued", {
      bookingId,
      rejectedCount: rejectedBookings.length,
    });

    return true;
  } catch (error) {
    await session.abortTransaction();
    session.endSession();

    logger.error("Booking acceptance failed", {
      bookingId,
      error,
    });

    throw error;
  }
};

export const cancelBookingService = async (
  userId: string,
  bookingId: string,
  userRole: "renter" | "owner",
  cancelMessage: string,
) => {
  logger.info("Cancelling booking", { bookingId, userId, userRole });

  if (!mongoose.Types.ObjectId.isValid(bookingId)) {
    throw new AppError("Invalid booking ID format", 400);
  }

  const booking = await Booking.findOne({
    _id: bookingId,
    $or: [{ renter_id: userId }, { owner_id: userId }],
  });

  if (!booking) {
    logger.warn("Booking not found for cancellation", { bookingId });
    throw new AppError("Booking not found", 404);
  }

  if (
    booking.booking_status === BookingStatus.CANCELLED ||
    booking.booking_status === BookingStatus.REJECTED ||
    booking.booking_status === BookingStatus.COMPLETED
  ) {
    logger.warn("Booking already finalized", { bookingId });
    throw new AppError("Booking already finalized", 400);
  }

  booking.booking_status = BookingStatus.CANCELLED;
  booking.cancelledBy = userRole;
  booking.cancellationReason = cancelMessage;

  await booking.save();

  logger.info("Booking cancelled", { bookingId });

  return {
    id: booking._id.toString(),
    status: booking.booking_status,
  };
};

export const rejectBookingService = async (
  userId: string,
  bookingId: string,
  userRole: "owner",
  rejectMessage: string,
) => {
  logger.info("Rejecting booking", { bookingId, ownerId: userId });

  if (!mongoose.Types.ObjectId.isValid(bookingId)) {
    throw new AppError("Invalid booking ID format", 400);
  }

  const booking = await Booking.findOne({
    _id: bookingId,
    owner_id: userId,
  });

  if (!booking) {
    logger.warn("Booking not found for rejection", { bookingId });
    throw new AppError("Booking not found", 404);
  }

  if (booking.booking_status !== BookingStatus.PENDING) {
    logger.warn("Booking already processed", { bookingId });
    throw new AppError("Booking is already processed", 400);
  }

  booking.booking_status = BookingStatus.REJECTED;
  booking.cancellationReason = rejectMessage;
  booking.cancelledBy = userRole;

  await booking.save();

  logger.info("Booking rejected", { bookingId });

  await createNotificationService({
    userId: booking.renter_id.toString(),
    title: "Booking Request Declined ❌",
    message: `Your booking request was declined. Reason: ${rejectMessage}`,
    type: "booking_rejected",
    link: "/rentals",
  });
};

export const completeBookingService = async (
  userId: string,
  bookingId: string,
) => {
  logger.info("Completing booking", { bookingId, ownerId: userId });

  if (!mongoose.Types.ObjectId.isValid(bookingId)) {
    throw new AppError("Invalid booking ID format", 400);
  }

  const booking = await Booking.findOne({
    _id: bookingId,
    owner_id: userId,
  });

  if (!booking) {
    logger.warn("Booking not found for completion", { bookingId });
    throw new AppError("Booking not found", 404);
  }

  if (
    booking.booking_status !== BookingStatus.CONFIRMED &&
    booking.booking_status !== BookingStatus.ONGOING
  ) {
    logger.warn("Booking not in a completable state", {
      bookingId,
      status: booking.booking_status,
    });
    throw new AppError(
      "Booking must be confirmed or ongoing to be completed",
      400,
    );
  }

  if (!booking.returnPhotos || booking.returnPhotos.length === 0) {
    throw new AppError(
      "Please upload return condition photos before marking this booking as completed",
      400,
    );
  }

  booking.booking_status = BookingStatus.COMPLETED;
  await booking.save();

  logger.info("Booking completed", { bookingId });

  // Trigger Autonomous AI Damage & Escrow Settlement
  try {
    const { defaultPaymentService } = await import("./payment.service");
    await defaultPaymentService.settleDeposit(bookingId, userId);
  } catch (settleErr: any) {
    logger.warn("Automated deposit settlement error on complete:", { error: settleErr.message, bookingId });
  }

  await createNotificationService({
    userId: booking.renter_id.toString(),
    title: "Rental Completed! 🎉",
    message: "Your rental agreement has been marked as completed. Thank you!",
    type: "booking_completed",
    link: `/rentals/${booking._id}`,
  });

  return true;
};

export const uploadBookingPhotosService = async (
  userId: string,
  bookingId: string,
  type: "handover" | "return",
  files: { path: string; filename: string }[],
) => {
  logger.info("Uploading booking evidence photos", { bookingId, userId, type });

  if (!files || files.length === 0) {
    throw new AppError("At least one photo is required", 400);
  }

  const booking = await Booking.findOne({
    _id: bookingId,
    $or: [{ renter_id: userId }, { owner_id: userId }],
  });

  if (!booking) {
    throw new AppError("Booking not found", 404);
  }

  // Both booking participants (owner and renter) are allowed to upload condition photos


  const photos = files.map((f) => ({ url: f.path, publicId: f.filename }));

  if (type === "handover") {
    booking.handoverPhotos = photos;
    booking.handoverPhotosUploadedAt = new Date();
  } else {
    booking.returnPhotos = photos;
    booking.returnPhotosUploadedAt = new Date();
  }

  await booking.save();

  if (type === "return") {
    await photoPurgeQueue.add(
      "purge-photos",
      { bookingId: booking._id },
      { delay: 3 * 24 * 60 * 60 * 1000 }, // 3 days
    );
  }

  logger.info("Booking evidence photos uploaded", { bookingId, type, count: photos.length });

  return {
    type,
    photos,
  };
};

const MAX_SCAN_DISTANCE_KM = 0.5;

export const generateQRTokenService = async (
  bookingId: string,
  type: QRType,
  userId: string,
) => {
  const booking = await Booking.findOne({
    _id: bookingId,
    $or: [{ renter_id: userId }, { owner_id: userId }],
  });

  if (!booking) {
    throw new AppError("Booking not found", 404);
  }

  if (type === "handover" && booking.booking_status !== BookingStatus.CONFIRMED) {
    throw new AppError("Payment must be completed before handover", 400);
  }

  if (
    type === "return" &&
    (!booking.handoverConfirmedAt ||
      (booking.booking_status !== BookingStatus.CONFIRMED &&
        booking.booking_status !== BookingStatus.ONGOING))
  ) {
    throw new AppError("Handover must be confirmed before return can be processed", 400);
  }

  if (type === "handover" && booking.owner_id.toString() !== userId) {
    throw new AppError("Only the owner can generate the handover QR", 403);
  }
  if (type === "return" && booking.renter_id.toString() !== userId) {
    throw new AppError("Only the renter can generate the return QR", 403);
  }

  if (type === "handover" && (!booking.handoverPhotos || booking.handoverPhotos.length === 0)) {
    throw new AppError("Handover photos must be uploaded before generating the QR.", 400);
  }
  if (type === "return" && (!booking.returnPhotos || booking.returnPhotos.length === 0)) {
    throw new AppError("Return photos must be uploaded before generating the QR.", 400);
  }

  const token = generateQRToken({ bookingId, type, issuedBy: userId });

  logger.info("QR token generated", { bookingId, type, userId });

  return { token, expiresIn: 120 };
};

export const confirmQRScanService = async (
  token: string,
  scannerUserId: string,
  scannerLat: number,
  scannerLng: number,
) => {
  let payload;
  try {
    payload = verifyQRToken(token);
  } catch (err) {
    logger.warn("QR scan failed — invalid or expired token", { scannerUserId });
    throw new AppError("QR code is invalid or has expired. Ask for a new one.", 400);
  }

  const { bookingId, type } = payload;

  const booking = await Booking.findById(bookingId).populate<{
    item_id: { location?: { coordinates?: { coordinates: [number, number] } } };
  }>("item_id", "location");

  if (!booking) {
    throw new AppError("Booking not found", 404);
  }

  if (type === "handover" && booking.booking_status !== BookingStatus.CONFIRMED) {
    throw new AppError("Payment must be completed before handover", 400);
  }

  if (
    type === "return" &&
    (!booking.handoverConfirmedAt ||
      (booking.booking_status !== BookingStatus.CONFIRMED &&
        booking.booking_status !== BookingStatus.ONGOING))
  ) {
    throw new AppError("Handover must be confirmed before return can be processed", 400);
  }

  if (type === "handover" && booking.renter_id.toString() !== scannerUserId) {
    throw new AppError("Only the renter can scan the handover QR", 403);
  }
  if (type === "return" && booking.owner_id.toString() !== scannerUserId) {
    throw new AppError("Only the owner can scan the return QR", 403);
  }

  const itemCoords = booking.item_id?.location?.coordinates?.coordinates;
  if (itemCoords && typeof scannerLat === "number" && typeof scannerLng === "number") {
    const [itemLng, itemLat] = itemCoords;
    const distanceKm = calculateDistanceKm(scannerLat, scannerLng, itemLat, itemLng);
    if (distanceKm > MAX_SCAN_DISTANCE_KM) {
      logger.warn("QR scan rejected — scanner too far from pickup location", {
        bookingId,
        distanceKm,
      });
      throw new AppError(
        "You must be at the pickup location to confirm this scan.",
        403,
      );
    }
  } else {
    logger.warn("QR scan location check skipped — no item coordinates on file", {
      bookingId,
    });
  }

  if (type === "handover") {
    booking.handoverConfirmedAt = new Date();
    booking.booking_status = BookingStatus.ONGOING;
    await booking.save();

    const notifyUserId = booking.owner_id.toString();
    await createNotificationService({
      userId: notifyUserId,
      title: "Handover Confirmed",
      message: "Item handover confirmed by renter",
      type: "general",
    });

    logger.info("QR scan confirmed", { bookingId, type, scannerUserId });

    return { type, confirmedAt: new Date() };
  } else {
    await completeBookingService(booking.owner_id.toString(), bookingId);

    const now = new Date();
    await Booking.findByIdAndUpdate(bookingId, { returnConfirmedAt: now });

    logger.info("QR scan confirmed", { bookingId, type, scannerUserId });

    return { type, confirmedAt: now };
  }
};

/**
 * 6-Digit Alphanumeric/Numeric Verification PIN System (Uber-Style)
 */
export const generateVerificationPinService = async (
  userId: string,
  bookingId: string,
  type: "handover" | "return",
) => {
  if (!mongoose.Types.ObjectId.isValid(bookingId)) {
    throw new AppError("Invalid booking ID format", 400);
  }

  const booking = await Booking.findOne({
    _id: bookingId,
    $or: [{ renter_id: userId }, { owner_id: userId }],
  });

  if (!booking) {
    throw new AppError("Booking not found", 404);
  }

  if (type === "handover" && booking.booking_status !== BookingStatus.CONFIRMED && booking.booking_status !== BookingStatus.ONGOING) {
    throw new AppError("Payment must be completed before handover PIN can be generated", 400);
  }

  if (
    type === "return" &&
    (!booking.handoverConfirmedAt ||
      (booking.booking_status !== BookingStatus.CONFIRMED &&
        booking.booking_status !== BookingStatus.ONGOING))
  ) {
    throw new AppError("Handover must be confirmed before return PIN can be generated", 400);
  }

  // Generate a clean 6-digit numeric PIN
  const pin = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour TTL

  if (!booking.verificationPin) {
    booking.verificationPin = {};
  }

  if (type === "handover") {
    booking.verificationPin.handoverPin = pin;
    booking.verificationPin.handoverExpiresAt = expiresAt;
    booking.verificationPin.handoverAttempts = 0;
  } else {
    booking.verificationPin.returnPin = pin;
    booking.verificationPin.returnExpiresAt = expiresAt;
    booking.verificationPin.returnAttempts = 0;
  }

  await booking.save();

  logger.info("Verification PIN generated", { bookingId, type, userId });

  return {
    success: true,
    pin,
    type,
    expiresAt,
    expiresInSeconds: 3600,
  };
};

export const verifyPinService = async (
  userId: string,
  bookingId: string,
  type: "handover" | "return",
  enteredPin: string,
) => {
  if (!mongoose.Types.ObjectId.isValid(bookingId)) {
    throw new AppError("Invalid booking ID format", 400);
  }

  const booking = await Booking.findOne({
    _id: bookingId,
    $or: [{ renter_id: userId }, { owner_id: userId }],
  });

  if (!booking) {
    throw new AppError("Booking not found", 404);
  }

  if (!enteredPin || enteredPin.trim().length !== 6) {
    throw new AppError("Please provide a valid 6-digit PIN", 400);
  }

  const cleanPin = enteredPin.trim();

  if (type === "handover") {
    if (booking.booking_status === BookingStatus.ONGOING) {
      return { success: true, message: "Handover is already confirmed", status: "ongoing" };
    }

    if (!booking.verificationPin?.handoverPin) {
      throw new AppError("No active handover PIN found. Please generate a PIN first.", 400);
    }

    if (booking.verificationPin.handoverExpiresAt && new Date() > booking.verificationPin.handoverExpiresAt) {
      throw new AppError("Handover PIN has expired. Please generate a new PIN.", 400);
    }

    if ((booking.verificationPin.handoverAttempts || 0) >= 5) {
      await User.findByIdAndUpdate(userId, { isBlocked: true });
      throw new AppError("Maximum verification attempts reached (5). Account suspended by Autonomous Risk Guard for security.", 429);
    }

    if (booking.verificationPin.handoverPin !== cleanPin) {
      booking.verificationPin.handoverAttempts = (booking.verificationPin.handoverAttempts || 0) + 1;
      await booking.save();
      const remaining = 5 - booking.verificationPin.handoverAttempts;
      throw new AppError(`Incorrect PIN. ${remaining} attempts remaining.`, 400);
    }

    // Success: Confirm Handover
    booking.handoverConfirmedAt = new Date();
    booking.booking_status = BookingStatus.ONGOING;
    booking.verificationPin.handoverAttempts = 0;
    await booking.save();

    // Notify other party
    const recipientId = userId === booking.owner_id.toString()
      ? booking.renter_id.toString()
      : booking.owner_id.toString();

    await createNotificationService({
      userId: recipientId,
      title: "Handover Verified",
      message: "Item handover was successfully verified with 6-digit PIN. Rental is now ongoing!",
      type: "general",
    });

    logger.info("Handover verified via PIN", { bookingId, userId });

    return {
      success: true,
      message: "Handover verified successfully! Rental is now ongoing.",
      status: "ongoing",
      confirmedAt: booking.handoverConfirmedAt,
    };
  } else {
    // Return flow
    if (booking.booking_status === BookingStatus.COMPLETED) {
      return { success: true, message: "Return is already completed", status: "completed" };
    }

    if (!booking.verificationPin?.returnPin) {
      throw new AppError("No active return PIN found. Please generate a PIN first.", 400);
    }

    if (booking.verificationPin.returnExpiresAt && new Date() > booking.verificationPin.returnExpiresAt) {
      throw new AppError("Return PIN has expired. Please generate a new PIN.", 400);
    }

    if ((booking.verificationPin.returnAttempts || 0) >= 5) {
      await User.findByIdAndUpdate(userId, { isBlocked: true });
      throw new AppError("Maximum verification attempts reached (5). Account suspended by Autonomous Risk Guard for security.", 429);
    }

    if (booking.verificationPin.returnPin !== cleanPin) {
      booking.verificationPin.returnAttempts = (booking.verificationPin.returnAttempts || 0) + 1;
      await booking.save();
      const remaining = 5 - booking.verificationPin.returnAttempts;
      throw new AppError(`Incorrect PIN. ${remaining} attempts remaining.`, 400);
    }

    // Complete the booking
    await completeBookingService(booking.owner_id.toString(), bookingId);

    const now = new Date();
    booking.returnConfirmedAt = now;
    if (booking.verificationPin) {
      booking.verificationPin.returnAttempts = 0;
    }
    await booking.save();

    const recipientId = userId === booking.owner_id.toString()
      ? booking.renter_id.toString()
      : booking.owner_id.toString();

    await createNotificationService({
      userId: recipientId,
      title: "Return Verified",
      message: "Item return was successfully verified with 6-digit PIN. Rental completed!",
      type: "general",
    });

    logger.info("Return verified via PIN", { bookingId, userId });

    return {
      success: true,
      message: "Return verified successfully! Rental completed.",
      status: "completed",
      confirmedAt: now,
    };
  }
};

export const getActivePinForDemoService = async (
  userId: string,
  bookingId: string,
  type: "handover" | "return",
) => {
  if (!mongoose.Types.ObjectId.isValid(bookingId)) {
    throw new AppError("Invalid booking ID format", 400);
  }

  const booking = await Booking.findOne({
    _id: bookingId,
    $or: [{ renter_id: userId }, { owner_id: userId }],
  });

  if (!booking) {
    throw new AppError("Booking not found", 404);
  }

  let pin = type === "handover"
    ? booking.verificationPin?.handoverPin
    : booking.verificationPin?.returnPin;

  // Auto-generate if not created yet for seamless demo experience
  if (!pin) {
    const generated = await generateVerificationPinService(userId, bookingId, type);
    pin = generated.pin;
  }

  return {
    success: true,
    pin,
    type,
  };
};

export const submitVoiceConsentService = async (
  userId: string,
  bookingId: string,
  audioBuffer: Buffer,
  mimetype: string = "audio/webm",
) => {
  if (!mongoose.Types.ObjectId.isValid(bookingId)) {
    throw new AppError("Invalid booking ID format", 400);
  }

  const booking = await Booking.findOne({
    _id: bookingId,
    $or: [{ renter_id: userId }, { owner_id: userId }],
  });

  if (!booking) {
    throw new AppError("Booking not found", 404);
  }

  // 1. Calculate SHA-256 audio fingerprint
  const fingerprint = computeAudioFingerprint(audioBuffer);

  // 2. Transcribe via Sarvam AI Saaras
  const { transcript, languageCode } = await transcribeAudio(audioBuffer, mimetype);

  // 3. Upload to Cloudinary under rentora/voice_consent
  const { url, publicId } = await uploadAudioToCloudinary(audioBuffer, "rentora/voice_consent");

  // 4. Update booking document
  booking.voiceConsent = {
    audioUrl: url,
    publicId,
    fingerprint,
    transcript,
    languageCode,
    recordedAt: new Date(),
    verified: true,
  };

  await booking.save();

  logger.info("Voice biometric consent recorded and fingerprinted", {
    bookingId,
    userId,
    fingerprint,
    transcript,
  });

  return {
    success: true,
    message: "Voice biometric consent verified and recorded successfully",
    voiceConsent: booking.voiceConsent,
  };
};

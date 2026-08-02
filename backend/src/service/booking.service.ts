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
import { getReputationTier } from "../utils/reputation";

export const getBookingService = async (userId: string, userRole: string) => {
  logger.info("Fetching bookings", { userId, userRole });

  const filter: Record<string, any> =
    userRole === "owner" ? { owner_id: userId } : { renter_id: userId };

  const bookings = await Booking.find(filter)
    .select(
      "item_id renter_id owner_id start_date end_date pricing booking_status payment_status createdAt",
    )
    .populate("item_id", "title images")
    .populate("renter_id", "name profileImage trustScore")
    .populate("owner_id", "name profileImage trustScore")
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
            reputationTier: getReputationTier(renter.trustScore),
          }
        : null,
      ownerInfo: owner
        ? {
            id: owner._id?.toString(),
            name: owner.name,
            image: owner.profileImage,
            reputationTier: getReputationTier(owner.trustScore),
          }
        : null,
      startDate: booking.start_date,
      endDate: booking.end_date,
      address: booking.address,
      totalAmount: booking.pricing?.totalAmount ?? 0,
      status: booking.booking_status,
      paymentStatus: booking.payment_status,
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

  const item = await Item.findById(booking.itemId);

  if (!item) {
    logger.error("Item not found during booking", { itemId: booking.itemId });
    throw new AppError("Item not found", 404);
  }

  const totalDays =
    Math.ceil(
      (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24),
    ) + 1; // Including start date

  const pricing = calculatePricing({
    baseRate: booking.pricing.baseRate,
    discountApplied: booking.pricing.discountApplied,
    securityDeposit: booking.pricing.securityDeposit,
    serviceFee: booking.pricing.serviceFee,
    tax: booking.pricing.tax,
    totalDays,
  });

  const newBooking = await Booking.create({
    renter_id: userId,
    owner_id: item.ownerId,
    item_id: booking.itemId,
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

  const booking = await Booking.findOne({
    _id: bookingId,
    $or: [{ renter_id: userId }, { owner_id: userId }],
  })
    .populate("item_id", "title images category")
    .populate("owner_id", "name email phone profileImage trustScore")
    .populate("renter_id", "name email phone profileImage trustScore")
    .lean();

  if (!booking) {
    logger.warn("Booking not found", { bookingId, userId });
    throw new AppError("Booking not found", 404);
  }

  const owner = booking.owner_id as any;
  const renter = booking.renter_id as any;

  if (owner && typeof owner === "object") {
    owner.reputationTier = getReputationTier(owner.trustScore);
    delete owner.trustScore;
  }

  if (renter && typeof renter === "object") {
    renter.reputationTier = getReputationTier(renter.trustScore);
    delete renter.trustScore;
  }

  logger.info("Booking details fetched", { bookingId });

  return booking;
};

export const acceptBookingService = async (
  userId: string,
  bookingId: string,
) => {
  logger.info("Accepting booking", { bookingId, userId });

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

  const wasCommitted = booking.booking_status === BookingStatus.APPROVED || booking.booking_status === BookingStatus.CONFIRMED;

  booking.booking_status = BookingStatus.CANCELLED;
  booking.cancelledBy = userRole;
  booking.cancellationReason = cancelMessage;

  await booking.save();

  if (wasCommitted) {
    const penalizedUserId = userRole === "renter" ? booking.renter_id : booking.owner_id;
    await User.updateOne(
      { _id: penalizedUserId, trustScore: { $gt: 0 } },
      { $inc: { trustScore: -5 } },
    );
  }

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

  await User.updateOne(
    { _id: booking.renter_id, trustScore: { $lt: 100 } },
    { $inc: { trustScore: 2 } },
  );
  await User.updateOne(
    { _id: booking.owner_id, trustScore: { $lt: 100 } },
    { $inc: { trustScore: 2 } },
  );

  logger.info("Booking completed", { bookingId });

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

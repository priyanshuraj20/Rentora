import { Message } from "../models/message.model";
import { Booking } from "../models/booking.model";
import { AppError } from "../utils/AppError";
import { createNotificationService } from "./notification.service";
import logger from "../config/logger";
import mongoose from "mongoose";

export interface CreateMessageDto {
  bookingId: string;
  senderId: string;
  text?: string;
  type?: "text" | "image" | "file" | "voice";
  mediaUrl?: string;
}

export const saveMessageService = async (data: CreateMessageDto) => {
  logger.info("Persisting message to DB", { bookingId: data.bookingId, senderId: data.senderId });

  if (!data.text && !data.mediaUrl) {
    throw new AppError("Message content or media URL is required", 400);
  }

  // 1. Verify booking exists
  const booking = await Booking.findById(data.bookingId);
  if (!booking) {
    throw new AppError("Booking not found", 404);
  }

  // 2. Authorization Guard: Check if sender is member of this booking
  const senderStr = data.senderId.toString();
  const renterStr = booking.renter_id.toString();
  const ownerStr = booking.owner_id.toString();

  if (senderStr !== renterStr && senderStr !== ownerStr) {
    logger.warn("Unauthorized chat message attempt", { senderId: data.senderId, bookingId: data.bookingId });
    throw new AppError("Forbidden: You are not authorized to participate in this booking's chat", 403);
  }

  // 3. Determine receiver (the other party in the booking)
  const receiverId = senderStr === renterStr ? ownerStr : renterStr;

  // 4. Persist Message to MongoDB BEFORE broadcasting
  const messageDoc = await Message.create({
    bookingId: new mongoose.Types.ObjectId(data.bookingId),
    senderId: new mongoose.Types.ObjectId(data.senderId),
    receiverId: new mongoose.Types.ObjectId(receiverId),
    type: data.type || "text",
    text: data.text,
    mediaUrl: data.mediaUrl,
    status: "sent",
  });

  logger.info("Message persisted successfully", { messageId: messageDoc._id });

  // 5. Trigger System Notification to Receiver
  await createNotificationService({
    userId: receiverId,
    title: "New Message Received 💬",
    message: data.text ? `${data.text.substring(0, 50)}...` : "Sent an attachment",
    type: "general",
    link: "/messages",
  });

  return {
    id: messageDoc._id.toString(),
    bookingId: messageDoc.bookingId.toString(),
    senderId: messageDoc.senderId.toString(),
    receiverId: messageDoc.receiverId.toString(),
    type: messageDoc.type,
    text: messageDoc.text,
    mediaUrl: messageDoc.mediaUrl,
    status: messageDoc.status,
    createdAt: messageDoc.createdAt,
  };
};

export const getBookingMessagesService = async (
  userId: string,
  bookingId: string,
  query: { page?: number; limit?: number; before?: string }
) => {
  logger.info("Fetching booking messages history", { userId, bookingId });

  // 1. Verify booking exists & Authorization Guard
  const booking = await Booking.findById(bookingId);
  if (!booking) {
    throw new AppError("Booking not found", 404);
  }

  const userStr = userId.toString();
  const renterStr = booking.renter_id.toString();
  const ownerStr = booking.owner_id.toString();

  if (userStr !== renterStr && userStr !== ownerStr) {
    throw new AppError("Forbidden: You do not have access to this conversation", 403);
  }

  // 2. Pagination Controls
  const page = Math.max(1, Number(query.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(query.limit) || 30));
  const skip = (page - 1) * limit;

  const filter: Record<string, any> = {
    $or: [
      { bookingId },
      ...(mongoose.Types.ObjectId.isValid(bookingId)
        ? [{ bookingId: new mongoose.Types.ObjectId(bookingId) }]
        : []),
    ],
  };
  if (query.before) {
    filter._id = { $lt: new mongoose.Types.ObjectId(query.before) };
  }

  // 3. Fetch Messages from DB
  const messages = await Message.find(filter)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate("senderId", "name profileImage")
    .lean();

  const totalCount = await Message.countDocuments({ bookingId });

  // 4. Mark unread messages sent to this user as read
  await Message.updateMany(
    { bookingId, receiverId: userId, status: { $ne: "read" } },
    { $set: { status: "read", readAt: new Date() } }
  );

  const formatted = messages.reverse().map((msg: any) => ({
    id: msg._id.toString(),
    bookingId: msg.bookingId.toString(),
    senderId: msg.senderId?._id?.toString() || msg.senderId?.toString(),
    senderName: msg.senderId?.name || "User",
    senderAvatar: msg.senderId?.profileImage || null,
    receiverId: msg.receiverId.toString(),
    type: msg.type,
    text: msg.text,
    mediaUrl: msg.mediaUrl,
    status: msg.status,
    readAt: msg.readAt,
    createdAt: msg.createdAt,
  }));

  return {
    messages: formatted,
    pagination: {
      page,
      limit,
      totalCount,
      hasMore: skip + messages.length < totalCount,
    },
  };
};

export const markMessagesAsReadService = async (userId: string, bookingId: string) => {
  await Message.updateMany(
    { bookingId, receiverId: userId, status: { $ne: "read" } },
    { $set: { status: "read", readAt: new Date() } }
  );
  return { success: true };
};

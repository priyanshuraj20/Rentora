import { Notification } from "../models/notification.model";
import { emitNotificationToUser } from "../config/socket";

export const createNotificationService = async (data: {
  userId: string;
  title: string;
  message: string;
  type?:
    | "booking_request"
    | "booking_accepted"
    | "booking_rejected"
    | "payment_success"
    | "payment_failed"
    | "booking_completed"
    | "general";
  link?: string;
}) => {
  const notification = await Notification.create({
    userId: data.userId,
    title: data.title,
    message: data.message,
    type: data.type || "general",
    link: data.link,
  });

  emitNotificationToUser(data.userId, notification);
  return notification;
};

export const getUserNotificationsService = async (userId: string) => {
  return Notification.find({ userId }).sort({ createdAt: -1 }).limit(20);
};

export const markNotificationsAsReadService = async (userId: string) => {
  await Notification.updateMany({ userId, isRead: false }, { isRead: true });
  return { success: true };
};

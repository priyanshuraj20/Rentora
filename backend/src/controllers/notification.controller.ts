import { Request, Response } from "express";
import { catchAsync } from "../utils/catchAsync";
import {
  getUserNotificationsService,
  markNotificationsAsReadService,
} from "../service/notification.service";

export const getNotifications = catchAsync(
  async (req: Request, res: Response) => {
    const notifications = await getUserNotificationsService(req.userId!);
    res.status(200).json({
      success: true,
      data: notifications,
    });
  },
);

export const markAsRead = catchAsync(async (req: Request, res: Response) => {
  await markNotificationsAsReadService(req.userId!);
  res.status(200).json({
    success: true,
    message: "Notifications marked as read",
  });
});

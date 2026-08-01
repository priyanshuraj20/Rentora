import { Request, Response } from "express";
import { catchAsync } from "../utils/catchAsync";
import {
  saveMessageService,
  getBookingMessagesService,
  markMessagesAsReadService,
} from "../service/message.service";

export const getBookingMessages = catchAsync(
  async (req: Request, res: Response) => {
    const bookingId = req.params.bookingId as string;
    const { page, limit, before } = req.query;

    const data = await getBookingMessagesService(req.userId!, bookingId, {
      page: Number(page),
      limit: Number(limit),
      before: before as string,
    });

    res.status(200).json({
      success: true,
      message: "Chat history fetched successfully",
      ...data,
    });
  }
);

export const sendMessage = catchAsync(async (req: Request, res: Response) => {
  const { bookingId, text, type, mediaUrl } = req.body;

  const message = await saveMessageService({
    bookingId,
    senderId: req.userId!,
    text,
    type,
    mediaUrl,
  });

  res.status(201).json({
    success: true,
    message: "Message sent successfully",
    data: message,
  });
});

export const markAsRead = catchAsync(async (req: Request, res: Response) => {
  const bookingId = req.params.bookingId as string;

  await markMessagesAsReadService(req.userId!, bookingId);

  res.status(200).json({
    success: true,
    message: "Messages marked as read",
  });
});

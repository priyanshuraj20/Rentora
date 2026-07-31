import { Request, Response } from "express";
import { catchAsync } from "../utils/catchAsync";
import logger from "../config/logger";
import {
  createBookingService,
  getBookingService,
  getBookingIdService,
  acceptBookingService,
  cancelBookingService,
  rejectBookingService,
  completeBookingService,
} from "../service/booking.service";
import { createBookingSchema } from "../validators/booking.validator";
import { AppError } from "../utils/AppError";

export const getBookings = catchAsync(async (req: Request, res: Response) => {
  const bookings: any[] = await getBookingService(req.userId!, req.userRole!);

  res.status(200).json({
    success: true,
    message: "Bookings fetched successfully",
    bookings,
  });
});

export const createBooking = catchAsync(async (req: Request, res: Response) => {
  const validate = createBookingSchema.safeParse(req.body);
  if (!validate.success) {
    throw new AppError(`Invalid Data ${validate.error.flatten()}`, 400);
  }

  await createBookingService(req.userId!, validate.data);

  res.status(201).json({
    success: true,
    message: "Booking created successfully",
  });
});

export const getBookingById = catchAsync(
  async (req: Request, res: Response) => {
    const booking = await getBookingIdService(
      req.userId!,
      req.params.id as string,
    );

    res.status(200).json({
      success: true,
      message: "Booking fetched successfully",
      booking,
    });
  },
);

export const acceptBooking = catchAsync(async (req: Request, res: Response) => {
  await acceptBookingService(req.userId!, req.params.id as string);
  res.status(200).json({
    success: true,
    message: "Booking accepted successfully",
  });
});

export const cancelBooking = catchAsync(async (req: Request, res: Response) => {
  if (req.userRole !== "renter") {
    throw new AppError("Forbidden: Only renter can cancel the booking", 403);
  }

  const { cancelMessage } = req.body;

  if (!cancelMessage) {
    throw new AppError("Cancel message is required", 400);
  }

  if (cancelMessage.length < 10 || cancelMessage.length > 500) {
    throw new AppError(
      "Cancel message must be between 10 and 500 characters long",
      400,
    );
  }

  await cancelBookingService(
    req.userId!,
    req.params.id as string,
    req.userRole! as "renter" | "owner",
    cancelMessage,
  );

  res.status(200).json({
    success: true,
    message: "Booking cancelled successfully",
  });
});

export const rejectBooking = catchAsync(async (req: Request, res: Response) => {
  if (req.userRole !== "owner") {
    throw new AppError("Forbidden: Only owner can reject the booking", 403);
  }

  const { rejectMessage } = req.body;

  if (!rejectMessage) {
    throw new AppError("Reject message is required", 400);
  }

  if (rejectMessage.length < 10 || rejectMessage.length > 500) {
    throw new AppError(
      "Reject message must be between 10 and 500 characters long",
      400,
    );
  }

  await rejectBookingService(
    req.userId!,
    req.params.id as string,
    req.userRole! as "owner",
    rejectMessage,
  );

  res.status(200).json({
    success: true,
    message: "Booking rejected successfully",
  });
});

export const completeBooking = catchAsync(
  async (req: Request, res: Response) => {
    if (req.userRole !== "owner") {
      throw new AppError(
        "Forbidden: Only owner can mark the booking as completed",
        403,
      );
    }

    await completeBookingService(req.userId!, req.params.id as string);

    res.status(200).json({
      success: true,
      message: "Booking marked as completed successfully",
    });
  },
);

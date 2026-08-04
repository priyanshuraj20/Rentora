import { Request, Response } from "express";
import { catchAsync } from "../utils/catchAsync";
import {
  createBookingService,
  getBookingService,
  getBookingIdService,
  acceptBookingService,
  cancelBookingService,
  rejectBookingService,
  completeBookingService,
  uploadBookingPhotosService,
  generateQRTokenService,
  confirmQRScanService,
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
    const errorMsg = validate.error.issues.map((i) => i.message).join(". ");
    throw new AppError(`Invalid Data: ${errorMsg}`, 400);
  }

  const booking = await createBookingService(req.userId!, validate.data);

  res.status(201).json({
    success: true,
    message: "Booking created successfully",
    booking,
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
    await completeBookingService(req.userId!, req.params.id as string);

    res.status(200).json({
      success: true,
      message: "Booking marked as completed successfully",
    });
  },
);

export const uploadBookingPhotos = catchAsync(async (req: Request, res: Response) => {
  const { type } = req.body;

  if (type !== "handover" && type !== "return") {
    throw new AppError("Photo type must be 'handover' or 'return'", 400);
  }

  const files = (req.files as Express.Multer.File[]) || [];

  const result = await uploadBookingPhotosService(
    req.userId!,
    req.params.id as string,
    type,
    files.map((f) => ({ path: f.path, filename: f.filename })),
  );

  res.status(200).json({
    success: true,
    message: "Photos uploaded successfully",
    data: result,
  });
});

export const getBookingQR = catchAsync(async (req: Request, res: Response) => {
  const { type } = req.query;

  if (type !== "handover" && type !== "return") {
    throw new AppError("Query param 'type' must be 'handover' or 'return'", 400);
  }

  const result = await generateQRTokenService(
    req.params.id as string,
    type,
    req.userId!,
  );

  res.status(200).json({ success: true, data: result });
});

export const confirmBookingScan = catchAsync(async (req: Request, res: Response) => {
  const { token, scannerLat, scannerLng } = req.body;

  if (!token) {
    throw new AppError("QR token is required", 400);
  }

  const result = await confirmQRScanService(
    token,
    req.userId!,
    Number(scannerLat),
    Number(scannerLng),
  );

  res.status(200).json({
    success: true,
    message: `${result.type === "handover" ? "Handover" : "Return"} confirmed successfully`,
    data: result,
  });
});

import { Request, Response } from "express";
import { catchAsync } from "../utils/catchAsync";
import { AppError } from "../utils/AppError";
import { defaultPaymentService } from "../service/payment.service";

export const createOrder = catchAsync(async (req: Request, res: Response) => {
  const { bookingId } = req.body;
  if (!bookingId) {
    throw new AppError("Booking ID is required", 400);
  }

  const orderData = await defaultPaymentService.createOrder(
    bookingId,
    req.userId!,
  );

  res.status(200).json({
    success: true,
    data: orderData,
  });
});

export const verifyPayment = catchAsync(async (req: Request, res: Response) => {
  const { bookingId, razorpay_order_id, razorpay_payment_id, razorpay_signature } =
    req.body;

  if (
    !bookingId ||
    !razorpay_order_id ||
    !razorpay_payment_id ||
    !razorpay_signature
  ) {
    throw new AppError("Payment details missing for verification", 400);
  }

  const result = await defaultPaymentService.verifyPayment(req.userId!, {
    bookingId,
    orderId: razorpay_order_id,
    paymentId: razorpay_payment_id,
    signature: razorpay_signature,
  });

  res.status(200).json({
    success: true,
    message: result.message,
  });
});

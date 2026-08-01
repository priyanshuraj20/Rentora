import { Request, Response } from "express";
import { catchAsync } from "../utils/catchAsync";
import { AppError } from "../utils/AppError";
import {
  addItemReviewService,
  getItemReviewsService,
} from "../service/review.service";

export const createReview = catchAsync(async (req: Request, res: Response) => {
  const { bookingId, itemId, rating, review } = req.body;
  if (!bookingId || !itemId || !rating) {
    throw new AppError("Booking ID, Item ID, and Rating are required", 400);
  }

  const result = await addItemReviewService(req.userId!, {
    bookingId,
    itemId,
    rating: Number(rating),
    review,
  });

  res.status(201).json({
    success: true,
    message: "Review submitted successfully",
    data: result,
  });
});

export const getItemReviews = catchAsync(async (req: Request, res: Response) => {
  const itemId = req.params.itemId as string;
  if (!itemId) {
    throw new AppError("Item ID is required", 400);
  }

  const reviews = await getItemReviewsService(itemId);
  res.status(200).json({
    success: true,
    data: reviews,
  });
});

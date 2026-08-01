import { ItemReview } from "../models/itemReview.model";
import { Item } from "../models/item.model";
import { Booking } from "../models/booking.model";
import { AppError } from "../utils/AppError";

export const addItemReviewService = async (
  renterId: string,
  data: {
    bookingId: string;
    itemId: string;
    rating: number;
    review?: string;
  },
) => {
  const booking = await Booking.findById(data.bookingId);
  if (!booking) {
    throw new AppError("Booking not found", 404);
  }

  if (booking.renter_id.toString() !== renterId) {
    throw new AppError(
      "Forbidden: Only renter can leave review for this booking",
      403,
    );
  }

  const existing = await ItemReview.findOne({
    booking_id: data.bookingId,
    reviewer_id: renterId,
  });

  if (existing) {
    throw new AppError("Review already submitted for this booking", 400);
  }

  const review = await ItemReview.create({
    booking_id: data.bookingId,
    item_id: data.itemId,
    reviewer_id: renterId,
    owner_id: booking.owner_id,
    rating: data.rating,
    comment: data.review || "",
  });

  booking.isReviewedByRenter = true;
  await booking.save();

  // Recalculate average rating for item
  const allReviews = await ItemReview.find({ item_id: data.itemId });
  const totalRating = allReviews.reduce((sum, r) => sum + r.rating, 0);
  const avgRating = Number((totalRating / allReviews.length).toFixed(1));

  await Item.findByIdAndUpdate(data.itemId, {
    "rating.average": avgRating,
    "rating.count": allReviews.length,
  });

  return review;
};

export const getItemReviewsService = async (itemId: string) => {
  return ItemReview.find({ item_id: itemId })
    .populate("reviewer_id", "name profileImage")
    .sort({ createdAt: -1 });
};

import mongoose, { Schema, Document } from "mongoose";

export interface IItemReview extends Document {
  item_id: mongoose.Types.ObjectId;
  booking_id: mongoose.Types.ObjectId;

  reviewer_id: mongoose.Types.ObjectId; // renter
  owner_id: mongoose.Types.ObjectId;

  rating: number;
  comment?: string;

  isEdited: boolean;
  isHidden: boolean;

  createdAt: Date;
  updatedAt: Date;
}

const ItemReviewSchema: Schema<IItemReview> = new Schema(
  {
    item_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Item",
      required: true,
    },

    booking_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      required: true,
    },

    reviewer_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    owner_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },

    comment: {
      type: String,
      maxlength: 1000,
    },

    isEdited: {
      type: Boolean,
      default: false,
    },

    isHidden: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

// Prevent duplicate review per booking
ItemReviewSchema.index({ booking_id: 1, reviewer_id: 1 }, { unique: true });

// Fast lookups
ItemReviewSchema.index({ item_id: 1 });
ItemReviewSchema.index({ owner_id: 1 });

export const ItemReview = mongoose.model<IItemReview>(
  "ItemReview",
  ItemReviewSchema,
);

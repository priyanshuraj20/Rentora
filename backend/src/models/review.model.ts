import mongoose, { Schema, Document } from "mongoose";

export interface IReview extends Document {
  reviewerId: mongoose.Types.ObjectId;
  reviewedUserId: mongoose.Types.ObjectId;

  bookingId: mongoose.Types.ObjectId;
  itemId: mongoose.Types.ObjectId;

  role: "renter" | "owner";

  rating: number;
  comment?: string;

  isEdited: boolean;
  isHidden: boolean;

  createdAt: Date;
  updatedAt: Date;
}

const ReviewSchema: Schema<IReview> = new Schema(
  {
    reviewerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    reviewedUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      required: true,
    },

    itemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Item",
      required: true,
    },

    role: {
      type: String,
      enum: ["renter", "owner"],
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

// Prevent duplicate review for same booking + role
ReviewSchema.index({ bookingId: 1, reviewerId: 1, role: 1 }, { unique: true });

// Fast lookup
ReviewSchema.index({ reviewedUserId: 1 });
ReviewSchema.index({ bookingId: 1 });

export const Review = mongoose.model<IReview>("Review", ReviewSchema);

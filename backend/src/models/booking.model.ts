import mongoose, { Schema, Document } from "mongoose";

export interface IBooking extends Document {
  item_id: mongoose.Types.ObjectId;
  renter_id: mongoose.Types.ObjectId;
  owner_id: mongoose.Types.ObjectId;

  start_date: Date;
  end_date: Date;
  total_days: number;

  address: {
    district?: string;
    state?: string;
    pincode?: string;
  };

  pricing: {
    appliedPricing: "daily" | "weekly" | "monthly";
    baseRate: number;

    discountApplied: number;
    securityDeposit: number;

    subtotal: number;
    serviceFee: number;
    tax: number;

    platformFee: number;
    ownerEarning: number;

    totalAmount: number;
  };

  payment_status: "pending" | "paid" | "failed" | "refunded";

  booking_status:
    | "pending"
    | "confirmed"
    | "ongoing"
    | "completed"
    | "cancelled"
    | "rejected";

  cancellationReason?: string;
  cancelledBy?: "renter" | "owner";

  isReviewedByRenter: boolean;
  isReviewedByOwner: boolean;

  expiresAt?: Date;

  createdAt: Date;
  updatedAt: Date;
}

const BookingSchema: Schema<IBooking> = new Schema(
  {
    item_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Item",
      required: true,
    },

    renter_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    owner_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    address: {
      district: { type: String, required: true },
      state: { type: String, required: true },
      pincode: { type: String, required: true },
    },

    start_date: {
      type: Date,
      required: true,
    },

    end_date: {
      type: Date,
      required: true,
    },

    total_days: {
      type: Number,
      required: true,
      min: 1,
    },

    pricing: {
      appliedPricing: {
        type: String,
        enum: ["daily", "weekly", "monthly"],
        required: true,
      },

      baseRate: { type: Number, required: true },

      discountApplied: { type: Number, default: 0 },
      securityDeposit: { type: Number, default: 0 },

      subtotal: { type: Number, required: true },
      serviceFee: { type: Number, default: 0 },
      tax: { type: Number, default: 0 },

      platformFee: { type: Number, default: 49 },
      ownerEarning: { type: Number, required: true },

      totalAmount: { type: Number, required: true },
    },

    payment_status: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded"],
      default: "pending",
    },

    booking_status: {
      type: String,
      enum: ["pending", "confirmed", "ongoing", "completed", "cancelled"],
      default: "pending",
    },

    cancellationReason: {
      type: String,
    },

    cancelledBy: {
      type: String,
      enum: ["renter", "owner"],
    },

    isReviewedByRenter: {
      type: Boolean,
      default: false,
    },

    isReviewedByOwner: {
      type: Boolean,
      default: false,
    },

    expiresAt: {
      type: Date,
    },
  },
  { timestamps: true },
);

// Fast lookups
BookingSchema.index({ item_id: 1 });
BookingSchema.index({ renter_id: 1 });
BookingSchema.index({ owner_id: 1 });

// Auto-expire unpaid bookings (optional if you use TTL)
BookingSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

BookingSchema.index({
  item_id: 1,
  booking_status: 1,
  start_date: 1,
  end_date: 1,
});

export const Booking = mongoose.model<IBooking>("Booking", BookingSchema);

import mongoose, { Schema, Document } from "mongoose";

export interface Item extends Document {
  ownerId: mongoose.Types.ObjectId;
  title: string;
  description: string;
  images: string[];
  category: string;
  subCategory?: string;

  price: {
    daily: number;
    weekly?: number;
    monthly?: number;
  };

  discount: {
    daily?: number;
    weekly?: number;
    monthly?: number;
  };

  securityDeposit: number;

  rating: {
    average: number;
    count: number;
  };

  availability: {
    isAvailable: boolean;
    unavailableDates: Date[];
  };

  isActive: boolean;
  status: "active" | "paused" | "rented";
  totalBookings: number;

  createdAt: Date;
  updatedAt: Date;
}

const ItemSchema: Schema<Item> = new Schema(
  {
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
      maxlength: 2000,
    },

    images: {
      type: [String],
      required: true,
    },

    category: {
      type: String,
      required: true,
    },

    subCategory: {
      type: String,
    },

    price: {
      daily: { type: Number, required: true },
      weekly: { type: Number },
      monthly: { type: Number },
    },

    discount: {
      daily: { type: Number, default: 0 },
      weekly: { type: Number, default: 0 },
      monthly: { type: Number, default: 0 },
    },

    securityDeposit: {
      type: Number,
      default: 0,
    },

    rating: {
      average: { type: Number, default: 0, min: 0, max: 5 },
      count: { type: Number, default: 0 },
    },

    availability: {
      isAvailable: { type: Boolean, default: true },
      unavailableDates: [{ type: Date }],
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    status: {
      type: String,
      enum: ["active", "paused", "rented"],
      default: "active",
    },

    totalBookings: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true },
);

/* =======================
   Indexes (Important)
======================= */

// Fast filtering by city & category
ItemSchema.index({ "location.city": 1 });
ItemSchema.index({ category: 1 });
ItemSchema.index({ title: "text" });

// Fast owner dashboard lookup
ItemSchema.index({ ownerId: 1 });

export const Item = mongoose.model<Item>("Item", ItemSchema);

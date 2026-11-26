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
    | "approved"
    | "confirmed"
    | "ongoing"
    | "completed"
    | "cancelled"
    | "rejected";

  cancellationReason?: string;
  cancelledBy?: "renter" | "owner";

  isReviewedByRenter: boolean;
  isReviewedByOwner: boolean;

  handoverPhotos: { url: string; publicId: string }[];
  returnPhotos: { url: string; publicId: string }[];
  handoverPhotosUploadedAt?: Date;
  returnPhotosUploadedAt?: Date;
  handoverConfirmedAt?: Date;
  returnConfirmedAt?: Date;
  evidencePurgedAt?: Date;

  verificationPin?: {
    handoverPin?: string;
    handoverExpiresAt?: Date;
    handoverAttempts?: number;
    previousHandoverPin?: string;
    previousHandoverExpiresAt?: Date;
    returnPin?: string;
    returnExpiresAt?: Date;
    returnAttempts?: number;
    previousReturnPin?: string;
    previousReturnExpiresAt?: Date;
  };

  damageReport?: {
    tier: "TIER_0" | "TIER_1" | "TIER_2" | "TIER_3";
    severity: "none" | "minor" | "moderate" | "severe";
    summary: string;
    findings: string[];
    estimatedRepairCost: number;
    inspectedAt: Date;
    aiInspected: boolean;
  };

  depositSettlement?: {
    totalDeposit: number;
    repairDeduction: number;
    refundedToRenter: number;
    compensatedToOwner: number;
    razorpayRefundId?: string;
    settledAt: Date;
    status: "settled" | "pending";
  };

  voiceConsent?: {
    audioUrl?: string;
    publicId?: string;
    fingerprint?: string;
    transcript?: string;
    languageCode?: string;
    recordedAt?: Date;
    verified?: boolean;
  };

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

      platformFee: { type: Number, default: 0 },
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
      enum: ["pending", "approved", "confirmed", "ongoing", "completed", "cancelled", "rejected"],
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

    handoverPhotos: [
      {
        url: { type: String, required: true },
        publicId: { type: String, required: true },
      },
    ],
    returnPhotos: [
      {
        url: { type: String, required: true },
        publicId: { type: String, required: true },
      },
    ],
    handoverPhotosUploadedAt: { type: Date },
    returnPhotosUploadedAt: { type: Date },
    handoverConfirmedAt: { type: Date },
    returnConfirmedAt: { type: Date },
    evidencePurgedAt: { type: Date },

    verificationPin: {
      handoverPin: { type: String },
      handoverExpiresAt: { type: Date },
      handoverAttempts: { type: Number, default: 0 },
      previousHandoverPin: { type: String },
      previousHandoverExpiresAt: { type: Date },
      returnPin: { type: String },
      returnExpiresAt: { type: Date },
      returnAttempts: { type: Number, default: 0 },
      previousReturnPin: { type: String },
      previousReturnExpiresAt: { type: Date },
    },

    damageReport: {
      tier: { type: String, enum: ["TIER_0", "TIER_1", "TIER_2", "TIER_3"] },
      severity: { type: String, enum: ["none", "minor", "moderate", "severe"] },
      summary: { type: String },
      findings: [{ type: String }],
      estimatedRepairCost: { type: Number, default: 0 },
      inspectedAt: { type: Date },
      aiInspected: { type: Boolean, default: false },
    },

    depositSettlement: {
      totalDeposit: { type: Number, default: 0 },
      repairDeduction: { type: Number, default: 0 },
      refundedToRenter: { type: Number, default: 0 },
      compensatedToOwner: { type: Number, default: 0 },
      razorpayRefundId: { type: String },
      settledAt: { type: Date },
      status: { type: String, enum: ["settled", "pending"], default: "pending" },
    },

    voiceConsent: {
      audioUrl: { type: String },
      publicId: { type: String },
      fingerprint: { type: String },
      transcript: { type: String },
      languageCode: { type: String, default: "hi-IN" },
      recordedAt: { type: Date },
      verified: { type: Boolean, default: false },
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

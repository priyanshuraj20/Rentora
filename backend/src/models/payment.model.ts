import mongoose, { Schema, Document } from "mongoose";

export interface IPayment extends Document {
  booking_id: mongoose.Types.ObjectId;
  renter_id: mongoose.Types.ObjectId;
  owner_id: mongoose.Types.ObjectId;

  amount: number;
  currency: string;

  paymentMethod: "card" | "upi" | "netbanking" | "wallet";

  transactionId?: string;

  paymentStatus: "initiated" | "success" | "failed" | "refunded";

  refundAmount: number;
  refundReason?: string;

  paidAt?: Date;
  refundedAt?: Date;

  createdAt: Date;
  updatedAt: Date;
}

const PaymentSchema: Schema<IPayment> = new Schema(
  {
    booking_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
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

    amount: {
      type: Number,
      required: true,
    },

    currency: {
      type: String,
      default: "INR",
    },

    paymentMethod: {
      type: String,
      enum: ["card", "upi", "netbanking", "wallet"],
      required: true,
    },

    transactionId: {
      type: String,
    },

    paymentStatus: {
      type: String,
      enum: ["initiated", "success", "failed", "refunded"],
      default: "initiated",
    },

    refundAmount: {
      type: Number,
      default: 0,
    },

    refundReason: {
      type: String,
    },

    paidAt: {
      type: Date,
    },

    refundedAt: {
      type: Date,
    },
  },
  { timestamps: true },
);

// Fast lookup for booking payments
PaymentSchema.index({ booking_id: 1 });

// Fast lookup for user payment history
PaymentSchema.index({ renter_id: 1 });
PaymentSchema.index({ owner_id: 1 });

export const Payment = mongoose.model<IPayment>("Payment", PaymentSchema);

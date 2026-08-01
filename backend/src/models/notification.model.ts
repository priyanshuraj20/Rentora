import mongoose, { Schema, Document } from "mongoose";

export interface INotification extends Document {
  userId: mongoose.Types.ObjectId;
  title: string;
  message: string;
  type:
    | "booking_request"
    | "booking_accepted"
    | "booking_rejected"
    | "payment_success"
    | "payment_failed"
    | "booking_completed"
    | "general";
  isRead: boolean;
  link?: string;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema: Schema<INotification> = new Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: [
        "booking_request",
        "booking_accepted",
        "booking_rejected",
        "payment_success",
        "payment_failed",
        "booking_completed",
        "general",
      ],
      default: "general",
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    link: {
      type: String,
    },
  },
  { timestamps: true }
);

NotificationSchema.index({ userId: 1, createdAt: -1 });

export const Notification = mongoose.model<INotification>(
  "Notification",
  NotificationSchema
);

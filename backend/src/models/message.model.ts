import mongoose, { Schema, Document } from "mongoose";

export interface IMessage extends Document {
  bookingId: mongoose.Types.ObjectId;
  senderId: mongoose.Types.ObjectId;
  receiverId: mongoose.Types.ObjectId;

  type: "text" | "image" | "file" | "voice";
  text?: string;
  mediaUrl?: string;

  status: "sent" | "delivered" | "read";
  readAt?: Date;

  metadata?: Record<string, any>;

  createdAt: Date;
  updatedAt: Date;
}

const MessageSchema: Schema<IMessage> = new Schema(
  {
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      required: true,
      index: true,
    },
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ["text", "image", "file", "voice"],
      default: "text",
    },
    text: {
      type: String,
      trim: true,
      maxlength: 2000,
    },
    mediaUrl: {
      type: String,
    },
    status: {
      type: String,
      enum: ["sent", "delivered", "read"],
      default: "sent",
    },
    readAt: {
      type: Date,
    },
    metadata: {
      type: Schema.Types.Mixed,
    },
  },
  { timestamps: true }
);

// Indexes for fast paginated chat history query & unread message counts
MessageSchema.index({ bookingId: 1, createdAt: -1 });
MessageSchema.index({ receiverId: 1, status: 1 });

export const Message = mongoose.model<IMessage>("Message", MessageSchema);

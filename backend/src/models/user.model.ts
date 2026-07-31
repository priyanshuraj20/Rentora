import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  email: string;
  password: string;
  name?: string;
  phone?: string;
  profileImage?: string;
  googleId?: string;
  isVerified: boolean;

  roles: "renter" | "owner" | "admin";

  address?: {
    district?: string;
    state?: string;
    pincode?: string;
  };

  renter?: {
    totalSpent: number;
    totalBookings: number;
    wishlist: mongoose.Types.ObjectId[];
    rating: {
      average: number;
      count: number;
    };
  };

  owner?: {
    totalEarnings: number;
    totalListings: number;
    totalBookings: number;
    rating: {
      average: number;
      count: number;
    };
  };

  walletBalance: number;
  isActive: boolean;
  isBlocked: boolean;

  createdAt: Date;
  updatedAt: Date;
}


   //Schema Definition


const UserSchema: Schema<IUser> = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: false,
      minlength: 6,
    },

    googleId: {
      type: String,
      unique: true,
      sparse: true,
    },

    name: {
      type: String,
      required: false,
      trim: true,
    },

    phone: {
      type: String,
      unique: true,
      sparse: true,
    },

    profileImage: {
      type: String,
      default: "",
    },

    isVerified: {
      type: Boolean,
      default: false,
    },

    roles: {
      type: String,
      enum: ["renter", "owner", "admin"],
      default: "renter",
    },

    address: {
      district: String,
      state: String,
      pincode: String,
    },

    renter: {
      totalSpent: { type: Number, default: 0 },
      totalBookings: { type: Number, default: 0 },

      wishlist: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Item",
        },
      ],

      rating: {
        average: { type: Number, default: 0, min: 0, max: 5 },
        count: { type: Number, default: 0 },
      },
    },

    owner: {
      totalEarnings: { type: Number, default: 0 },
      totalListings: { type: Number, default: 0 },
      totalBookings: { type: Number, default: 0 },

      rating: {
        average: { type: Number, default: 0, min: 0, max: 5 },
        count: { type: Number, default: 0 },
      },
    },

    walletBalance: {
      type: Number,
      default: 0,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    isBlocked: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

// Delete unverified users after 1 hour
UserSchema.index(
  { createdAt: 1 },
  {
    expireAfterSeconds: 3600, // 1 hour
    partialFilterExpression: { isVerified: false },
  },
);

export const User = mongoose.model<IUser>("User", UserSchema);

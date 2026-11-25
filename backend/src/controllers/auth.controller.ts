import { Request, Response } from "express";
import bcrypt from "bcrypt";
import { loginSchema, registerSchema } from "@validators/auth.schema";
import { OTPValidator } from "@validators/OTP.validator";
import {
  loginService,
  registerService,
  sendOTPService,
  verifyOTPService,
  MeService,
  refreshTokenService,
  sendPasswordResetOTPService,
  resetPasswordService,
} from "@service/auth.service";
import { catchAsync } from "@utils/catchAsync";
import { AppError } from "@utils/AppError";
import {
  generateAccessToken,
  generateRefreshToken,
  TokenPayload,
} from "@utils/generateTokens";
import { blacklistToken } from "../utils/tokenBlacklist";
import { env } from "@config/env";
import { User } from "@models/user.model";
import { Item } from "@models/item.model";

export interface userInterface {
  id: string;
  name: string;
  email: string;
  role: string;
  phone?: string;
  profileImage: string;
  address?: {
    district?: string;
    state?: string;
    pincode?: string;
  };
}

// Common function to set authentication cookies
const setAuthCookies = (res: Response, payload: TokenPayload) => {
  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);

  const cookieOptions = {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: (env.NODE_ENV === "production" ? "none" : "lax") as
      | "none"
      | "lax",
  };

  res.cookie("accessToken", accessToken, {
    ...cookieOptions,
    maxAge: 15 * 60 * 1000, // 15 minutes
  });

  res.cookie("refreshToken", refreshToken, {
    ...cookieOptions,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
};

export const register = catchAsync(async (req: Request, res: Response) => {
  const validate = registerSchema.safeParse(req.body);

  if (!validate.success) {
    const errorMsg = validate.error.issues.map((i) => i.message).join(". ");
    throw new AppError(`Invalid data: ${errorMsg}`, 400);
  }

  await registerService(validate.data);

  res.status(201).json({
    success: true,
    message: "User registered successfully",
  });
});

export const sendOTP = catchAsync(async (req: Request, res: Response) => {
  const { email } = req.body;

  if (!email) {
    throw new AppError("Email is required", 400);
  }

  await sendOTPService(email);

  res.status(200).json({
    success: true,
    message: "OTP has been sent to your email",
  });
});

export const verifyOTP = catchAsync(async (req: Request, res: Response) => {
  const validate = OTPValidator.safeParse(req.body);

  if (!validate.success) {
    const errorMsg = validate.error.issues.map((i) => i.message).join(". ");
    throw new AppError(`Invalid data: ${errorMsg}`, 400);
  }

  // Service returns user payload instead of JWT
  const payload: TokenPayload = await verifyOTPService(validate.data);

  setAuthCookies(res, payload);

  res.status(200).json({
    success: true,
    message: "OTP verified successfully",
  });
});

export const login = catchAsync(async (req: Request, res: Response) => {
  const validate = loginSchema.safeParse(req.body);

  if (!validate.success) {
    const errorMsg = validate.error.issues.map((i) => i.message).join(". ");
    throw new AppError(`Invalid data: ${errorMsg}`, 400);
  }

  // Service returns payload instead of token
  const payload: TokenPayload = await loginService(validate.data);

  setAuthCookies(res, payload);

  res.status(200).json({
    success: true,
    message: "User logged in successfully",
  });
});

export const me = catchAsync(async (req: Request, res: Response) => {
  if (!req.userId) {
    throw new AppError("Unauthorized", 401);
  }

  const user: userInterface = await MeService(req.userId);

  res.status(200).json({
    success: true,
    message: "User fetched successfully",
    user,
  });
});

export const logout = catchAsync(async (req: Request, res: Response) => {
  const refreshToken = req.cookies?.refreshToken;
  if (refreshToken) {
    await blacklistToken(refreshToken);
  }

  const cookieOptions = {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: (env.NODE_ENV === "production" ? "none" : "lax") as
      | "none"
      | "lax",
  };

  res.clearCookie("accessToken", cookieOptions);
  res.clearCookie("refreshToken", cookieOptions);

  res.status(200).json({
    success: true,
    message: "Logged out",
  });
});

export const refreshToken = catchAsync(async (req: Request, res: Response) => {
  const token = req.cookies?.refreshToken;

  if (!token) {
    res.status(401).json({
      success: false,
      message: "Refresh token missing. Please login again",
    });
    return;
  }

  const payload: TokenPayload = await refreshTokenService(token);

  const accessToken = generateAccessToken(payload);

  const cookieOptions = {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: (env.NODE_ENV === "production" ? "none" : "lax") as
      | "none"
      | "lax",
  };

  res.cookie("accessToken", accessToken, {
    ...cookieOptions,
    maxAge: 15 * 60 * 1000, // 15 minutes
  });

  res.status(200).json({
    success: true,
    message: "Access token refreshed successfully",
  });
});

export const forgotPassword = catchAsync(async (req: Request, res: Response) => {
  const { email } = req.body;
  if (!email) {
    throw new AppError("Email is required", 400);
  }

  await sendPasswordResetOTPService(email);

  res.status(200).json({
    success: true,
    message: "Password reset OTP sent to your email",
  });
});

export const resetPassword = catchAsync(async (req: Request, res: Response) => {
  const { email, otp, newPassword } = req.body;
  if (!email || !otp || !newPassword) {
    throw new AppError("Email, OTP, and new password are required", 400);
  }

  if (newPassword.length < 6) {
    throw new AppError("Password must be at least 6 characters long", 400);
  }

  await resetPasswordService({ email, otp, newPassword });

  res.status(200).json({
    success: true,
    message: "Password reset successfully. You can now login with your new password.",
  });
});

export const demoLogin = catchAsync(async (req: Request, res: Response) => {
  const { persona } = req.body; // "renter" | "owner" | "admin"
  const role = ["owner", "admin"].includes(persona) ? persona : "renter";

  const email = `${role}.demo@rentora.com`;
  const name =
    role === "owner"
      ? "Alex Vance (Demo Owner)"
      : role === "admin"
      ? "Platform Administrator"
      : "Jordan Miller (Demo Renter)";

  const demoHashedPassword = await bcrypt.hash("password123", 10);

  let user = await User.findOne({ email });
  if (!user) {
    user = await User.create({
      email,
      password: demoHashedPassword,
      name,
      phone: role === "admin" ? "+91 9876543210" : role === "owner" ? "+91 9876543211" : "+91 9876543212",
      roles: role as any,
      isVerified: true,
      isActive: true,
      isBlocked: false,
      walletBalance: role === "owner" ? 12500 : 5000,
      address: {
        city: "Bangalore",
        district: "Bangalore Urban",
        state: "Karnataka",
        pincode: "560001",
      },
    });
  } else {
    user.isBlocked = false;
    user.isVerified = true;
    user.roles = role as any;
    if (!user.phone) {
      user.phone = role === "admin" ? "+91 9876543210" : role === "owner" ? "+91 9876543211" : "+91 9876543212";
    }
    if (!user.password) {
      user.password = demoHashedPassword;
    }
    await user.save();
  }

  // Ensure Demo Owner has high-quality showcase items immediately available
  if (role === "owner") {
    const existingItemsCount = await Item.countDocuments({ ownerId: user._id });
    if (existingItemsCount === 0) {
      await Item.create([
        {
          ownerId: user._id,
          title: "Sony Alpha A7 IV Mirrorless Camera",
          description:
            "Full-frame hybrid mirrorless camera with 33MP sensor, 4K 60p 10-bit recording, 28-70mm lens, and 2 high-capacity batteries. Ideal for professional video and photo gigs.",
          category: "Electronics",
          subCategory: "Cameras",
          images: [
            "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&q=80",
            "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=800&q=80",
          ],
          price: { daily: 1400, weekly: 8000, monthly: 25000 },
          securityDeposit: 8000,
          rating: { average: 4.8, count: 18 },
          availability: { isAvailable: true, unavailableDates: [] },
          location: {
            city: "Bangalore",
            district: "Bangalore Urban",
            state: "Karnataka",
            pincode: "560001",
          },
          status: "active",
          isActive: true,
          totalBookings: 6,
        },
        {
          ownerId: user._id,
          title: "DJI Mini 3 Pro Drone Combo",
          description:
            "Sub-249g lightweight drone with 4K HDR video, true vertical shooting, 34-min flight time, and tri-directional obstacle sensing. Includes RC controller and 3 batteries.",
          category: "Electronics",
          subCategory: "Drones",
          images: [
            "https://images.unsplash.com/photo-1527977966376-1c8408f9f108?w=800&q=80",
          ],
          price: { daily: 1800, weekly: 9500, monthly: 29000 },
          securityDeposit: 12000,
          rating: { average: 4.9, count: 24 },
          availability: { isAvailable: true, unavailableDates: [] },
          location: {
            city: "Bangalore",
            district: "Bangalore Urban",
            state: "Karnataka",
            pincode: "560001",
          },
          status: "active",
          isActive: true,
          totalBookings: 12,
        },
      ]);
    }
  }

  setAuthCookies(res, {
    userId: user._id.toString(),
    userRole: user.roles,
  });

  res.status(200).json({
    success: true,
    message: `Logged in as ${name}`,
    data: {
      id: user._id.toString(),
      email: user.email,
      name: user.name,
      role: user.roles,
    },
  });
});

import { Request, Response } from "express";
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

export interface userInterface {
  id: string;
  name: string;
  email: string;
  role: string;
  phone?: string;
  profileImage: string;
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

export const googleCallback = catchAsync(
  async (req: Request, res: Response) => {
    const user = req.user as any;

    if (!user) {
      throw new AppError("Authentication failed", 401);
    }

    setAuthCookies(res, {
      userId: user._id.toString(),
      userRole: user.roles,
    });

    if (!user.phone) {
      return res.redirect(
        `${env.CLIENT_URL}/?auth=success&mode=completeProfile`,
      );
    }

    return res.redirect(`${env.CLIENT_URL}/role-redirect`);
  },
);

export const refreshToken = catchAsync(async (req: Request, res: Response) => {
  const token = req.cookies?.refreshToken;

  if (!token) {
    throw new AppError("Refresh token missing. Please login again", 401);
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

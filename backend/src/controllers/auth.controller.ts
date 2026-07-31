import { Request, Response } from "express";
import { loginSchema, registerSchema } from "@validators/auth.schema";
import { OTPValidator } from "@validators/OTP.validator";
import {
  loginService,
  registerService,
  sendOTPService,
  verifyOTPService,
  MeService,
} from "@service/auth.service";
import { catchAsync } from "@utils/catchAsync";
import { AppError } from "@utils/AppError";
import {
  generateAccessToken,
  generateRefreshToken,
  TokenPayload,
} from "@utils/generateTokens";
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
    sameSite: (env.NODE_ENV === "production" ? "none" : "strict") as
      | "none"
      | "strict",
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
    throw new AppError(
      `Invalid data ${validate.error.flatten().fieldErrors}`,
      400,
    );
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
    throw new AppError(
      `Invalid data ${validate.error.flatten().fieldErrors}`,
      400,
    );
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
    throw new AppError(
      `Invalid data ${validate.error.flatten().fieldErrors}`,
      400,
    );
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

export const logout = (_req: Request, res: Response) => {
  const cookieOptions = {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: (env.NODE_ENV === "production" ? "none" : "strict") as
      | "none"
      | "strict",
  };

  res.clearCookie("accessToken", cookieOptions);
  res.clearCookie("refreshToken", cookieOptions);

  res.status(200).json({
    success: true,
    message: "Logged out",
  });
};

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

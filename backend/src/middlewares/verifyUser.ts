import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import * as Sentry from "@sentry/node";
import { catchAsync } from "@utils/catchAsync";
import { AppError } from "@utils/AppError";
import { env } from "@config/env";
import { TokenPayload, generateAccessToken } from "@utils/generateTokens";
import { refreshTokenService } from "../service/auth.service";
import { User } from "@models/user.model";

export const VerifyUser = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    let token = req.cookies?.accessToken;
    let decoded: TokenPayload | null = null;

    if (token) {
      try {
        decoded = jwt.verify(token, env.JWT_ACCESS_SECRET) as TokenPayload;
      } catch (err) {
        decoded = null;
      }
    }

    // If access token is missing or expired, attempt transparent silent refresh using the 7-day refresh token cookie
    if (!decoded && req.cookies?.refreshToken) {
      try {
        const payload = await refreshTokenService(req.cookies.refreshToken);
        const newAccessToken = generateAccessToken(payload);
        const cookieOptions = {
          httpOnly: true,
          secure: env.NODE_ENV === "production",
          sameSite: (env.NODE_ENV === "production" ? "none" : "lax") as
            | "none"
            | "lax",
          maxAge: 15 * 60 * 1000,
        };
        res.cookie("accessToken", newAccessToken, cookieOptions);
        decoded = payload;
      } catch (refreshErr) {
        decoded = null;
      }
    }

    if (!decoded) {
      throw new AppError("Unauthorized. Please login", 401);
    }

    req.userId = decoded.userId;
    req.userRole = decoded.userRole;

    const user = await User.findById(decoded.userId).select("isBlocked");
    if (user?.isBlocked) {
      throw new AppError(
        "Your account has been suspended. Please contact support.",
        403,
      );
    }

    Sentry.setUser({ id: decoded.userId });

    next();
  },
);

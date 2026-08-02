import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import * as Sentry from "@sentry/node";
import { catchAsync } from "@utils/catchAsync";
import { AppError } from "@utils/AppError";
import { env } from "@config/env";
import { TokenPayload } from "@utils/generateTokens";
import { User } from "@models/user.model";

export const VerifyUser = catchAsync(
  async (req: Request, _res: Response, next: NextFunction) => {
    //browser ayutomatically cookie bhejta
    const token = req.cookies?.accessToken;
    //if cookie nahi mtlb logged in nahi hain
    if (!token) {
      throw new AppError("Unauthorized. Please login", 401);
    }

    // If this throws (expired/invalid), it's caught by catchAsync and
    // forwarded to globalErrorHandler, which converts JWT errors into
    // clean 401 messages (see error.middleware.ts).

    //check verify token || expired toh nahi || token fake toh nahi || signature match karti   and decoded ke pas data nikal ke aajata
    const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET) as TokenPayload;

    req.userId = decoded.userId;
    req.userRole = decoded.userRole;

    const user = await User.findById(decoded.userId).select("isBlocked");
    if (user?.isBlocked) {
      throw new AppError("Your account has been suspended. Please contact support.", 403);
    }

    //agar baad mein errror sentry will display in  its dashboard
    Sentry.setUser({ id: decoded.userId });

    next();
  },
);







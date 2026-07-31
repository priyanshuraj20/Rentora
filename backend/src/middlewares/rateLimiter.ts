import rateLimit from "express-rate-limit";
import { Request, Response } from "express";

declare module "express-serve-static-core" {
  interface Request {
    rateLimit: {
      limit: number;
      current: number;
      remaining: number;
      resetTime: Date;
    };
  }
}

export const RATE_LIMITER = rateLimit({
  windowMs: 15 * 60 * 1000, //15 min Ye time window hai.
  max: 100, //mtlb 15 min mein 100 request
  message: {
    error: "Too many requests from this IP address",
    retryAfter: "15 minutes",
    documentation: "https://api.example.com/docs/rate-limits",
  },

  //Express response me headers bhejta hai.Example
  // RateLimit-Limit:100
  // RateLimit-Remaining:40
  // RateLimit-Reset:123456
  // Frontend ko bhi pata chal jata hai.
  standardHeaders: true,
  legacyHeaders: false, //Purane headers. Aajkal nahi use karte.


  //handler : default message ki jagah khud response bhejna 
  handler: (req: Request, res: Response) => {
    res.status(429).json({
      error: "Rate limit exceeded",
      message: "Too many requests from this IP, please try again later",
      retryAfter: Math.round(req.rateLimit.resetTime.getTime() / 1000), //Ye batata hai.Kab dobara request kar sakte.
    });
  },
});

export const AUTH_LIMITER = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 5,
  message: {
    error: "Too many authentication attempts",
    retryAfter: "10 minutes",
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req: Request, res: Response) => {
    res.status(429).json({
      success: false,
      error: "Rate limit exceeded",
      message: "Too many authentication attempts, please try again later",
      retryAfter: Math.round(req.rateLimit.resetTime.getTime() / 1000),
    });
  },
});

export const OTP_LIMITER = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 3,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req: Request, res: Response) => {
    res.status(429).json({
      success: false,
      error: "Rate limit exceeded",
      message:
        "Too many OTP requests. Please wait 10 minutes before trying again.",
      retryAfter: Math.round(req.rateLimit.resetTime.getTime() / 1000),
    });
  },
});

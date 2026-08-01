import rateLimit from "express-rate-limit";

export const phoneVerificationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP/user to 5 verification attempts per 15 minutes
  message: {
    success: false,
    message: "Too many phone verification attempts from this IP. Please try again after 15 minutes.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

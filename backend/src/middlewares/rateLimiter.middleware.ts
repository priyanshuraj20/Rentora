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

export const qrGenerationLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 5,
  keyGenerator: (req) => req.userId || req.ip || "",
  message: {
    success: false,
    message: "Too many QR code requests. Please try again in 5 minutes.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import * as Sentry from "@sentry/node";

import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./config/swagger";
import passport from "@config/passport";

import { env } from "@config/env";
import { healthController } from "@controllers/health.controller";
import { globalErrorHandler } from "@middlewares/error.middleware";
import { AppError } from "@utils/AppError";


import authRouter from "./routes/auth.route";
import userRouter from "./routes/user.route";
import itemRouter from "./routes/items.route";
import bookingRouter from "./routes/booking.route";
import exploreRouter from "./routes/explore.route";
import paymentRouter from "./routes/payment.route";
import notificationRouter from "./routes/notification.route";
import reviewRouter from "./routes/review.route";
import messageRouter from "./routes/message.route";
import csrfRouter, { verifyCsrf } from "./routes/csrf.route";

const app = express();
app.set("trust proxy", 1);

// -------------------- CORS --------------------
// credentials:true needed because we'll send JWT via httpOnly cookie
app.use(
  cors({
    origin: env.CLIENT_URL,
    credentials: true,
  }),
);

// -------------------- SECURITY & PARSING --------------------
app.use(helmet()); // sets safe HTTP headers (XSS, sniffing, etc.)
app.use(morgan(env.NODE_ENV === "development" ? "dev" : "combined"));
app.use(express.json({ limit: "10kb" })); // caps body size — basic DoS guard
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(passport.initialize());

// -------------------- RATE LIMITING --------------------
// Generic limiter for all routes. Stricter limiters (e.g. AUTH_LIMITER)
// get added per-route later, in Phase 4.
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 2000, // 2000 requests per IP per window
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many requests from this IP, please try again after 15 minutes.",
  },
});
app.use(globalLimiter);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// -------------------- HEALTH CHECK --------------------
app.get("/health", healthController);

// -------------------- CSRF & ROUTES --------------------
app.use(csrfRouter);
app.use("/api/v1", csrfRouter);
app.use(verifyCsrf);

app.use("/api/v1/auth", authRouter);
app.use("/auth", authRouter);
app.use("/api/v1/user", userRouter);
app.use("/api/v1/items", itemRouter);
app.use("/api/v1/booking", bookingRouter);
app.use("/api/v1/explore", exploreRouter);
app.use("/api/v1/payments", paymentRouter);
app.use("/api/v1/notifications", notificationRouter);
app.use("/api/v1/reviews", reviewRouter);
app.use("/api/v1/messages", messageRouter);

// -------------------- SENTRY ERROR HANDLER --------------------
// Must come after all routes, before our own error handlers.
// By default Sentry only reports errors with status >= 500 (or no status),
// so our 404 AppErrors below won't spam Sentry as "errors".
Sentry.setupExpressErrorHandler(app);

// -------------------- ROOT ENDPOINT --------------------
app.get("/", (_req, res) => {
  return res.status(200).json({
    success: true,
    message: "Rentora API is running 🚀",
    version: "1.0.0",
  });
});

// -------------------- 404 HANDLER --------------------
app.use((req, _res, next) => {
  next(new AppError(`Route ${req.originalUrl} not found`, 404));
});

// -------------------- GLOBAL ERROR HANDLER (always last) --------------------
app.use(globalErrorHandler);

export default app;

import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import * as Sentry from "@sentry/node";

import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./config/swagger";

import { env } from "@config/env";
import { healthController } from "@controllers/health.controller";
import { globalErrorHandler } from "@middlewares/error.middleware";
import { AppError } from "@utils/AppError";


import authRouter from "./routes/auth.route";
import userRouter from "./routes/user.route";
import itemRouter from "./routes/items.route";
import bookingRouter from "./routes/booking.route";
import exploreRouter from "./routes/explore.route";

const app = express();

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

// -------------------- RATE LIMITING --------------------
// Generic limiter for all routes. Stricter limiters (e.g. AUTH_LIMITER)
// get added per-route later, in Phase 4.
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 200, // 200 requests per IP per window
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(globalLimiter);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// -------------------- HEALTH CHECK --------------------
app.get("/health", healthController);

// -------------------- ROUTES --------------------
// Will mount things like: app.use("/api/v1/auth", authRoute) from Phase 4 onward.
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/user", userRouter);
app.use("/api/v1/items", itemRouter);
app.use("/api/v1/booking", bookingRouter);
app.use("/api/v1/explore", exploreRouter);

// -------------------- SENTRY ERROR HANDLER --------------------
// Must come after all routes, before our own error handlers.
// By default Sentry only reports errors with status >= 500 (or no status),
// so our 404 AppErrors below won't spam Sentry as "errors".
Sentry.setupExpressErrorHandler(app);

// -------------------- 404 HANDLER --------------------
app.use((req, _res, next) => {
  next(new AppError(`Route ${req.originalUrl} not found`, 404));
});

// -------------------- GLOBAL ERROR HANDLER (always last) --------------------
app.use(globalErrorHandler);

export default app;

import { Router, Request, Response, NextFunction } from "express";
import crypto from "crypto";
import { env } from "@config/env";
import { AppError } from "@utils/AppError";

const router = Router();

export const CSRF_SECRET_COOKIE = "_csrf";

/**
 * Generate a deterministic CSRF token based on secret cookie
 */
export function generateCsrfToken(secret: string): string {
  return crypto
    .createHmac("sha256", secret)
    .update("rentora-csrf-secret")
    .digest("hex");
}

/**
 * Timing-safe string comparison to prevent timing side-channel attacks
 */
function safeCompare(a: string, b: string): boolean {
  if (typeof a !== "string" || typeof b !== "string") return false;
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

/**
 * GET /api/v1/csrf-token
 * Sets httpOnly secret cookie if not present, and returns JSON containing { csrfToken }
 */
router.get("/csrf-token", (req: Request, res: Response) => {
  let secret = req.cookies?.[CSRF_SECRET_COOKIE];

  if (!secret) {
    secret = crypto.randomBytes(32).toString("hex");
    res.cookie(CSRF_SECRET_COOKIE, secret, {
      httpOnly: true,
      secure: env.NODE_ENV === "production",
      sameSite: (env.NODE_ENV === "production" ? "none" : "lax") as
        | "none"
        | "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
  }

  const csrfToken = generateCsrfToken(secret);

  res.status(200).json({
    success: true,
    csrfToken,
  });
});

/**
 * Middleware to verify CSRF token on state-changing requests (OWASP standard)
 */
export const verifyCsrf = (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  // Safe HTTP methods (GET, HEAD, OPTIONS) do not alter server state
  if (["GET", "HEAD", "OPTIONS"].includes(req.method)) {
    return next();
  }

  // Exempt auth routes where user is initializing session / unauthenticated.
  // Use req.originalUrl because this middleware is mounted at the app level
  // where req.path includes the full /api/v1 prefix.
  const url = req.originalUrl;
  const exemptPrefixes = [
    "/api/v1/auth/login",
    "/api/v1/auth/register",
    "/api/v1/auth/send-otp",
    "/api/v1/auth/verify-otp",
    "/api/v1/auth/refresh",
    "/api/v1/auth/forgot-password",
    "/api/v1/auth/reset-password",
    "/api/v1/auth/google",
    "/api/v1/auth/logout",
    "/api/v1/notifications/read",
    "/auth/login",
    "/auth/register",
    "/auth/send-otp",
    "/auth/verify-otp",
    "/auth/refresh",
    "/auth/forgot-password",
    "/auth/reset-password",
    "/auth/google",
    "/auth/logout",
    "/notifications/read",
  ];
  if (exemptPrefixes.some((prefix) => url.startsWith(prefix))) {
    return next();
  }

  const clientToken = (req.headers["x-csrf-token"] ||
    req.headers["x-xsrf-token"]) as string | undefined;

  if (!clientToken) {
    return next(new AppError("CSRF token missing", 403));
  }

  const secret = req.cookies?.[CSRF_SECRET_COOKIE];
  if (!secret) {
    return next(new AppError("Invalid CSRF session cookie", 403));
  }

  const expectedToken = generateCsrfToken(secret);
  if (!safeCompare(clientToken, expectedToken)) {
    return next(new AppError("Invalid CSRF token", 403));
  }

  next();
};

export default router;

import { Router } from "express";
import {
  login,
  logout,
  me,
  register,
  sendOTP,
  verifyOTP,
  googleCallback,
  refreshToken,
  forgotPassword,
  resetPassword,
} from "../controllers/auth.controller";
import passport from "passport";
import { VerifyUser } from "../middlewares/verifyUser";
import { OTP_LIMITER } from "../middlewares/rateLimiter";

const router = Router();

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: User registered successfully
 */
router.post("/register", register);

/**
 * @swagger
 * /auth/send-otp:
 *   post:
 *     summary: Request for the otp
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: OTP sent successfully
 */
router.post("/send-otp", OTP_LIMITER, sendOTP);

/**
 * @swagger
 * /auth/verify-otp:
 *   post:
 *     summary: Verify the otp
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               otp:
 *                 type: string
 *     responses:
 *       200:
 *         description: OTP verified successfully
 */
router.post("/verify-otp", verifyOTP);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login a user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: User logged in successfully
 */
router.post("/login", login);

/**
 * @swagger
 * /auth/me:
 *   get:
 *     summary: Get current user
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: User fetched successfully
 */
router.get("/me", VerifyUser, me);

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Logout a user
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: User logged out successfully
 */
router.post("/logout", VerifyUser, logout);

/**
 * @swagger
 * /auth/refresh:
 *   post:
 *     summary: Refresh Access Token
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Access token refreshed successfully
 *       401:
 *         description: Refresh token missing or expired
 */
router.post("/refresh", refreshToken);

/**
 * @swagger
 * /auth/google:
 *   get:
 *     summary: Initiate Google OAuth
 *     tags: [Auth]
 *     parameters:
 *       - in: query
 *         name: flow
 *         schema:
 *           type: string
 *         description: "State to distinguish between 'login' and 'register'"
 */
router.get("/google", (req, res, next) => {
  const { flow } = req.query;
  passport.authenticate("google", {
    scope: ["profile", "email"],
    state: flow as string,
  })(req, res, next);
});

/**
 * @swagger
 * /auth/google/callback:
 *   get:
 *     summary: Google OAuth Callback
 *     tags: [Auth]
 */
router.get(
  "/google/callback",
  passport.authenticate("google", { session: false }),
  googleCallback,
);

router.post("/forgot-password", OTP_LIMITER, forgotPassword);
router.post("/reset-password", resetPassword);

export default router;

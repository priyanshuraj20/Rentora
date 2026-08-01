import { Router } from "express";
import { VerifyUser } from "../middlewares/verifyUser";
import {
  createProfile,
  getProfile,
  updateProfile,
  updateProfileImage,
  deleteProfile,
  updateAddress,
  dashboard,
  getWishlist,
  toggleWishlist,
  getUserVerifications,
} from "../controllers/user.controller";

const router = Router();

//yeh comments runtime mein execute nahi hote bas  swagger jsdoc padhta
/**
 * @swagger
 * /user/me/profile:
 *   post:
 *     summary: Create the User's Profile
 *     tags: [User]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               phone:
 *                 type: string
 *               profileImage:
 *                 type: string
 *               address:
 *                 type: object
 *                 properties:
 *                   district:
 *                     type: string
 *                   state:
 *                     type: string
 *                   pincode:
 *                     type: string
 *               roles:
 *                 type: string
 *                 enum: [renter, owner, admin]
 *     responses:
 *       201:
 *         description: Profile created successfully
 */
router.post("/me/profile", VerifyUser, createProfile);

/**
 * @swagger
 * /user/me/profile:
 *   get:
 *     summary: Get the User's Profile
 *     tags: [User]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Profile fetched successfully
 */
router.get("/me/profile", VerifyUser, getProfile);

/**
 * @swagger
 * /user/me/profile:
 *   patch:
 *     summary: Update the User's Profile
 *     tags: [User]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               phone:
 *                 type: string
 *     responses:
 *       200:
 *         description: Profile updated successfully
 */
router.patch("/me/profile", VerifyUser, updateProfile);

import { uploadSingleImage } from "../middlewares/upload.middleware";

/**
 * @swagger
 * /user/me/avatar:
 *   patch:
 *     summary: Update the User's Profile Image
 *     tags: [User]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               profileImage:
 *                 type: string
 *     responses:
 *       200:
 *         description: Profile image updated successfully
 */
router.patch(
  "/me/avatar",
  VerifyUser,
  uploadSingleImage("profileImage"),
  updateProfileImage,
);

/**
 * @swagger
 * /user/me/profile:
 *   delete:
 *     summary: Delete the User's Profile
 *     tags: [User]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Profile deleted successfully
 */
router.delete("/me/profile", VerifyUser, deleteProfile);

/**
 * @swagger
 * /user/me/address:
 *   patch:
 *     summary: Update the User's Address
 *     tags: [User]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               pincode:
 *                 type: string
 *               district:
 *                 type: string
 *               state:
 *                 type: string
 *     responses:
 *       200:
 *         description: Address updated successfully
 */
router.patch("/me/address", VerifyUser, updateAddress);

/**
 * @swagger
 * /user/dashboard:
 *   get:
 *     summary: Get the User's Dashboard
 *     tags: [User]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Dashboard fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               oneOf:
 *                 - type: object
 *                   properties:
 *                     totalListings:
 *                       type: integer
 *                     activeRentals:
 *                       type: integer
 *                     totalEarnings:
 *                       type: number
 *                 - type: object
 *                   properties:
 *                     activeRentals:
 *                       type: integer
 *                     upcomingRentals:
 *                       type: integer
 *                     wishlist:
 *                       type: integer
 *       400:
 *         description: Invalid user role
 *       404:
 *         description: User not found
 */
router.get("/dashboard", VerifyUser, dashboard);

/**
 * @swagger
 * /user/wishlist:
 *   get:
 *     summary: Get the User's Wishlist
 *     tags: [User]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Wishlist fetched successfully
 *       404:
 *         description: User not found
 */
router.get("/wishlist", VerifyUser, getWishlist);

/**
 * @swagger
 * /user/wishlist/toggle:
 *   post:
 *     summary: Toggle item in User's Wishlist
 *     tags: [User]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               itemId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Wishlist toggled successfully
 */
router.post("/wishlist/toggle", VerifyUser, toggleWishlist);

/**
 * @swagger
 * /user/me/verifications:
 *   get:
 *     summary: Get user verification badges & selfie status
 *     tags: [User]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Verifications fetched successfully
 */
router.get("/me/verifications", VerifyUser, getUserVerifications);

import { verifyPhoneFirebase } from "../controllers/verification.controller";

/**
 * @swagger
 * /user/me/verification/phone-firebase:
 *   post:
 *     summary: Verify phone number using Firebase SMS OTP Token
 *     tags: [User]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               idToken:
 *                 type: string
 *               phoneNumber:
 *                 type: string
 *     responses:
 *       200:
 *         description: Phone number verified successfully
 */
import { phoneVerificationLimiter } from "../middlewares/rateLimiter.middleware";

router.post("/me/verification/phone-firebase", VerifyUser, phoneVerificationLimiter, verifyPhoneFirebase);

export default router;

import admin from "../config/firebase";
import { User } from "../models/user.model";
import { AppError } from "../utils/AppError";
import logger from "../config/logger";

export const verifyPhoneFirebaseService = async (
  userId: string,
  idToken: string,
  phoneNumber: string,
) => {
  logger.info("Verifying phone number via Firebase Admin SDK", { userId, phoneNumber });

  if (!idToken) {
    throw new AppError("Firebase ID Token is required", 400);
  }
  if (!phoneNumber) {
    throw new AppError("Phone number is required", 400);
  }

  // 1. Verify Firebase ID Token using Firebase Admin SDK
  let decodedToken: any;
  try {
    decodedToken = await (admin as any).auth().verifyIdToken(idToken);
  } catch (error: any) {
    logger.error("Firebase ID token verification failed", { error: error.message, userId });
    throw new AppError("Invalid or expired SMS OTP token. Please try again.", 401);
  }

  // Ensure the token's decoded phone number matches
  const tokenPhoneNumber = decodedToken.phone_number;
  if (!tokenPhoneNumber) {
    throw new AppError("Token does not contain a verified phone number", 400);
  }

  // Normalize phone numbers for comparison
  const normalizedRequestedPhone = phoneNumber.startsWith("+") ? phoneNumber : `+91${phoneNumber.replace(/\D/g, "")}`;
  if (tokenPhoneNumber !== normalizedRequestedPhone) {
    logger.warn("Phone number mismatch in token", { tokenPhoneNumber, normalizedRequestedPhone });
    throw new AppError("Verified phone number does not match requested phone number", 400);
  }

  // 2. Check for duplicate phone number across other users
  const existingUser = await User.findOne({
    $or: [
      { phone: tokenPhoneNumber },
      { "verifications.phone.phoneNumber": tokenPhoneNumber },
    ],
  });

  if (existingUser && existingUser._id.toString() !== userId) {
    logger.warn("Phone number already registered to another account", { tokenPhoneNumber });
    throw new AppError("Phone number is already linked to another verified Rentora account", 400);
  }

  // 3. Update User document with verified phone status
  const user = await User.findById(userId);
  if (!user) {
    throw new AppError("User not found", 404);
  }

  user.phone = tokenPhoneNumber;
  if (!user.verifications) {
    user.verifications = {
      email: { isVerified: user.isVerified },
      phone: { isVerified: false },
      govtId: { status: "none" },
    };
  }

  user.verifications.phone = {
    isVerified: true,
    phoneNumber: tokenPhoneNumber,
    verifiedAt: new Date(),
  };

  await user.save();

  logger.info("Phone verification completed successfully", { userId, tokenPhoneNumber });

  return {
    success: true,
    message: "Phone number verified successfully via SMS OTP",
    phone: tokenPhoneNumber,
    verifications: user.verifications,
  };
};

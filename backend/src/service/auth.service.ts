import bcrypt from "bcrypt";
import { User } from "../models/user.model";
import logger from "../config/logger";
import { userInterface } from "../controllers/auth.controller";
import { OTP } from "../models/OTP.model";
import { sendOTP } from "../utils/sendEmails";
import { AppError } from "../utils/AppError";
import { TokenPayload } from "../utils/generateTokens";

export const registerService = async (userData: {
  email: string;
  password: string;
}) => {
  logger.info("User registration started", { email: userData.email });

  const isExist = await User.findOne({ email: userData.email });

  if (isExist) {
    logger.warn("User already exists", { email: userData.email });
    throw new AppError("User already exists", 400);
  }

  const hashedPassword = await bcrypt.hash(userData.password, 10);

  await User.create({
    email: userData.email,
    password: hashedPassword,
  });

  logger.info("User registered successfully", { email: userData.email });
};

export const sendOTPService = async (email: string) => {
  logger.info("OTP generation requested", { email });

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

  const hashedOtp = await bcrypt.hash(otp, 10);

  await OTP.create({
    email,
    otp: hashedOtp,
    expiresAt,
  });

  await sendOTP(email, otp);

  logger.info("OTP sent successfully", { email });
};

export const verifyOTPService = async (otpData: {
  email: string;
  otp: string;
}): Promise<TokenPayload> => {
  logger.info("OTP verification attempt", { email: otpData.email });

  const isExist = await OTP.findOne({ email: otpData.email }).sort({
    createdAt: -1,
  });

  if (!isExist) {
    logger.warn("OTP not found", { email: otpData.email });
    throw new AppError("OTP not found", 400);
  }

  const isOtpValid = await bcrypt.compare(otpData.otp, isExist.otp);

  if (!isOtpValid) {
    logger.warn("Invalid OTP", { email: otpData.email });
    throw new AppError("Invalid OTP", 400);
  }

  if (isExist.expiresAt < new Date()) {
    logger.warn("OTP expired", { email: otpData.email });
    throw new AppError("OTP expired", 410);
  }

  await OTP.deleteOne({ email: otpData.email });

  await User.updateOne({ email: otpData.email }, { isVerified: true });

  const user = await User.findOne({ email: otpData.email });

  if (!user) {
    logger.warn("User not found after OTP verification", {
      email: otpData.email,
    });
    throw new AppError("User not found", 400);
  }

  logger.info("OTP verified successfully", {
    email: otpData.email,
  });

  return {
    userId: user._id.toString(),
    userRole: user.roles,
  };
};

export const loginService = async (userData: {
  email: string;
  password: string;
}): Promise<TokenPayload> => {
  logger.info("User login attempt", { email: userData.email });

  const user = await User.findOne({ email: userData.email });

  if (!user) {
    logger.warn("User not found", { email: userData.email });
    throw new AppError("User Not Found", 400);
  }

  if (!user.isVerified) {
    logger.warn("User not verified", { email: userData.email });
    throw new AppError("User Not Verified", 403);
  }

  const isPasswordValid = await bcrypt.compare(
    userData.password,
    user.password,
  );

  if (!isPasswordValid) {
    logger.warn("Invalid password", { email: userData.email });
    throw new AppError("Invalid Password", 400);
  }

  logger.info("User login success", {
    email: userData.email,
    userId: user._id,
  });

  return {
    userId: user._id.toString(),
    userRole: user.roles,
  };
};

export const MeService = async (id: string | undefined) => {
  logger.info("Fetching current user profile", { userId: id });

  if (!id) {
    throw new AppError("Id is not defined", 400);
  }

  const user = await User.findById(id);

  if (!user) {
    logger.warn("User not found", { userId: id });
    throw new AppError("User Not Found", 400);
  }

  const userResponse: userInterface = {
    id: user._id.toString(),
    email: user.email,
    name: user.name!,
    role: user.roles!,
    phone: user.phone!,
    profileImage: user.profileImage!,
  };

  logger.info("User profile fetched successfully", { userId: id });

  return userResponse;
};

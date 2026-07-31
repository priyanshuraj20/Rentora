import { Request, Response } from "express";
import logger from "../config/logger";
import {
  updateProfileSchema,
  updateAddressSchema,
  profileSchema,
} from "../validators/user.schema";
import {
  updateProfileService,
  userProfileService,
  getUserProfileService,
  updateProfileImageService,
  deleteProfileService,
  updateAddressService,
  dashboardDataService,
  getWishlistService,
  toggleWishlistService,
} from "../service/user.service";
import { catchAsync } from "../utils/catchAsync";
import { AppError } from "../utils/AppError";

export const createProfile = catchAsync(async (req: Request, res: Response) => {
  const validate = profileSchema.safeParse(req.body);
  if (!validate.success) {
    throw new AppError(`Invalid Data ${validate.error.flatten()}`, 400);
  }

  await userProfileService(req.userId!, validate.data);
  res
    .status(201)
    .json({ success: true, message: "Profile created successfully" });
});

export const getProfile = catchAsync(async (req: Request, res: Response) => {
  const user = await getUserProfileService(req.userId!);
  res.status(200).json({ success: true, user });
});

export const updateProfile = catchAsync(async (req: Request, res: Response) => {
  const validate = updateProfileSchema.safeParse(req.body);
  if (!validate.success) {
    throw new AppError(`Invalid Data ${validate.error.flatten()}`, 400);
  }

  await updateProfileService(req.userId!, validate.data);
  res
    .status(200)
    .json({ success: true, message: "Profile updated successfully" });
});

export const updateProfileImage = catchAsync(
  async (req: Request, res: Response) => {
    const { profileImage } = req.body;
    if (!profileImage) {
      throw new AppError("Profile Image is required", 400);
    }

    await updateProfileImageService(req.userId!, profileImage);
    res
      .status(200)
      .json({ success: true, message: "Profile image updated successfully" });
  },
);

export const updateAddress = catchAsync(async (req: Request, res: Response) => {
  const validate = updateAddressSchema.safeParse(req.body);
  if (!validate.success) {
    throw new AppError(`Invalid Data ${validate.error.flatten()}`, 400);
  }

  await updateAddressService(req.userId!, validate.data);
  res
    .status(200)
    .json({ success: true, message: "Address updated successfully" });
});

export const deleteProfile = catchAsync(async (req: Request, res: Response) => {
  await deleteProfileService(req.userId!);
  res
    .status(200)
    .json({ success: true, message: "Profile deleted successfully" });
});

export const dashboard = catchAsync(async (req: Request, res: Response) => {
  const data = await dashboardDataService(req.userId!);
  res
    .status(200)
    .json({
      success: true,
      data: data,
      message: "Dashboard data fetched successfully",
    });
});

export const getWishlist = catchAsync(async (req: Request, res: Response) => {
  const wishlist = await getWishlistService(req.userId!);
  res
    .status(200)
    .json({
      success: true,
      data: wishlist,
      message: "Wishlist fetched successfully",
    });
});

export const toggleWishlist = catchAsync(
  async (req: Request, res: Response) => {
    const { itemId } = req.body;
    if (!itemId) {
      throw new AppError("Item ID is required", 400);
    }

    const result = await toggleWishlistService(req.userId!, itemId);
    res
      .status(200)
      .json({ success: true, data: result, message: result.message });
  },
);

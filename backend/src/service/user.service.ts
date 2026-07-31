import { User } from "../models/user.model";
import { Item } from "../models/item.model";
import { Booking } from "../models/booking.model";
import { z } from "zod";
import {
  profileSchema,
  updateProfileSchema,
  updateAddressSchema,
} from "../validators/user.schema";
import { AppError } from "../utils/AppError";
import logger from "../config/logger";

export const userProfileService = async (
  userId: string,
  userData: z.infer<typeof profileSchema>,
) => {
  logger.info("Creating user profile", { userId });

  const isMobileExists = await User.findOne({ phone: userData.phone });

  if (isMobileExists) {
    logger.warn("Mobile already exists", { phone: userData.phone });
    throw new AppError("Mobile number already exists", 400);
  }

  const user = await User.findByIdAndUpdate(userId, userData, { new: true });

  if (!user) {
    logger.error("User not found while creating profile", { userId });
    throw new AppError("User not found", 404);
  }

  logger.info("User profile created successfully", { userId });

  return { success: true, user };
};

export const getUserProfileService = async (userId: string) => {
  logger.info("Fetching user profile", { userId });

  const user = await User.findById(userId).select("-password");

  if (!user) {
    logger.warn("User profile not found", { userId });
    throw new AppError("User not found", 404);
  }

  const profile: any = {
    id: user._id.toString(),
    email: user.email,
    name: user.name!,
    phone: user.phone!,
    address: {
      pincode: user.address?.pincode!,
      district: user.address?.district!,
      state: user.address?.state!,
    },
    profileImage: user.profileImage!,
  };

  if (user.roles === "renter") {
    profile.renter = user.renter;
  }

  if (user.roles === "owner") {
    profile.owner = user.owner;
  }

  logger.info("User profile fetched successfully", { userId });

  return profile;
};

export const updateProfileService = async (
  userId: string,
  userData: z.infer<typeof updateProfileSchema>,
) => {
  logger.info("Updating user profile", { userId });

  const allowedFields = ["name", "phone", "address"];

  const filteredData = Object.fromEntries(
    Object.entries(userData).filter(([key]) => allowedFields.includes(key)),
  );

  const user = await User.findByIdAndUpdate(
    userId,
    { $set: filteredData },
    { new: true, runValidators: true },
  );

  if (!user) {
    logger.warn("Update profile failed - user not found", { userId });
    throw new AppError("User not found", 404);
  }

  logger.info("User profile updated successfully", { userId });

  return { success: true };
};

export const updateProfileImageService = async (
  userId: string,
  profileImage: string,
) => {
  logger.info("Updating profile image", { userId });

  const user = await User.findByIdAndUpdate(
    userId,
    { $set: { profileImage } },
    { new: true, runValidators: true },
  );

  if (!user) {
    logger.warn("Profile image update failed - user not found", { userId });
    throw new AppError("User not found", 404);
  }

  logger.info("Profile image updated successfully", { userId });

  return { success: true };
};

export const updateAddressService = async (
  userId: string,
  address: z.infer<typeof updateAddressSchema>,
) => {
  logger.info("Updating address", { userId });

  const user = await User.findByIdAndUpdate(
    userId,
    { $set: { address } },
    { new: true, runValidators: true },
  );

  if (!user) {
    logger.warn("Address update failed - user not found", { userId });
    throw new AppError("User not found", 404);
  }

  logger.info("Address updated successfully", { userId });

  return { success: true };
};

export const deleteProfileService = async (userId: string) => {
  logger.warn("Deleting user profile", { userId });

  const user = await User.findByIdAndDelete(userId);

  if (!user) {
    logger.error("Delete profile failed - user not found", { userId });
    throw new AppError("User not found", 404);
  }

  logger.warn("User profile deleted", { userId });

  return { success: true };
};

export const dashboardDataService = async (userId: string) => {
  logger.info("Fetching dashboard data", { userId });

  const user = await User.findById(userId).lean();

  if (!user) {
    logger.error("Dashboard fetch failed - user not found", { userId });
    throw new AppError("User not found", 404);
  }

  if (user.roles === "owner") {
    logger.info("Fetching owner dashboard stats", { userId });

    const activeOwnerRentals = await Booking.countDocuments({
      owner_id: userId,
      booking_status: "ongoing",
    });

    const totalListings = await Item.countDocuments({
      ownerId: userId,
    });

    const recentRentals = await Booking.find({ owner_id: userId })
      .populate("item_id", "title images category rating")
      .populate("renter_id", "name profileImage")
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    const formattedRentals = recentRentals.map((booking: any) => ({
      id: booking._id.toString(),
      title: booking.item_id?.title || "Unknown Item",
      image: booking.item_id?.images?.[0] || null,
      rentedBy: booking.renter_id?.name || "Unknown Renter",
      status:
        booking.booking_status === "ongoing"
          ? "Active"
          : booking.booking_status === "confirmed"
            ? "Upcoming"
            : booking.booking_status.charAt(0).toUpperCase() +
              booking.booking_status.slice(1),
      pricePerDay: booking.pricing?.baseRate || 0,
      rating: booking.item_id?.rating?.average || 5.0,
    }));

    logger.info("Owner dashboard stats fetched", { userId });

    return {
      totalListings,
      activeRentals: activeOwnerRentals,
      totalEarnings: user.owner?.totalEarnings ?? 0,
      rentals: formattedRentals,
    };
  }

  if (user.roles === "renter") {
    const activeRenterRentals = await Booking.countDocuments({
      renter_id: userId,
      booking_status: "ongoing",
    });

    const upcomingRentals = await Booking.countDocuments({
      renter_id: userId,
      booking_status: "confirmed",
      start_date: { $gt: new Date() },
    });

    const recentBookings = await Booking.find({ renter_id: userId })
      .populate("item_id", "title images category")
      .populate("owner_id", "name profileImage")
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    const formattedBookings = recentBookings.map((booking: any) => ({
      id: booking._id.toString(),
      status: booking.booking_status === "ongoing" ? "active" : "upcoming",
      title: booking.item_id?.title || "Unknown Item",
      dateRange: `${new Date(booking.start_date).toLocaleDateString("en-US", { month: "short", day: "numeric" })} - ${new Date(booking.end_date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}`,
      category: booking.item_id?.category || "Uncategorized",
      price: booking.pricing?.totalAmount || 0,
      image: booking.item_id?.images?.[0] || null,
    }));

    logger.info("Renter dashboard stats fetched", { userId });

    return {
      activeRentals: activeRenterRentals,
      upcomingRentals,
      wishlist: user.renter?.wishlist?.length ?? 0,
      bookings: formattedBookings,
    };
  }

  logger.error("Invalid user role for dashboard", {
    userId,
    roles: user.roles,
  });

  throw new AppError("Invalid user role", 400);
};

export const getWishlistService = async (userId: string) => {
  logger.info("Fetching user wishlist", { userId });

  const user = await User.findById(userId)
    .populate({
      path: "renter.wishlist",
      model: "Item",
    })
    .lean();

  if (!user) {
    throw new AppError("User not found", 404);
  }

  if (user.roles !== "renter") {
    throw new AppError("Only renters can have a wishlist", 400);
  }

  const wishlist = user.renter?.wishlist || [];

  const formattedWishlist = wishlist.map((item: any) => ({
    id: item._id.toString(),
    title: item.title,
    category: item.category,
    rating: item.rating?.average || 5.0,
    reviews: item.rating?.count || 0,
    pricePerDay: item.pricing?.daily || item.dailyPrice || 0,
    image: item.images?.[0] || null,
    available:
      item.item_status === "active" || item.item_status === "available",
  }));

  return formattedWishlist;
};

export const toggleWishlistService = async (userId: string, itemId: string) => {
  logger.info("Toggling wishlist item", { userId, itemId });

  const user = await User.findById(userId);

  if (!user) {
    throw new AppError("User not found", 404);
  }

  if (user.roles !== "renter") {
    throw new AppError("Only renters can have a wishlist", 400);
  }

  const itemIndex = user.renter?.wishlist?.findIndex(
    (id) => id.toString() === itemId,
  );

  let message = "";
  let isWishlisted = false;

  if (itemIndex !== undefined && itemIndex > -1) {
    // Remove from wishlist
    user.renter?.wishlist?.splice(itemIndex, 1);
    message = "Item removed from wishlist";
    isWishlisted = false;
  } else {
    // Add to wishlist
    if (!user.renter) {
      user.renter = {
        totalSpent: 0,
        totalBookings: 0,
        wishlist: [],
        rating: { average: 0, count: 0 },
      };
    }

    // Check if item exists
    const item = await Item.findById(itemId);
    if (!item) {
      throw new AppError("Item not found", 404);
    }

    user.renter?.wishlist?.push(
      new (require("mongoose").Types.ObjectId)(itemId),
    );
    message = "Item added to wishlist";
    isWishlisted = true;
  }

  await user.save();

  return { message, isWishlisted };
};

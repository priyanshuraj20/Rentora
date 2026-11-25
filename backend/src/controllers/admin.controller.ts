import { Request, Response } from "express";
import { Booking } from "../models/booking.model";
import { User } from "../models/user.model";
import { Item } from "../models/item.model";
import { catchAsync } from "../utils/catchAsync";
import { AppError } from "../utils/AppError";
import logger from "../config/logger";

/**
 * Platform Governance Overview: GMV, 10% platform commission, Escrow In-Holding, Risk Guard stats
 */
export const getPlatformOverview = catchAsync(async (_req: Request, res: Response) => {
  logger.info("Admin fetching platform overview");

  const [
    totalBookings,
    totalUsers,
    blockedUsers,
    totalListings,
    paidBookings,
    activeEscrowBookings,
    damageIncidentsCount,
  ] = await Promise.all([
    Booking.countDocuments(),
    User.countDocuments(),
    User.countDocuments({ isBlocked: true }),
    Item.countDocuments({ isActive: true }),
    Booking.find({ payment_status: "paid" }).select("pricing").lean(),
    Booking.find({
      payment_status: "paid",
      booking_status: { $in: ["confirmed", "ongoing"] },
    })
      .select("pricing")
      .lean(),
    Booking.countDocuments({
      "damageReport.tier": { $in: ["TIER_1", "TIER_2", "TIER_3"] },
    }),
  ]);

  const totalGMV = paidBookings.reduce(
    (sum, b) => sum + (b.pricing?.totalAmount || 0),
    0
  );

  const platformCommission = paidBookings.reduce(
    (sum, b) => sum + (b.pricing?.platformFee || Math.round((b.pricing?.baseRate || 0) * 0.1)),
    0
  );

  const activeEscrowHolding = activeEscrowBookings.reduce(
    (sum, b) => sum + (b.pricing?.securityDeposit || 0),
    0
  );

  res.status(200).json({
    success: true,
    data: {
      metrics: {
        totalGMV,
        platformCommission,
        activeEscrowHolding,
        totalBookings,
        totalUsers,
        blockedUsers,
        totalListings,
        damageIncidentsCount,
      },
    },
  });
});

/**
 * User Governance: list users with roles, counts of bookings/listings, wallet balance, and block status
 */
export const getAdminUsers = catchAsync(async (_req: Request, res: Response) => {
  logger.info("Admin fetching user directory");

  const [users, renterBookings, ownerBookings, itemsCount] = await Promise.all([
    User.find()
      .select("name email phone roles isBlocked isVerified walletBalance address profileImage createdAt")
      .sort({ createdAt: -1 })
      .lean(),
    Booking.aggregate([
      { $group: { _id: "$renter_id", count: { $sum: 1 } } },
    ]),
    Booking.aggregate([
      { $group: { _id: "$owner_id", count: { $sum: 1 } } },
    ]),
    Item.aggregate([
      { $group: { _id: "$ownerId", count: { $sum: 1 } } },
    ]),
  ]);

  const renterMap = new Map(renterBookings.map((r: any) => [r._id?.toString(), r.count]));
  const ownerMap = new Map(ownerBookings.map((o: any) => [o._id?.toString(), o.count]));
  const itemsMap = new Map(itemsCount.map((i: any) => [i._id?.toString(), i.count]));

  const formattedUsers = users.map((u: any) => {
    const userId = u._id.toString();
    return {
      id: userId,
      name: u.name || "Anonymous User",
      email: u.email,
      phone: u.phone || "Not provided",
      role: u.roles || "renter",
      profileImage:
        u.profileImage ||
        `https://ui-avatars.com/api/?name=${encodeURIComponent(
          u.name || "User"
        )}&background=f97316&color=fff`,
      isBlocked: u.isBlocked || false,
      isVerified: u.isVerified || false,
      walletBalance: u.walletBalance || 0,
      city: u.address?.city || u.address?.district || "Not specified",
      state: u.address?.state || "",
      pincode: u.address?.pincode || "",
      totalRentals: renterMap.get(userId) || 0,
      totalListings: itemsMap.get(userId) || 0,
      totalOwnerBookings: ownerMap.get(userId) || 0,
      joinedAt: u.createdAt,
    };
  });

  res.status(200).json({
    success: true,
    data: { users: formattedUsers },
  });
});

/**
 * Toggle User Suspension (1-click block/unblock override)
 */
export const toggleUserBlock = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;

  const user = await User.findById(id);
  if (!user) {
    throw new AppError("User not found", 404);
  }

  user.isBlocked = !user.isBlocked;
  await user.save();

  logger.info("Admin updated user suspension state", {
    userId: id,
    isBlocked: user.isBlocked,
  });

  res.status(200).json({
    success: true,
    message: `User successfully ${user.isBlocked ? "suspended" : "reactivated"}`,
    data: {
      id: user._id.toString(),
      isBlocked: user.isBlocked,
    },
  });
});

/**
 * Update User Role (Admin override: promote or change role)
 */
export const updateUserRole = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { role } = req.body;

  if (!["renter", "owner", "admin"].includes(role)) {
    throw new AppError("Invalid role specified. Must be renter, owner, or admin.", 400);
  }

  const user = await User.findById(id);
  if (!user) {
    throw new AppError("User not found", 404);
  }

  user.roles = role;
  await user.save();

  logger.info("Admin updated user role", {
    userId: id,
    newRole: role,
  });

  res.status(200).json({
    success: true,
    message: `User role successfully updated to ${role}`,
    data: {
      id: user._id.toString(),
      role: user.roles,
    },
  });
});

/**
 * Escrow & Security Deposit Ledger with Handover & Return Evidence Photos
 */
export const getEscrowLedger = catchAsync(async (_req: Request, res: Response) => {
  logger.info("Admin fetching escrow ledger with evidence photos");

  const bookings = await Booking.find({
    $or: [
      { payment_status: "paid" },
      { "pricing.securityDeposit": { $gt: 0 } },
    ],
  })
    .populate("item_id", "title images category")
    .populate("renter_id", "name email phone")
    .populate("owner_id", "name email phone")
    .sort({ createdAt: -1 })
    .lean();

  const ledger = bookings.map((b: any) => {
    const totalDeposit = b.pricing?.securityDeposit || 0;
    const isSettled = b.depositSettlement?.status === "settled";

    return {
      id: b._id.toString(),
      itemTitle: b.item_id?.title || "Rental Equipment",
      itemImage: b.item_id?.images?.[0] || null,
      itemCategory: b.item_id?.category || "Equipment",
      renterName: b.renter_id?.name || "Renter",
      renterEmail: b.renter_id?.email || "",
      renterPhone: b.renter_id?.phone || "Not provided",
      ownerName: b.owner_id?.name || "Owner",
      ownerEmail: b.owner_id?.email || "",
      ownerPhone: b.owner_id?.phone || "Not provided",
      totalDeposit,
      bookingStatus: b.booking_status,
      settlementStatus: isSettled ? "Settled" : "In Escrow Holding",
      repairDeduction: b.depositSettlement?.repairDeduction || 0,
      refundedToRenter: b.depositSettlement?.refundedToRenter || 0,
      compensatedToOwner: b.depositSettlement?.compensatedToOwner || 0,
      razorpayRefundId: b.depositSettlement?.razorpayRefundId || null,
      // Gemini AI Condition & Damage Findings
      damageTier: b.damageReport?.tier || "TIER_0",
      damageSeverity: b.damageReport?.severity || "none",
      damageSummary: b.damageReport?.summary || "Clean return (no damages detected)",
      damageFindings: b.damageReport?.findings || [],
      aiInspected: b.damageReport?.aiInspected ?? false,
      inspectedAt: b.damageReport?.inspectedAt || null,
      // Evidence Photos Captured at Delivery (Pickup) and Return
      handoverPhotos: b.handoverPhotos || [],
      returnPhotos: b.returnPhotos || [],
      handoverConfirmedAt: b.handoverConfirmedAt || null,
      returnConfirmedAt: b.returnConfirmedAt || null,
      voiceConsent: b.voiceConsent || null,
      rentalDates: {
        startDate: b.rental_dates?.startDate,
        endDate: b.rental_dates?.endDate,
      },
      pricing: b.pricing,
      createdAt: b.createdAt,
      settledAt: b.depositSettlement?.settledAt || null,
    };
  });

  res.status(200).json({
    success: true,
    data: { ledger },
  });
});

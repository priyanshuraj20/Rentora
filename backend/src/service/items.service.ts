import { Item } from "../models/item.model";
import { User } from "../models/user.model";
import mongoose from "mongoose";
import { AppError } from "../utils/AppError";
import {
  updateItemSchema,
  itemValidationSchema,
} from "../validators/item.schema";
import z from "zod";
import logger from "../config/logger";
import { ROLE } from "../validators/auth.schema";
import { addElasticSyncJob } from "../queues/elasticSync.queue";
import { geocodeCityOrAddress } from "../utils/geocoder";

function ensureOwner(role: ROLE) {
  if (role !== ROLE.OWNER) {
    logger.warn("Unauthorized access attempt", { role });
    throw new AppError("Unauthorized", 403);
  }
}

export const getItemService = async (
  id: string,
  status?: string,
  page: number = 1,
  q?: string,
  role?: ROLE,
) => {
  logger.info("Fetching items", { userId: id, status, page, q });

  ensureOwner(role!);

  // Record<string, any> resolves TypeScript's strict query type check without needing imports
  const query: Record<string, any> = {
    ownerId: new mongoose.Types.ObjectId(id),
    ...(status && { status }),
    ...(q && { $text: { $search: q } }),
  };

  const limit = 10;
  const skip = (page - 1) * limit;

  const [items, total] = await Promise.all([
    Item.find(query)
      .select(
        "title images price category rating description status securityDeposit",
      )
      .lean()
      .sort(q ? { score: { $meta: "textScore" } } : { createdAt: -1 })
      .skip(skip)
      .limit(limit),

    Item.countDocuments(query),
  ]);

  logger.info("Items fetched successfully", {
    userId: id,
    totalItems: total,
    page,
  });

  const formattedItems = items.map((item: any) => ({
    id: item._id.toString(),
    title: item.title,
    image: item.images?.[0] ?? null,
    images: item.images ?? [],
    description: item.description ?? "",
    price: item.price?.daily ?? 0,
    weeklyPrice: item.price?.weekly ?? 0,
    monthlyPrice: item.price?.monthly ?? 0,
    securityDeposit: item.securityDeposit ?? 0,
    category: item.category,
    discount: item.discount?.daily ?? null,
    rating: item.rating?.average ?? 0,
    status: item.status ?? "active",
  }));

  return {
    items: formattedItems,
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const addItemService = async (
  userId: string,
  data: z.infer<typeof itemValidationSchema>,
) => {
  logger.info("Creating new item", { userId });

  const user = await User.findById(userId).select("roles address").lean();

  if (!user) {
    logger.error("User not found while creating item", { userId });
    throw new AppError("User not found", 404);
  }

  ensureOwner(user.roles as ROLE);

  const locData = (data as any).location || {};
  const city = locData.city || user.address?.district || user.address?.state;
  const district = locData.district || user.address?.district || "";
  const state = locData.state || user.address?.state || "";
  const pincode = locData.pincode || user.address?.pincode || "";

  if (!city) {
    throw new AppError(
      "Please update your profile address or specify a pickup location before publishing a listing.",
      400,
    );
  }

  const geocoded = await geocodeCityOrAddress(city, state, district);

  const itemData: any = {
    ownerId: userId,
    ...data,
    location: {
      city,
      district,
      state,
      pincode,
      coordinates: {
        type: "Point" as const,
        coordinates: locData.coordinates?.coordinates || geocoded.coordinates,
      },
    },
  };

  const item: any = await Item.create(itemData);

  logger.info("Item created successfully", {
    userId,
    itemId: item._id,
  });

  await addElasticSyncJob("INDEX_ITEM", item._id.toString());

  return item;
};

export const updateItemService = async (
  itemId: string,
  userId: string,
  data: z.infer<typeof updateItemSchema>,
  role: ROLE,
) => {
  logger.info("Updating item", { itemId, userId });

  ensureOwner(role);

  const existingItem = await Item.findOne({ _id: itemId, ownerId: userId });
  if (!existingItem) {
    throw new AppError("Item not found", 404);
  }

  const updatePayload: any = { ...data };

  if ((data as any).location) {
    const loc = (data as any).location;
    const city = loc.city || existingItem.location?.city;
    const state = loc.state || existingItem.location?.state;
    const district = loc.district || existingItem.location?.district;
    const pincode = loc.pincode || existingItem.location?.pincode;

    if (city) {
      const geocoded = await geocodeCityOrAddress(city, state, district);
      updatePayload.location = {
        city,
        district: district || "",
        state: state || "",
        pincode: pincode || "",
        coordinates: {
          type: "Point" as const,
          coordinates: loc.coordinates?.coordinates || geocoded.coordinates,
        },
      };
    }
  }

  const item = await Item.findOneAndUpdate(
    { _id: itemId, ownerId: userId, status: { $ne: "rented" } },
    { $set: updatePayload },
    { new: true, runValidators: true },
  );

  if (!item) {
    logger.warn("Item update failed - item not found", { itemId, userId });
    throw new AppError("Item not found", 404);
  }

  logger.info("Item updated successfully", { itemId });

  await addElasticSyncJob("INDEX_ITEM", item._id.toString());

  return item;
};

export const pauseItemService = async (
  itemId: string,
  userId: string,
  role: ROLE,
) => {
  logger.info("Pausing item", { itemId, userId });

  ensureOwner(role);

  const item = await Item.findOne({ _id: itemId, ownerId: userId });

  if (!item) {
    logger.warn("Pause failed - item not found", { itemId });
    throw new AppError("Item not found", 404);
  }

  if (item.status === "rented") {
    logger.warn("Pause failed - item already rented", { itemId });
    throw new AppError("Item already rented", 400);
  }

  item.status = "paused";
  await item.save();

  logger.info("Item paused successfully", { itemId });

  await addElasticSyncJob("INDEX_ITEM", item._id.toString());
};

export const deleteItemService = async (
  itemId: string,
  userId: string,
  role: ROLE,
) => {
  logger.info("Deleting item", { itemId, userId });

  ensureOwner(role);

  const item = await Item.findOne({ _id: itemId, ownerId: userId });

  if (!item) {
    logger.warn("Delete failed - item not found", { itemId });
    throw new AppError("Item not found", 404);
  }

  if (item.status === "rented") {
    logger.warn("Delete failed - item currently rented", { itemId });
    throw new AppError("Item can't be deleted as it is currently rented", 400);
  }

  await Item.deleteOne({ _id: itemId, ownerId: userId });

  logger.info("Item deleted successfully", { itemId });

  await addElasticSyncJob("DELETE_ITEM", itemId);
};

export const activateItemService = async (
  itemId: string,
  userId: string,
  role: ROLE,
) => {
  logger.info("Activating item", { itemId, userId });

  ensureOwner(role);

  const item = await Item.findOne({ _id: itemId, ownerId: userId });

  if (!item) {
    logger.warn("Activation failed - item not found", { itemId });
    throw new AppError("Item not found", 404);
  }

  if (item.status === "rented") {
    logger.warn("Activation failed - item already rented", { itemId });
    throw new AppError("Item already rented", 400);
  }

  item.status = "active";
  await item.save();

  logger.info("Item activated successfully", { itemId });

  await addElasticSyncJob("INDEX_ITEM", item._id.toString());
};

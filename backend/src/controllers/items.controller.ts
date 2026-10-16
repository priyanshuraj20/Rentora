import { Request, Response } from "express";
import { AppError } from "../utils/AppError";
import {
  getItemService,
  pauseItemService,
  deleteItemService,
  updateItemService,
  addItemService,
  activateItemService,
} from "../service/items.service";
import { catchAsync } from "../utils/catchAsync";
import {
  updateItemSchema,
  itemValidationSchema,
} from "../validators/item.schema";
import { ROLE } from "../validators/auth.schema";

type ItemStatus = "active" | "paused" | "rented";

export const getItemsByUser = catchAsync(
  async (req: Request, res: Response) => {
    const status = req.query.status as ItemStatus;
    const page = req.query.page;
    const q = req.query.q as string;

    const items = await getItemService(
      req.userId!,
      status,
      Number(page),
      q,
      req.userRole! as ROLE,
    );

    res.status(200).json({
      success: true,
      message: "Items fetched successfully",
      data: items,
    });
  },
);

export const updateItem = catchAsync(async (req: Request, res: Response) => {
  const itemId = req.params.id as string;

  let images: string[] | undefined;
  if (req.files && Array.isArray(req.files) && req.files.length > 0) {
    images = (req.files as any[]).map((f) => f.path);
  } else if (req.file) {
    images = [(req.file as any).path];
  } else if (req.body.images) {
    const rawImages = Array.isArray(req.body.images) ? req.body.images : [req.body.images];
    images = rawImages.filter((img: any) => typeof img === "string" && img.trim().length > 0);
  }

  const rawBody: any = { ...req.body };

  if (rawBody["price[daily]"] !== undefined || rawBody["price[weekly]"] !== undefined || rawBody["price[monthly]"] !== undefined) {
    rawBody.price = {
      daily: rawBody["price[daily]"] !== undefined ? Number(rawBody["price[daily]"]) : undefined,
      weekly: rawBody["price[weekly]"] !== undefined ? Number(rawBody["price[weekly]"]) : undefined,
      monthly: rawBody["price[monthly]"] !== undefined ? Number(rawBody["price[monthly]"]) : undefined,
    };
  }

  if (rawBody["location[city]"] !== undefined || rawBody["location[district]"] !== undefined || rawBody["location[state]"] !== undefined || rawBody["location[pincode]"] !== undefined) {
    rawBody.location = {
      city: rawBody["location[city]"] || "",
      district: rawBody["location[district]"] || "",
      state: rawBody["location[state]"] || "",
      pincode: rawBody["location[pincode]"] || "",
    };
  }

  if (rawBody.securityDeposit !== undefined) {
    rawBody.securityDeposit = Number(rawBody.securityDeposit);
  }

  const payload = {
    ...rawBody,
    ...(images && images.length > 0 ? { images } : {}),
  };

  const validate = updateItemSchema.safeParse(payload);
  if (!validate.success) {
    const errorMsg = Object.entries(validate.error.flatten().fieldErrors)
      .map(([field, errs]) => `${field}: ${(errs || []).join(", ")}`)
      .join("; ");
    throw new AppError(`Validation failed: ${errorMsg}`, 422);
  }

  await updateItemService(
    itemId,
    req.userId!,
    validate.data,
    req.userRole! as ROLE,
  );

  res.status(200).json({
    success: true,
    message: "Item updated",
  });
});

export const addItem = catchAsync(async (req: Request, res: Response) => {
  let images: string[] = [];
  if (req.files && Array.isArray(req.files) && req.files.length > 0) {
    images = (req.files as any[]).map((f) => f.path);
  } else if (req.file) {
    images = [(req.file as any).path];
  } else if (req.body.images) {
    const rawImages = Array.isArray(req.body.images) ? req.body.images : [req.body.images];
    images = rawImages.filter((img: any) => typeof img === "string" && img.trim().length > 0);
  }

  const rawBody: any = { ...req.body };

  if (rawBody["price[daily]"] !== undefined || rawBody["price[weekly]"] !== undefined || rawBody["price[monthly]"] !== undefined) {
    rawBody.price = {
      daily: rawBody["price[daily]"] !== undefined ? Number(rawBody["price[daily]"]) : undefined,
      weekly: rawBody["price[weekly]"] !== undefined ? Number(rawBody["price[weekly]"]) : undefined,
      monthly: rawBody["price[monthly]"] !== undefined ? Number(rawBody["price[monthly]"]) : undefined,
    };
  }

  if (rawBody["location[city]"] !== undefined || rawBody["location[district]"] !== undefined || rawBody["location[state]"] !== undefined || rawBody["location[pincode]"] !== undefined) {
    rawBody.location = {
      city: rawBody["location[city]"] || "",
      district: rawBody["location[district]"] || "",
      state: rawBody["location[state]"] || "",
      pincode: rawBody["location[pincode]"] || "",
    };
  }

  if (rawBody.securityDeposit !== undefined) {
    rawBody.securityDeposit = Number(rawBody.securityDeposit);
  }

  const payload = {
    ...rawBody,
    ...(images.length > 0 ? { images } : {}),
  };

  const validate = itemValidationSchema.safeParse(payload);
  if (!validate.success) {
    const errorMsg = Object.entries(validate.error.flatten().fieldErrors)
      .map(([field, errs]) => `${field}: ${(errs || []).join(", ")}`)
      .join("; ");
    throw new AppError(`Validation failed: ${errorMsg}`, 422);
  }

  await addItemService(req.userId!, validate.data);

  res.status(201).json({
    success: true,
    message: "Item added successfully",
  });
});

export const pauseItem = catchAsync(async (req: Request, res: Response) => {
  const itemId = req.params.id as string;

  if (!itemId) {
    throw new AppError("Item ID is required", 400);
  }

  await pauseItemService(itemId, req.userId!, req.userRole! as ROLE);

  res.status(200).json({
    success: true,
    message: "Item paused successfully",
  });
});

export const deleteItem = catchAsync(async (req: Request, res: Response) => {
  const itemId = req.params.id as string;

  if (!itemId) {
    throw new AppError("Item ID is required", 400);
  }

  await deleteItemService(itemId, req.userId!, req.userRole! as ROLE);

  res.status(200).json({
    success: true,
    message: "Item deleted successfully",
  });
});

export const activateItem = catchAsync(async (req: Request, res: Response) => {
  const itemId = req.params.id as string;

  if (!itemId) {
    throw new AppError("Item ID is required", 400);
  }

  await activateItemService(itemId, req.userId!, req.userRole! as ROLE);

  res.status(200).json({
    success: true,
    message: "Item activated successfully",
  });
});

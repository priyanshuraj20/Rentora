import { Request, Response } from "express";
import { catchAsync } from "../utils/catchAsync";
import logger from "../config/logger";
import {
  getAllItemsService,
  getItemByIdService,
  searchItemsService,
} from "../service/explore.service";

export interface item {
  id: string;
  title: string;
  image: string;
  dailyPrice: number;
  category: string;
  discount: number | null;
  rating: number;
}

export const exploreItems = catchAsync(async (req: Request, res: Response) => {
  const limit = Number(req.query.limit) || 12;
  const page = Number(req.query.page) || 1;

  const { total, items } = await getAllItemsService(page, limit);

  res.status(200).json({
    status: "success",
    success: true,
    message: "Items fetched successfully",
    data: items,
    total,
  });
});

export const exploreItem = catchAsync(async (req: Request, res: Response) => {
  const item = await getItemByIdService(req.params.id as string);

  res.status(200).json({
    status: "success",
    item,
  });
});

export const searchItems = catchAsync(async (req: Request, res: Response) => {
  const q = (req.query.q as string) || undefined;
  const category = (req.query.category as string) || undefined;
  const city = (req.query.city as string) || undefined;
  const minPrice = req.query.minPrice ? Number(req.query.minPrice) : undefined;
  const maxPrice = req.query.maxPrice ? Number(req.query.maxPrice) : undefined;
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 12;

  const result = await searchItemsService({
    q,
    category,
    city,
    minPrice,
    maxPrice,
    page,
    limit,
  });

  res.status(200).json({
    status: "success",
    ...result,
  });
});

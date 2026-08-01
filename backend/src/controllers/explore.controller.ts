import { Request, Response } from "express";
import { catchAsync } from "../utils/catchAsync";
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
  const lat = req.query.lat ? Number(req.query.lat) : undefined;
  const lng = req.query.lng ? Number(req.query.lng) : undefined;
  const radius = req.query.radius ? Number(req.query.radius) : undefined;
  const city = (req.query.city as string) || undefined;

  const { total, items } = await getAllItemsService(page, limit, lat, lng, radius, city);

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
  const lat = req.query.lat ? Number(req.query.lat) : undefined;
  const lng = req.query.lng ? Number(req.query.lng) : undefined;
  const radius = req.query.radius ? Number(req.query.radius) : undefined;
  const minPrice = req.query.minPrice ? Number(req.query.minPrice) : undefined;
  const maxPrice = req.query.maxPrice ? Number(req.query.maxPrice) : undefined;
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 12;

  const result = await searchItemsService({
    q,
    category,
    city,
    lat,
    lng,
    radius,
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

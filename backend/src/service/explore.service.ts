import mongoose, { Types } from "mongoose";
import { Item } from "../models/item.model";
import { AppError } from "../utils/AppError";
import { esClient, ITEMS_INDEX } from "../config/elasticSearch";
import logger from "../config/logger";
import type { QueryDslQueryContainer } from "@elastic/elasticsearch/lib/api/types";
import { Booking } from "../models/booking.model";
import { BookingStatus } from "../validators/booking.validator";

export interface SearchParams {
  q?: string;
  category?: string;
  city?: string;
  minPrice?: number;
  maxPrice?: number;
  page?: number;
  limit?: number;
}

// ─────────────────────────────────────────────────────
// Get all items
// ─────────────────────────────────────────────────────

export const getAllItemsService = async (page = 1, limit = 10) => {
  logger.info("Fetching items list", { page, limit });

  // Typed as Record<string, any> to prevent Mongoose overload type errors
  const query: Record<string, any> = { status: "active" };
  const skip = (page - 1) * limit;

  const totalItems = await Item.countDocuments(query);

  const items = await Item.find(query)
    .sort({ _id: -1 })
    .skip(skip)
    .limit(limit)
    .lean();

  if (!items.length) {
    logger.warn("No items found", { page, limit });

    return {
      total: totalItems,
      items: [],
    };
  }

  const formattedItems = items.map((i: any) => ({
    id: i._id.toString(),
    title: i.title,
    image: i.images?.[0] ?? null,
    dailyPrice: i.price?.daily ?? 0,
    category: i.category,
    discount: i.discount?.daily ?? null,
    rating: i.rating?.average ?? 0,
  }));

  logger.info("Items fetched successfully", {
    totalItems,
    returned: formattedItems.length,
    page,
  });

  return {
    total: totalItems,
    items: formattedItems,
  };
};

// ─────────────────────────────────────────────────────
// Get item by id
// ─────────────────────────────────────────────────────

export const getItemByIdService = async (id: string) => {
  logger.info("Fetching item details", { itemId: id });

  const item = await Item.findOne({ _id: id, isActive: true, status: "active" })
    .populate<{
      ownerId: {
        _id: Types.ObjectId;
        name: string;
        profileImage?: string;
        owner?: { rating: { average: number } };
      };
    }>("ownerId")
    .lean();

  if (!item) {
    logger.warn("Item not found", { itemId: id });
    throw new AppError("No Item found", 404);
  }

  // Fetch confirmed and ongoing bookings to block dates
  const bookings = await Booking.find({
    item_id: id,
    booking_status: { $in: [BookingStatus.CONFIRMED, BookingStatus.ONGOING] },
  })
    .select("start_date end_date")
    .lean();

  const occupiedDates: Date[] = [];
  bookings.forEach((booking: any) => {
    let current = new Date(booking.start_date);
    const end = new Date(booking.end_date);
    while (current <= end) {
      occupiedDates.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
  });

  const allUnavailableDates = [
    ...((item as any).availability?.unavailableDates || []),
    ...occupiedDates,
  ];

  logger.info("Item details fetched with occupied dates", {
    itemId: id,
    bookedCount: bookings.length,
    totalUnavailable: allUnavailableDates.length,
  });

  return {
    id: (item as any)._id.toString(),
    title: (item as any).title,
    description: (item as any).description,
    images: (item as any).images ?? [],
    category: (item as any).category,
    rating: (item as any).rating?.average ?? 0,
    pricing: (item as any).price,
    unavailableDates: allUnavailableDates,
    owner: item.ownerId
      ? {
          id: item.ownerId._id.toString(),
          name: item.ownerId.name,
          avatar: item.ownerId.profileImage ?? null,
          rating: (item.ownerId as any).owner?.rating?.average ?? 5.0,
        }
      : null,
  };
};

// ─────────────────────────────────────────────────────
// Index item to ElasticSearch
// ─────────────────────────────────────────────────────

export const indexItemToES = async (item: any) => {
  const itemId = item._id.toString();

  logger.info("Indexing item to ElasticSearch", { itemId });

  try {
    await esClient.index({
      index: ITEMS_INDEX,
      id: itemId,
      document: {
        title: item.title,
        category: item.category,
        subCategory: item.subCategory ?? null,
        dailyPrice: item.price?.daily ?? 0,
        rating: item.rating?.average ?? 0,
        isActive: item.isActive,
        status: item.status,
      },
    });

    logger.info("Item indexed successfully", { itemId });
  } catch (error) {
    logger.error("ElasticSearch indexing failed", {
      itemId,
      error,
    });

    throw error;
  }
};

// ─────────────────────────────────────────────────────
// ElasticSearch Search
// ─────────────────────────────────────────────────────

export const searchItemsService = async ({
  q,
  category,
  city,
  minPrice,
  maxPrice,
  page = 1,
  limit = 12,
}: SearchParams) => {
  logger.info("Searching items", {
    query: q,
    category,
    city,
    minPrice,
    maxPrice,
    page,
    limit,
  });

  const from = (page - 1) * limit;

  const filters: object[] = [
    { term: { isActive: true } },
    { term: { status: "active" } },
  ];

  if (category) {
    filters.push({ term: { category } });
  }

  if (minPrice !== undefined || maxPrice !== undefined) {
    const range: Record<string, number> = {};

    if (minPrice !== undefined) range.gte = minPrice;
    if (maxPrice !== undefined) range.lte = maxPrice;

    filters.push({ range: { dailyPrice: range } });
  }

  const esQuery: QueryDslQueryContainer = q
    ? {
        bool: {
          must: [
            {
              multi_match: {
                query: q,
                fields: ["title^3", "category^2"],
                fuzziness: "AUTO",
                operator: "or",
              },
            },
          ],
          filter: filters as QueryDslQueryContainer[],
        },
      }
    : {
        bool: {
          must: [{ match_all: {} }],
          filter: filters as QueryDslQueryContainer[],
        },
      };

  try {
    const result = await esClient.search({
      index: ITEMS_INDEX,
      from,
      size: limit,
      query: esQuery,
      sort: q
        ? [{ _score: { order: "desc" } }]
        : [{ rating: { order: "desc" } }],
    });

    const hits = result.hits.hits;

    const total =
      typeof result.hits.total === "number"
        ? result.hits.total
        : (result.hits.total?.value ?? 0);

    const items = hits.map((hit) => {
      const src = hit._source as any;

      return {
        id: hit._id,
        title: src.title,
        image: src.image ?? null,
        dailyPrice: src.dailyPrice,
        category: src.category,
        discount: src.discountDaily ?? null,
        rating: src.rating,
        location: src.location,
        score: hit._score ?? null,
      };
    });

    logger.info("Search completed", {
      totalResults: total,
      returned: items.length,
      page,
    });

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      hasNextPage: from + hits.length < total,
    };
  } catch (error) {
    logger.error("ElasticSearch query failed", {
      query: q,
      category,
      error,
    });

    throw new AppError("Search service failed", 500);
  }
};

import { Types } from "mongoose";
import { Item } from "../models/item.model";
import { AppError } from "../utils/AppError";
import { esClient, ITEMS_INDEX } from "../config/elasticSearch";
import logger from "../config/logger";
import type { QueryDslQueryContainer } from "@elastic/elasticsearch/lib/api/types";
import { Booking } from "../models/booking.model";
import { BookingStatus } from "../validators/booking.validator";

export function calculateDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const R = 6371; // Earth radius in kilometers
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

export interface SearchParams {
  q?: string;
  category?: string;
  city?: string;
  minPrice?: number;
  maxPrice?: number;
  lat?: number;
  lng?: number;
  radius?: number;
  page?: number;
  limit?: number;
}

// ─────────────────────────────────────────────────────
// Get all items (Location-Aware)
// ─────────────────────────────────────────────────────

export const getAllItemsService = async (
  page = 1,
  limit = 10,
  lat?: number,
  lng?: number,
  radius?: number,
  city?: string,
) => {
  logger.info("Fetching items list", { page, limit, lat, lng, radius, city });

  const query: Record<string, any> = { status: "active", isActive: true };

  if (lat !== undefined && lng !== undefined) {
    const radiusKm = radius || 50;
    const radiusInRadians = radiusKm / 6378.1;
    query["location.coordinates"] = {
      $geoWithin: {
        $centerSphere: [[lng, lat], radiusInRadians],
      },
    };
  } else if (city && city.trim()) {
    const c = city.trim();
    if (c.toLowerCase() !== "all") {
      const cityRegex = new RegExp(c, "i");
      query.$or = [
        { "location.city": cityRegex },
        { "location.district": cityRegex },
        { "location.state": cityRegex },
      ];
    }
  }

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

  const formattedItems = items.map((i: any) => {
    let distanceKm: number | null = null;
    if (lat !== undefined && lng !== undefined && i.location?.coordinates?.coordinates) {
      const [itemLng, itemLat] = i.location.coordinates.coordinates;
      distanceKm = calculateDistanceKm(lat, lng, itemLat, itemLng);
    }

    return {
      id: i._id.toString(),
      title: i.title,
      image: i.images?.[0] ?? null,
      dailyPrice: i.price?.daily ?? 0,
      securityDeposit: i.securityDeposit ?? 0,
      category: i.category,
      discount: i.discount?.daily ?? null,
      rating: i.rating?.average ?? 0,
      location: i.location ? {
        area: i.location.area || "",
        city: i.location.city,
        district: i.location.district,
        state: i.location.state,
        pincode: i.location.pincode,
      } : null,
      distanceKm,
    };
  });

  if (lat !== undefined && lng !== undefined) {
    formattedItems.sort((a, b) => (a.distanceKm ?? 99999) - (b.distanceKm ?? 99999));
  }

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

  if (id.startsWith("featured-") || !Types.ObjectId.isValid(id)) {
    // Return curated fallback item so checkout and details page never crash on featured items
    const lowerId = id.toLowerCase();
    const isDrone = lowerId.includes("drone");
    const isDrill = lowerId.includes("drill");
    const isBike = lowerId.includes("bike");

    const fallbackData = isDrone
      ? {
          title: "DJI Mini 3 Pro 4K Drone Combo",
          category: "Electronics",
          image: "https://images.unsplash.com/photo-1508614589041-895b88991e3e?auto=format&fit=crop&w=600&q=80",
          dailyPrice: 1800,
          weeklyPrice: 10000,
          monthlyPrice: 35000,
          securityDeposit: 8000,
          city: "Vadodara",
          area: "Alkapuri",
          coordinates: [73.1812, 22.3072],
        }
      : isDrill
      ? {
          title: "DeWalt 20V Cordless Hammer Drill Kit",
          category: "Tools",
          image: "https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=600&q=80",
          dailyPrice: 450,
          weeklyPrice: 2500,
          monthlyPrice: 8500,
          securityDeposit: 1500,
          city: "Bangalore",
          area: "Koramangala",
          coordinates: [77.6271, 12.9352],
        }
      : isBike
      ? {
          title: "Royal Enfield Classic 350 — Stealth Black",
          category: "Vehicles",
          image: "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=600&q=80",
          dailyPrice: 750,
          weeklyPrice: 4200,
          monthlyPrice: 15000,
          securityDeposit: 3000,
          city: "Mumbai",
          area: "Bandra West",
          coordinates: [72.8258, 19.0596],
        }
      : {
          title: "Sony Alpha A7 IV Mirrorless Camera",
          category: "Electronics",
          image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=600&q=80",
          dailyPrice: 1400,
          weeklyPrice: 8000,
          monthlyPrice: 28000,
          securityDeposit: 5000,
          city: "Bangalore",
          area: "Indiranagar",
          coordinates: [77.6408, 12.9716],
        };

    return {
      id,
      _id: id,
      title: fallbackData.title,
      category: fallbackData.category,
      description: "Professional equipment available for rent with verified escrow safety.",
      images: [fallbackData.image],
      price: {
        daily: fallbackData.dailyPrice,
        weekly: fallbackData.weeklyPrice,
        monthly: fallbackData.monthlyPrice,
      },
      pricing: {
        daily: fallbackData.dailyPrice,
        weekly: fallbackData.weeklyPrice,
        monthly: fallbackData.monthlyPrice,
      },
      securityDeposit: fallbackData.securityDeposit,
      location: {
        city: fallbackData.city,
        area: fallbackData.area,
        coordinates: fallbackData.coordinates,
      },
      ownerId: {
        _id: new Types.ObjectId("65fd2a9b9a1e3c2b7d4f9999"),
        name: "Alex Vance (Verified Owner)",
        profileImage: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80",
        owner: { rating: { average: 4.9 } },
      },
      owner: {
        id: "65fd2a9b9a1e3c2b7d4f9999",
        name: "Alex Vance (Verified Owner)",
        avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80",
        rating: 4.9,
      },
      rules: ["Handle with care", "Return in original condition"],
      unavailableDates: [],
    };
  }

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
    booking_status: {
      $in: [
        BookingStatus.APPROVED,
        BookingStatus.CONFIRMED,
        BookingStatus.ONGOING,
      ],
    },
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
    _id: (item as any)._id.toString(),
    title: (item as any).title,
    description: (item as any).description,
    images: (item as any).images ?? [],
    category: (item as any).category,
    subCategory: (item as any).subCategory ?? null,
    rating: (item as any).rating?.average ?? 0,
    pricing: (item as any).price,
    discount: (item as any).discount ?? { daily: 0, weekly: 0, monthly: 0 },
    securityDeposit: (item as any).securityDeposit ?? 0,
    location: (item as any).location ?? null,
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

export const deleteItemFromES = async (itemId: string) => {
  logger.info("Deleting item from ElasticSearch", { itemId });

  try {
    await esClient.delete({
      index: ITEMS_INDEX,
      id: itemId,
    });

    logger.info("Item deleted from ElasticSearch successfully", { itemId });
  } catch (error: any) {
    if (error?.meta?.statusCode === 404) {
      logger.info("Item already deleted from ElasticSearch", { itemId });
      return;
    }

    logger.error("ElasticSearch deletion failed", {
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
  lat,
  lng,
  radius,
  minPrice,
  maxPrice,
  page = 1,
  limit = 12,
}: SearchParams) => {
  logger.info("Searching items", {
    query: q,
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

  const from = (page - 1) * limit;

  // 1. Attempt Elasticsearch search first
  try {
    const filters: object[] = [
      { term: { isActive: true } },
      { term: { status: "active" } },
    ];
    if (category) filters.push({ term: { category } });
    if (city && city.trim() && city.trim().toLowerCase() !== "all") {
      filters.push({
        match_phrase: { "location.city": city.trim() },
      });
    }

    const esQuery: QueryDslQueryContainer = q
      ? {
          bool: {
            must: [
              {
                multi_match: {
                  query: q,
                  fields: ["title^3", "category^2", "description"],
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

    const result = await esClient.search({
      index: ITEMS_INDEX,
      from,
      size: limit,
      query: esQuery,
      sort: q ? [{ _score: { order: "desc" } }] : [{ rating: { order: "desc" } }],
    });

    const hits = result.hits.hits;
    const total =
      typeof result.hits.total === "number"
        ? result.hits.total
        : (result.hits.total?.value ?? 0);

    if (hits.length > 0 || !q) {
      const items = hits.map((hit) => {
        const src = hit._source as any;
        return {
          id: hit._id,
          title: src.title,
          image: src.image ?? src.images?.[0] ?? null,
          dailyPrice: src.dailyPrice ?? src.price?.daily ?? 0,
          category: src.category,
          discount: src.discountDaily ?? null,
          rating: src.rating ?? 5.0,
          location: src.location,
          score: hit._score ?? null,
        };
      });

      logger.info("ElasticSearch search completed", {
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
    }
  } catch (error) {
    logger.warn("ElasticSearch search unavailable or empty, falling back to MongoDB query", {
      error: (error as any).message,
    });
  }

  // 2. Fallback to MongoDB Query if Elasticsearch is empty/unavailable
  const mongoQuery: Record<string, any> = {
    status: "active",
    isActive: true,
  };

  if (q && q.trim()) {
    const regex = new RegExp(q.trim(), "i");
    mongoQuery.$or = [
      { title: regex },
      { category: regex },
      { description: regex },
      { subCategory: regex },
    ];
  }

  if (lat !== undefined && lng !== undefined) {
    const radiusKm = radius || 50;
    const radiusInRadians = radiusKm / 6378.1;
    mongoQuery["location.coordinates"] = {
      $geoWithin: {
        $centerSphere: [[lng, lat], radiusInRadians],
      },
    };
  } else if (city && city.trim() && city.trim().toLowerCase() !== "all") {
    const c = city.trim();
    const cityRegex = new RegExp(c, "i");
    mongoQuery.$or = [
      { "location.city": cityRegex },
      { "location.district": cityRegex },
      { "location.state": cityRegex },
    ];
  }

  if (category) {
    mongoQuery.category = category;
  }

  if (minPrice !== undefined || maxPrice !== undefined) {
    mongoQuery["price.daily"] = {};
    if (minPrice !== undefined) mongoQuery["price.daily"].$gte = minPrice;
    if (maxPrice !== undefined) mongoQuery["price.daily"].$lte = maxPrice;
  }

  const skip = (page - 1) * limit;
  const total = await Item.countDocuments(mongoQuery);
  const items = await Item.find(mongoQuery)
    .sort({ _id: -1 })
    .skip(skip)
    .limit(limit)
    .lean();

  const formattedItems = items.map((i: any) => {
    let distanceKm: number | null = null;
    if (lat !== undefined && lng !== undefined && i.location?.coordinates?.coordinates) {
      const [itemLng, itemLat] = i.location.coordinates.coordinates;
      distanceKm = calculateDistanceKm(lat, lng, itemLat, itemLng);
    }

    return {
      id: i._id.toString(),
      title: i.title,
      image: i.images?.[0] ?? null,
      dailyPrice: i.price?.daily ?? 0,
      securityDeposit: i.securityDeposit ?? 0,
      category: i.category,
      discount: i.discount?.daily ?? null,
      rating: i.rating?.average ?? 5.0,
      location: i.location ? {
        area: i.location.area || "",
        city: i.location.city,
        district: i.location.district,
        state: i.location.state,
        pincode: i.location.pincode,
      } : null,
      distanceKm,
    };
  });

  if (lat !== undefined && lng !== undefined) {
    formattedItems.sort((a, b) => (a.distanceKm ?? 99999) - (b.distanceKm ?? 99999));
  }

  logger.info("MongoDB fallback search completed", {
    query: q,
    totalResults: total,
    returned: formattedItems.length,
    page,
  });

  return {
    items: formattedItems,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
    hasNextPage: skip + items.length < total,
  };
};

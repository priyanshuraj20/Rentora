/**
 * Idempotent Geo-Coordinates Data Migration Script for Rentora
 * Populates missing location.coordinates for older Item documents.
 */

import "dotenv/config";
import mongoose from "mongoose";
import { Item } from "../models/item.model";
import { geocodeCityOrAddress } from "../utils/geocoder";
import logger from "../config/logger";

async function runMigration() {
  const mongoUri = process.env.MONGO_URI || "mongodb://localhost:27017/rentora";
  logger.info("Connecting to MongoDB for Geo-Coordinates migration...", { mongoUri });

  await mongoose.connect(mongoUri);
  logger.info("Connected to MongoDB successfully.");

  const itemsWithoutCoordinates = await Item.find({
    $or: [
      { "location.coordinates": { $exists: false } },
      { "location.coordinates.coordinates": { $size: 0 } },
      { location: { $exists: false } },
    ],
  });

  logger.info(`Found ${itemsWithoutCoordinates.length} items needing geo-coordinates migration.`);

  let updatedCount = 0;

  for (const item of itemsWithoutCoordinates) {
    const city = item.location?.city || "New Delhi";
    const geocoded = await geocodeCityOrAddress(city, item.location?.state, item.location?.district);

    item.location = {
      city: item.location?.city || geocoded.city || "New Delhi",
      district: item.location?.district || geocoded.district || "",
      state: item.location?.state || geocoded.state || "",
      pincode: item.location?.pincode || "",
      coordinates: {
        type: "Point",
        coordinates: geocoded.coordinates,
      },
    };

    await item.save();
    updatedCount++;
    logger.info(`Updated item '${item.title}' (${item._id}) with city '${city}' -> [${geocoded.coordinates.join(", ")}]`);
    await new Promise((resolve) => setTimeout(resolve, 1100));
  }

  logger.info(`Geo-Coordinates migration completed successfully. Updated ${updatedCount} items.`);
  await mongoose.disconnect();
}

if (require.main === module) {
  runMigration().catch((err) => {
    logger.error("Geo-Coordinates migration failed:", err);
    process.exit(1);
  });
}

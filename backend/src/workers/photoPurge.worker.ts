import { Worker } from "bullmq";
import { redisConnection } from "../config/redis";
import { Booking } from "../models/booking.model";
import { cloudinary } from "../config/cloudinary";
import logger from "../config/logger";

export const photoPurgeWorker = new Worker(
  "photoPurgeQueue",
  async (job) => {
    const { bookingId } = job.data;
    logger.info(`Purging evidence photos for booking ${bookingId}`);

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      logger.warn(`Booking not found for photo purge: ${bookingId}`);
      return;
    }

    if (booking.evidencePurgedAt) {
      logger.info(`Photos already purged for booking ${bookingId}, skipping`);
      return;
    }

    const allPhotos = [...(booking.handoverPhotos || []), ...(booking.returnPhotos || [])];

    for (const photo of allPhotos) {
      try {
        await cloudinary.uploader.destroy(photo.publicId);
      } catch (err) {
        logger.warn(`Failed to delete Cloudinary asset ${photo.publicId}: ${err}`);
      }
    }

    booking.handoverPhotos = [];
    booking.returnPhotos = [];
    booking.evidencePurgedAt = new Date();
    await booking.save();

    logger.info(`Evidence photos purged for booking ${bookingId}, count: ${allPhotos.length}`);
  },
  {
    connection: redisConnection as any,
  },
);

import { Worker } from "bullmq";
import { redisConnection } from "../config/redis";
import { Booking } from "../models/booking.model";
import logger from "../config/logger";
import { BookingStatus } from "../validators/booking.validator";

export const bookingStatusWorker = new Worker(
  "bookingStatusQueue",
  async (job) => {
    const { bookingId } = job.data;
    logger.info(`Processing booking status for booking ${bookingId}`);

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      logger.error(`Booking not found for bookingId: ${bookingId}`);
      return;
    }

    const currentDate = new Date();
    const checkInDate = new Date(booking.start_date);
    const checkOutDate = new Date(booking.end_date);

    if (
      booking.booking_status === BookingStatus.CONFIRMED &&
      currentDate >= checkInDate &&
      currentDate <= checkOutDate
    ) {
      booking.booking_status = BookingStatus.ONGOING;
      await booking.save();
      logger.info(`Booking ${bookingId} status updated to ongoing`);
    } else if (
      booking.booking_status === BookingStatus.ONGOING &&
      currentDate > checkOutDate
    ) {
      booking.booking_status = BookingStatus.COMPLETED;
      await booking.save();
      logger.info(`Booking ${bookingId} status updated to completed`);
    }
  },
  {
    connection: redisConnection as any,
  },
);

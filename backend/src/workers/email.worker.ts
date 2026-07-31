import { Worker } from "bullmq";
import { redisConnection } from "../config/redis";
import { cancellationEmail, acceptedBookingEmail } from "../utils/sendEmails";
import { User } from "../models/user.model";
import logger from "../config/logger";

export const emailWorker = new Worker(
  "emailQueue",
  async (job) => {
    const { renter_id, bookingId } = job.data;
    const user = await User.findById(renter_id);
    if (!user) throw new Error(`User not found for renter_id: ${renter_id}`);

    if (job.name === "sendBookingRejectedEmail") {
      logger.info(
        `Sending rejection email to ${user.email} for booking ${bookingId}`,
      );
      await cancellationEmail(user.email, bookingId);
    } else if (job.name === "sendBookingAcceptedEmail") {
      logger.info(
        `Sending acceptance email to ${user.email} for booking ${bookingId}`,
      );
      await acceptedBookingEmail(user.email, bookingId);
    } else {
      logger.warn(`Unknown email job type: ${job.name}`);
    }
  },
  {
    connection: redisConnection as any,
  },
);

emailWorker.on("completed", (job) => {
  logger.info(`Email job [${job.name}] completed successfully`);
});

emailWorker.on("failed", (job, err) => {
  logger.error(`Email job [${job?.name}] failed: ${err.message}`);
});

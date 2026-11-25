  import { Queue } from "bullmq";
  import { redisConnection } from "../config/redis";
  import logger from "../config/logger";

  //creating emailQueue
  export const emailQueue = new Queue("emailQueue", {
    connection: redisConnection as any,
  });
  emailQueue.on("error", (err) => {
    logger.warn(`emailQueue Redis notice: ${err.message}`);
  });

  //creating bookingStatus queue
  export const bookingStatusQueue = new Queue("bookingStatusQueue", {
    connection: redisConnection as any,
  });
  bookingStatusQueue.on("error", (err) => {
    logger.warn(`bookingStatusQueue Redis notice: ${err.message}`);
  });

  export const photoPurgeQueue = new Queue("photoPurgeQueue", {
    connection: redisConnection as any,
  });
  photoPurgeQueue.on("error", (err) => {
    logger.warn(`photoPurgeQueue Redis notice: ${err.message}`);
  });

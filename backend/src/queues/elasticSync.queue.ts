import { Queue } from "bullmq";
import { redisConnection } from "../config/redis";
import logger from "../config/logger";

export const elasticSyncQueue = new Queue("elasticSyncQueue", {
  connection: redisConnection as any,
  defaultJobOptions: {
    attempts: 5,
    backoff: {
      type: "exponential",
      delay: 3000,
    },
    removeOnComplete: 100,
    removeOnFail: 500,
  },
});

export const addElasticSyncJob = async (
  action: "INDEX_ITEM" | "DELETE_ITEM",
  itemId: string,
) => {
  try {
    await elasticSyncQueue.add(
      action,
      { itemId, action },
      { jobId: `${action}-${itemId}-${Date.now()}` },
    );
    logger.info(`Queued ElasticSearch sync job: [${action}] for item ${itemId}`);
  } catch (error) {
    logger.error(`Failed to queue ElasticSearch job for item ${itemId}`, error);
    // Non-blocking: fail gracefully so database transaction / API request completes
  }
};

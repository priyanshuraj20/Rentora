import { Worker } from "bullmq";
import { redisConnection } from "../config/redis";
import { Item } from "../models/item.model";
import { indexItemToES, deleteItemFromES } from "../service/explore.service";
import logger from "../config/logger";

export const elasticSyncWorker = new Worker(
  "elasticSyncQueue",
  async (job) => {
    const { action, itemId } = job.data;
    logger.info(
      `Processing ElasticSearch sync job: [${action}] for item ${itemId}`,
    );

    if (action === "DELETE_ITEM") {
      await deleteItemFromES(itemId);
      return;
    }

    if (action === "INDEX_ITEM") {
      const item = await Item.findById(itemId).lean();
      if (!item) {
        logger.warn(
          `Item ${itemId} not found in MongoDB during ES sync, attempting deletion from ES`,
        );
        await deleteItemFromES(itemId);
        return;
      }
      await indexItemToES(item);
      return;
    }

    logger.warn(`Unknown action for ElasticSearch sync job: ${action}`);
  },
  {
    connection: redisConnection as any,
    concurrency: 5,
  },
);

elasticSyncWorker.on("completed", (job) => {
  logger.info(
    `ElasticSearch sync job [${job.name}] for item ${job.data.itemId} completed successfully`,
  );
});

elasticSyncWorker.on("failed", (job, err) => {
  logger.error(
    `ElasticSearch sync job [${job?.name}] for item ${job?.data?.itemId} failed: ${err.message}`,
  );
});

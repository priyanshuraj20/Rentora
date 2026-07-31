import { Client } from "@elastic/elasticsearch";
import logger from "./logger";
import { env } from "./env";

export const esClient = new Client({
  node: env.ELASTIC_SEARCH_URL,
  auth: {
    apiKey: env.ELASTIC_API_KEY,
  },
});

export const ITEMS_INDEX = "items";

/**
 * Creates the 'items' index with proper mappings if it doesn't already exist.
 * Call this once on server startup.
 */
export const initElasticIndex = async () => {
  try {
    const exists = await esClient.indices.exists({ index: ITEMS_INDEX });
    if (exists) {
      logger.info(`[ElasticSearch] Index '${ITEMS_INDEX}' already exists.`);
      return;
    }

    await esClient.indices.create({
      index: ITEMS_INDEX,
      mappings: {
        properties: {
          title: { type: "text", analyzer: "standard" },
          category: { type: "keyword" },
          subCategory: { type: "keyword" },
          dailyPrice: { type: "float" },
          rating: { type: "float" },
        },
      },
    });

    logger.info(`[ElasticSearch] Index '${ITEMS_INDEX}' created successfully.`);
  } catch (err) {
    logger.error("[ElasticSearch] Failed to initialise index:", err);
  }
};

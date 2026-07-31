import { Redis } from "ioredis";
import logger from "./logger";

export const redisConnection = new Redis(process.env.REDIS_URL as string, {
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
});

redisConnection.on("connect", () => {
  logger.info("Redis connected");
});

redisConnection.on("ready", () => {
  logger.info("Redis is ready to use");
});

redisConnection.on("error", (err) => {
  logger.error("Redis connection error", err);
});

redisConnection.on("close", () => {
  logger.warn("Redis connection closed");
});

redisConnection.on("reconnecting", () => {
  logger.info("Redis reconnecting");
});

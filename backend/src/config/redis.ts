import { Redis } from "ioredis";
import logger from "./logger";

const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";

// Upstash and other hosted providers use rediss:// (TLS).
// ioredis needs { tls: {} } when connecting over TLS.
const isTLS = redisUrl?.startsWith("rediss://");

export const redisConnection = new Redis(redisUrl, {
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
  lazyConnect: false,
  retryStrategy(times) {
    if (times > 3 && process.env.NODE_ENV !== "production") {
      logger.warn(
        "Redis is offline locally (127.0.0.1:6379). Server running in graceful local mode without background queue."
      );
      return null; // Stop reconnection loop in local dev if Redis is down
    }
    return Math.min(times * 1000, 3000);
  },
  ...(isTLS ? { tls: { rejectUnauthorized: false } } : {}),
});

redisConnection.on("connect", () => {
  logger.info("Redis connected");
});

redisConnection.on("ready", () => {
  logger.info("Redis is ready to use");
});

redisConnection.on("error", (err: any) => {
  logger.warn(`Redis connection notice: ${err.message || err}`);
});

redisConnection.on("close", () => {
  logger.warn("Redis connection closed");
});

redisConnection.on("reconnecting", () => {
  logger.info("Redis reconnecting");
});

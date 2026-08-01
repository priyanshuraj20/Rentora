import { Redis } from "ioredis";
import logger from "./logger";

const redisUrl = process.env.REDIS_URL as string;

// Upstash and other hosted providers use rediss:// (TLS).
// ioredis needs { tls: {} } when connecting over TLS.
const isTLS = redisUrl?.startsWith("rediss://");

export const redisConnection = new Redis(redisUrl, {
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
  ...(isTLS ? { tls: { rejectUnauthorized: false } } : {}),
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

import crypto from "crypto";
import jwt from "jsonwebtoken";
import { redisConnection } from "../config/redis";
import logger from "../config/logger";

/**
 * Computes SHA-256 hash of a raw token string.
 */
function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

/**
 * Blacklists a Refresh Token in Redis with a TTL matching its remaining JWT lifetime.
 * Never stores raw refresh tokens (only SHA-256 hashes).
 */
export async function blacklistToken(token: string): Promise<void> {
  if (!token) return;

  try {
    const hash = hashToken(token);
    const decoded = jwt.decode(token) as { exp?: number } | null;

    let ttlSeconds = 7 * 24 * 60 * 60; // 7 days fallback default

    if (decoded && typeof decoded.exp === "number") {
      const nowInSeconds = Math.floor(Date.now() / 1000);
      ttlSeconds = Math.max(1, decoded.exp - nowInSeconds);
    }

    const redisKey = `blacklist:${hash}`;
    await redisConnection.set(redisKey, "revoked", "EX", ttlSeconds);
    logger.info("Refresh token blacklisted successfully", { redisKey, ttlSeconds });
  } catch (error) {
    logger.error("Error blacklisting refresh token", { error });
  }
}

/**
 * Checks if a Refresh Token is present in the Redis blacklist.
 * Returns true if blacklisted, false otherwise.
 */
export async function isTokenBlacklisted(token: string): Promise<boolean> {
  if (!token) return false;

  try {
    const hash = hashToken(token);
    const redisKey = `blacklist:${hash}`;
    const exists = await redisConnection.exists(redisKey);
    return exists === 1;
  } catch (error) {
    logger.error("Error checking token blacklist", { error });
    return false;
  }
}

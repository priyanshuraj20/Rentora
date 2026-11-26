import { Request, Response } from "express";
import mongoose from "mongoose";

export const healthController = async (_req: Request, res: Response) => {
  const uptime = process.uptime();
  const formattedUptime = {
    days: Math.floor(uptime / 86400),
    hours: Math.floor((uptime % 86400) / 3600),
    minutes: Math.floor((uptime % 3600) / 60),
    seconds: Math.floor(uptime % 60),
  };

  let dbStatus = "disconnected";
  try {
    if (mongoose.connection.readyState === 1 && mongoose.connection.db) {
      await mongoose.connection.db.admin().ping();
      dbStatus = "connected";
    }
  } catch {
    dbStatus = "error";
  }

  return res.status(200).json({
    status: "ok",
    db: dbStatus,
    uptime: formattedUptime,
    message: "Rentora backend & database are awake and ready!",
    timestamp: new Date().toISOString(),
  });
};

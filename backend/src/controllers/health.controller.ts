import { Request, Response } from "express";

export const healthController = (req: Request, res: Response) => {
  const uptime = process.uptime();
  const formattedUptime = {
    days: Math.floor(uptime / 86400),
    hours: Math.floor((uptime % 86400) / 3600),
    minutes: Math.floor((uptime % 3600) / 60),
    seconds: Math.floor(uptime % 60),
  };

  const health = {
    status: "ok",
    uptime: formattedUptime,
    message: "API is running",
    timestamp: Date.now().toString(),
  };
  res.json(health);
};

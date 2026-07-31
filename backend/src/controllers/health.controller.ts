import { Request, Response } from "express";
import { env } from "@config/env";

export const healthController = (_req: Request, res: Response) => {
  res.status(200).json({ success: true, status: "ok", env: env.NODE_ENV });
};

import jwt from "jsonwebtoken";
import { env } from "@config/env";

export type QRType = "handover" | "return";

export interface QRPayload {
  bookingId: string;
  type: QRType;
  issuedBy: string;
}

export const generateQRToken = (payload: QRPayload): string => {
  return jwt.sign(payload, env.QR_TOKEN_SECRET, { expiresIn: "2m" });
};

export const verifyQRToken = (token: string): QRPayload => {
  return jwt.verify(token, env.QR_TOKEN_SECRET) as QRPayload;
};

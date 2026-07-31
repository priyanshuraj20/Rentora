import mongoose from "mongoose";
//For temporary storing of OTPs. Hum email, OTP aur expiry time save karte hain. expiresAt par TTL(time to live) index lagaya hai jisse MongoDB expiry ke baad OTP ko automatically delete kar deta hai. Isse database clean rehta hai aur manual cleanup ki zarurat nahi padti.
const otpSchema = new mongoose.Schema(
  {
    email: { type: String, required: true },
    otp: { type: String, required: true },
    expiresAt: { type: Date, required: true, index: { expires: 0 } },
  },
  { timestamps: true },
);

export const OTP = mongoose.model("OTP", otpSchema);

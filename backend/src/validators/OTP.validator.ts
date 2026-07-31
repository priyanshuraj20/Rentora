import z from "zod";

export const OTPValidator = z.object({
  email: z.string().email("Invalid email address"),
  otp: z.string().min(6, "OTP must be at least 6 characters long"),
});

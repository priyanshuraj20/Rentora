import { z } from "zod";

export const createBookingSchema = z.object({
  itemId: z.string().min(1, "Item ID is required"),
  ownerId: z.string().min(1, "Owner ID is required"),
  startDate: z
    .string()
    .min(1, "Start date is required")
    .refine(
      (date) => {
        const selected = new Date(date);
        selected.setHours(0, 0, 0, 0);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return selected >= today;
      },
      {
        message: "Start date cannot be in the past",
      },
    ),
  address: z.object({
    district: z.string().min(1, "District is required"),
    state: z.string().min(1, "State is required"),
    pincode: z.string().min(1, "Pincode is required"),
  }),
  endDate: z
    .string()
    .min(1, "End date is required")
    .refine(
      (date) => {
        const selected = new Date(date);
        selected.setHours(0, 0, 0, 0);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return selected >= today;
      },
      {
        message: "End date cannot be in the past",
      },
    ),
  pricing: z.object({
    baseRate: z.number().min(0, "Base rate must be non-negative"),
    discountApplied: z.number().min(0).optional(),
    securityDeposit: z.number().min(0, "Security deposit must be non-negative"),
    tax: z.number().min(0).optional(),
    platformFee: z.number().min(0, "Platform fee must be non-negative"),
    totalAmount: z.number().min(0, "Total amount must be non-negative"),
  }),
});

export const enum BookingStatus {
  PENDING = "pending",
  APPROVED = "approved",
  CONFIRMED = "confirmed",
  CANCELLED = "cancelled",
  COMPLETED = "completed",
  REJECTED = "rejected",
  ONGOING = "ongoing",
}

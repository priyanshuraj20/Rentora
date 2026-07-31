import z from "zod";

export const itemValidationSchema = z.object({
  title: z.string().min(4, "Title must be at least 4 characters long"),
  description: z
    .string()
    .min(10, "Description must be at least 10 characters long"),
  category: z.string().min(1, "Category is required"),
  price: z.object({
    daily: z.number().min(1, "Daily price is required"),
    weekly: z.number().min(1, "Weekly price is required"),
    monthly: z.number().min(1, "Monthly price is required"),
  }),
  securityDeposit: z.number().min(1, "Security deposit is required"),
  images: z.array(z.string()).min(1, "Images are required").optional(),
});

export const updateItemSchema = z.object({
  title: z.string().min(4).optional(),
  description: z.string().min(10).optional(),
  category: z.string().optional(),
  price: z
    .object({
      daily: z.number().min(1).optional(),
      weekly: z.number().min(1).optional(),
      monthly: z.number().min(1).optional(),
    })
    .optional(),
  securityDeposit: z.number().min(1).optional(),
  images: z.array(z.string()).min(1).optional(),
});

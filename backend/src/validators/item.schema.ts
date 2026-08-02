import z from "zod";

export const itemValidationSchema = z.object({
  title: z.string().min(4, "Title must be at least 4 characters long"),
  description: z
    .string()
    .min(10, "Description must be at least 10 characters long"),
  category: z.string().min(1, "Category is required"),
  price: z.object({
    daily: z.coerce.number().min(1, "Daily price is required"),
    weekly: z.coerce.number().optional().default(0),
    monthly: z.coerce.number().optional().default(0),
  }),
  securityDeposit: z.coerce.number().min(0, "Security deposit is required"),
  images: z.array(z.string()).min(1, "Images are required").optional(),
  location: z
    .object({
      city: z.string().optional(),
      district: z.string().optional(),
      state: z.string().optional(),
      pincode: z.string().optional(),
      coordinates: z
        .object({
          type: z.literal("Point").optional(),
          coordinates: z.tuple([z.number(), z.number()]).optional(),
        })
        .optional(),
    })
    .optional(),
});

export const updateItemSchema = z.object({
  title: z.string().min(4).optional(),
  description: z.string().min(10).optional(),
  category: z.string().optional(),
  price: z
    .object({
      daily: z.coerce.number().min(1).optional(),
      weekly: z.coerce.number().optional(),
      monthly: z.coerce.number().optional(),
    })
    .optional(),
  securityDeposit: z.coerce.number().optional(),
  images: z.array(z.string()).optional(),
  location: z
    .object({
      city: z.string().optional(),
      district: z.string().optional(),
      state: z.string().optional(),
      pincode: z.string().optional(),
      coordinates: z
        .object({
          type: z.literal("Point").optional(),
          coordinates: z.tuple([z.number(), z.number()]).optional(),
        })
        .optional(),
    })
    .optional(),
});

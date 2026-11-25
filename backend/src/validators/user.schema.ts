import z from "zod";

export const profileSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters long"),

  phone: z.string().min(10, "Phone must be at least 10 digits long"),

  address: z.object({
    city: z.string().optional(),
    pincode: z.string().min(6, "Pincode must be 6 digits"),
    district: z.string().min(2, "District is required").optional(),
    state: z.string().min(2, "State is required").optional(),
  }),

  roles: z.enum(["renter", "owner", "admin"]).default("renter"),

  profileImage: z
    .string()
    .min(3, "Profile image must be at least 3 characters long")
    .optional(),
});

export const updateProfileSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters long").optional(),
  phone: z.string().min(10, "Phone must be at least 10 digits long").optional(),
  profileImage: z
    .string()
    .min(3, "Profile image must be at least 3 characters long")
    .optional(),
  address: z
    .object({
      city: z.string().optional(),
      district: z.string().optional(),
      state: z.string().optional(),
      pincode: z.string().optional(),
    })
    .optional(),
  role: z.enum(["renter", "owner", "admin"]).optional(),
  roles: z.enum(["renter", "owner", "admin"]).optional(),
});

export const updateAddressSchema = z.object({
  city: z.string().optional(),
  pincode: z.string().min(6, "Pincode must be 6 digits").optional(),
  district: z.string().min(2, "District is required").optional(),
  state: z.string().min(2, "State is required").optional(),
});

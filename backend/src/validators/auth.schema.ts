import z from "zod";

export const registerSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
  name: z.string().optional(),
  fullName: z.string().optional(),
  phone: z.string().optional(),
  role: z.enum(["renter", "owner", "admin"]).optional(),
  roles: z.enum(["renter", "owner", "admin"]).optional(),
  profileImage: z.string().optional(),
  city: z.string().optional(),
  pincode: z.string().optional(),
  address: z
    .object({
      city: z.string().optional(),
      district: z.string().optional(),
      state: z.string().optional(),
      pincode: z.string().optional(),
    })
    .optional(),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
});

export enum ROLE {
  OWNER = "owner",
  RENTER = "renter",
  ADMIN = "admin",
}

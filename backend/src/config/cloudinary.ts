import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import multer from "multer";
import { Request } from "express";
import { env } from "./env";
import { AppError } from "../utils/AppError";

cloudinary.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME || process.env.CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY || process.env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET || process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "rentora",
    allowed_formats: ["jpeg", "jpg", "png", "webp"],
  } as any,
});

const fileFilter = (
  _req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback,
) => {
  const allowedMimeTypes = ["image/jpeg", "image/png", "image/webp"];
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new AppError(
        "Invalid file type. Only image/jpeg, image/png, and image/webp formats are allowed.",
        400,
      ) as any,
      false,
    );
  }
};

export const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter,
});

export { cloudinary, storage };

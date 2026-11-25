import multer from "multer";
import { upload } from "../config/cloudinary";

export const uploadSingleImage = (fieldName: string) => upload.single(fieldName);
export const uploadMultipleImages = (fieldName: string, maxCount: number = 5) =>
  upload.array(fieldName, maxCount);

const memoryStorage = multer.memoryStorage();
export const uploadAudioMemory = multer({
  storage: memoryStorage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
}).single("audio");

export { upload };

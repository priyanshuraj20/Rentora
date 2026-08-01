import { upload } from "../config/cloudinary";

export const uploadSingleImage = (fieldName: string) => upload.single(fieldName);
export const uploadMultipleImages = (fieldName: string, maxCount: number = 5) =>
  upload.array(fieldName, maxCount);

export { upload };

import admin from "firebase-admin";
import path from "path";
import fs from "fs";
import logger from "./logger";

const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH || "./firebase-service-account.json";
const resolvedPath = path.resolve(process.cwd(), serviceAccountPath);

try {
  if (fs.existsSync(resolvedPath)) {
    const serviceAccount = JSON.parse(fs.readFileSync(resolvedPath, "utf8"));
    if (!(admin as any).apps?.length) {
      (admin as any).initializeApp({
        credential: (admin as any).credential.cert(serviceAccount),
      });
      logger.info("Firebase Admin SDK initialized successfully");
    }
  } else {
    logger.warn(`Firebase Admin SDK service account file not found at ${resolvedPath}`);
  }
} catch (error: any) {
  logger.error("Failed to initialize Firebase Admin SDK", { error: error.message });
}

export default admin;

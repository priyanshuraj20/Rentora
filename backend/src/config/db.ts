import mongoose from "mongoose";
import { env } from "./env";

export const connectDB = async (): Promise<void> => {
  try {
    await mongoose.connect(env.MONGO_URI);
    console.log("MongoDB connected");
  } catch (error) {
    console.error("MongoDB connection failed:", error);
    // No point running the server without a DB — fail fast, let the
    // process manager (or you, in dev) restart it.
    process.exit(1);
  }
};

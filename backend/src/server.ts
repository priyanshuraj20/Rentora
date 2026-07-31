import app from "./app";
import { connectDB } from "@config/db";
import { env } from "@config/env";
import { initSentry } from "@config/sentry";

initSentry();

const startServer = async () => {
  try {
    await connectDB();

    app.listen(env.PORT, () => {
      console.log(`🚀 Server running on http://localhost:${env.PORT}`);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
};

startServer();

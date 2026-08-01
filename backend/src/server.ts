import http from "http";
import app from "./app";
import { connectDB } from "@config/db";
import { env } from "@config/env";
import { initSentry } from "@config/sentry";
import { initSocket } from "./config/socket";
import "./workers";

initSentry();

const startServer = async () => {
  try {
    await connectDB();

    const server = http.createServer(app);
    initSocket(server);

    server.listen(env.PORT, () => {
      console.log(`🚀 Server running on http://localhost:${env.PORT}`);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
};

startServer();

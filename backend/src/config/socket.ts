import { Server as HttpServer } from "http";
import { Server, Socket } from "socket.io";
import jwt from "jsonwebtoken";
import { env } from "./env";
import logger from "./logger";
import { saveMessageService } from "../service/message.service";

let io: Server | null = null;

export const initSocket = (httpServer: HttpServer): Server => {
  io = new Server(httpServer, {
    cors: {
      origin: env.CLIENT_URL,
      credentials: true,
    },
  });

  // -------------------- OPTIONAL JWT HANDSHAKE PARSER --------------------
  io.use((socket: Socket, next) => {
    try {
      const cookieHeader = socket.handshake.headers.cookie;
      if (cookieHeader) {
        const match = cookieHeader.match(/accessToken=([^;]+)/);
        const token = match ? match[1] : null;

        if (token) {
          const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET) as { userId: string };
          socket.data.userId = decoded.userId;
          logger.info(`Socket handshake authenticated for user: ${decoded.userId}`);
        }
      }
    } catch (err: any) {
      // Gracefully fall back to client "join" room event without throwing connection error
      logger.debug("Socket cookie handshake fallback", { message: err.message });
    }
    next();
  });

  // -------------------- CONNECTION HANDLER --------------------
  io.on("connection", (socket: Socket) => {
    let userId = socket.data.userId;
    if (userId) {
      socket.join(userId);
      logger.info(`User ${userId} joined socket room via JWT: ${userId}`);
    }

    // Allow client to join dedicated room by emitting "join" event
    socket.on("join", (requestedUserId: string) => {
      if (!socket.data.userId) {
        socket.emit("error", { message: "Unauthorized: no valid session" });
        return;
      }
      if (requestedUserId !== socket.data.userId) {
        logger.warn("Blocked cross-user room join attempt", {
          authenticatedUserId: socket.data.userId,
          requestedUserId,
        });
        socket.emit("error", { message: "Forbidden" });
        return;
      }
      socket.join(socket.data.userId);
      logger.info(
        `User ${socket.data.userId} joined socket room via join event`,
      );
    });

    // -------------------- LIVE CHAT EVENT: SEND MESSAGE --------------------
    socket.on(
      "send_message",
      async (data: { bookingId: string; senderId?: string; text?: string; type?: "text" | "image" | "file" | "voice"; mediaUrl?: string }) => {
        try {
          const senderId = socket.data.userId || data.senderId;
          if (!senderId) {
            socket.emit("error", { message: "Unauthorized socket action" });
            return;
          }

          // 1. Persist message in MongoDB FIRST (includes membership authorization check)
          const savedMessage = await saveMessageService({
            bookingId: data.bookingId,
            senderId: senderId,
            text: data.text,
            type: data.type,
            mediaUrl: data.mediaUrl,
          });

          // 2. Broadcast to receiver's dedicated room
          if (io) {
            io.to(savedMessage.receiverId).emit("receive_message", savedMessage);
            // Also emit back to sender to confirm delivery
            io.to(senderId).emit("message_sent", savedMessage);
          }
        } catch (err: any) {
          logger.error("Error processing socket message", { error: err.message });
          socket.emit("error", { message: err.message || "Failed to process message" });
        }
      }
    );

    socket.on("disconnect", () => {
      logger.info(`Socket disconnected for user ${socket.data.userId || "anonymous"}`);
    });
  });

  return io;
};

export const getIO = (): Server => {
  if (!io) {
    throw new Error("Socket.io not initialized!");
  }
  return io;
};

export const emitNotificationToUser = (userId: string, data: any) => {
  if (io) {
    io.to(userId).emit("notification", data);
  }
};

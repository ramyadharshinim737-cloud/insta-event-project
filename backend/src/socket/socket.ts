import { Server as HTTPServer } from "http";
import { Server as SocketIOServer, Socket } from "socket.io";
import jwt from "jsonwebtoken";
import { handleChatEvents } from "./chat.socket";
import { initializeNotificationSocket } from "./notification.socket";
import { setSocketIO } from "../modules/notifications/notification.service";

// Map to track connected users: userId -> socketId
export const connectedUsers = new Map<string, string>();

// Map to track last-seen time for users
export const userLastSeen = new Map<string, Date>();

// Initialize Socket.IO
export const initializeSocket = (server: HTTPServer): SocketIOServer => {
  const io = new SocketIOServer(server, {
    cors: {
      origin: process.env.FRONTEND_URL || "http://localhost:3000",
      credentials: true,
    },
  });

  // Pass IO instance to notification service for real-time emission
  setSocketIO(io);

  // Socket authentication middleware
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;

    if (!token) {
      return next(new Error("No authentication token provided"));
    }

    try {
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || "your-secret-key"
      ) as any;
      socket.data.userId = decoded.userId;
      next();
    } catch (error) {
      return next(new Error("Invalid token"));
    }
  });

  // Connection handler
  io.on("connection", (socket: Socket) => {
    const userId = socket.data.userId;

    // Track connected user
    connectedUsers.set(userId, socket.id);
    userLastSeen.set(userId, new Date());
    console.log(`✓ User ${userId} connected with socket ${socket.id}`);

    // Initialize chat events
    handleChatEvents(socket, io);

    // Initialize notification socket
    initializeNotificationSocket(socket, io);

    // Disconnect handler
    socket.on("disconnect", () => {
      connectedUsers.delete(userId);
      userLastSeen.set(userId, new Date());
      console.log(`✗ User ${userId} disconnected`);
    });

    // Error handler
    socket.on("error", (error) => {
      console.error(`Socket error for user ${userId}:`, error);
    });
  });

  return io;
};

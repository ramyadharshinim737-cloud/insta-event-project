import { Socket, Server as SocketIOServer } from "socket.io";
import { connectedUsers } from "./socket";

// Initialize notification socket for real-time notification emission
export const initializeNotificationSocket = (
  socket: Socket,
  io: SocketIOServer
): void => {
  const userId = socket.data.userId;

  // Event: Listen for real-time notifications
  socket.on("subscribe_notifications", () => {
    console.log(`✓ User ${userId} subscribed to notifications`);
    socket.emit("notification_subscribed", {
      message: "Successfully subscribed to notifications",
    });
  });

  // Event: Unsubscribe from notifications
  socket.on("unsubscribe_notifications", () => {
    console.log(`✗ User ${userId} unsubscribed from notifications`);
  });
};

// Function to emit notification to a user if they are online
export const emitNotificationToUser = (
  io: SocketIOServer,
  userId: string,
  notification: any
): void => {
  const socketId = connectedUsers.get(userId);

  if (socketId) {
    // User is online, emit in real-time
    io.to(socketId).emit("notification", notification);
    console.log(`✓ Notification sent in real-time to user ${userId}`);
  } else {
    // User is offline, notification already saved in DB (fallback)
    console.log(`→ User ${userId} is offline, notification saved in DB`);
  }
};

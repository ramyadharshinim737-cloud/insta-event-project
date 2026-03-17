import { Socket, Server as SocketIOServer } from "socket.io";
import ChatRoom from "../modules/chat/chatroom.model";
import Message from "../modules/chat/message.model";
import { Types } from "mongoose";

// Handle chat-related socket events
export const handleChatEvents = (
  socket: Socket,
  io: SocketIOServer
): void => {
  const userId = socket.data.userId;

  // Event: Join chat room
  socket.on("join_room", async (data: { chatRoomId: string }) => {
    try {
      const { chatRoomId } = data;

      // Validate chat room exists and user is participant
      const chatRoom = await ChatRoom.findById(chatRoomId);
      if (!chatRoom) {
        socket.emit("error", { message: "Chat room not found" });
        return;
      }

      const isParticipant = chatRoom.participants.some(
        (id) => id.toString() === userId
      );
      if (!isParticipant) {
        socket.emit("error", { message: "You are not a participant in this room" });
        return;
      }

      // Join socket room
      socket.join(chatRoomId);
      console.log(`✓ User ${userId} joined chat room ${chatRoomId}`);

      // Notify others in the room
      socket.to(chatRoomId).emit("user_joined", {
        userId,
        timestamp: new Date(),
      });
    } catch (error) {
      console.error("Error joining room:", error);
      socket.emit("error", { message: "Failed to join room" });
    }
  });

  // Event: Send message
  socket.on(
    "send_message",
    async (data: { chatRoomId: string; text: string }) => {
      try {
        const { chatRoomId, text } = data;

        // Validate input
        if (!text || text.trim().length === 0) {
          socket.emit("error", { message: "Message cannot be empty" });
          return;
        }

        // Validate chat room exists
        const chatRoom = await ChatRoom.findById(chatRoomId);
        if (!chatRoom) {
          socket.emit("error", { message: "Chat room not found" });
          return;
        }

        // Save message to MongoDB
        const message = new Message({
          chatRoomId: new Types.ObjectId(chatRoomId),
          senderId: new Types.ObjectId(userId),
          text: text.trim(),
        });
        await message.save();

        // Emit message to all participants in the room
        io.to(chatRoomId).emit("receive_message", {
          _id: message._id,
          chatRoomId: message.chatRoomId,
          senderId: message.senderId,
          text: message.text,
          createdAt: message.createdAt,
        });

        console.log(`✓ Message saved in room ${chatRoomId} by user ${userId}`);
      } catch (error) {
        console.error("Error sending message:", error);
        socket.emit("error", { message: "Failed to send message" });
      }
    }
  );

  // Event: Get message history
  socket.on(
    "get_history",
    async (data: { chatRoomId: string; limit?: number; skip?: number }) => {
      try {
        const { chatRoomId, limit = 50, skip = 0 } = data;

        // Validate chat room exists and user is participant
        const chatRoom = await ChatRoom.findById(chatRoomId);
        if (!chatRoom) {
          socket.emit("error", { message: "Chat room not found" });
          return;
        }

        const isParticipant = chatRoom.participants.some(
          (id) => id.toString() === userId
        );
        if (!isParticipant) {
          socket.emit("error", { message: "You are not a participant in this room" });
          return;
        }

        // Fetch message history
        const messages = await Message.find({ chatRoomId: new Types.ObjectId(chatRoomId) })
          .sort({ createdAt: -1 })
          .limit(limit)
          .skip(skip);

        socket.emit("message_history", {
          chatRoomId,
          messages: messages.reverse(),
        });
      } catch (error) {
        console.error("Error fetching message history:", error);
        socket.emit("error", { message: "Failed to fetch message history" });
      }
    }
  );
};

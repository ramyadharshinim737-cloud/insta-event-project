import { Router, Request, Response } from "express";
import { authMiddleware } from "../../middlewares/auth.middleware";
import ChatRoom from "./chatroom.model";
import Message from "./message.model";
import { Types } from "mongoose";
import { upload } from "../../middlewares/upload.middleware";
import { uploadImage, uploadVideo } from "../../config/cloudinary";

const router = Router();

// Create or get chat room with another user
router.post(
  "/rooms",
  authMiddleware,
  async (req: Request, res: Response): Promise<any> => {
    try {
      const userId = (req as any).userId;
      const { otherUserId } = req.body;

      if (!otherUserId) {
        return res.status(400).json({ error: "otherUserId is required" });
      }

      // Check if chat room already exists
      let chatRoom = await ChatRoom.findOne({
        participants: {
          $all: [
            new Types.ObjectId(userId),
            new Types.ObjectId(otherUserId),
          ],
        },
      });

      // Create new chat room if it doesn't exist
      if (!chatRoom) {
        chatRoom = new ChatRoom({
          participants: [
            new Types.ObjectId(userId),
            new Types.ObjectId(otherUserId),
          ],
        });
        await chatRoom.save();
      }

      res.json({
        chatRoomId: chatRoom._id,
        participants: chatRoom.participants,
        createdAt: chatRoom.createdAt,
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
);

// Mark all messages in a room as read by the current user
router.post(
  "/rooms/:chatRoomId/read",
  authMiddleware,
  async (req: Request, res: Response): Promise<any> => {
    try {
      const userId = (req as any).userId;
      const { chatRoomId } = req.params;

      const chatRoom = await ChatRoom.findById(chatRoomId);
      if (!chatRoom) {
        return res.status(404).json({ error: "Chat room not found" });
      }

      const isParticipant = chatRoom.participants.some(
        (id) => id.toString() === userId
      );
      if (!isParticipant) {
        return res
          .status(403)
          .json({ error: "You are not a participant in this room" });
      }

      await Message.updateMany(
        {
          chatRoomId: new Types.ObjectId(chatRoomId),
          readBy: { $ne: new Types.ObjectId(userId) },
        },
        {
          $addToSet: { readBy: new Types.ObjectId(userId) },
        }
      );

      return res.status(200).json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
);

// Soft-delete a message (mark as deleted but keep it for both participants)
router.delete(
  "/messages/:messageId",
  authMiddleware,
  async (req: Request, res: Response): Promise<any> => {
    try {
      const userId = (req as any).userId;
      const { messageId } = req.params;

      const message = await Message.findById(messageId);
      if (!message) {
        return res.status(404).json({ error: "Message not found" });
      }

      if (message.senderId.toString() !== userId) {
        return res
          .status(403)
          .json({ error: "You can only delete your own messages" });
      }

      if (!message.deleted) {
        message.deleted = true;
        // Optionally clear text so content is not kept
        message.text = "";
        await message.save();
      }

      return res.status(200).json({
        _id: message._id,
        chatRoomId: message.chatRoomId,
        senderId: message.senderId,
        text: message.text,
        createdAt: message.createdAt,
        deleted: message.deleted,
        readBy: (message as any).readBy,
        replyTo: (message as any).replyTo,
        mediaUrl: (message as any).mediaUrl,
        mediaType: (message as any).mediaType,
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
);

// Get chat rooms for current user
router.get(
  "/rooms",
  authMiddleware,
  async (req: Request, res: Response): Promise<any> => {
    try {
      const userId = (req as any).userId;

      const chatRooms = await ChatRoom.find({
        participants: new Types.ObjectId(userId),
      }).populate("participants", "name email");

      res.json(chatRooms);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
);

// Get messages from a chat room
router.get(
  "/messages/:chatRoomId",
  authMiddleware,
  async (req: Request, res: Response): Promise<any> => {
    try {
      const userId = (req as any).userId;
      const { chatRoomId } = req.params;
      const limit = parseInt(req.query.limit as string) || 50;
      const skip = parseInt(req.query.skip as string) || 0;

      // Verify user is participant
      const chatRoom = await ChatRoom.findById(chatRoomId);
      if (!chatRoom) {
        return res.status(404).json({ error: "Chat room not found" });
      }

      const isParticipant = chatRoom.participants.some(
        (id) => id.toString() === userId
      );
      if (!isParticipant) {
        return res.status(403).json({ error: "You are not a participant in this room" });
      }

      // Fetch messages
      const messages = await Message.find({
        chatRoomId: new Types.ObjectId(chatRoomId),
      })
        .sort({ createdAt: -1 })
        .limit(limit)
        .skip(skip)
        .populate("senderId", "name email");

      res.json(messages.reverse());
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
);

// Send a text-only message to a chat room via HTTP
router.post(
  "/messages",
  authMiddleware,
  async (req: Request, res: Response): Promise<any> => {
    try {
      const userId = (req as any).userId;
      const { chatRoomId, text, replyTo } = req.body as {
        chatRoomId?: string;
        text?: string;
        replyTo?: string;
      };

      if (!chatRoomId || !text || !text.trim()) {
        return res.status(400).json({ error: "chatRoomId and non-empty text are required" });
      }

      // Validate chat room exists
      const chatRoom = await ChatRoom.findById(chatRoomId);
      if (!chatRoom) {
        return res.status(404).json({ error: "Chat room not found" });
      }

      // Ensure user is a participant
      const isParticipant = chatRoom.participants.some(
        (id) => id.toString() === userId
      );
      if (!isParticipant) {
        return res.status(403).json({ error: "You are not a participant in this room" });
      }

      // Save message
      const message = new Message({
        chatRoomId: new Types.ObjectId(chatRoomId),
        senderId: new Types.ObjectId(userId),
        text: text.trim(),
        replyTo: replyTo ? new Types.ObjectId(replyTo) : null,
        readBy: [new Types.ObjectId(userId)],
      });
      await message.save();

      return res.status(201).json({
        _id: message._id,
        chatRoomId: message.chatRoomId,
        senderId: message.senderId,
        text: message.text,
        createdAt: message.createdAt,
        deleted: message.deleted,
        readBy: message.readBy,
        replyTo: message.replyTo,
        mediaUrl: message.mediaUrl,
        mediaType: message.mediaType,
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
);

// Send a message with media (image/video) via HTTP upload
router.post(
  "/messages/upload",
  authMiddleware,
  upload.single("media"),
  async (req: Request, res: Response): Promise<any> => {
    try {
      const userId = (req as any).userId;
      const file = req.file as Express.Multer.File | undefined;
      const { chatRoomId, text, replyTo } = req.body as {
        chatRoomId?: string;
        text?: string;
        replyTo?: string;
      };

      if (!chatRoomId) {
        return res.status(400).json({ error: "chatRoomId is required" });
      }

      if (!file && (!text || !text.trim())) {
        return res
          .status(400)
          .json({ error: "Either media file or non-empty text is required" });
      }

      // Validate chat room exists
      const chatRoom = await ChatRoom.findById(chatRoomId);
      if (!chatRoom) {
        return res.status(404).json({ error: "Chat room not found" });
      }

      // Ensure user is a participant
      const isParticipant = chatRoom.participants.some(
        (id) => id.toString() === userId
      );
      if (!isParticipant) {
        return res
          .status(403)
          .json({ error: "You are not a participant in this room" });
      }

      let mediaUrl: string | undefined;
      let mediaType: "image" | "video" | undefined;

      if (file) {
        const b64 = Buffer.from(file.buffer).toString("base64");
        const dataURI = `data:${file.mimetype};base64,${b64}`;

        if (file.mimetype.startsWith("image/")) {
          mediaUrl = await uploadImage(dataURI);
          mediaType = "image";
        } else if (file.mimetype.startsWith("video/")) {
          mediaUrl = await uploadVideo(dataURI);
          mediaType = "video";
        } else {
          return res.status(400).json({ error: "Unsupported media type" });
        }
      }

      const message = new Message({
        chatRoomId: new Types.ObjectId(chatRoomId),
        senderId: new Types.ObjectId(userId),
        text: (text || "").trim(),
        replyTo: replyTo ? new Types.ObjectId(replyTo) : null,
        mediaUrl,
        mediaType,
        readBy: [new Types.ObjectId(userId)],
      });
      await message.save();

      return res.status(201).json({
        _id: message._id,
        chatRoomId: message.chatRoomId,
        senderId: message.senderId,
        text: message.text,
        createdAt: message.createdAt,
        deleted: message.deleted,
        readBy: message.readBy,
        replyTo: message.replyTo,
        mediaUrl: message.mediaUrl,
        mediaType: message.mediaType,
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
);

export default router;

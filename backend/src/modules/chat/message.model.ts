import mongoose, { Schema, Document, Types } from "mongoose";

// Interface for TypeScript
export interface IMessage extends Document {
  chatRoomId: Types.ObjectId;
  senderId: Types.ObjectId;
  text: string;
  createdAt: Date;
  deleted: boolean;
  readBy: Types.ObjectId[];
  replyTo?: Types.ObjectId | null;
  mediaUrl?: string;
  mediaType?: 'image' | 'video';
}

// Schema definition
const MessageSchema = new Schema<IMessage>(
  {
    chatRoomId: {
      type: Schema.Types.ObjectId,
      ref: "ChatRoom",
      required: true,
    },
    senderId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    text: {
      type: String,
      required: false,
      trim: true,
    },
    deleted: {
      type: Boolean,
      default: false,
    },
    readBy: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    replyTo: {
      type: Schema.Types.ObjectId,
      ref: "Message",
      default: null,
    },
    mediaUrl: {
      type: String,
    },
    mediaType: {
      type: String,
      enum: ['image', 'video'],
    },
  },
  {
    timestamps: {
      createdAt: true,
      updatedAt: false,
    },
  }
);

// Index for efficient querying
MessageSchema.index({ chatRoomId: 1, createdAt: -1 });
MessageSchema.index({ senderId: 1 });

// Export model
const Message = mongoose.model<IMessage>("Message", MessageSchema);

export default Message;

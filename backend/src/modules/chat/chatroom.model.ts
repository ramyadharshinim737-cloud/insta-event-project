import mongoose, { Schema, Document, Types } from "mongoose";

// Interface for TypeScript
export interface IChatRoom extends Document {
  participants: Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

// Schema definition
const ChatRoomSchema = new Schema<IChatRoom>(
  {
    participants: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Index for efficient querying
ChatRoomSchema.index({ participants: 1 });

// Export model
const ChatRoom = mongoose.model<IChatRoom>("ChatRoom", ChatRoomSchema);

export default ChatRoom;

// Block schema
import { Schema, model, Document, Types } from "mongoose";

export interface IBlock extends Document {
  userId: Types.ObjectId; // The user who blocks
  blockedUserId: Types.ObjectId; // The user being blocked
  createdAt: Date;
}

const blockSchema = new Schema<IBlock>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  blockedUserId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

blockSchema.index({ userId: 1, blockedUserId: 1 }, { unique: true });

export const Block = model<IBlock>("Block", blockSchema);

// Connection schema
import { Schema, model, Document, Types } from "mongoose";

export interface IConnection extends Document {
  user1Id: Types.ObjectId;
  user2Id: Types.ObjectId;
  createdAt: Date;
}

const connectionSchema = new Schema<IConnection>({
  user1Id: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  user2Id: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Ensure a connection between two users is unique (order-independent)
connectionSchema.index(
  { user1Id: 1, user2Id: 1 },
  { unique: true }
);

export const Connection = model<IConnection>("Connection", connectionSchema);

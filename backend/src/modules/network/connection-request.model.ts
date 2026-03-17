// ConnectionRequest schema
import { Schema, model, Document, Types } from "mongoose";

export type ConnectionRequestStatus = "pending" | "accepted" | "rejected";

export interface IConnectionRequest extends Document {
  fromUserId: Types.ObjectId;
  toUserId: Types.ObjectId;
  message?: string;
  status: ConnectionRequestStatus;
  createdAt: Date;
}

const connectionRequestSchema = new Schema<IConnectionRequest>({
  fromUserId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  toUserId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  message: {
    type: String,
    trim: true,
  },
  status: {
    type: String,
    enum: ["pending", "accepted", "rejected"],
    default: "pending",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

connectionRequestSchema.index({ fromUserId: 1, toUserId: 1, status: 1 });

export const ConnectionRequest = model<IConnectionRequest>(
  "ConnectionRequest",
  connectionRequestSchema
);

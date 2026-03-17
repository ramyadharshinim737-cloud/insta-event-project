// Follow schema
import { Schema, model, Document, Types } from "mongoose";

export interface IFollow extends Document {
  followerId: Types.ObjectId;
  followingId: Types.ObjectId;
  createdAt: Date;
}

const followSchema = new Schema<IFollow>({
  followerId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  followingId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

followSchema.index({ followerId: 1, followingId: 1 }, { unique: true });

export const Follow = model<IFollow>("Follow", followSchema);

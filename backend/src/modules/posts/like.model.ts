// Like schema
import { Schema, model, Document, Types } from "mongoose";

export interface ILike extends Document {
  postId: Types.ObjectId;
  userId: Types.ObjectId;
  createdAt: Date;
}

const likeSchema = new Schema<ILike>(
  {
    postId: {
      type: Schema.Types.ObjectId,
      ref: "Post",
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Unique index to prevent duplicate likes
likeSchema.index({ postId: 1, userId: 1 }, { unique: true });
likeSchema.index({ userId: 1 });

export const Like = model<ILike>("Like", likeSchema);

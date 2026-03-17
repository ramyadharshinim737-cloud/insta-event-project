// Comment schema
import { Schema, model, Document, Types } from "mongoose";

export interface IComment extends Document {
  postId: Types.ObjectId;
  userId: Types.ObjectId;
  text: string;
  createdAt: Date;
}

const commentSchema = new Schema<IComment>(
  {
    postId: {
      type: Schema.Types.ObjectId,
      ref: "Post",
      required: true,
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    text: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

commentSchema.index({ postId: 1, createdAt: -1 });
commentSchema.index({ userId: 1 });

export const Comment = model<IComment>("Comment", commentSchema);

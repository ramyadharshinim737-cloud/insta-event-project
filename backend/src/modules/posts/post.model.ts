// Post schema - Phase 4 Implementation
import { Schema, model, Document, Types } from "mongoose";

export interface IPost extends Document {
  authorId: Types.ObjectId;
  eventId?: Types.ObjectId;
  communityId?: Types.ObjectId;
  caption: string;
  createdAt: Date;
  updatedAt: Date;
}

const postSchema = new Schema<IPost>(
  {
    authorId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    eventId: {
      type: Schema.Types.ObjectId,
      ref: "Event",
      index: true,
    },
    communityId: {
      type: Schema.Types.ObjectId,
      ref: "Community",
      index: true,
    },
    caption: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

postSchema.index({ authorId: 1, createdAt: -1 });
postSchema.index({ createdAt: -1 });
postSchema.index({ caption: "text" }); // Full-text search on caption

export const Post = model<IPost>("Post", postSchema);
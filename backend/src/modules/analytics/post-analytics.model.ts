import mongoose, { Schema, Document, Types } from "mongoose";

export interface IPostAnalytics extends Document {
  postId: Types.ObjectId;
  likesCount: number;
  commentsCount: number;
  updatedAt: Date;
}

const PostAnalyticsSchema = new Schema<IPostAnalytics>(
  {
    postId: {
      type: Schema.Types.ObjectId,
      ref: "Post",
      required: true,
      unique: true,
    },
    likesCount: {
      type: Number,
      default: 0,
    },
    commentsCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: {
      createdAt: false,
      updatedAt: true,
    },
  }
);

// Index for efficient queries
PostAnalyticsSchema.index({ postId: 1 });
PostAnalyticsSchema.index({ likesCount: -1 });
PostAnalyticsSchema.index({ commentsCount: -1 });

const PostAnalytics = mongoose.model<IPostAnalytics>(
  "PostAnalytics",
  PostAnalyticsSchema
);

export default PostAnalytics;

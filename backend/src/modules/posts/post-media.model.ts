// PostMedia schema
import { Schema, model, Document, Types } from "mongoose";

export interface IPostMedia extends Document {
  postId: Types.ObjectId;
  mediaType: "image" | "video";
  mediaUrl: string;
}

const postMediaSchema = new Schema<IPostMedia>(
  {
    postId: {
      type: Schema.Types.ObjectId,
      ref: "Post",
      required: true,
      index: true,
    },
    mediaType: {
      type: String,
      enum: ["image", "video"],
      required: true,
    },
    mediaUrl: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

export const PostMedia = model<IPostMedia>("PostMedia", postMediaSchema);

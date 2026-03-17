// Story schema
import { Schema, model, Document, Types } from "mongoose";

export interface IStory extends Document {
  userId: Types.ObjectId;
  mediaUrl: string;
  mediaType: 'image' | 'video';
  caption?: string;
  backgroundColor?: string;
  duration: number; // Duration in seconds (for video) or display time for image
  viewCount: number;
  viewedBy: Types.ObjectId[];
  createdAt: Date;
  expiresAt: Date;
}

const storySchema = new Schema<IStory>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true,
  },
  mediaUrl: {
    type: String,
    required: false, // Allow text-only stories
    default: 'text-only',
  },
  mediaType: {
    type: String,
    enum: ['image', 'video'],
    required: true,
  },
  caption: {
    type: String,
    trim: true,
  },
  backgroundColor: {
    type: String,
    default: '#000000',
  },
  duration: {
    type: Number,
    default: 5, // 5 seconds for images
  },
  viewCount: {
    type: Number,
    default: 0,
  },
  viewedBy: [{
    type: Schema.Types.ObjectId,
    ref: "User",
  }],
  createdAt: {
    type: Date,
    default: Date.now,
    index: true,
  },
  expiresAt: {
    type: Date,
    required: true,
    index: true,
  },
});

// Index for efficient queries
storySchema.index({ userId: 1, createdAt: -1 });
storySchema.index({ expiresAt: 1 });

// Automatically set expiration to 24 hours from creation
storySchema.pre('save', function(next) {
  if (this.isNew && !this.expiresAt) {
    this.expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
  }
  next();
});

export const Story = model<IStory>("Story", storySchema);

// Community schema
import { Schema, model, Document, Types } from "mongoose";

export type CommunityVisibility = 'public' | 'private';

export interface ICommunity extends Document {
  name: string;
  category?: string;
  description?: string;
  visibility: CommunityVisibility;
  tags: string[];
  rules?: string;
  imageUrl?: string;
  coverImageUrl?: string;
  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const communitySchema = new Schema<ICommunity>({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  category: {
    type: String,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  visibility: {
    type: String,
    enum: ['public', 'private'],
    default: 'public',
  },
  tags: {
    type: [String],
    default: [],
  },
  rules: {
    type: String,
    trim: true,
  },
  imageUrl: {
    type: String,
    trim: true,
  },
  coverImageUrl: {
    type: String,
    trim: true,
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

communitySchema.index({ name: 1 });
communitySchema.index({ category: 1 });
communitySchema.index({ tags: 1 });
communitySchema.index({ visibility: 1 });

// Update timestamp on save
communitySchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

export const Community = model<ICommunity>("Community", communitySchema);

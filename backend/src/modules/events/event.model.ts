// Event schema
import { Schema, model, Document, Types } from "mongoose";

export interface IEvent extends Document {
  title: string;
  description?: string;
  category?: string;
  date?: Date;
  time?: string;
  venue?: string;
  isOnline: boolean;
  meetingLink?: string;
  coverImage?: string;
  createdBy: Types.ObjectId;
  createdAt: Date;
}

const eventSchema = new Schema<IEvent>({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  category: {
    type: String,
    trim: true,
  },
  date: {
    type: Date,
  },
  time: {
    type: String,
  },
  venue: {
    type: String,
    trim: true,
  },
  isOnline: {
    type: Boolean,
    default: false,
  },
  meetingLink: {
    type: String,
  },
  coverImage: {
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
});

// Indexes for search performance
eventSchema.index({ title: "text" });  // Full-text search on title
eventSchema.index({ category: 1 });   // Filter by category
eventSchema.index({ date: 1 });       // Sort by date

export const Event = model<IEvent>("Event", eventSchema);

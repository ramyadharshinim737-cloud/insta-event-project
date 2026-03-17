import mongoose, { Schema, Document, Types } from "mongoose";

export interface IEventAnalytics extends Document {
  eventId: Types.ObjectId;
  viewsCount: number;
  rsvpCount: number;
  updatedAt: Date;
}

const EventAnalyticsSchema = new Schema<IEventAnalytics>(
  {
    eventId: {
      type: Schema.Types.ObjectId,
      ref: "Event",
      required: true,
      unique: true,
    },
    viewsCount: {
      type: Number,
      default: 0,
    },
    rsvpCount: {
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
EventAnalyticsSchema.index({ viewsCount: -1 });
EventAnalyticsSchema.index({ rsvpCount: -1 });

const EventAnalytics = mongoose.model<IEventAnalytics>(
  "EventAnalytics",
  EventAnalyticsSchema
);

export default EventAnalytics;

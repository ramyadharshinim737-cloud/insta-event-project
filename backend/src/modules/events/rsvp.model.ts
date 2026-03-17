// Event RSVP schema
import { Schema, model, Document, Types } from "mongoose";

export interface IEventRsvp extends Document {
  eventId: Types.ObjectId;
  userId: Types.ObjectId;
  registeredAt: Date;
}

const rsvpSchema = new Schema<IEventRsvp>({
  eventId: {
    type: Schema.Types.ObjectId,
    ref: "Event",
    required: true,
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  registeredAt: {
    type: Date,
    default: Date.now,
  },
});

// Ensure one user can RSVP only once per event
rsvpSchema.index({ eventId: 1, userId: 1 }, { unique: true });

export const EventRsvp = model<IEventRsvp>("EventRsvp", rsvpSchema);

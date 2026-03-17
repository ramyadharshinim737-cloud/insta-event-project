import mongoose, { Schema, Document } from 'mongoose';

// Notification types
export type NotificationType = 'LIKE' | 'COMMENT' | 'EVENT_RSVP' | 'NEW_STORY' | 'NEW_POST' | 'NEW_EVENT';

// Interface for TypeScript
export interface INotification extends Document {
  userId: mongoose.Types.ObjectId; // receiver
  type: NotificationType;
  message: string;
  referenceId: mongoose.Types.ObjectId; // postId or eventId
  isRead: boolean;
  createdAt: Date;
}

// Schema definition
const NotificationSchema = new Schema<INotification>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      enum: ['LIKE', 'COMMENT', 'EVENT_RSVP', 'NEW_STORY', 'NEW_POST', 'NEW_EVENT'],
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    referenceId: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient querying
NotificationSchema.index({ userId: 1, createdAt: -1 });
NotificationSchema.index({ userId: 1, isRead: 1 });

// Export model
const Notification = mongoose.model<INotification>(
  'Notification',
  NotificationSchema
);

export default Notification;

import { INotification } from './notification.model';

// Response format for API
export interface NotificationResponse {
  _id: string;
  userId: string;
  type: 'LIKE' | 'COMMENT' | 'EVENT_RSVP' | 'NEW_STORY' | 'NEW_POST' | 'NEW_EVENT';
  message: string;
  referenceId: string;
  isRead: boolean;
  createdAt: string;
}

// Request format for marking as read
export interface MarkAsReadRequest {
  isRead: boolean;
}

// Internal service return type
export interface NotificationData {
  userId: string;
  type: 'LIKE' | 'COMMENT' | 'EVENT_RSVP' | 'NEW_STORY' | 'NEW_POST' | 'NEW_EVENT';
  message: string;
  referenceId: string;
}

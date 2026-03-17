/**
 * Notification API Service
 * Handles all notification-related API calls
 */

import { apiRequest } from './api';

export interface Notification {
  _id: string;
  userId: string;
  type: 'LIKE' | 'COMMENT' | 'EVENT_RSVP' | 'NEW_STORY' | 'NEW_POST' | 'NEW_EVENT';
  message: string;
  referenceId: string;
  isRead: boolean;
  createdAt: string;
  actorId?: string;
  actorName?: string;
  actorAvatar?: string;
}

export interface NotificationResponse {
  notifications: Notification[];
  unreadCount: number;
}

/**
 * Fetch all notifications for the current user
 */
export const fetchNotifications = async (
  limit: number = 20,
  skip: number = 0
): Promise<Notification[]> => {
  try {
    console.log(`📥 Fetching notifications: limit=${limit}, skip=${skip}`);
    const response = await apiRequest<Notification[]>(
      'GET',
      `/notifications?limit=${limit}&skip=${skip}`
    );
    console.log('✅ Notifications API response:', response);
    console.log('✅ Notifications count:', Array.isArray(response) ? response.length : 'Not an array');
    return response;
  } catch (error: any) {
    console.error('❌ Error fetching notifications:', error);
    console.error('❌ Error message:', error.message);
    console.error('❌ Error stack:', error.stack);
    throw new Error(error.message || 'Failed to fetch notifications');
  }
};

/**
 * Get unread notification count
 */
export const getUnreadCount = async (): Promise<number> => {
  try {
    console.log('📊 Fetching unread count...');
    const response = await apiRequest<{ unreadCount: number }>(
      'GET',
      '/notifications/unread/count'
    );
    console.log('✅ Unread count API response:', response);
    return response.unreadCount;
  } catch (error: any) {
    console.error('❌ Error fetching unread count:', error);
    console.error('❌ Error message:', error.message);
    return 0;
  }
};

/**
 * Mark a notification as read
 */
export const markNotificationAsRead = async (notificationId: string): Promise<Notification> => {
  try {
    const response = await apiRequest<Notification>(
      'PUT',
      `/notifications/${notificationId}/read`
    );
    return response;
  } catch (error: any) {
    console.error('Error marking notification as read:', error);
    throw new Error(error.message || 'Failed to mark notification as read');
  }
};

/**
 * Mark all notifications as read
 */
export const markAllNotificationsAsRead = async (): Promise<void> => {
  try {
    await apiRequest<void>('PUT', '/notifications/mark-all/read');
  } catch (error: any) {
    console.error('Error marking all notifications as read:', error);
    throw new Error(error.message || 'Failed to mark all notifications as read');
  }
};

/**
 * Notification Utility Functions
 * Time grouping, formatting, and helper functions
 */

import { Notification, GroupedNotifications, TimeGroup } from '../types/notification.types';

/**
 * Format timestamp to relative time (e.g., "2h ago", "5m ago")
 */
export const formatNotificationTime = (timestamp: string): string => {
    const now = new Date();
    const notificationDate = new Date(timestamp);
    const diffInMs = now.getTime() - notificationDate.getTime();
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays}d ago`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)}w ago`;

    return notificationDate.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
    });
};

/**
 * Determine which time group a notification belongs to
 */
export const getTimeGroup = (timestamp: string): TimeGroup => {
    const now = new Date();
    const notificationDate = new Date(timestamp);

    // Reset time to start of day for accurate comparison
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);

    const notificationDay = new Date(
        notificationDate.getFullYear(),
        notificationDate.getMonth(),
        notificationDate.getDate()
    );

    if (notificationDay.getTime() === today.getTime()) {
        return 'today';
    } else if (notificationDay.getTime() === yesterday.getTime()) {
        return 'yesterday';
    } else if (notificationDay >= weekAgo) {
        return 'thisWeek';
    } else {
        return 'older';
    }
};

/**
 * Group notifications by time periods
 */
export const groupNotificationsByTime = (notifications: Notification[]): GroupedNotifications => {
    const grouped: GroupedNotifications = {
        today: [],
        yesterday: [],
        thisWeek: [],
        older: [],
    };

    notifications.forEach(notification => {
        const group = getTimeGroup(notification.timestamp);
        grouped[group].push(notification);
    });

    // Sort each group by timestamp (newest first)
    Object.keys(grouped).forEach(key => {
        grouped[key as TimeGroup].sort((a, b) =>
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );
    });

    return grouped;
};

/**
 * Get notification icon name based on type
 */
export const getNotificationIcon = (type: string): string => {
    const iconMap: Record<string, string> = {
        like: 'heart',
        comment: 'chatbubble',
        follow: 'person-add',
        mention: 'at',
        event: 'calendar',
        connection: 'people',
        message: 'mail',
        rsvp: 'checkmark-circle',
        community: 'people-circle',
    };

    return iconMap[type] || 'notifications';
};

/**
 * Get notification color based on type
 */
export const getNotificationColor = (type: string): string => {
    const colorMap: Record<string, string> = {
        like: '#ED4956',
        comment: '#0095f6',
        follow: '#0A66C2',
        mention: '#8E44AD',
        event: '#27AE60',
        connection: '#0A66C2',
        message: '#3498DB',
        rsvp: '#27AE60',
        community: '#E67E22',
    };

    return colorMap[type] || '#8E8E8E';
};

/**
 * Count unread notifications
 */
export const countUnreadNotifications = (notifications: Notification[]): number => {
    return notifications.filter(n => !n.read).length;
};

/**
 * Mark notification as read
 */
export const markAsRead = (
    notifications: Notification[],
    notificationId: string
): Notification[] => {
    return notifications.map(n =>
        n.id === notificationId ? { ...n, read: true } : n
    );
};

/**
 * Mark all notifications as read
 */
export const markAllAsRead = (notifications: Notification[]): Notification[] => {
    return notifications.map(n => ({ ...n, read: true }));
};

/**
 * Get time group label
 */
export const getTimeGroupLabel = (group: TimeGroup): string => {
    const labels: Record<TimeGroup, string> = {
        today: 'Today',
        yesterday: 'Yesterday',
        thisWeek: 'This Week',
        older: 'Older',
    };
    return labels[group];
};

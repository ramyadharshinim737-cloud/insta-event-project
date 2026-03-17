/**
 * Notification Type Definitions
 * Professional notification system types for social media app
 */

export type NotificationType =
    | 'like'
    | 'comment'
    | 'follow'
    | 'mention'
    | 'event'
    | 'connection'
    | 'message'
    | 'rsvp'
    | 'community'
    | 'system';

export type NotificationActionType = 'accept' | 'reject' | 'view' | 'reply';

export interface NotificationUser {
    id: string;
    name: string;
    avatar: string;
    verified?: boolean;
}

export interface NotificationAction {
    label: string;
    type: NotificationActionType;
    onPress?: () => void;
}

export interface Notification {
    id: string;
    type: NotificationType;
    user: NotificationUser;
    content: string;
    timestamp: string; // ISO date string
    read: boolean;
    actionable?: boolean;
    actions?: NotificationAction[];
    relatedId?: string; // ID of related post, event, etc.
}

export interface GroupedNotifications {
    today: Notification[];
    yesterday: Notification[];
    thisWeek: Notification[];
    older: Notification[];
}

export type TimeGroup = 'today' | 'yesterday' | 'thisWeek' | 'older';

export interface NotificationStats {
    total: number;
    unread: number;
}

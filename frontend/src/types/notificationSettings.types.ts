/**
 * Notification Settings Types
 * Type definitions for notification preferences and settings
 */

export interface NotificationPreferences {
    // Push Notifications
    pushEnabled: boolean;

    // Category-specific settings
    likes: boolean;
    comments: boolean;
    follows: boolean;
    mentions: boolean;
    events: boolean;
    connections: boolean;
    messages: boolean;
    rsvp: boolean;
    community: boolean;

    // Email Notifications
    emailEnabled: boolean;
    emailDigest: 'instant' | 'daily' | 'weekly' | 'never';

    // Quiet Hours
    quietHoursEnabled: boolean;
    quietHoursStart: string; // HH:mm format
    quietHoursEnd: string; // HH:mm format

    // Sound & Vibration
    soundEnabled: boolean;
    vibrationEnabled: boolean;

    // Frequency
    frequency: 'all' | 'important' | 'minimal';

    // Show previews
    showPreviews: boolean;
}

export const defaultNotificationPreferences: NotificationPreferences = {
    pushEnabled: true,
    likes: true,
    comments: true,
    follows: true,
    mentions: true,
    events: true,
    connections: true,
    messages: true,
    rsvp: true,
    community: true,
    emailEnabled: true,
    emailDigest: 'daily',
    quietHoursEnabled: false,
    quietHoursStart: '22:00',
    quietHoursEnd: '08:00',
    soundEnabled: true,
    vibrationEnabled: true,
    frequency: 'all',
    showPreviews: true,
};

export type NotificationCategory =
    | 'all'
    | 'likes'
    | 'comments'
    | 'follows'
    | 'events'
    | 'connections'
    | 'messages';

export interface CategoryFilter {
    id: NotificationCategory;
    label: string;
    icon: string;
    types: string[]; // Notification types that belong to this category
}

export const notificationCategories: CategoryFilter[] = [
    {
        id: 'all',
        label: 'All',
        icon: 'notifications',
        types: [],
    },
    {
        id: 'likes',
        label: 'Likes',
        icon: 'heart',
        types: ['like'],
    },
    {
        id: 'comments',
        label: 'Comments',
        icon: 'chatbubble',
        types: ['comment', 'mention'],
    },
    {
        id: 'follows',
        label: 'Follows',
        icon: 'people',
        types: ['follow', 'connection'],
    },
    {
        id: 'events',
        label: 'Events',
        icon: 'calendar',
        types: ['event', 'rsvp'],
    },
    {
        id: 'connections',
        label: 'Network',
        icon: 'people-circle',
        types: ['connection', 'community'],
    },
    {
        id: 'messages',
        label: 'Messages',
        icon: 'mail',
        types: ['message'],
    },
];

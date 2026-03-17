/**
 * Mock Notification Data
 * Comprehensive sample data for testing notification UI
 */

import { Notification } from '../types/notification.types';

// Helper to generate timestamps
const getTimestamp = (hoursAgo: number = 0, daysAgo: number = 0): string => {
    const date = new Date();
    date.setHours(date.getHours() - hoursAgo);
    date.setDate(date.getDate() - daysAgo);
    return date.toISOString();
};

export const mockNotifications: Notification[] = [
    // Today - Recent
    {
        id: 'n1',
        type: 'like',
        user: {
            id: 'u1',
            name: 'Sarah Johnson',
            avatar: 'https://i.pravatar.cc/150?u=sarah',
            verified: true,
        },
        content: 'liked your post about the Tech Summit 2024',
        timestamp: getTimestamp(0.5), // 30 minutes ago
        read: false,
    },
    {
        id: 'n2',
        type: 'comment',
        user: {
            id: 'u2',
            name: 'Michael Chen',
            avatar: 'https://i.pravatar.cc/150?u=michael',
        },
        content: 'commented: "Great insights on AI development!"',
        timestamp: getTimestamp(1), // 1 hour ago
        read: false,
    },
    {
        id: 'n3',
        type: 'connection',
        user: {
            id: 'u3',
            name: 'Priya Sharma',
            avatar: 'https://i.pravatar.cc/150?u=priya',
        },
        content: 'wants to connect with you',
        timestamp: getTimestamp(2), // 2 hours ago
        read: false,
        actionable: true,
        actions: [
            { label: 'Accept', type: 'accept' },
            { label: 'Reject', type: 'reject' },
        ],
    },
    {
        id: 'n4',
        type: 'event',
        user: {
            id: 'u4',
            name: 'Tech Community',
            avatar: 'https://i.pravatar.cc/150?u=techcomm',
            verified: true,
        },
        content: 'invited you to "React Native Workshop 2024"',
        timestamp: getTimestamp(3), // 3 hours ago
        read: true,
        actionable: true,
        actions: [
            { label: 'View Event', type: 'view' },
        ],
    },
    {
        id: 'n5',
        type: 'mention',
        user: {
            id: 'u5',
            name: 'Alex Kumar',
            avatar: 'https://i.pravatar.cc/150?u=alex',
        },
        content: 'mentioned you in a comment',
        timestamp: getTimestamp(5), // 5 hours ago
        read: true,
    },

    // Yesterday
    {
        id: 'n6',
        type: 'follow',
        user: {
            id: 'u6',
            name: 'Emma Wilson',
            avatar: 'https://i.pravatar.cc/150?u=emma',
        },
        content: 'started following you',
        timestamp: getTimestamp(0, 1), // Yesterday
        read: true,
    },
    {
        id: 'n7',
        type: 'rsvp',
        user: {
            id: 'u7',
            name: 'David Lee',
            avatar: 'https://i.pravatar.cc/150?u=david',
        },
        content: 'RSVPd to your event "Startup Networking Mixer"',
        timestamp: getTimestamp(12, 1), // Yesterday
        read: true,
    },
    {
        id: 'n8',
        type: 'message',
        user: {
            id: 'u8',
            name: 'Lisa Anderson',
            avatar: 'https://i.pravatar.cc/150?u=lisa',
        },
        content: 'sent you a message',
        timestamp: getTimestamp(18, 1), // Yesterday evening
        read: false,
        actionable: true,
        actions: [
            { label: 'Reply', type: 'reply' },
        ],
    },

    // This Week
    {
        id: 'n9',
        type: 'community',
        user: {
            id: 'u9',
            name: 'Design Enthusiasts',
            avatar: 'https://i.pravatar.cc/150?u=design',
        },
        content: 'New post in your community',
        timestamp: getTimestamp(0, 2), // 2 days ago
        read: true,
    },
    {
        id: 'n10',
        type: 'like',
        user: {
            id: 'u10',
            name: 'James Rodriguez',
            avatar: 'https://i.pravatar.cc/150?u=james',
        },
        content: 'and 12 others liked your event photo',
        timestamp: getTimestamp(0, 3), // 3 days ago
        read: true,
    },
    {
        id: 'n11',
        type: 'connection',
        user: {
            id: 'u11',
            name: 'Sophia Martinez',
            avatar: 'https://i.pravatar.cc/150?u=sophia',
        },
        content: 'accepted your connection request',
        timestamp: getTimestamp(0, 4), // 4 days ago
        read: true,
    },
    {
        id: 'n12',
        type: 'event',
        user: {
            id: 'u12',
            name: 'University Events',
            avatar: 'https://i.pravatar.cc/150?u=uni',
            verified: true,
        },
        content: 'Reminder: "Career Fair 2024" starts tomorrow',
        timestamp: getTimestamp(0, 5), // 5 days ago
        read: true,
    },

    // Older
    {
        id: 'n13',
        type: 'comment',
        user: {
            id: 'u13',
            name: 'Ryan Thompson',
            avatar: 'https://i.pravatar.cc/150?u=ryan',
        },
        content: 'replied to your comment',
        timestamp: getTimestamp(0, 8), // 8 days ago
        read: true,
    },
    {
        id: 'n14',
        type: 'follow',
        user: {
            id: 'u14',
            name: 'Olivia Brown',
            avatar: 'https://i.pravatar.cc/150?u=olivia',
        },
        content: 'started following you',
        timestamp: getTimestamp(0, 10), // 10 days ago
        read: true,
    },
    {
        id: 'n15',
        type: 'event',
        user: {
            id: 'u15',
            name: 'Innovation Hub',
            avatar: 'https://i.pravatar.cc/150?u=innov',
            verified: true,
        },
        content: 'posted a new event in your area',
        timestamp: getTimestamp(0, 15), // 15 days ago
        read: true,
    },
];

// Export helper to get fresh mock data
export const getMockNotifications = (): Notification[] => {
    return mockNotifications.map(n => ({ ...n }));
};

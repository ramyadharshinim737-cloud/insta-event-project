/**
 * Chat Utility Functions
 * Helper functions for chat formatting and operations
 */

import { ChatMessage, Conversation } from '../types/chat.types';

/**
 * Format timestamp to relative time
 */
export const formatMessageTime = (timestamp: string): string => {
    const now = new Date();
    const messageDate = new Date(timestamp);
    const diffMs = now.getTime() - messageDate.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d`;

    // Format as date
    return messageDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

/**
 * Format full timestamp for message bubble
 */
export const formatMessageTimestamp = (timestamp: string): string => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
    });
};

/**
 * Get date separator label
 */
export const getDateSeparator = (timestamp: string): string => {
    const now = new Date();
    const messageDate = new Date(timestamp);

    const isToday = now.toDateString() === messageDate.toDateString();
    if (isToday) return 'Today';

    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    const isYesterday = yesterday.toDateString() === messageDate.toDateString();
    if (isYesterday) return 'Yesterday';

    // Format as full date
    return messageDate.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: messageDate.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
};

/**
 * Check if messages should be grouped (same sender, within 5 minutes)
 */
export const shouldGroupMessages = (
    msg1: ChatMessage,
    msg2: ChatMessage
): boolean => {
    if (msg1.senderId !== msg2.senderId) return false;

    const time1 = new Date(msg1.timestamp).getTime();
    const time2 = new Date(msg2.timestamp).getTime();
    const diffMs = Math.abs(time2 - time1);

    return diffMs < 300000; // 5 minutes
};

/**
 * Check if date separator is needed between messages
 */
export const needsDateSeparator = (
    msg1: ChatMessage | null,
    msg2: ChatMessage
): boolean => {
    if (!msg1) return true;

    const date1 = new Date(msg1.timestamp).toDateString();
    const date2 = new Date(msg2.timestamp).toDateString();

    return date1 !== date2;
};

/**
 * Get last seen text
 */
export const getLastSeenText = (lastSeen: string): string => {
    const now = new Date();
    const seenDate = new Date(lastSeen);
    const diffMs = now.getTime() - seenDate.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Active now';
    if (diffMins < 60) return `Active ${diffMins}m ago`;
    if (diffHours < 24) return `Active ${diffHours}h ago`;
    if (diffDays === 1) return 'Active yesterday';
    if (diffDays < 7) return `Active ${diffDays}d ago`;

    return `Active ${seenDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
};

/**
 * Truncate message preview
 */
export const truncateMessage = (text: string, maxLength: number = 50): string => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
};

/**
 * Search conversations
 */
export const searchConversations = (
    conversations: Conversation[],
    query: string
): Conversation[] => {
    if (!query.trim()) return conversations;

    const lowerQuery = query.toLowerCase();

    return conversations.filter(conv => {
        const nameMatch = conv.user.name.toLowerCase().includes(lowerQuery);
        const messageMatch = conv.lastMessage.content.toLowerCase().includes(lowerQuery);
        return nameMatch || messageMatch;
    });
};

/**
 * Sort conversations (pinned first, then by last message time)
 */
export const sortConversations = (conversations: Conversation[]): Conversation[] => {
    return [...conversations].sort((a, b) => {
        // Pinned first
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;

        // Then by last message time
        const timeA = new Date(a.lastMessage.timestamp).getTime();
        const timeB = new Date(b.lastMessage.timestamp).getTime();
        return timeB - timeA;
    });
};

/**
 * Get total unread count
 */
export const getTotalUnreadCount = (conversations: Conversation[]): number => {
    return conversations.reduce((total, conv) => total + conv.unreadCount, 0);
};

/**
 * Get reaction count
 */
export const getReactionCount = (reactions: any[], emoji: string): number => {
    return reactions.filter(r => r.emoji === emoji).length;
};

/**
 * Check if current user reacted
 */
export const hasUserReacted = (
    reactions: any[],
    emoji: string,
    userId: string
): boolean => {
    return reactions.some(r => r.emoji === emoji && r.userId === userId);
};

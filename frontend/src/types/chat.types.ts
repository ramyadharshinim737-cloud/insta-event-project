/**
 * Chat Type Definitions
 * TypeScript interfaces for messaging system
 */

export type UserStatus = 'online' | 'offline' | 'away';

export type MessageStatus = 'sending' | 'sent' | 'delivered' | 'seen' | 'failed';

export interface ChatUser {
    id: string;
    name: string;
    avatar: string;
    status: UserStatus;
    lastSeen?: string; // ISO timestamp
    bio?: string;
}

export interface MessageReaction {
    emoji: string;
    userId: string;
    userName: string;
}

export interface MessageAttachment {
    id: string;
    type: 'image' | 'file' | 'voice';
    url: string;
    name?: string;
    size?: number;
    duration?: number; // for voice messages
}

export interface ChatMessage {
    id: string;
    senderId: string;
    content: string;
    timestamp: string; // ISO timestamp
    status: MessageStatus;
    replyTo?: string; // Message ID
    reactions?: MessageReaction[];
    attachments?: MessageAttachment[];
    isEdited?: boolean;
}

export interface Conversation {
    id: string;
    user: ChatUser;
    messages: ChatMessage[];
    lastMessage: ChatMessage;
    unreadCount: number;
    isPinned: boolean;
    isTyping: boolean;
    isMuted?: boolean;
}

export interface ConversationGroup {
    today: Conversation[];
    yesterday: Conversation[];
    older: Conversation[];
}

export interface ChatState {
    conversations: Conversation[];
    activeConversationId: string | null;
    searchQuery: string;
    currentUserId: string;
}

export const QUICK_REACTIONS = ['❤️', '👍', '😂', '😮', '😢', '🙏'];

export const EMOJI_CATEGORIES = {
    smileys: ['😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂', '🙂', '🙃', '😉', '😊', '😇', '🥰', '😍', '🤩', '😘', '😗', '😚', '😙'],
    gestures: ['👍', '👎', '👏', '🙌', '👐', '🤝', '🙏', '✌️', '🤞', '🤟', '🤘', '🤙', '👈', '👉', '👆', '👇', '☝️', '✋', '🤚', '🖐'],
    hearts: ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟'],
    faces: ['😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂', '🙂', '🙃', '😉', '😊', '😇', '🥰', '😍', '🤩', '😘', '😗', '😚', '😙'],
};

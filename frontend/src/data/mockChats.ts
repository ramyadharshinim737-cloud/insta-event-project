/**
 * Mock Chat Data
 * Comprehensive dummy data for messaging system
 */

import { Conversation, ChatUser, ChatMessage } from '../types/chat.types';

// Mock users
const users: ChatUser[] = [
    {
        id: 'user-1',
        name: 'Sarah Johnson',
        avatar: 'https://i.pravatar.cc/150?img=1',
        status: 'online',
        bio: 'Product Designer at TechCorp',
    },
    {
        id: 'user-2',
        name: 'Michael Chen',
        avatar: 'https://i.pravatar.cc/150?img=12',
        status: 'offline',
        lastSeen: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
        bio: 'Software Engineer',
    },
    {
        id: 'user-3',
        name: 'Emily Rodriguez',
        avatar: 'https://i.pravatar.cc/150?img=5',
        status: 'online',
        bio: 'Marketing Manager',
    },
    {
        id: 'user-4',
        name: 'David Kim',
        avatar: 'https://i.pravatar.cc/150?img=13',
        status: 'away',
        lastSeen: new Date(Date.now() - 900000).toISOString(), // 15 mins ago
        bio: 'UX Researcher',
    },
    {
        id: 'user-5',
        name: 'Jessica Taylor',
        avatar: 'https://i.pravatar.cc/150?img=9',
        status: 'offline',
        lastSeen: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
        bio: 'Data Scientist',
    },
    {
        id: 'user-6',
        name: 'Alex Martinez',
        avatar: 'https://i.pravatar.cc/150?img=14',
        status: 'online',
        bio: 'Frontend Developer',
    },
];

// Current user ID
export const CURRENT_USER_ID = 'current-user';

// Helper to create messages
const createMessage = (
    id: string,
    senderId: string,
    content: string,
    minutesAgo: number,
    status: ChatMessage['status'] = 'seen',
    replyTo?: string,
    reactions?: ChatMessage['reactions']
): ChatMessage => ({
    id,
    senderId,
    content,
    timestamp: new Date(Date.now() - minutesAgo * 60000).toISOString(),
    status,
    replyTo,
    reactions,
});

// Conversation 1: Sarah Johnson (Active, Pinned)
const conversation1: Conversation = {
    id: 'conv-1',
    user: users[0],
    isPinned: true,
    isTyping: true,
    unreadCount: 3,
    messages: [
        createMessage('msg-1-1', users[0].id, 'Hey! How are you doing?', 120, 'seen'),
        createMessage('msg-1-2', CURRENT_USER_ID, 'Hi Sarah! I\'m great, thanks! How about you?', 118, 'seen'),
        createMessage('msg-1-3', users[0].id, 'I\'m doing well! Working on the new design system', 115, 'seen'),
        createMessage('msg-1-4', CURRENT_USER_ID, 'That sounds exciting! How\'s it coming along?', 110, 'seen'),
        createMessage('msg-1-5', users[0].id, 'Really good! I\'d love to show you the prototypes', 105, 'seen'),
        createMessage('msg-1-6', CURRENT_USER_ID, 'Absolutely! When works for you?', 100, 'seen'),
        createMessage('msg-1-7', users[0].id, 'How about tomorrow at 2 PM?', 95, 'seen', undefined, [
            { emoji: '👍', userId: CURRENT_USER_ID, userName: 'You' }
        ]),
        createMessage('msg-1-8', CURRENT_USER_ID, 'Perfect! See you then 😊', 90, 'seen'),
        createMessage('msg-1-9', users[0].id, 'Great! I\'ll send you the meeting link', 5, 'delivered'),
        createMessage('msg-1-10', users[0].id, 'Also, can you review the latest mockups?', 3, 'delivered'),
        createMessage('msg-1-11', users[0].id, 'I uploaded them to Figma', 2, 'delivered'),
    ],
    lastMessage: createMessage('msg-1-11', users[0].id, 'I uploaded them to Figma', 2, 'delivered'),
};

// Conversation 2: Michael Chen
const conversation2: Conversation = {
    id: 'conv-2',
    user: users[1],
    isPinned: false,
    isTyping: false,
    unreadCount: 0,
    messages: [
        createMessage('msg-2-1', users[1].id, 'Did you see the latest pull request?', 180, 'seen'),
        createMessage('msg-2-2', CURRENT_USER_ID, 'Yes! The code looks great', 175, 'seen'),
        createMessage('msg-2-3', users[1].id, 'Thanks! I added some optimizations', 170, 'seen'),
        createMessage('msg-2-4', CURRENT_USER_ID, 'I noticed. The performance improvements are impressive', 165, 'seen', undefined, [
            { emoji: '🚀', userId: users[1].id, userName: 'Michael Chen' }
        ]),
        createMessage('msg-2-5', users[1].id, 'Appreciate it! Let me know if you have any feedback', 160, 'seen'),
        createMessage('msg-2-6', CURRENT_USER_ID, 'Will do! I\'ll review it thoroughly this afternoon', 155, 'seen'),
        createMessage('msg-2-7', users[1].id, 'Perfect, thanks!', 150, 'seen', undefined, [
            { emoji: '👍', userId: CURRENT_USER_ID, userName: 'You' }
        ]),
    ],
    lastMessage: createMessage('msg-2-7', users[1].id, 'Perfect, thanks!', 150, 'seen'),
};

// Conversation 3: Emily Rodriguez (Recent)
const conversation3: Conversation = {
    id: 'conv-3',
    user: users[2],
    isPinned: false,
    isTyping: false,
    unreadCount: 1,
    messages: [
        createMessage('msg-3-1', users[2].id, 'Hi! Quick question about the campaign', 60, 'seen'),
        createMessage('msg-3-2', CURRENT_USER_ID, 'Sure, what\'s up?', 58, 'seen'),
        createMessage('msg-3-3', users[2].id, 'When is the launch date?', 55, 'seen'),
        createMessage('msg-3-4', CURRENT_USER_ID, 'We\'re targeting next Friday', 50, 'seen'),
        createMessage('msg-3-5', users[2].id, 'Great! I\'ll prepare the materials', 45, 'seen'),
        createMessage('msg-3-6', CURRENT_USER_ID, 'Awesome! Let me know if you need anything', 40, 'seen'),
        createMessage('msg-3-7', users[2].id, 'Will do! Thanks 😊', 10, 'delivered'),
    ],
    lastMessage: createMessage('msg-3-7', users[2].id, 'Will do! Thanks 😊', 10, 'delivered'),
};

// Conversation 4: David Kim
const conversation4: Conversation = {
    id: 'conv-4',
    user: users[3],
    isPinned: true,
    isTyping: false,
    unreadCount: 0,
    messages: [
        createMessage('msg-4-1', users[3].id, 'The user research results are in!', 1440, 'seen'), // 1 day ago
        createMessage('msg-4-2', CURRENT_USER_ID, 'Excellent! What did you find?', 1435, 'seen'),
        createMessage('msg-4-3', users[3].id, 'Users love the new navigation', 1430, 'seen', undefined, [
            { emoji: '❤️', userId: CURRENT_USER_ID, userName: 'You' },
            { emoji: '🎉', userId: CURRENT_USER_ID, userName: 'You' }
        ]),
        createMessage('msg-4-4', CURRENT_USER_ID, 'That\'s fantastic news!', 1425, 'seen'),
        createMessage('msg-4-5', users[3].id, 'I\'ll send you the full report', 1420, 'seen'),
        createMessage('msg-4-6', CURRENT_USER_ID, 'Looking forward to it!', 1415, 'seen'),
    ],
    lastMessage: createMessage('msg-4-6', CURRENT_USER_ID, 'Looking forward to it!', 1415, 'seen'),
};

// Conversation 5: Jessica Taylor
const conversation5: Conversation = {
    id: 'conv-5',
    user: users[4],
    isPinned: false,
    isTyping: false,
    unreadCount: 0,
    messages: [
        createMessage('msg-5-1', users[4].id, 'Hey! Can we schedule a meeting?', 2880, 'seen'), // 2 days ago
        createMessage('msg-5-2', CURRENT_USER_ID, 'Sure! What time works for you?', 2875, 'seen'),
        createMessage('msg-5-3', users[4].id, 'How about Wednesday at 3 PM?', 2870, 'seen'),
        createMessage('msg-5-4', CURRENT_USER_ID, 'That works perfectly!', 2865, 'seen'),
        createMessage('msg-5-5', users[4].id, 'Great! I\'ll send a calendar invite', 2860, 'seen'),
    ],
    lastMessage: createMessage('msg-5-5', users[4].id, 'Great! I\'ll send a calendar invite', 2860, 'seen'),
};

// Conversation 6: Alex Martinez (Very recent)
const conversation6: Conversation = {
    id: 'conv-6',
    user: users[5],
    isPinned: false,
    isTyping: false,
    unreadCount: 2,
    messages: [
        createMessage('msg-6-1', users[5].id, 'Check out this cool animation!', 30, 'seen'),
        createMessage('msg-6-2', CURRENT_USER_ID, 'Wow, that\'s smooth!', 28, 'seen', undefined, [
            { emoji: '😍', userId: users[5].id, userName: 'Alex Martinez' }
        ]),
        createMessage('msg-6-3', users[5].id, 'Thanks! Used Framer Motion', 25, 'seen'),
        createMessage('msg-6-4', CURRENT_USER_ID, 'I should try that library', 20, 'seen'),
        createMessage('msg-6-5', users[5].id, 'Definitely! It\'s super easy to use', 15, 'seen'),
        createMessage('msg-6-6', users[5].id, 'Want me to share some examples?', 1, 'delivered'),
        createMessage('msg-6-7', users[5].id, 'I have a great tutorial', 0.5, 'delivered'),
    ],
    lastMessage: createMessage('msg-6-7', users[5].id, 'I have a great tutorial', 0.5, 'delivered'),
};

// Export all conversations
export const getMockConversations = (): Conversation[] => {
    return [
        conversation1,
        conversation2,
        conversation3,
        conversation4,
        conversation5,
        conversation6,
    ];
};

// Export individual conversation for testing
export const getMockConversation = (id: string): Conversation | undefined => {
    return getMockConversations().find(conv => conv.id === id);
};

// Get conversation by user ID
export const getConversationByUserId = (userId: string): Conversation | undefined => {
    return getMockConversations().find(conv => conv.user.id === userId);
};

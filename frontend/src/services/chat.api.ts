// Chat API service - real HTTP integration with backend /api/chat routes

import AsyncStorage from '@react-native-async-storage/async-storage';
import { getApiUrl } from './api';

export interface ChatRoomResponse {
  _id: string;
  participants: ({ _id: string; name: string; email: string } | string)[];
  createdAt: string;
  updatedAt: string;
}

export interface ChatMessageResponse {
  _id: string;
  chatRoomId: string;
  senderId: { _id: string; name: string; email: string } | string;
  text: string;
  createdAt: string;
  deleted?: boolean;
  readBy?: (string | { _id: string })[];
  replyTo?: string | { _id: string } | null;
  mediaUrl?: string;
  mediaType?: 'image' | 'video';
}

const getAuthHeaders = async () => {
  const token = await AsyncStorage.getItem('token');
  if (!token) {
    throw new Error('No authentication token found');
  }
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
};

const getAuthHeadersForMultipart = async () => {
  const token = await AsyncStorage.getItem('token');
  if (!token) {
    throw new Error('No authentication token found');
  }
  return {
    Authorization: `Bearer ${token}`,
  } as const;
};

export interface UserStatusResponse {
  userId: string;
  online: boolean;
  lastSeen?: string | null;
}

export const chatApi = {
  // Get all chat rooms for current user
  getRooms: async (): Promise<ChatRoomResponse[]> => {
    const apiUrl = await getApiUrl();
    const headers = await getAuthHeaders();

    const res = await fetch(`${apiUrl}/api/chat/rooms`, {
      method: 'GET',
      headers,
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Failed to load chat rooms');
    }
    return data as ChatRoomResponse[];
  },

  // Create or get a chat room with another user
  createOrGetRoom: async (otherUserId: string): Promise<ChatRoomResponse> => {
    const apiUrl = await getApiUrl();
    const headers = await getAuthHeaders();

    const res = await fetch(`${apiUrl}/api/chat/rooms`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ otherUserId }),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Failed to create/get chat room');
    }

    // Backend returns { chatRoomId, participants, createdAt } for this endpoint,
    // while our ChatRoomResponse expects an _id field. Normalize here so
    // consumers can always use room._id safely.
    const normalized: ChatRoomResponse = {
      _id: (data as any)._id || (data as any).chatRoomId,
      participants: (data as any).participants || [],
      createdAt: (data as any).createdAt,
      updatedAt: (data as any).updatedAt || (data as any).createdAt,
    };

    return normalized;
  },

  // Get messages for a specific chat room
  getMessages: async (
    chatRoomId: string,
    limit: number = 50,
    skip: number = 0
  ): Promise<ChatMessageResponse[]> => {
    const apiUrl = await getApiUrl();
    const headers = await getAuthHeaders();

    const res = await fetch(
      `${apiUrl}/api/chat/messages/${chatRoomId}?limit=${limit}&skip=${skip}`,
      {
        method: 'GET',
        headers,
      }
    );
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Failed to load messages');
    }
    return data as ChatMessageResponse[];
  },

  // Send a new message via HTTP
  sendMessage: async (
    chatRoomId: string,
    text: string,
    replyTo?: string,
  ): Promise<ChatMessageResponse> => {
    const apiUrl = await getApiUrl();
    const headers = await getAuthHeaders();

    const body: any = { chatRoomId, text };
    if (replyTo) {
      body.replyTo = replyTo;
    }

    const res = await fetch(`${apiUrl}/api/chat/messages`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Failed to send message');
    }
    return data as ChatMessageResponse;
  },

  // Send a new message with media via HTTP (multipart/form-data)
  sendMediaMessage: async (
    chatRoomId: string,
    media: { uri: string; type: 'image' | 'video' },
    text?: string,
    replyTo?: string,
  ): Promise<ChatMessageResponse> => {
    const apiUrl = await getApiUrl();
    const headers = await getAuthHeadersForMultipart();

    const formData = new FormData();
    formData.append('chatRoomId', chatRoomId);
    if (text && text.trim()) {
      formData.append('text', text.trim());
    }
    if (replyTo) {
      formData.append('replyTo', replyTo);
    }

    formData.append('media', {
      uri: media.uri,
      name: media.type === 'image' ? 'image.jpg' : 'video.mp4',
      type: media.type === 'image' ? 'image/jpeg' : 'video/mp4',
    } as any);

    const res = await fetch(`${apiUrl}/api/chat/messages/upload`, {
      method: 'POST',
      headers,
      body: formData as any,
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Failed to send media message');
    }
    return data as ChatMessageResponse;
  },

  // Soft-delete a message
  deleteMessage: async (messageId: string): Promise<ChatMessageResponse> => {
    const apiUrl = await getApiUrl();
    const headers = await getAuthHeaders();

    const res = await fetch(`${apiUrl}/api/chat/messages/${messageId}`, {
      method: 'DELETE',
      headers,
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Failed to delete message');
    }
    return data as ChatMessageResponse;
  },

  // Mark all messages in a room as read by current user
  markRoomAsRead: async (chatRoomId: string): Promise<void> => {
    const apiUrl = await getApiUrl();
    const headers = await getAuthHeaders();

    const res = await fetch(`${apiUrl}/api/chat/rooms/${chatRoomId}/read`, {
      method: 'POST',
      headers,
    });

    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || 'Failed to mark room as read');
    }
  },

  // Get online / last-seen status for a user
  getUserStatus: async (userId: string): Promise<UserStatusResponse> => {
    const apiUrl = await getApiUrl();
    const headers = await getAuthHeaders();

    const res = await fetch(`${apiUrl}/api/users/status/${userId}`, {
      method: 'GET',
      headers,
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Failed to load user status');
    }
    return data as UserStatusResponse;
  },
};

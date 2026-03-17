export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: string;
  read: boolean;
  deleted?: boolean;
  mediaUrl?: string | null;
  mediaType?: 'image' | 'video' | null;
  replyToId?: string | null;
  readBy?: string[];
}

export interface User {
  id: string;
  name: string;
  avatar?: string;
  status?: string;
}

export interface Conversation {
  id: string;
  participant: User;
  messages: Message[];
  lastMessage?: Message;
  unreadCount: number;
  updatedAt: string;
}

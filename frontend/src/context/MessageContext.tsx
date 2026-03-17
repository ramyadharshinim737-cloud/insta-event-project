import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Conversation, Message, User } from '../utils/messageTypes';
import { useAuth } from '../context/AuthContext';
import { chatApi, ChatRoomResponse, ChatMessageResponse } from '../services/chat.api';

interface MessageContextType {
  conversations: Conversation[];
  sendMessage: (conversationId: string, text: string, replyToId?: string) => Promise<void>;
  sendMediaMessage: (
    conversationId: string,
    media: { uri: string; type: 'image' | 'video' },
    text?: string,
    replyToId?: string,
  ) => Promise<void>;
  deleteMessage: (conversationId: string, messageId: string) => Promise<void>;
  getConversation: (id: string) => Conversation | undefined;
  markAsRead: (conversationId: string) => Promise<void>;
  openConversationWithUser: (userId: string, displayName?: string) => Promise<string>;
}

const MessageContext = createContext<MessageContextType | undefined>(undefined);

export const MessageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const { user } = useAuth();
  const currentUserId = user?.id;

  const loadConversations = async () => {
    try {
      if (!currentUserId) {
        setConversations([]);
        return;
      }

      const rooms = await chatApi.getRooms();

      const buildParticipant = (room: ChatRoomResponse): User => {
        const participants = room.participants as any[];
        if (!participants || participants.length === 0) {
          return { id: '', name: 'Unknown' };
        }
        const other =
          participants.find((p) => p._id && p._id !== currentUserId) || participants[0];
        return {
          id: other._id || other,
          name: other.name || 'Unknown',
          avatar: undefined,
          status: undefined,
        };
      };

      const convs: Conversation[] = [];

      for (const room of rooms) {
        const messagesRes = await chatApi.getMessages(room._id, 50, 0);
        const messages: Message[] = messagesRes
          .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
          .map((m: ChatMessageResponse) => {
            const sender: any =
              typeof m.senderId === 'string' ? { _id: m.senderId, name: '' } : m.senderId;
            const readByIds: string[] = (m.readBy || []).map((rb: any) =>
              typeof rb === 'string' ? rb : rb._id,
            );
            return {
              id: m._id,
              conversationId: m.chatRoomId,
              senderId: sender._id,
              senderName: sender.name || '',
              text: m.text,
              timestamp: m.createdAt,
              read: true,
              deleted: m.deleted,
              mediaUrl: m.mediaUrl ?? null,
              mediaType: m.mediaType ?? null,
              replyToId:
                typeof m.replyTo === 'string'
                  ? m.replyTo
                  : m.replyTo && (m.replyTo as any)._id
                    ? (m.replyTo as any)._id
                    : null,
              readBy: readByIds,
            } as Message;
          });

        const lastMessage = messages[messages.length - 1] || undefined;
        const participant = buildParticipant(room);

        convs.push({
          id: room._id,
          participant,
          messages,
          lastMessage,
          unreadCount: 0,
          updatedAt: lastMessage ? lastMessage.timestamp : room.updatedAt || room.createdAt,
        });
      }

      convs.sort(
        (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      );

      setConversations(convs);
    } catch (error) {
      console.error('Error loading conversations:', error);
      setConversations([]);
    }
  };

  useEffect(() => {
    if (currentUserId) {
      loadConversations();
    } else {
      setConversations([]);
    }
  }, [currentUserId]);

  const openConversationWithUser = async (
    otherUserId: string,
    displayName?: string,
  ): Promise<string> => {
    try {
      if (!currentUserId) {
        throw new Error('User not authenticated');
      }

      const room = await chatApi.createOrGetRoom(otherUserId);
      const messagesRes = await chatApi.getMessages(room._id, 50, 0);

      const messages: Message[] = messagesRes
        .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
        .map((m: ChatMessageResponse) => {
          const sender: any =
            typeof m.senderId === 'string' ? { _id: m.senderId, name: '' } : m.senderId;
          const readByIds: string[] = (m.readBy || []).map((rb: any) =>
            typeof rb === 'string' ? rb : rb._id,
          );
          return {
            id: m._id,
            conversationId: m.chatRoomId,
            senderId: sender._id,
            senderName: sender.name || '',
            text: m.text,
            timestamp: m.createdAt,
            read: true,
            deleted: m.deleted,
            mediaUrl: m.mediaUrl ?? null,
            mediaType: m.mediaType ?? null,
            replyToId:
              typeof m.replyTo === 'string'
                ? m.replyTo
                : m.replyTo && (m.replyTo as any)._id
                  ? (m.replyTo as any)._id
                  : null,
            readBy: readByIds,
          } as Message;
        });

      const lastMessage = messages[messages.length - 1] || undefined;

      const participants = room.participants as any[];
      let participantUser: User;
      if (!participants || participants.length === 0) {
        participantUser = { id: otherUserId, name: displayName || 'Unknown' };
      } else {
        const other =
          participants.find((p) => p._id && p._id !== currentUserId) || participants[0];
        participantUser = {
          id: other._id || other,
          name: other.name || displayName || 'Unknown',
          avatar: undefined,
          status: undefined,
        };
      }

      const updatedAt = lastMessage ? lastMessage.timestamp : room.updatedAt || room.createdAt;

      setConversations(prev => {
        const existingIndex = prev.findIndex(conv => conv.id === room._id);
        const newConv: Conversation = {
          id: room._id,
          participant: participantUser,
          messages,
          lastMessage,
          unreadCount: 0,
          updatedAt,
        };

        let updated: Conversation[];
        if (existingIndex >= 0) {
          updated = [...prev];
          updated[existingIndex] = newConv;
        } else {
          updated = [...prev, newConv];
        }

        updated.sort(
          (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        );
        return updated;
      });

      return room._id;
    } catch (error) {
      console.error('Error opening conversation:', error);
      throw error;
    }
  };

  const sendMessage = async (conversationId: string, text: string, replyToId?: string) => {
    try {
      if (!currentUserId) {
        throw new Error('User not authenticated');
      }

      const res = await chatApi.sendMessage(conversationId, text, replyToId);
      const sender: any =
        typeof res.senderId === 'string' ? { _id: res.senderId, name: '' } : res.senderId;

      const readByIds: string[] = (res.readBy || []).map((rb: any) =>
        typeof rb === 'string' ? rb : rb._id,
      );

      const newMessage: Message = {
        id: res._id,
        conversationId,
        senderId: sender._id,
        senderName: sender.name || '',
        text: res.text,
        timestamp: res.createdAt,
        read: true,
        deleted: res.deleted,
        mediaUrl: res.mediaUrl ?? null,
        mediaType: res.mediaType ?? null,
        replyToId:
          typeof res.replyTo === 'string'
            ? res.replyTo
            : res.replyTo && (res.replyTo as any)._id
              ? (res.replyTo as any)._id
              : null,
        readBy: readByIds,
      };

      setConversations(prev => {
        const updated = prev.map(conv => {
          if (conv.id === conversationId) {
            const messages = [...conv.messages, newMessage];
            return {
              ...conv,
              messages,
              lastMessage: newMessage,
              updatedAt: newMessage.timestamp,
            };
          }
          return conv;
        });

        updated.sort(
          (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        );
        return updated;
      });
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  };

  const sendMediaMessage = async (
    conversationId: string,
    media: { uri: string; type: 'image' | 'video' },
    text?: string,
    replyToId?: string,
  ) => {
    try {
      if (!currentUserId) {
        throw new Error('User not authenticated');
      }

      const res = await chatApi.sendMediaMessage(conversationId, media, text, replyToId);
      const sender: any =
        typeof res.senderId === 'string' ? { _id: res.senderId, name: '' } : res.senderId;

      const readByIds: string[] = (res.readBy || []).map((rb: any) =>
        typeof rb === 'string' ? rb : rb._id,
      );

      const newMessage: Message = {
        id: res._id,
        conversationId,
        senderId: sender._id,
        senderName: sender.name || '',
        text: res.text,
        timestamp: res.createdAt,
        read: true,
        deleted: res.deleted,
        mediaUrl: res.mediaUrl ?? null,
        mediaType: res.mediaType ?? null,
        replyToId:
          typeof res.replyTo === 'string'
            ? res.replyTo
            : res.replyTo && (res.replyTo as any)._id
              ? (res.replyTo as any)._id
              : null,
        readBy: readByIds,
      };

      setConversations(prev => {
        const updated = prev.map(conv => {
          if (conv.id === conversationId) {
            const messages = [...conv.messages, newMessage];
            return {
              ...conv,
              messages,
              lastMessage: newMessage,
              updatedAt: newMessage.timestamp,
            };
          }
          return conv;
        });

        updated.sort(
          (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        );
        return updated;
      });
    } catch (error) {
      console.error('Error sending media message:', error);
      throw error;
    }
  };

  const deleteMessage = async (conversationId: string, messageId: string) => {
    try {
      const res = await chatApi.deleteMessage(messageId);

      setConversations(prev => {
        return prev.map(conv => {
          if (conv.id !== conversationId) return conv;

          const messages = conv.messages.map(msg => {
            if (msg.id !== messageId) return msg;
            return {
              ...msg,
              deleted: res.deleted ?? true,
              text: res.text,
            };
          });

          const lastMessage =
            conv.lastMessage && conv.lastMessage.id === messageId
              ? messages[messages.length - 1] || undefined
              : conv.lastMessage;

          return {
            ...conv,
            messages,
            lastMessage,
          };
        });
      });
    } catch (error) {
      console.error('Error deleting message:', error);
      throw error;
    }
  };

  const getConversation = (id: string): Conversation | undefined => {
    return conversations.find(conv => conv.id === id);
  };

  const markAsRead = async (conversationId: string) => {
    try {
      if (!currentUserId) {
        return;
      }

      await chatApi.markRoomAsRead(conversationId);

      const updatedConversations = conversations.map(conv => {
        if (conv.id === conversationId) {
          return {
            ...conv,
            unreadCount: 0,
            messages: conv.messages.map(msg => ({
              ...msg,
              read: true,
              readBy: Array.from(new Set([...(msg.readBy || []), currentUserId])),
            })),
          };
        }
        return conv;
      });

      setConversations(updatedConversations);
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  return (
    <MessageContext.Provider
      value={{ conversations, sendMessage, sendMediaMessage, deleteMessage, getConversation, markAsRead, openConversationWithUser }}
    >
      {children}
    </MessageContext.Provider>
  );
};

export const useMessages = () => {
  const context = useContext(MessageContext);
  if (context === undefined) {
    throw new Error('useMessages must be used within a MessageProvider');
  }
  return context;
};

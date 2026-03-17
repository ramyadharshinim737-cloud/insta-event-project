import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Image,
  ActionSheetIOS,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import * as FileSystem from 'expo-file-system';
import { Video, ResizeMode } from 'expo-av';
import { useMessages } from '../../context/MessageContext';
import { useAuth } from '../../context/AuthContext';
import { Message } from '../../utils/messageTypes';
import { MediaPickerService, MediaResult } from '../../utils/MediaPickerService';
import { chatApi } from '../../services/chat.api';

interface ChatScreenProps {
  route?: any;
  navigation?: any;
}

const ChatScreen: React.FC<ChatScreenProps> = ({ route, navigation }) => {
  const { conversationId } = route?.params ?? {};
  const { getConversation, sendMessage, sendMediaMessage, deleteMessage, markAsRead } = useMessages();
  const { user } = useAuth();
  const currentUserId = user?.id;
  const [inputText, setInputText] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [attachedMedia, setAttachedMedia] = useState<MediaResult | null>(null);
  const [deletedMessageIds, setDeletedMessageIds] = useState<string[]>([]);
  const [previewMedia, setPreviewMedia] = useState<{ uri: string; type: 'image' | 'video' } | null>(null);
  const [replyTo, setReplyTo] = useState<Message | null>(null);
  const [highlightedMessageId, setHighlightedMessageId] = useState<string | null>(null);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [statusText, setStatusText] = useState<string | null>(null);
  const flatListRef = useRef<FlatList>(null);

  const conversation = getConversation(conversationId);

  useEffect(() => {
    if (conversationId) {
      markAsRead(conversationId);
    }
  }, [conversationId]);

  useEffect(() => {
    if (!conversation) return;

    let isMounted = true;
    let interval: any;

    const loadStatus = async () => {
      try {
        const status = await chatApi.getUserStatus(conversation.participant.id);
        if (!isMounted) return;

        if (status.online) {
          setStatusText('Online');
        } else if (status.lastSeen) {
          const d = new Date(status.lastSeen);
          const time = d.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
          });
          setStatusText(`Last seen at ${time}`);
        } else {
          // Fallback: prefer last message from this participant, otherwise use last message in the thread
          const lastFromParticipant = conversation.messages
            .filter(m => m.senderId === conversation.participant.id)
            .slice(-1)[0];

          const lastMessage = lastFromParticipant
            || conversation.messages[conversation.messages.length - 1];

          if (lastMessage) {
            const d = new Date(lastMessage.timestamp);
            const time = d.toLocaleTimeString('en-US', {
              hour: 'numeric',
              minute: '2-digit',
              hour12: true,
            });
            setStatusText(`Last seen at ${time}`);
          } else {
            setStatusText(null);
          }
        }
      } catch {
        // ignore status errors
      }
    };

    loadStatus();
    interval = setInterval(loadStatus, 2000);

    return () => {
      isMounted = false;
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [conversation?.participant?.id]);

  if (!conversation) {
    return (
      <SafeAreaView style={styles.container}>
        <Text>Conversation not found</Text>
      </SafeAreaView>
    );
  }

  const handleSend = async () => {
    const trimmed = inputText.trim();
    if (!trimmed && !attachedMedia) {
      return;
    }

    if (attachedMedia) {
      await sendMediaMessage(
        conversationId,
        {
          uri: attachedMedia.uri,
          type: attachedMedia.type,
        },
        trimmed || undefined,
        replyTo?.id,
      );
    } else if (trimmed) {
      await sendMessage(conversationId, trimmed, replyTo?.id);
    }

    setInputText('');
    setShowEmojiPicker(false);
    setIsTyping(false);
    setAttachedMedia(null);
    setReplyTo(null);
    // Scroll to bottom after sending
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const handleToggleEmojiPicker = () => {
    setShowEmojiPicker(prev => !prev);
  };

  const handleEmojiPress = (emoji: string) => {
    setInputText(prev => prev + emoji);
  };

  const handleOpenMedia = (item: Message) => {
    if (!item.mediaUrl || !item.mediaType) return;
    if (item.mediaType !== 'image' && item.mediaType !== 'video') return;
    setPreviewMedia({ uri: item.mediaUrl, type: item.mediaType });
  };

  const scrollToMessage = (messageId: string) => {
    if (!conversation) return;
    const index = conversation.messages.findIndex(m => m.id === messageId);
    if (index === -1) return;

    flatListRef.current?.scrollToIndex({ index, animated: true });
    setHighlightedMessageId(messageId);
    setTimeout(() => {
      setHighlightedMessageId(current => (current === messageId ? null : current));
    }, 1500);
  };

  const handleSavePreviewMedia = async () => {
    if (!previewMedia) return;
    try {
      const filename = previewMedia.type === 'image'
        ? `chat-image-${Date.now()}.jpg`
        : `chat-video-${Date.now()}.mp4`;
      const fsAny: any = FileSystem as any;
      const baseDir: string = fsAny.cacheDirectory || fsAny.documentDirectory || '';
      const dest = baseDir + filename;
      await FileSystem.downloadAsync(previewMedia.uri, dest);
      Alert.alert('Saved', 'Media saved to app storage.');
    } catch (error) {
      Alert.alert('Error', 'Failed to save media.');
    }
  };

  const handleAddMedia = async () => {
    // Show media options and pick/take media, then attach it locally.
    MediaPickerService.showMediaOptions(
      async () => {
        const result = await MediaPickerService.pickImage();
        if (result) setAttachedMedia(result);
      },
      async () => {
        const result = await MediaPickerService.takePhoto();
        if (result) setAttachedMedia(result);
      },
      async () => {
        const result = await MediaPickerService.pickVideo();
        if (result) setAttachedMedia(result);
      },
      async () => {
        const result = await MediaPickerService.recordVideo();
        if (result) setAttachedMedia(result);
      },
    );
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const handleLongPressMessage = (item: Message) => {
    // If message is already deleted, ignore long press
    if (item.deleted || deletedMessageIds.includes(item.id)) {
      return;
    }
    setSelectedMessage(item);
  };

  const handleMessageOption = async (action: 'reply' | 'copy' | 'delete') => {
    const item = selectedMessage;
    if (!item) return;

    const isCurrentUser = !!currentUserId && item.senderId === currentUserId;

    if (action === 'reply') {
      setReplyTo(item);
    } else if (action === 'copy') {
      if (item.text) {
        await Clipboard.setStringAsync(item.text);
      }
    } else if (action === 'delete') {
      if (!isCurrentUser) return;
      // Optimistic local flag
      setDeletedMessageIds(prev =>
        prev.includes(item.id) ? prev : [...prev, item.id],
      );
      try {
        await deleteMessage(conversationId, item.id);
      } catch {
        // If API fails, remove optimistic flag
        setDeletedMessageIds(prev => prev.filter(id => id !== item.id));
      }
    }

    setSelectedMessage(null);
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isCurrentUser = !!currentUserId && item.senderId === currentUserId;
    const isDeleted = item.deleted || deletedMessageIds.includes(item.id);
    const isHighlighted = highlightedMessageId === item.id;
    const otherUserId = conversation.participant.id;
    const isSeenByOther = isCurrentUser
      ? !!item.readBy && item.readBy.includes(otherUserId)
      : false;

    const repliedToMessage = item.replyToId
      ? conversation.messages.find(m => m.id === item.replyToId)
      : undefined;

    return (
      <TouchableOpacity
        activeOpacity={0.8}
        onLongPress={() => handleLongPressMessage(item)}
        onPress={() => handleOpenMedia(item)}
        style={[
          styles.messageContainer,
          isCurrentUser ? styles.currentUserMessage : styles.otherUserMessage,
          isHighlighted && styles.highlightedMessageContainer,
        ]}
      >
        <View
          style={[
            styles.messageBubble,
            isCurrentUser ? styles.currentUserBubble : styles.otherUserBubble,
          ]}
        >
          {isDeleted ? (
            <Text
              style={[
                styles.messageText,
                styles.deletedMessageText,
              ]}
            >
              This message was deleted
            </Text>
          ) : (
            <>
              {repliedToMessage && (
                <TouchableOpacity
                  style={styles.replyBubble}
                  activeOpacity={0.7}
                  onPress={() => scrollToMessage(repliedToMessage.id)}
                >
                  <View style={styles.replyBar} />
                  <View style={styles.replyContent}>
                    <Text
                      style={[
                        styles.replyAuthor,
                        isCurrentUser
                          ? styles.replyTextOnDark
                          : styles.replyTextOnLight,
                      ]}
                    >
                      {repliedToMessage.senderId === currentUserId
                        ? 'You'
                        : conversation.participant.name}
                    </Text>
                    {repliedToMessage.mediaUrl && (
                      <Text
                        style={[
                          styles.replySnippetMedia,
                          isCurrentUser
                            ? styles.replyTextOnDark
                            : styles.replyTextOnLight,
                        ]}
                      >
                        {repliedToMessage.mediaType === 'image' ? 'Photo' : 'Video'}
                      </Text>
                    )}
                    {!!repliedToMessage.text && (
                      <Text
                        style={[
                          styles.replySnippet,
                          isCurrentUser
                            ? styles.replyTextOnDark
                            : styles.replyTextOnLight,
                        ]}
                        numberOfLines={1}
                      >
                        {repliedToMessage.text}
                      </Text>
                    )}
                  </View>
                </TouchableOpacity>
              )}
              {item.mediaUrl && item.mediaType === 'image' && (
                <Image
                  source={{ uri: item.mediaUrl }}
                  style={{
                    width: 180,
                    height: 180,
                    borderRadius: 12,
                    marginBottom: item.text ? 8 : 0,
                  }}
                  resizeMode="cover"
                />
              )}
              {item.mediaUrl && item.mediaType === 'video' && (
                <View style={{ marginBottom: item.text ? 8 : 0 }}>
                  <View style={styles.mediaPreviewVideo}>
                    <Ionicons name="videocam" size={20} color="#fff" />
                    <Text style={styles.mediaPreviewVideoText}>Video</Text>
                  </View>
                </View>
              )}
              {!!item.text && (
                <Text
                  style={[
                    styles.messageText,
                    isCurrentUser ? styles.currentUserText : styles.otherUserText,
                  ]}
                >
                  {item.text}
                </Text>
              )}
            </>
          )}
        </View>
        <View style={styles.messageMeta}>
          <Text style={styles.messageTime}>{formatTime(item.timestamp)}</Text>
          {!isCurrentUser && !isDeleted && (
            <TouchableOpacity
              style={styles.inlineReplyButton}
              onPress={() => setReplyTo(item)}
            >
              <Ionicons name="arrow-undo-outline" size={14} color="#9ca3af" />
            </TouchableOpacity>
          )}
          {isCurrentUser && !isDeleted && (
            <Ionicons
              name={isSeenByOther ? 'checkmark-done' : 'checkmark'}
              size={14}
              color={isSeenByOther ? '#0A66C2' : '#9ca3af'}
              style={{ marginLeft: 4 }}
            />
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation?.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.headerInfo}
          onPress={() => navigation?.navigate('UserProfile', { userId: conversation.participant.id })}
          activeOpacity={0.6}
        >
          <Ionicons name={conversation.participant.avatar as any || 'person-circle'} size={40} color="#fff" />
          <View style={styles.headerText}>
            <Text style={styles.participantName}>{conversation.participant.name}</Text>
            {statusText && (
              <Text style={styles.participantStatus}>{statusText}</Text>
            )}
          </View>
        </TouchableOpacity>

        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.headerButton}>
            <Ionicons name="call-outline" size={24} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerButton}>
            <Ionicons name="videocam-outline" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Content + Keyboard Handling */}
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <View style={{ flex: 1 }}>
          {/* Messages List */}
          <FlatList
            ref={flatListRef}
            data={conversation.messages}
            renderItem={renderMessage}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.messagesList}
            onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: false })}
          />

          {/* Typing Indicator */}
          {isTyping && (
            <View style={styles.typingContainer}>
              <Text style={styles.typingText}>Typing...</Text>
            </View>
          )}

          {/* Emoji Picker */}
          {showEmojiPicker && (
            <View style={styles.emojiPicker}>
              {['😀', '😂', '😍', '😎', '👍', '🙏', '🎉', '❤️'].map(emoji => (
                <TouchableOpacity
                  key={emoji}
                  style={styles.emojiItem}
                  onPress={() => handleEmojiPress(emoji)}
                >
                  <Text style={styles.emojiText}>{emoji}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Input Area */}
        <View style={styles.inputContainer}>
          <TouchableOpacity 
            style={styles.addButton}
            onPress={handleAddMedia}
          >
            <Ionicons name="add-circle" size={32} color="#0A66C2" />
          </TouchableOpacity>

          <TextInput
            style={styles.input}
            placeholder="Type a message..."
            placeholderTextColor="#999"
            value={inputText}
            onChangeText={text => {
              setInputText(text);
              setIsTyping(text.trim().length > 0);
            }}
            multiline
            maxLength={1000}
          />

          <TouchableOpacity 
            style={styles.emojiButton}
            onPress={handleToggleEmojiPicker}
          >
            <Ionicons name="happy-outline" size={24} color="#666" />
          </TouchableOpacity>

          <TouchableOpacity 
            style={[
              styles.sendButton,
              !inputText.trim() && !attachedMedia && styles.sendButtonDisabled,
            ]}
            onPress={handleSend}
            disabled={!inputText.trim() && !attachedMedia}
          >
            <Ionicons name="send" size={20} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Attached media preview (local only) */}
        {attachedMedia && (
          <View style={styles.mediaPreviewContainer}>
            {attachedMedia.type === 'image' ? (
              <Image
                source={{ uri: attachedMedia.uri }}
                style={styles.mediaPreviewImage}
              />
            ) : (
              <View style={styles.mediaPreviewVideo}>
                <Ionicons name="videocam" size={24} color="#fff" />
                <Text style={styles.mediaPreviewVideoText}>Video attached</Text>
              </View>
            )}
            <TouchableOpacity
              style={styles.mediaPreviewRemove}
              onPress={() => setAttachedMedia(null)}
            >
              <Ionicons name="close-circle" size={20} color="#ef4444" />
            </TouchableOpacity>
          </View>
        )}

        {/* Reply preview above input */}
        {replyTo && (
          <View style={styles.replyPreviewContainer}>
            <View style={styles.replyPreviewBar} />
            <View style={styles.replyPreviewContent}>
              <Text style={styles.replyPreviewLabel}>
                Replying to {replyTo.senderId === currentUserId ? 'yourself' : conversation.participant.name}
              </Text>
              {replyTo.mediaUrl && (
                <Text style={styles.replyPreviewMedia}>
                  {replyTo.mediaType === 'image' ? 'Photo' : 'Video'}
                </Text>
              )}
              {!!replyTo.text && (
                <Text style={styles.replyPreviewText} numberOfLines={2}>
                  {replyTo.text}
                </Text>
              )}
            </View>
            <TouchableOpacity
              style={styles.replyPreviewClose}
              onPress={() => setReplyTo(null)}
            >
              <Ionicons name="close" size={18} color="#6b7280" />
            </TouchableOpacity>
          </View>
        )}
      </KeyboardAvoidingView>

      {/* Message options bottom sheet */}
      {selectedMessage && (
        <Modal
          visible
          transparent
          animationType="fade"
          onRequestClose={() => setSelectedMessage(null)}
        >
          <View style={styles.optionsOverlay}>
            <TouchableOpacity
              style={styles.optionsBackdrop}
              activeOpacity={1}
              onPress={() => setSelectedMessage(null)}
            />
            <View style={styles.optionsSheet}>
              <View style={styles.optionsHandle} />
              <View style={styles.optionsRow}>
                <TouchableOpacity
                  style={styles.optionButton}
                  onPress={() => handleMessageOption('reply')}
                >
                  <View style={styles.optionIconWrapper}>
                    <Ionicons name="arrow-undo-outline" size={22} color="#111827" />
                  </View>
                  <Text style={styles.optionLabel}>Reply</Text>
                </TouchableOpacity>
                {selectedMessage.text && (
                  <TouchableOpacity
                    style={styles.optionButton}
                    onPress={() => handleMessageOption('copy')}
                  >
                    <View style={styles.optionIconWrapper}>
                      <Ionicons name="copy-outline" size={22} color="#111827" />
                    </View>
                    <Text style={styles.optionLabel}>Copy</Text>
                  </TouchableOpacity>
                )}
                {selectedMessage.senderId === currentUserId && !selectedMessage.deleted && (
                  <TouchableOpacity
                    style={styles.optionButton}
                    onPress={() => handleMessageOption('delete')}
                  >
                    <View style={[styles.optionIconWrapper, styles.optionDeleteIconWrapper]}>
                      <Ionicons name="trash-outline" size={22} color="#b91c1c" />
                    </View>
                    <Text style={[styles.optionLabel, styles.optionDeleteLabel]}>Delete</Text>
                  </TouchableOpacity>
                )}
              </View>
              <TouchableOpacity
                style={styles.optionCancelButton}
                onPress={() => setSelectedMessage(null)}
              >
                <Text style={styles.optionCancelText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}

      {/* Full-screen media preview */}
      {previewMedia && (
        <Modal
          visible
          transparent
          animationType="fade"
          onRequestClose={() => setPreviewMedia(null)}
        >
          <View style={styles.previewOverlay}>
            <TouchableOpacity
              style={styles.previewClose}
              onPress={() => setPreviewMedia(null)}
            >
              <Ionicons name="close" size={26} color="#fff" />
            </TouchableOpacity>

            {previewMedia.type === 'image' ? (
              <Image
                source={{ uri: previewMedia.uri }}
                style={styles.previewImage}
                resizeMode="contain"
              />
            ) : (
              <Video
                source={{ uri: previewMedia.uri }}
                style={styles.previewVideo}
                useNativeControls
                resizeMode={ResizeMode.CONTAIN}
              />
            )}

            <TouchableOpacity
              style={styles.previewSave}
              onPress={handleSavePreviewMedia}
            >
              <Ionicons name="download-outline" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
        </Modal>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#0A66C2',
    borderBottomWidth: 1,
    borderBottomColor: '#0856a3',
  },
  backButton: {
    padding: 4,
    marginRight: 12,
  },
  headerInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerText: {
    marginLeft: 12,
  },
  participantName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  participantStatus: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 2,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  headerButton: {
    padding: 4,
  },
  messagesList: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  messageContainer: {
    marginBottom: 12,
    maxWidth: '75%',
  },
  highlightedMessageContainer: {
    transform: [{ scale: 1.02 }],
  },
  currentUserMessage: {
    alignSelf: 'flex-end',
    alignItems: 'flex-end',
  },
  otherUserMessage: {
    alignSelf: 'flex-start',
    alignItems: 'flex-start',
  },
  messageBubble: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginBottom: 4,
  },
  currentUserBubble: {
    backgroundColor: '#0A66C2',
    borderBottomRightRadius: 4,
  },
  otherUserBubble: {
    backgroundColor: '#f0f0f0',
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 20,
  },
  currentUserText: {
    color: '#fff',
  },
  otherUserText: {
    color: '#262626',
  },
  messageTime: {
    fontSize: 11,
    color: '#8e8e8e',
    marginTop: 2,
  },
  messageMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  deletedMessageText: {
    fontSize: 13,
    color: '#9ca3af',
    fontStyle: 'italic',
  },
  typingContainer: {
    paddingHorizontal: 16,
    paddingBottom: 4,
  },
  typingText: {
    fontSize: 12,
    color: '#6b7280',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#efefef',
  },
  addButton: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    fontSize: 15,
    maxHeight: 100,
    color: '#262626',
  },
  emojiButton: {
    marginLeft: 8,
    padding: 4,
  },
  sendButton: {
    marginLeft: 8,
    backgroundColor: '#0A66C2',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#ccc',
  },
  mediaPreviewContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#f9fafb',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  mediaPreviewImage: {
    width: 64,
    height: 64,
    borderRadius: 8,
  },
  mediaPreviewVideo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0A66C2',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  mediaPreviewVideoText: {
    marginLeft: 8,
    color: '#fff',
    fontSize: 13,
    fontWeight: '500',
  },
  mediaPreviewRemove: {
    marginLeft: 12,
  },
  replyBubble: {
    flexDirection: 'row',
    paddingVertical: 4,
    paddingHorizontal: 8,
    marginBottom: 4,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.18)',
  },
  replyBar: {
    width: 2,
    borderRadius: 999,
    backgroundColor: '#bfdbfe',
    marginRight: 6,
  },
  replyContent: {
    flex: 1,
  },
  replyAuthor: {
    fontSize: 11,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 1,
  },
  replySnippet: {
    fontSize: 12,
    color: '#4b5563',
  },
  replySnippetMedia: {
    fontSize: 11,
    color: '#2563eb',
    marginBottom: 1,
  },
  replyTextOnDark: {
    color: 'rgba(255,255,255,0.9)',
  },
  replyTextOnLight: {
    color: '#374151',
  },
  replyPreviewContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#e5e7eb',
    backgroundColor: '#f9fafb',
  },
  replyPreviewBar: {
    width: 3,
    borderRadius: 999,
    backgroundColor: '#93c5fd',
    marginRight: 8,
  },
  replyPreviewContent: {
    flex: 1,
  },
  replyPreviewLabel: {
    fontSize: 11,
    color: '#6b7280',
    marginBottom: 2,
  },
  replyPreviewMedia: {
    fontSize: 11,
    color: '#2563eb',
    marginBottom: 2,
  },
  replyPreviewText: {
    fontSize: 13,
    color: '#374151',
  },
  replyPreviewClose: {
    marginLeft: 8,
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  previewOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewImage: {
    width: '100%',
    height: '80%',
  },
  previewVideo: {
    width: '100%',
    height: '80%',
  },
  previewClose: {
    position: 'absolute',
    top: 40,
    right: 20,
    padding: 8,
  },
  previewSave: {
    position: 'absolute',
    bottom: 40,
    right: 20,
    padding: 10,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  emojiPicker: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    paddingBottom: 4,
  },
  emojiItem: {
    padding: 4,
    marginRight: 4,
    marginBottom: 4,
    borderRadius: 16,
  },
  emojiText: {
    fontSize: 22,
  },
  inlineReplyButton: {
    marginLeft: 6,
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  optionsOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'flex-end',
  },
  optionsBackdrop: {
    flex: 1,
  },
  optionsSheet: {
    backgroundColor: '#fff',
    paddingTop: 8,
    paddingBottom: 24,
    paddingHorizontal: 16,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  optionsHandle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 999,
    backgroundColor: '#e5e7eb',
    marginBottom: 12,
  },
  optionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    marginBottom: 12,
  },
  optionButton: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionIconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  optionDeleteIconWrapper: {
    backgroundColor: '#fee2e2',
  },
  optionLabel: {
    fontSize: 12,
    color: '#111827',
  },
  optionDeleteLabel: {
    color: '#b91c1c',
    fontWeight: '500',
  },
  optionCancelButton: {
    marginTop: 4,
    paddingVertical: 8,
    alignItems: 'center',
  },
  optionCancelText: {
    fontSize: 14,
    color: '#4b5563',
    fontWeight: '500',
  },
});

export default ChatScreen;

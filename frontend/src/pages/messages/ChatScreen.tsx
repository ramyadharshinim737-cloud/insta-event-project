/**
 * Enhanced ChatScreen
 * With Voice Messages, File Sharing, Reactions, Reply, Read Receipts, and More
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  Keyboard,
  Image,
  Modal,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';

interface Message {
  id: string;
  text: string;
  time: string;
  sent: boolean;
  status?: 'sending' | 'sent' | 'delivered' | 'seen';
  type?: 'text' | 'voice' | 'image' | 'file';
  duration?: string; // for voice messages
  fileName?: string; // for files
  fileSize?: string;
  reactions?: { emoji: string; count: number }[];
  replyTo?: { id: string; text: string; sender: string };
}

interface Props {
  navigation?: any;
  route?: any;
}

const ChatScreen: React.FC<Props> = ({ navigation, route }) => {
  const { colors } = useTheme();
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Hey! How are you?',
      time: '2:10 PM',
      sent: false,
      status: 'seen',
    },
    {
      id: '2',
      text: "I'm good! Thanks for asking 😊",
      time: '2:11 PM',
      sent: true,
      status: 'seen',
    },
    {
      id: '3',
      text: 'Are you coming to the event tomorrow?',
      time: '2:12 PM',
      sent: false,
      status: 'seen',
      reactions: [{ emoji: '👍', count: 1 }],
    },
    {
      id: '4',
      text: 'Yes! See you at the event!',
      time: '2:14 PM',
      sent: true,
      status: 'seen',
      replyTo: { id: '3', text: 'Are you coming to the event tomorrow?', sender: 'Sarah' },
    },
    {
      id: '5',
      text: '',
      time: '2:15 PM',
      sent: false,
      status: 'seen',
      type: 'voice',
      duration: '0:45',
    },
    {
      id: '6',
      text: '',
      time: '2:16 PM',
      sent: true,
      status: 'delivered',
      type: 'image',
    },
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const [longPressedMessage, setLongPressedMessage] = useState<Message | null>(null);
  const scrollViewRef = useRef<ScrollView>(null);

  const chatName = route?.params?.chatName || 'Sarah Johnson';
  const chatAvatar = route?.params?.chatAvatar || 'https://i.pravatar.cc/150?img=1';
  const chatType = route?.params?.chatType || 'direct';
  const members = route?.params?.members;

  useEffect(() => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [messages]);

  const handleSend = () => {
    if (message.trim().length === 0) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      text: message.trim(),
      time: new Date().toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
      }),
      sent: true,
      status: 'sending',
      replyTo: replyingTo
        ? {
          id: replyingTo.id,
          text: replyingTo.text,
          sender: replyingTo.sent ? 'You' : chatName,
        }
        : undefined,
    };

    setMessages([...messages, newMessage]);
    setMessage('');
    setReplyingTo(null);
    Keyboard.dismiss();

    // Simulate status updates
    setTimeout(() => {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === newMessage.id ? { ...m, status: 'sent' } : m
        )
      );
    }, 500);

    setTimeout(() => {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === newMessage.id ? { ...m, status: 'delivered' } : m
        )
      );
    }, 1000);

    // Simulate typing and response
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      const response: Message = {
        id: (Date.now() + 1).toString(),
        text: 'Thanks for your message! 👍',
        time: new Date().toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
        }),
        sent: false,
        status: 'seen',
      };
      setMessages((prev) => [...prev, response]);

      // Mark as seen
      setTimeout(() => {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === newMessage.id ? { ...m, status: 'seen' } : m
          )
        );
      }, 500);
    }, 2500);
  };

  const handleReaction = (messageId: string, emoji: string) => {
    setMessages((prev) =>
      prev.map((m) => {
        if (m.id === messageId) {
          const reactions = m.reactions || [];
          const existing = reactions.find((r) => r.emoji === emoji);
          if (existing) {
            return {
              ...m,
              reactions: reactions.map((r) =>
                r.emoji === emoji ? { ...r, count: r.count + 1 } : r
              ),
            };
          } else {
            return {
              ...m,
              reactions: [...reactions, { emoji, count: 1 }],
            };
          }
        }
        return m;
      })
    );
    setLongPressedMessage(null);
  };

  const handleVoiceMessage = () => {
    Alert.alert('Voice Message', 'Voice recording feature (UI only)');
    setShowAttachMenu(false);
  };

  const handleImagePicker = () => {
    Alert.alert('Image', 'Image picker feature (UI only)');
    setShowAttachMenu(false);
  };

  const handleFilePicker = () => {
    Alert.alert('File', 'File picker feature (UI only)');
    setShowAttachMenu(false);
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
      edges={['left', 'right', 'bottom']}
    >
      <StatusBar
        barStyle="light-content"
        backgroundColor="#0A66C2"
        translucent={false}
      />

      {/* Enhanced Header */}
      <LinearGradient
        colors={['#0A66C2', '#378FE9']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.headerGradient}
      >
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation?.goBack?.()}
            style={styles.backButton}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.headerCenter} activeOpacity={0.7}>
            <Image source={{ uri: chatAvatar }} style={styles.headerAvatar} />
            <View style={styles.headerTextContainer}>
              <Text style={styles.headerTitle} numberOfLines={1}>
                {chatName}
              </Text>
              <Text style={styles.headerSubtitle}>
                {chatType === 'group' || chatType === 'community'
                  ? `${members} members`
                  : isTyping
                    ? 'typing...'
                    : 'Active now'}
              </Text>
            </View>
          </TouchableOpacity>

          <View style={styles.headerRight}>
            <TouchableOpacity style={styles.iconButton} activeOpacity={0.7}>
              <Ionicons name="call-outline" size={22} color="#FFFFFF" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton} activeOpacity={0.7}>
              <Ionicons name="videocam-outline" size={24} color="#FFFFFF" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton} activeOpacity={0.7}>
              <Ionicons
                name="information-circle-outline"
                size={24}
                color="#FFFFFF"
              />
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        {/* Messages ScrollView */}
        <ScrollView
          ref={scrollViewRef}
          style={[styles.messagesContainer, { backgroundColor: colors.background }]}
          contentContainerStyle={styles.messagesContent}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() =>
            scrollViewRef.current?.scrollToEnd({ animated: true })
          }
        >
          {/* Date Separator */}
          <View style={styles.dateSeparator}>
            <View style={[styles.dateLine, { backgroundColor: colors.border }]} />
            <Text style={[styles.dateText, { color: colors.textSecondary }]}>
              TODAY
            </Text>
            <View style={[styles.dateLine, { backgroundColor: colors.border }]} />
          </View>

          {messages.map((msg, index) => (
            <MessageBubble
              key={msg.id}
              message={msg}
              colors={colors}
              onLongPress={() => setLongPressedMessage(msg)}
              onReply={() => setReplyingTo(msg)}
              onReaction={(emoji) => handleReaction(msg.id, emoji)}
            />
          ))}

          {isTyping && (
            <View style={styles.typingContainer}>
              <View
                style={[
                  styles.typingBubble,
                  { backgroundColor: colors.surface, borderColor: colors.border },
                ]}
              >
                <View style={styles.typingDots}>
                  <View
                    style={[styles.dot, { backgroundColor: colors.textTertiary }]}
                  />
                  <View
                    style={[styles.dot, { backgroundColor: colors.textTertiary }]}
                  />
                  <View
                    style={[styles.dot, { backgroundColor: colors.textTertiary }]}
                  />
                </View>
              </View>
            </View>
          )}
        </ScrollView>

        {/* Reply Preview */}
        {replyingTo && (
          <View
            style={[
              styles.replyPreview,
              { backgroundColor: colors.surface, borderTopColor: colors.border },
            ]}
          >
            <View style={styles.replyContent}>
              <View style={styles.replyBar} />
              <View style={styles.replyText}>
                <Text style={[styles.replyName, { color: colors.primary }]}>
                  {replyingTo.sent ? 'You' : chatName}
                </Text>
                <Text
                  style={[styles.replyMessage, { color: colors.textSecondary }]}
                  numberOfLines={1}
                >
                  {replyingTo.text || 'Voice message'}
                </Text>
              </View>
            </View>
            <TouchableOpacity
              onPress={() => setReplyingTo(null)}
              style={styles.replyClose}
            >
              <Ionicons name="close" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>
        )}

        {/* Input Bar */}
        <View
          style={[
            styles.inputBar,
            { backgroundColor: colors.surface, borderTopColor: colors.border },
          ]}
        >
          <TouchableOpacity
            style={styles.attachButton}
            activeOpacity={0.7}
            onPress={() => setShowAttachMenu(true)}
          >
            <Ionicons name="add-circle" size={28} color="#0A66C2" />
          </TouchableOpacity>

          <View
            style={[
              styles.inputContainer,
              { backgroundColor: colors.background, borderColor: colors.border },
            ]}
          >
            <TextInput
              placeholder="Type a message..."
              placeholderTextColor={colors.textSecondary}
              value={message}
              onChangeText={setMessage}
              style={[styles.input, { color: colors.text }]}
              multiline
              maxLength={500}
              returnKeyType="send"
              onSubmitEditing={handleSend}
              blurOnSubmit={false}
            />
            <TouchableOpacity
              style={styles.emojiButton}
              activeOpacity={0.7}
              onPress={() => setShowEmojiPicker(!showEmojiPicker)}
            >
              <Ionicons
                name="happy-outline"
                size={22}
                color={colors.textSecondary}
              />
            </TouchableOpacity>
          </View>

          {message.trim().length > 0 ? (
            <TouchableOpacity
              onPress={handleSend}
              style={[styles.sendButton, { backgroundColor: '#0A66C2' }]}
              activeOpacity={0.8}
            >
              <Ionicons name="send" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[styles.sendButton, { backgroundColor: colors.border }]}
              activeOpacity={0.8}
              onPress={handleVoiceMessage}
            >
              <Ionicons name="mic" size={22} color="#FFFFFF" />
            </TouchableOpacity>
          )}
        </View>
      </KeyboardAvoidingView>

      {/* Attachment Menu Modal */}
      <Modal
        visible={showAttachMenu}
        transparent
        animationType="fade"
        onRequestClose={() => setShowAttachMenu(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowAttachMenu(false)}
        >
          <View
            style={[
              styles.attachMenu,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            <TouchableOpacity
              style={styles.attachOption}
              onPress={handleImagePicker}
            >
              <View style={[styles.attachIcon, { backgroundColor: '#E91E63' }]}>
                <Ionicons name="image" size={24} color="#FFFFFF" />
              </View>
              <Text style={[styles.attachText, { color: colors.text }]}>
                Photo
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.attachOption}
              onPress={handleFilePicker}
            >
              <View style={[styles.attachIcon, { backgroundColor: '#9C27B0' }]}>
                <Ionicons name="document" size={24} color="#FFFFFF" />
              </View>
              <Text style={[styles.attachText, { color: colors.text }]}>
                Document
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.attachOption}
              onPress={handleVoiceMessage}
            >
              <View style={[styles.attachIcon, { backgroundColor: '#FF9800' }]}>
                <Ionicons name="mic" size={24} color="#FFFFFF" />
              </View>
              <Text style={[styles.attachText, { color: colors.text }]}>
                Voice
              </Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Message Actions Modal */}
      <Modal
        visible={longPressedMessage !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setLongPressedMessage(null)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setLongPressedMessage(null)}
        >
          <View
            style={[
              styles.actionsMenu,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            <View style={styles.reactionsRow}>
              {['❤️', '👍', '😂', '😮', '😢', '🙏'].map((emoji) => (
                <TouchableOpacity
                  key={emoji}
                  style={styles.reactionButton}
                  onPress={() =>
                    longPressedMessage &&
                    handleReaction(longPressedMessage.id, emoji)
                  }
                >
                  <Text style={styles.reactionEmoji}>{emoji}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => {
                if (longPressedMessage) {
                  setReplyingTo(longPressedMessage);
                  setLongPressedMessage(null);
                }
              }}
            >
              <Ionicons name="arrow-undo" size={20} color={colors.text} />
              <Text style={[styles.actionText, { color: colors.text }]}>
                Reply
              </Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="copy-outline" size={20} color={colors.text} />
              <Text style={[styles.actionText, { color: colors.text }]}>
                Copy
              </Text>
            </TouchableOpacity>
            {longPressedMessage?.sent && (
              <TouchableOpacity style={styles.actionButton}>
                <Ionicons name="trash-outline" size={20} color="#DC2626" />
                <Text style={[styles.actionText, { color: '#DC2626' }]}>
                  Delete
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
};

// Message Bubble Component
const MessageBubble: React.FC<{
  message: Message;
  colors: any;
  onLongPress: () => void;
  onReply: () => void;
  onReaction: (emoji: string) => void;
}> = ({ message, colors, onLongPress, onReply, onReaction }) => {
  const isSent = message.sent;

  return (
    <TouchableOpacity
      style={[
        styles.messageBubbleContainer,
        isSent ? styles.sentContainer : styles.receivedContainer,
      ]}
      onLongPress={onLongPress}
      activeOpacity={0.7}
    >
      {/* Reply Preview */}
      {message.replyTo && (
        <View
          style={[
            styles.replyInBubble,
            {
              backgroundColor: isSent ? '#FFFFFF20' : colors.background,
              borderLeftColor: isSent ? '#FFFFFF' : colors.primary,
            },
          ]}
        >
          <Text
            style={[
              styles.replyInBubbleName,
              { color: isSent ? '#FFFFFF' : colors.primary },
            ]}
          >
            {message.replyTo.sender}
          </Text>
          <Text
            style={[
              styles.replyInBubbleText,
              { color: isSent ? '#FFFFFFCC' : colors.textSecondary },
            ]}
            numberOfLines={1}
          >
            {message.replyTo.text}
          </Text>
        </View>
      )}

      {/* Message Content */}
      <View
        style={[
          styles.messageBubble,
          isSent
            ? { backgroundColor: '#0095f6' }
            : { backgroundColor: colors.surface, borderColor: colors.border },
        ]}
      >
        {message.type === 'voice' ? (
          <View style={styles.voiceMessage}>
            <Ionicons
              name="play-circle"
              size={32}
              color={isSent ? '#FFFFFF' : colors.primary}
            />
            <View style={styles.voiceWaveform}>
              {[...Array(20)].map((_, i) => (
                <View
                  key={i}
                  style={[
                    styles.waveBar,
                    {
                      height: Math.random() * 20 + 10,
                      backgroundColor: isSent ? '#FFFFFF' : colors.primary,
                    },
                  ]}
                />
              ))}
            </View>
            <Text
              style={[
                styles.voiceDuration,
                { color: isSent ? '#FFFFFF' : colors.text },
              ]}
            >
              {message.duration}
            </Text>
          </View>
        ) : message.type === 'image' ? (
          <View style={styles.imageMessage}>
            <Image
              source={{ uri: 'https://picsum.photos/300/200' }}
              style={styles.messageImage}
            />
          </View>
        ) : (
          <Text
            style={[
              styles.messageText,
              { color: isSent ? '#FFFFFF' : colors.text },
            ]}
          >
            {message.text}
          </Text>
        )}

        <View style={styles.messageFooter}>
          <Text
            style={[
              styles.messageTime,
              { color: isSent ? '#FFFFFFCC' : colors.textSecondary },
            ]}
          >
            {message.time}
          </Text>
          {isSent && message.status && (
            <Ionicons
              name={
                message.status === 'sending'
                  ? 'time-outline'
                  : message.status === 'sent'
                    ? 'checkmark'
                    : message.status === 'delivered'
                      ? 'checkmark-done'
                      : 'checkmark-done'
              }
              size={14}
              color={message.status === 'seen' ? '#0095f6' : '#FFFFFFCC'}
              style={styles.statusIcon}
            />
          )}
        </View>
      </View>

      {/* Reactions */}
      {message.reactions && message.reactions.length > 0 && (
        <View style={styles.reactionsContainer}>
          {message.reactions.map((reaction, index) => (
            <View key={index} style={styles.reactionBubble}>
              <Text style={styles.reactionEmojiSmall}>{reaction.emoji}</Text>
              {reaction.count > 1 && (
                <Text style={styles.reactionCount}>{reaction.count}</Text>
              )}
            </View>
          ))}
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerGradient: {
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  backButton: {
    padding: 4,
    marginRight: 8,
  },
  headerCenter: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF20',
    marginRight: 10,
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#FFFFFFCC',
    marginTop: 1,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  iconButton: {
    padding: 6,
  },
  keyboardView: {
    flex: 1,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
    paddingBottom: 8,
  },
  dateSeparator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
  },
  dateLine: {
    flex: 1,
    height: 1,
  },
  dateText: {
    fontSize: 12,
    fontWeight: '600',
    marginHorizontal: 12,
    letterSpacing: 0.5,
  },
  messageBubbleContainer: {
    marginBottom: 12,
    maxWidth: '75%',
  },
  sentContainer: {
    alignSelf: 'flex-end',
  },
  receivedContainer: {
    alignSelf: 'flex-start',
  },
  messageBubble: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  replyInBubble: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderLeftWidth: 3,
    marginBottom: 8,
    borderRadius: 8,
  },
  replyInBubbleName: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 2,
  },
  replyInBubbleText: {
    fontSize: 13,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 20,
  },
  messageFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 4,
  },
  messageTime: {
    fontSize: 11,
  },
  statusIcon: {
    marginLeft: 2,
  },
  voiceMessage: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 4,
  },
  voiceWaveform: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    flex: 1,
  },
  waveBar: {
    width: 2,
    borderRadius: 1,
  },
  voiceDuration: {
    fontSize: 12,
    fontWeight: '600',
  },
  imageMessage: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  messageImage: {
    width: 200,
    height: 150,
    borderRadius: 12,
  },
  reactionsContainer: {
    flexDirection: 'row',
    gap: 4,
    marginTop: 4,
  },
  reactionBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    gap: 2,
  },
  reactionEmojiSmall: {
    fontSize: 12,
  },
  reactionCount: {
    fontSize: 10,
    fontWeight: '600',
    color: '#6B7280',
  },
  typingContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginBottom: 8,
  },
  typingBubble: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 18,
    borderWidth: 1,
  },
  typingDots: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  replyPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
  },
  replyContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  replyBar: {
    width: 3,
    height: 40,
    backgroundColor: '#0A66C2',
    borderRadius: 2,
    marginRight: 12,
  },
  replyText: {
    flex: 1,
  },
  replyName: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 2,
  },
  replyMessage: {
    fontSize: 14,
  },
  replyClose: {
    padding: 4,
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderTopWidth: 1,
    gap: 8,
  },
  attachButton: {
    padding: 4,
    marginBottom: 4,
  },
  inputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
    borderWidth: 1,
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 8,
    minHeight: 44,
    maxHeight: 100,
  },
  input: {
    flex: 1,
    fontSize: 15,
    lineHeight: 20,
    paddingVertical: 6,
  },
  emojiButton: {
    padding: 4,
    marginLeft: 4,
    marginBottom: 2,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 0,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
    padding: 16,
  },
  attachMenu: {
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  attachOption: {
    alignItems: 'center',
    gap: 8,
  },
  attachIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  attachText: {
    fontSize: 13,
    fontWeight: '600',
  },
  actionsMenu: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
  },
  reactionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
  },
  reactionButton: {
    padding: 8,
  },
  reactionEmoji: {
    fontSize: 28,
  },
  divider: {
    height: 1,
    marginVertical: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    gap: 12,
  },
  actionText: {
    fontSize: 15,
    fontWeight: '500',
  },
});

export default ChatScreen;

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useMessages } from '../../context/MessageContext';
import { useAuth } from '../../context/AuthContext';
import { Conversation } from '../../utils/messageTypes';

interface MessagesScreenProps {
  navigation?: any;
}

const MessagesScreen: React.FC<MessagesScreenProps> = ({ navigation }) => {
  const { conversations } = useMessages();
  const { user } = useAuth();
  const currentUserId = user?.id;

  const handleNewMessage = () => {
    if (navigation) {
      navigation.navigate('Network');
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / 3600000);
    
    if (hours < 1) {
      const minutes = Math.floor(diff / 60000);
      return `${minutes}m ago`;
    } else if (hours < 24) {
      return `${hours}h ago`;
    } else {
      const days = Math.floor(hours / 24);
      return `${days}d ago`;
    }
  };

  const renderConversation = ({ item }: { item: Conversation }) => {
    const lastMessage = item.lastMessage || item.messages[item.messages.length - 1];

    if (!lastMessage) {
      return null;
    }
    
    return (
      <TouchableOpacity
        style={styles.conversationItem}
        onPress={() => navigation?.navigate('Chat', { conversationId: item.id })}
        activeOpacity={0.7}
      >
        <View style={styles.avatarContainer}>
          <Ionicons name={item.participant.avatar as any || 'person-circle'} size={56} color="#0A66C2" />
          {item.unreadCount > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadText}>{item.unreadCount}</Text>
            </View>
          )}
        </View>

        <View style={styles.conversationContent}>
          <View style={styles.conversationHeader}>
            <Text style={styles.participantName}>{item.participant.name}</Text>
            <Text style={styles.timestamp}>{formatTime(lastMessage.timestamp)}</Text>
          </View>
          
          <View style={styles.messagePreview}>
            <Text 
              style={[
                styles.lastMessage,
                item.unreadCount > 0 && styles.unreadMessage
              ]}
              numberOfLines={1}
            >
              {currentUserId && lastMessage.senderId === currentUserId ? 'You: ' : ''}
              {lastMessage.text}
            </Text>
          </View>

          {item.participant.status && (
            <Text style={styles.status}>{item.participant.status}</Text>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          {navigation && (
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack?.()}
            >
              <Ionicons name="arrow-back" size={24} color="#0A66C2" />
            </TouchableOpacity>
          )}
          <Text style={styles.headerTitle}>Messages</Text>
        </View>
        <TouchableOpacity style={styles.newMessageButton} onPress={handleNewMessage}>
          <Ionicons name="create-outline" size={24} color="#0A66C2" />
        </TouchableOpacity>
      </View>

      {/* Conversation List / Empty State */}
      {conversations.length > 0 ? (
        <FlatList
          data={conversations}
          renderItem={renderConversation}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Ionicons name="chatbubble-ellipses-outline" size={64} color="#d1d5db" />
          <Text style={styles.emptyTitle}>No messages yet</Text>
          <Text style={styles.emptySubtitle}>
            Start a conversation with your connections or people in your network.
          </Text>

          <TouchableOpacity style={styles.primaryButton} onPress={handleNewMessage}>
            <Text style={styles.primaryButtonText}>Start a message</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => navigation?.navigate?.('Network')}
          >
            <Text style={styles.secondaryButtonText}>Discover people to connect</Text>
          </TouchableOpacity>
        </View>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#efefef',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#262626',
  },
  backButton: {
    padding: 4,
    marginRight: 8,
  },
  newMessageButton: {
    padding: 4,
  },
  listContent: {
    paddingBottom: 80,
  },
  conversationItem: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#fff',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 12,
  },
  unreadBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: '#0A66C2',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  unreadText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  conversationContent: {
    flex: 1,
    justifyContent: 'center',
  },
  conversationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  participantName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#262626',
  },
  timestamp: {
    fontSize: 12,
    color: '#8e8e8e',
  },
  messagePreview: {
    marginBottom: 2,
  },
  lastMessage: {
    fontSize: 14,
    color: '#8e8e8e',
  },
  unreadMessage: {
    fontWeight: '600',
    color: '#262626',
  },
  status: {
    fontSize: 12,
    color: '#0A66C2',
    marginTop: 2,
  },
  separator: {
    height: 1,
    backgroundColor: '#efefef',
    marginLeft: 84,
  },
  emptyContainer: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyTitle: {
    marginTop: 16,
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  emptySubtitle: {
    marginTop: 8,
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
  primaryButton: {
    marginTop: 24,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
    backgroundColor: '#0A66C2',
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    marginTop: 12,
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  secondaryButtonText: {
    color: '#374151',
    fontSize: 14,
    fontWeight: '500',
  },
});

export default MessagesScreen;

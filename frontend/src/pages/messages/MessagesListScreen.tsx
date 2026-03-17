/**
 * Enhanced MessagesListScreen
 * With Groups, Communities, Pinned Chats, Online Status, and More
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  StatusBar,
  TextInput,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';

interface Props {
  navigation?: any;
}

type ChatType = 'direct' | 'group' | 'community';
type FilterType = 'all' | 'unread' | 'groups' | 'communities';

interface Chat {
  id: string;
  name: string;
  avatar: string;
  lastMessage: string;
  time: string;
  unread: number;
  type: ChatType;
  isOnline?: boolean;
  isPinned?: boolean;
  isTyping?: boolean;
  members?: number;
  lastSender?: string;
}

const MessagesListScreen: React.FC<Props> = ({ navigation }) => {
  const { colors } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [filter, setFilter] = useState<FilterType>('all');

  const chats: Chat[] = [
    {
      id: 'ch1',
      name: 'Sarah Johnson',
      avatar: 'https://i.pravatar.cc/150?img=1',
      lastMessage: 'See you at the event tomorrow! 🎉',
      time: '2m',
      unread: 3,
      type: 'direct',
      isOnline: true,
      isPinned: true,
      isTyping: true,
    },
    {
      id: 'ch2',
      name: 'React Developers',
      avatar: 'https://i.pravatar.cc/150?img=20',
      lastMessage: 'Next meetup agenda is ready',
      time: '15m',
      unread: 5,
      type: 'group',
      members: 24,
      isPinned: true,
      lastSender: 'Michael',
    },
    {
      id: 'ch3',
      name: 'Emily Rodriguez',
      avatar: 'https://i.pravatar.cc/150?img=5',
      lastMessage: 'Thanks for the help!',
      time: '1h',
      unread: 0,
      type: 'direct',
      isOnline: false,
    },
    {
      id: 'ch4',
      name: 'Tech Community Hub',
      avatar: 'https://i.pravatar.cc/150?img=30',
      lastMessage: 'New event: AI Workshop',
      time: '2h',
      unread: 12,
      type: 'community',
      members: 1247,
      lastSender: 'Admin',
    },
    {
      id: 'ch5',
      name: 'David Kim',
      avatar: 'https://i.pravatar.cc/150?img=13',
      lastMessage: 'The design looks great!',
      time: '5h',
      unread: 0,
      type: 'direct',
      isOnline: true,
    },
    {
      id: 'ch6',
      name: 'Project Team Alpha',
      avatar: 'https://i.pravatar.cc/150?img=25',
      lastMessage: 'Sprint planning tomorrow',
      time: 'Yesterday',
      unread: 2,
      type: 'group',
      members: 8,
      lastSender: 'Jessica',
    },
    {
      id: 'ch7',
      name: 'Design Community',
      avatar: 'https://i.pravatar.cc/150?img=35',
      lastMessage: 'Check out these amazing mockups!',
      time: 'Yesterday',
      unread: 0,
      type: 'community',
      members: 892,
      lastSender: 'Alex',
    },
  ];

  const filteredChats = chats.filter((chat) => {
    const matchesSearch =
      chat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      chat.lastMessage.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesFilter =
      filter === 'all' ||
      (filter === 'unread' && chat.unread > 0) ||
      (filter === 'groups' && chat.type === 'group') ||
      (filter === 'communities' && chat.type === 'community');

    return matchesSearch && matchesFilter;
  });

  // Sort: pinned first, then by time
  const sortedChats = [...filteredChats].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return 0;
  });

  const totalUnread = chats.reduce((sum, chat) => sum + chat.unread, 0);

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

      {/* Enhanced Header with Gradient */}
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
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle} numberOfLines={1}>
              Messages
            </Text>
            {totalUnread > 0 && (
              <View style={styles.headerBadge}>
                <Text style={styles.headerBadgeText}>
                  {totalUnread > 99 ? '99+' : totalUnread}
                </Text>
              </View>
            )}
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity
              style={styles.iconButton}
              activeOpacity={0.7}
              onPress={() => setShowSearch(!showSearch)}
            >
              <Ionicons name="search-outline" size={24} color="#FFFFFF" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton} activeOpacity={0.7}>
              <Ionicons name="create-outline" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>

      {/* Search Bar */}
      {showSearch && (
        <View
          style={[
            styles.searchContainer,
            { backgroundColor: colors.surface, borderBottomColor: colors.border },
          ]}
        >
          <View
            style={[
              styles.searchInputContainer,
              { backgroundColor: colors.background },
            ]}
          >
            <Ionicons
              name="search"
              size={20}
              color={colors.textSecondary}
              style={styles.searchIcon}
            />
            <TextInput
              style={[styles.searchInput, { color: colors.text }]}
              placeholder="Search messages..."
              placeholderTextColor={colors.textSecondary}
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoFocus
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity
                onPress={() => setSearchQuery('')}
                style={styles.clearButton}
              >
                <Ionicons
                  name="close-circle"
                  size={20}
                  color={colors.textSecondary}
                />
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}

      {/* Filter Tabs */}
      <View
        style={[
          styles.filterContainer,
          { backgroundColor: colors.surface, borderBottomColor: colors.border },
        ]}
      >
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScroll}
        >
          {(['all', 'unread', 'groups', 'communities'] as FilterType[]).map(
            (f) => (
              <TouchableOpacity
                key={f}
                style={[
                  styles.filterTab,
                  filter === f && [
                    styles.filterTabActive,
                    { backgroundColor: colors.primary },
                  ],
                ]}
                onPress={() => setFilter(f)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.filterText,
                    { color: colors.textSecondary },
                    filter === f && styles.filterTextActive,
                  ]}
                >
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </Text>
              </TouchableOpacity>
            )
          )}
        </ScrollView>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {sortedChats.length > 0 ? (
          sortedChats.map((chat) => (
            <ChatListItem
              key={chat.id}
              chat={chat}
              colors={colors}
              onPress={() =>
                navigation?.navigate?.('Chat', {
                  chatId: chat.id,
                  chatName: chat.name,
                  chatAvatar: chat.avatar,
                  chatType: chat.type,
                  members: chat.members,
                })
              }
            />
          ))
        ) : (
          <View style={styles.emptyState}>
            <Ionicons
              name="chatbubbles-outline"
              size={64}
              color={colors.textTertiary}
            />
            <Text style={[styles.emptyTitle, { color: colors.text }]}>
              {searchQuery ? 'No results found' : 'No messages yet'}
            </Text>
            <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
              {searchQuery
                ? `No conversations match "${searchQuery}"`
                : 'Start a conversation with your connections'}
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

// Chat List Item Component
const ChatListItem: React.FC<{
  chat: Chat;
  colors: any;
  onPress: () => void;
}> = ({ chat, colors, onPress }) => {
  return (
    <TouchableOpacity
      style={[styles.chatItem, { backgroundColor: colors.surface }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {/* Avatar with Online Indicator */}
      <View style={styles.avatarContainer}>
        <Image source={{ uri: chat.avatar }} style={styles.avatar} />
        {chat.type === 'direct' && chat.isOnline && (
          <View style={styles.onlineIndicator} />
        )}
        {chat.type === 'group' && (
          <View style={styles.groupBadge}>
            <Ionicons name="people" size={12} color="#FFFFFF" />
          </View>
        )}
        {chat.type === 'community' && (
          <View style={[styles.groupBadge, { backgroundColor: '#E67E22' }]}>
            <Ionicons name="globe" size={12} color="#FFFFFF" />
          </View>
        )}
      </View>

      {/* Chat Info */}
      <View style={styles.chatInfo}>
        <View style={styles.chatHeader}>
          <View style={styles.chatNameRow}>
            {chat.isPinned && (
              <Ionicons
                name="pin"
                size={14}
                color={colors.primary}
                style={styles.pinIcon}
              />
            )}
            <Text
              style={[
                styles.chatName,
                { color: colors.text },
                chat.unread > 0 && styles.chatNameUnread,
              ]}
              numberOfLines={1}
            >
              {chat.name}
            </Text>
          </View>
          <Text style={[styles.chatTime, { color: colors.textSecondary }]}>
            {chat.time}
          </Text>
        </View>

        <View style={styles.chatFooter}>
          <Text
            style={[
              styles.lastMessage,
              { color: colors.textSecondary },
              chat.unread > 0 && [
                styles.lastMessageUnread,
                { color: colors.text },
              ],
            ]}
            numberOfLines={1}
          >
            {chat.isTyping ? (
              <Text style={{ color: colors.primary, fontStyle: 'italic' }}>
                typing...
              </Text>
            ) : (
              <>
                {chat.lastSender && `${chat.lastSender}: `}
                {chat.lastMessage}
              </>
            )}
          </Text>
          {chat.unread > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadText}>
                {chat.unread > 99 ? '99+' : chat.unread}
              </Text>
            </View>
          )}
        </View>

        {/* Members count for groups/communities */}
        {chat.members && (
          <Text style={[styles.membersText, { color: colors.textTertiary }]}>
            <Ionicons name="people-outline" size={12} /> {chat.members} members
          </Text>
        )}
      </View>
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
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    padding: 4,
    marginRight: 12,
  },
  headerCenter: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  headerBadge: {
    backgroundColor: '#ED4956',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    minWidth: 20,
    alignItems: 'center',
  },
  headerBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    padding: 4,
    marginLeft: 8,
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
  },
  clearButton: {
    padding: 4,
  },
  filterContainer: {
    borderBottomWidth: 1,
  },
  filterScroll: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  filterTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
  },
  filterTabActive: {
    backgroundColor: '#0A66C2',
  },
  filterText: {
    fontSize: 14,
    fontWeight: '600',
  },
  filterTextActive: {
    color: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  chatItem: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: '#E5E7EB',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 12,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#E1E8ED',
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#44B700',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  groupBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#0A66C2',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  chatInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  chatNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  pinIcon: {
    marginRight: 4,
  },
  chatName: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  chatNameUnread: {
    fontWeight: '700',
  },
  chatTime: {
    fontSize: 12,
    marginLeft: 8,
  },
  chatFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  lastMessage: {
    fontSize: 14,
    flex: 1,
    marginRight: 8,
  },
  lastMessageUnread: {
    fontWeight: '600',
  },
  unreadBadge: {
    backgroundColor: '#0095f6',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    minWidth: 24,
    alignItems: 'center',
  },
  unreadText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  membersText: {
    fontSize: 12,
    marginTop: 4,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default MessagesListScreen;

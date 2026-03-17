import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Dimensions,
  StatusBar,
  Platform,
  ActivityIndicator,
  Alert,
  RefreshControl,
  Modal,
  Share,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNetwork } from '../../hooks/useNetwork';
import { useMessages } from '../../context/MessageContext';
import { NetworkStats } from '../../types/network.types';
import { postsApi, Post } from '../../services/posts.api';
import PostCard from '../../components/PostCard';
import * as Clipboard from 'expo-clipboard';
import StoryViewer from '../../components/StoryViewer';
import { storiesApi, UserStories } from '../../services/stories.api';

interface UserProfileScreenProps {
  route?: any;
  navigation?: any;
}

const { width } = Dimensions.get('window');
const imageSize = (width - 6) / 3; // 3 columns with 2px gaps

const UserProfileScreen: React.FC<UserProfileScreenProps> = ({ route, navigation }) => {
  const { userId, user: passedUser } = route?.params ?? {};
  const [activeTab, setActiveTab] = useState<'posts' | 'media' | 'about'>('posts');
  const { getUserStats, followUser, unfollowUser, sendConnectionRequest, blockUser } = useNetwork();
  const { openConversationWithUser } = useMessages();
  const [networkStats, setNetworkStats] = useState<NetworkStats | null>(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [loadingFollow, setLoadingFollow] = useState(false);
  const [loadingConnect, setLoadingConnect] = useState(false);
  const [userPosts, setUserPosts] = useState<Post[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'none' | 'requested' | 'connected'>('none');
  const [refreshing, setRefreshing] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [showStoryViewer, setShowStoryViewer] = useState(false);
  const [userStoriesData, setUserStoriesData] = useState<UserStories[]>([]);

  // Use passed user data or fallback to mock data
  const user = passedUser || {
    id: userId || '',
    name: 'Priya Sharma',
    username: '@priyasharma',
    role: 'Digital Marketing Specialist',
    organization: 'Tech Company',
    bio: 'Digital Marketing Specialist | Content Creator | Travel Enthusiast 🌍',
    location: 'Mumbai, India',
    website: 'priyasharma.com',
    skills: [],
    connectionStatus: 'none' as const,
    followStatus: 'not_following' as const,
    mutualConnections: 0,
    stats: {
      posts: 0,
      followers: 0,
      following: 0,
    },
    media: [
      'https://picsum.photos/400/400?random=1',
      'https://picsum.photos/400/400?random=2',
      'https://picsum.photos/400/400?random=3',
    ],
  };

  // Initialize follow and connection status from user data
  useEffect(() => {
    if (user.followStatus) {
      setIsFollowing(user.followStatus === 'following' || user.followStatus === 'mutual');
    }
    if (user.connectionStatus) {
      setConnectionStatus(user.connectionStatus);
    }
  }, [user.followStatus, user.connectionStatus]);

  // Load user stats
  useEffect(() => {
    let isMounted = true;
    const loadStats = async () => {
      if (!user.id) return;
      const stats = await getUserStats(user.id);
      if (isMounted && stats) {
        setNetworkStats(stats);
      }
    };
    loadStats();
    return () => {
      isMounted = false;
    };
  }, [getUserStats, user.id]);

  // Load user posts
  useEffect(() => {
    const loadPosts = async () => {
      if (!user.id) return;
      try {
        setLoadingPosts(true);
        // For now, load from general feed - in production, filter by userId
        const posts = await postsApi.getFeed(20, 0);
        // Filter posts by this user (if author data is available)
        const filteredPosts = posts.filter(post => post.authorId === user.id);
        setUserPosts(filteredPosts);
      } catch (error) {
        console.error('Failed to load user posts:', error);
      } finally {
        setLoadingPosts(false);
      }
    };
    if (activeTab === 'posts') {
      loadPosts();
    }
  }, [user.id, activeTab]);

  // Pull-to-refresh handler
  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        loadUserStats(),
        loadUserPosts(),
      ]);
    } finally {
      setRefreshing(false);
    }
  };

  const loadUserStats = async () => {
    if (!user.id) return;
    const stats = await getUserStats(user.id);
    if (stats) setNetworkStats(stats);
  };

  const loadUserPosts = async () => {
    if (!user.id) return;
    try {
      const posts = await postsApi.getFeed(20, 0);
      const filteredPosts = posts.filter(post => post.authorId === user.id);
      setUserPosts(filteredPosts);
    } catch (error) {
      console.error('Failed to load user posts:', error);
    }
  };

  // Optimistic UI update for Follow/Unfollow
  const handleFollowToggle = async () => {
    if (!user.id) return;
    
    // Optimistic update
    const previousState = isFollowing;
    const previousStats = networkStats;
    setIsFollowing(!isFollowing);
    
    // Update stats optimistically
    if (networkStats) {
      setNetworkStats({
        ...networkStats,
        followersCount: isFollowing ? networkStats.followersCount - 1 : networkStats.followersCount + 1,
      });
    }
    
    try {
      setLoadingFollow(true);
      if (previousState) {
        await unfollowUser(user.id);
      } else {
        await followUser(user.id);
      }
      // Reload actual stats
      const stats = await getUserStats(user.id);
      if (stats) setNetworkStats(stats);
    } catch (error) {
      // Revert on error
      setIsFollowing(previousState);
      if (previousStats) setNetworkStats(previousStats);
      Alert.alert('Error', 'Failed to update follow status');
    } finally {
      setLoadingFollow(false);
    }
  };

  // Optimistic UI update for Connect
  const handleConnect = async () => {
    if (!user.id) return;
    
    // Optimistic update
    const previousStatus = connectionStatus;
    setConnectionStatus('requested');
    
    try {
      setLoadingConnect(true);
      await sendConnectionRequest(user.id);
      Alert.alert('Success', 'Connection request sent!');
    } catch (error) {
      // Revert on error
      setConnectionStatus(previousStatus);
      Alert.alert('Error', 'Failed to send connection request');
    } finally {
      setLoadingConnect(false);
    }
  };

  const handleBlockUser = async () => {
    if (!user.id) return;
    Alert.alert(
      'Block User',
      `Are you sure you want to block ${user.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Block',
          style: 'destructive',
          onPress: async () => {
            try {
              await blockUser(user.id);
              Alert.alert('Success', 'User blocked successfully');
              setShowMenu(false);
              navigation?.goBack();
            } catch (error) {
              Alert.alert('Error', 'Failed to block user');
            }
          },
        },
      ]
    );
  };

  const handleShareProfile = async () => {
    try {
      await Share.share({
        message: `Check out ${user.name}'s profile on Linsta!`,
        title: `${user.name} - Linsta Profile`,
      });
      setShowMenu(false);
    } catch (error) {
      console.error('Share error:', error);
    }
  };

  const handleCopyLink = async () => {
    await Clipboard.setStringAsync(`linsta://profile/${user.id}`);
    Alert.alert('Success', 'Profile link copied to clipboard');
    setShowMenu(false);
  };

  const handleAvatarPress = async () => {
    if (!user.id) return;
    try {
      // Fetch all stories
      const allStories = await storiesApi.getStories();
      
      // Find this user's stories
      const userStories = allStories.find(s => s.user.id === user.id);
      
      if (userStories && userStories.stories.length > 0) {
        // Show story viewer with this user's stories
        setUserStoriesData([userStories]);
        setShowStoryViewer(true);
      } else {
        Alert.alert('No Stories', 'This user has no active stories');
      }
    } catch (error) {
      console.error('Failed to load user stories:', error);
      Alert.alert('Error', 'Failed to load stories');
    }
  };

  const handleMessage = async () => {
    if (!user.id || !user.name) return;
    try {
      const conversationId = await openConversationWithUser(user.id, user.name);
      if (navigation) {
        navigation.navigate('Chat', { conversationId });
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to open chat');
    }
  };

  const handlePostDeleted = (postId: string) => {
    setUserPosts(prev => prev.filter(p => p._id !== postId));
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'posts':
        if (loadingPosts) {
          return (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#0A66C2" />
            </View>
          );
        }
        return (
          <View style={styles.postsContainer}>
            {userPosts.length > 0 ? (
              userPosts.map(post => (
                <View key={post._id} style={{ marginBottom: 16 }}>
                  <PostCard post={post} onPostDeleted={() => handlePostDeleted(post._id)} />
                </View>
              ))
            ) : (
              <View style={styles.tabContent}>
                <Ionicons name="document-text-outline" size={64} color="#d1d5db" />
                <Text style={styles.emptyText}>No posts yet</Text>
              </View>
            )}
          </View>
        );
      
      case 'media':
        return (
          <View style={styles.mediaGrid}>
            {user.media && user.media.length > 0 ? (
              user.media.map((uri: string, index: number) => (
                <Image
                  key={index}
                  source={{ uri }}
                  style={styles.mediaItem}
                />
              ))
            ) : (
              <View style={styles.tabContent}>
                <Ionicons name="images-outline" size={64} color="#d1d5db" />
                <Text style={styles.emptyText}>No media yet</Text>
              </View>
            )}
          </View>
        );
      
      case 'about':
        return (
          <View style={styles.aboutContent}>
            {user.location && (
              <View style={styles.aboutItem}>
                <Ionicons name="location-outline" size={20} color="#666" />
                <Text style={styles.aboutText}>{user.location}</Text>
              </View>
            )}
            {user.website && (
              <View style={styles.aboutItem}>
                <Ionicons name="link-outline" size={20} color="#666" />
                <Text style={styles.aboutText}>{user.website}</Text>
              </View>
            )}
            <View style={styles.aboutItem}>
              <Ionicons name="calendar-outline" size={20} color="#666" />
              <Text style={styles.aboutText}>Joined January 2023</Text>
            </View>
          </View>
        );
      
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="light-content" backgroundColor="#0A66C2" />
      
      {/* Header with Gradient */}
      <LinearGradient
        colors={['#0A66C2', '#378FE9']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.headerGradient}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation?.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{user.name}</Text>
          <TouchableOpacity style={styles.moreButton} onPress={() => setShowMenu(true)}>
            <Ionicons name="ellipsis-vertical" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={["#0A66C2"]}
            tintColor="#0A66C2"
          />
        }
      >
        {/* Profile Info */}
        <View style={styles.profileSection}>
          <TouchableOpacity 
            style={styles.avatarContainer} 
            onPress={handleAvatarPress}
            activeOpacity={0.7}
          >
            <View style={styles.avatarWrapper}>
              <LinearGradient
                colors={['#0A66C2', '#378FE9', '#5B93D6']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.avatarGradient}
              >
                <View style={styles.avatarInner}>
                  {user.avatarUrl && !imageError ? (
                    <Image
                      source={{ uri: user.avatarUrl }}
                      style={styles.profileImage}
                      onError={() => setImageError(true)}
                    />
                  ) : (
                    <Ionicons name="person-circle" size={96} color="#0A66C2" />
                  )}
                </View>
              </LinearGradient>
            </View>
          </TouchableOpacity>

          <Text style={styles.name}>{user.name}</Text>
          <Text style={styles.username}>{user.username || `@${user.name.toLowerCase().replace(/\s+/g, '')}`}</Text>
          {user.role && <Text style={styles.userRole}>{user.role}</Text>}
          {user.organization && <Text style={styles.userOrg}>{user.organization}</Text>}
          <Text style={styles.bio}>{user.bio}</Text>

          {/* Skills Section */}
          {user.skills && user.skills.length > 0 && (
            <View style={styles.skillsSection}>
              <View style={styles.skillsContainer}>
                {user.skills.slice(0, 5).map((skill: string, index: number) => (
                  <View key={index} style={styles.skillTag}>
                    <Text style={styles.skillText}>{skill}</Text>
                  </View>
                ))}
                {user.skills.length > 5 && (
                  <View style={styles.moreSkillsTag}>
                    <Text style={styles.moreSkillsText}>+{user.skills.length - 5} more</Text>
                  </View>
                )}
              </View>
            </View>
          )}

          {/* Stats */}
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{user.stats?.posts || 0}</Text>
              <Text style={styles.statLabel}>Posts</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {(networkStats?.followersCount ?? user.stats?.followers ?? 0).toLocaleString()}
              </Text>
              <Text style={styles.statLabel}>Followers</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {(networkStats?.followingCount ?? user.stats?.following ?? 0).toLocaleString()}
              </Text>
              <Text style={styles.statLabel}>Following</Text>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            {/* Connection/Follow Button */}
            {connectionStatus === 'connected' ? (
              <TouchableOpacity
                style={styles.followButton}
                onPress={handleFollowToggle}
                disabled={loadingFollow || !user.id}
              >
                {loadingFollow ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.followButtonText}>
                    {isFollowing ? 'Following' : 'Follow'}
                  </Text>
                )}
              </TouchableOpacity>
            ) : connectionStatus === 'requested' ? (
              <View style={styles.pendingButton}>
                <Text style={styles.pendingButtonText}>Pending</Text>
              </View>
            ) : (
              <TouchableOpacity
                style={styles.connectButton}
                onPress={handleConnect}
                disabled={loadingConnect || !user.id}
              >
                {loadingConnect ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.connectButtonText}>Connect</Text>
                )}
              </TouchableOpacity>
            )}
            
            {/* Message Button */}
            <TouchableOpacity 
              style={styles.messageButton}
              onPress={handleMessage}
            >
              <Ionicons name="chatbubble-outline" size={18} color="#262626" />
              <Text style={styles.messageButtonText}>Message</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Tabs */}
        <View style={styles.tabsContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'posts' && styles.activeTab]}
            onPress={() => setActiveTab('posts')}
          >
            <Ionicons 
              name="grid-outline" 
              size={24} 
              color={activeTab === 'posts' ? '#0A66C2' : '#8e8e8e'} 
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'media' && styles.activeTab]}
            onPress={() => setActiveTab('media')}
          >
            <Ionicons 
              name="images-outline" 
              size={24} 
              color={activeTab === 'media' ? '#0A66C2' : '#8e8e8e'} 
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'about' && styles.activeTab]}
            onPress={() => setActiveTab('about')}
          >
            <Ionicons 
              name="information-circle-outline" 
              size={24} 
              color={activeTab === 'about' ? '#0A66C2' : '#8e8e8e'} 
            />
          </TouchableOpacity>
        </View>

        {/* Tab Content */}
        {renderTabContent()}
      </ScrollView>

      {/* Profile Menu Modal */}
      <Modal
        visible={showMenu}
        transparent
        animationType="fade"
        onRequestClose={() => setShowMenu(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowMenu(false)}
        >
          <View style={styles.menuContainer}>
            <TouchableOpacity style={styles.menuItem} onPress={handleShareProfile}>
              <Ionicons name="share-outline" size={22} color="#262626" />
              <Text style={styles.menuItemText}>Share Profile</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.menuItem} onPress={handleCopyLink}>
              <Ionicons name="link-outline" size={22} color="#262626" />
              <Text style={styles.menuItemText}>Copy Profile Link</Text>
            </TouchableOpacity>
            
            <View style={styles.menuDivider} />
            
            <TouchableOpacity style={styles.menuItem} onPress={handleBlockUser}>
              <Ionicons name="ban-outline" size={22} color="#EF4444" />
              <Text style={[styles.menuItemText, { color: '#EF4444' }]}>Block User</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Story Viewer */}
      <StoryViewer
        visible={showStoryViewer}
        stories={userStoriesData}
        initialIndex={0}
        onClose={() => setShowStoryViewer(false)}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F6F8',
  },
  headerGradient: {
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  backButton: {
    padding: 6,
    width: 36,
  },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    letterSpacing: 0.3,
  },
  moreButton: {
    padding: 6,
    width: 36,
  },
  profileSection: {
    alignItems: 'center',
    paddingVertical: 30,
    paddingHorizontal: 20,
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    marginBottom: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  avatarContainer: {
    marginBottom: 20,
  },
  avatarWrapper: {
    width: 110,
    height: 110,
  },
  avatarGradient: {
    width: 110,
    height: 110,
    borderRadius: 55,
    padding: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInner: {
    width: 102,
    height: 102,
    borderRadius: 51,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  name: {
    fontSize: 24,
    fontWeight: '700',
    color: '#262626',
    marginBottom: 4,
  },
  username: {
    fontSize: 14,
    color: '#8e8e8e',
    marginBottom: 4,
  },
  userRole: {
    fontSize: 14,
    color: '#262626',
    fontWeight: '500',
    marginBottom: 2,
  },
  userOrg: {
    fontSize: 13,
    color: '#8e8e8e',
    marginBottom: 12,
  },
  bio: {
    fontSize: 15,
    color: '#262626',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#262626',
  },
  statLabel: {
    fontSize: 13,
    color: '#8e8e8e',
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: '#efefef',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  followButton: {
    flex: 1,
    backgroundColor: '#0A66C2',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  followButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  connectButton: {
    flex: 1,
    backgroundColor: '#0A66C2',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  connectButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  pendingButton: {
    flex: 1,
    backgroundColor: '#E5E7EB',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pendingButtonText: {
    color: '#6B7280',
    fontSize: 15,
    fontWeight: '600',
  },
  messageButton: {
    flex: 1,
    backgroundColor: '#fff',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
    borderWidth: 1,
    borderColor: '#dbdbdb',
  },
  messageButtonText: {
    color: '#262626',
    fontSize: 15,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  postsContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  profileImage: {
    width: 96,
    height: 96,
    borderRadius: 48,
  },
  skillsSection: {
    marginBottom: 16,
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'center',
  },
  skillTag: {
    backgroundColor: '#E8F4FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#0A66C2',
  },
  skillText: {
    color: '#0A66C2',
    fontSize: 13,
    fontWeight: '500',
  },
  moreSkillsTag: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  moreSkillsText: {
    color: '#6B7280',
    fontSize: 13,
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  menuContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 8,
    paddingBottom: Platform.OS === 'ios' ? 34 : 16,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    gap: 12,
  },
  menuItemText: {
    fontSize: 16,
    color: '#262626',
    fontWeight: '500',
  },
  menuDivider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 4,
  },
  tabsContainer: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#efefef',
    backgroundColor: '#FFFFFF',
    marginTop: 16,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#0A66C2',
  },
  tabContent: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 15,
    color: '#8e8e8e',
  },
  mediaGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 2,
  },
  mediaItem: {
    width: imageSize,
    height: imageSize,
    backgroundColor: '#f0f0f0',
  },
  aboutContent: {
    padding: 20,
  },
  aboutItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  aboutText: {
    fontSize: 15,
    color: '#262626',
    marginLeft: 12,
  },
});

export default UserProfileScreen;

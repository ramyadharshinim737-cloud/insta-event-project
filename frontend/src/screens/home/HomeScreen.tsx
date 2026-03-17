import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  StatusBar,
  TouchableOpacity,
  ViewToken,
  Platform,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import StoryCarousel from '../../components/StoryCarousel';
import PostCard from '../../components/PostCard';
import VideoReel from '../../components/VideoReel';
import BottomNavigation from '../../components/BottomNavigation';
import StoryViewer from '../../components/StoryViewer';
import CreateContentModal from '../../components/CreateContentModal';
import { mockStories, mockPosts } from '../../utils/mockData';
import { postsApi, Post } from '../../services/posts.api';
import { storiesApi, UserStories } from '../../services/stories.api';
import { profileApi } from '../../services/profile.api';
import { useAuth } from '../../context/AuthContext';

interface HomeScreenProps {
  navigation?: any;
}

const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const { user, logout } = useAuth();
  const [activeReelId, setActiveReelId] = useState<string | null>(null);
  const [showStoryViewer, setShowStoryViewer] = useState(false);
  const [selectedStoryIndex, setSelectedStoryIndex] = useState(0);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [posts, setPosts] = useState<Post[]>([]);
  const [stories, setStories] = useState<UserStories[]>([]);
  const [userProfileImage, setUserProfileImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingStories, setLoadingStories] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch posts and stories on mount
  useEffect(() => {
    const initializeFeed = async () => {
      await fetchPosts();
      await fetchStories();
      await fetchUserProfile();
    };
    initializeFeed();
  }, []);

  const fetchUserProfile = async () => {
    try {
      if (user?.id) {
        const profileData = await profileApi.getProfile(user.id);
        setUserProfileImage(profileData.profile?.profileImageUrl || null);
      }
    } catch (error: any) {
      console.error('❌ Failed to fetch user profile:', error);
      // If session expired, logout user
      if (error.message?.includes('Session expired')) {
        await logout();
      }
    }
  };

  const fetchPosts = async () => {
    try {
      console.log('📱 Fetching posts...');
      const fetchedPosts = await postsApi.getFeed(20, 0);
      setPosts(fetchedPosts);
      console.log('✅ Posts loaded:', fetchedPosts.length);
    } catch (error: any) {
      console.error('❌ Failed to fetch posts:', error);
      // If session expired, logout user
      if (error.message?.includes('Session expired')) {
        Alert.alert(
          'Session Expired',
          'Your session has expired. Please log in again.',
          [{ text: 'OK', onPress: () => logout() }]
        );
      }
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchStories = async () => {
    try {
      console.log('📱 Fetching stories...');
      const fetchedStories = await storiesApi.getStories();
      setStories(fetchedStories);
      console.log('✅ Stories loaded:', fetchedStories.length);
    } catch (error: any) {
      console.error('❌ Failed to fetch stories:', error);
      // If session expired, logout user
      if (error.message?.includes('Session expired')) {
        await logout();
      }
      setStories([]);
    } finally {
      setLoadingStories(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchPosts(), fetchStories(), fetchUserProfile()]);
    setRefreshing(false);
  };

  const handleStoryPress = (index: number) => {
    setSelectedStoryIndex(index);
    setShowStoryViewer(true);
  };

  const handleYourStoryPress = () => {
    // Set index to -1 to indicate user's own story
    setSelectedStoryIndex(-1);
    setShowStoryViewer(true);
  };

  const handleCreatePress = () => {
    setShowCreateModal(true);
  };

  const handleCreateStory = () => {
    setShowCreateModal(false);
    navigation?.navigate?.('CreatePost', { mode: 'story' });
  };

  const handleCreatePost = () => {
    setShowCreateModal(false);
    navigation?.navigate?.('CreatePost', { mode: 'post' });
  };

  const handleCreateEvent = () => {
    setShowCreateModal(false);
    navigation?.navigate?.('CreateEvent');
  };

  const handleCreateReel = () => {
    setShowCreateModal(false);
    Alert.alert('Record Reel', 'Reel recording coming soon!');
  };

  const renderFeedItem = ({ item }: { item: any }) => {
    if (item.isReel) {
      return <VideoReel post={item} isActive={activeReelId === item.id} />;
    }
    return (
      <PostCard 
        post={item} 
        onLikeUpdated={fetchPosts}
        onPostDeleted={fetchPosts}
      />
    );
  };

  // Track which items are currently viewable
  const onViewableItemsChanged = useCallback(({ viewableItems }: { viewableItems: ViewToken[] }) => {
    // Find the first viewable reel
    const visibleReel = viewableItems.find(
      (item) => item.item.isReel && item.isViewable
    );

    if (visibleReel) {
      setActiveReelId(visibleReel.item.id);
    } else {
      setActiveReelId(null);
    }
  }, []);

  const viewabilityConfig = {
    itemVisiblePercentThreshold: 50, // Item must be 50% visible to be considered viewable
  };

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right', 'bottom']}>
      <StatusBar barStyle="light-content" backgroundColor="#0A66C2" translucent={false} />

      {/* Enhanced Header with Gradient */}
      <LinearGradient
        colors={['#0A66C2', '#378FE9']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.headerGradient}
      >
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Ionicons name="logo-linkedin" size={32} color="#FFFFFF" />
            <Text style={styles.appName} numberOfLines={1} ellipsizeMode="clip">
              Linsta
            </Text>
          </View>
          <View style={styles.headerIcons}>
            <TouchableOpacity
              style={styles.iconButton}
              onPress={() => navigation?.navigate?.('Notifications')}
              activeOpacity={0.7}
            >
              <Ionicons name="notifications-outline" size={28} color="#FFFFFF" />
              <View style={styles.badge}>
                <Text style={styles.badgeText} numberOfLines={1}>5</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.iconButton}
              onPress={() => navigation?.navigate?.('Messages')}
              activeOpacity={0.7}
            >
              <Ionicons name="chatbubble-ellipses-outline" size={28} color="#FFFFFF" />
              <View style={styles.badge}>
                <Text style={styles.badgeText} numberOfLines={1}>3</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>

      {/* Stories */}
      {loadingStories ? (
        <View style={styles.storiesLoadingContainer}>
          <ActivityIndicator size="small" color="#0A66C2" />
        </View>
      ) : (
        <StoryCarousel 
          stories={stories.filter(s => !s.isOwn)} 
          userStories={stories.find(s => s.isOwn)?.stories || []}
          onStoryPress={handleStoryPress}
          onYourStoryPress={handleYourStoryPress}
          onAddStory={() => navigation?.navigate?.('CreatePost', { mode: 'story' })}
          currentUserName={user?.name}
          currentUserProfileImage={userProfileImage}
        />
      )}

      {/* Loading indicator */}
      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0A66C2" />
          <Text style={styles.loadingText}>Loading posts...</Text>
        </View>
      )}

      {/* Feed with FlatList for smooth scrolling */}
      {!loading && (
        <FlatList
          data={posts.length > 0 ? posts : mockPosts}
          renderItem={renderFeedItem}
          keyExtractor={(item) => item._id || item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.feedContent}
          removeClippedSubviews={true}
          maxToRenderPerBatch={5}
          updateCellsBatchingPeriod={50}
          initialNumToRender={3}
          windowSize={5}
          onViewableItemsChanged={onViewableItemsChanged}
          viewabilityConfig={viewabilityConfig}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#0A66C2']}
              tintColor="#0A66C2"
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="newspaper-outline" size={48} color="#999" />
              <Text style={styles.emptyText}>No posts yet</Text>
              <Text style={styles.emptySubtext}>Pull down to refresh</Text>
            </View>
          }
        />
      )}

      {/* Bottom Navigation */}
      <BottomNavigation 
        activeTab="Home" 
        navigation={navigation}
        onCreatePress={handleCreatePress}
      />

      {/* Story Viewer */}
      <StoryViewer
        visible={showStoryViewer}
        stories={selectedStoryIndex === -1 
          ? [{ 
              user: { 
                id: user?.id || '', 
                name: user?.name || '', 
                email: user?.email || '', 
                avatar: 'person-circle',
                profileImageUrl: userProfileImage 
              }, 
              stories: stories.find(s => s.isOwn)?.stories || [], 
              isOwn: true 
            }]
          : stories.filter(s => !s.isOwn)
        }
        initialIndex={selectedStoryIndex === -1 ? 0 : selectedStoryIndex}
        onClose={() => setShowStoryViewer(false)}
      />

      {/* Create Content Modal */}
      <CreateContentModal
        visible={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreateStory={handleCreateStory}
        onCreatePost={handleCreatePost}
        onCreateEvent={handleCreateEvent}
        onCreateReel={handleCreateReel}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  appName: {
    fontSize: 26,
    fontWeight: '700',
    color: '#FFFFFF',
    marginLeft: 10,
    letterSpacing: 0.5,
  },
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
  },
  iconButton: {
    position: 'relative',
    padding: 4,
  },
  badge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: '#FF3250',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 5,
    borderWidth: 2,
    borderColor: '#378FE9',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.3,
        shadowRadius: 2,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  feedContent: {
    paddingTop: 8, // Small gap between stories and feed
    paddingBottom: 90, // Increased to account for fixed bottom navigation
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  storiesLoadingContainer: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 30,
    borderBottomWidth: 1,
    borderBottomColor: '#EFEFEF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
  },
});

export default HomeScreen;


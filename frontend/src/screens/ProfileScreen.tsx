import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Dimensions,
  ActivityIndicator,
  RefreshControl,
  Alert,
  FlatList,
  Animated,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';
import { profileApi, UserProfileResponse } from '../services/profile.api';
import { postsApi, Post } from '../services/posts.api';
import { useAuth } from '../context/AuthContext';
import { useNetwork } from '../hooks/useNetwork';
import { NetworkStats } from '../types/network.types';
import BottomNavigation from '../components/BottomNavigation';

const { width } = Dimensions.get('window');
const COVER_HEIGHT = 150;
const PROFILE_SIZE = 110;

const ProfileScreen = ({ navigation }: any) => {
  const { user: authUser, logout } = useAuth();
  const [profileData, setProfileData] = useState<UserProfileResponse | null>(null);
  const [networkStats, setNetworkStats] = useState<NetworkStats | null>(null);
  const [userPosts, setUserPosts] = useState<Post[]>([]);
  const [likedPosts, setLikedPosts] = useState<Post[]>([]);
  const [userComments, setUserComments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [postsLoading, setPostsLoading] = useState(false);
  const [activityLoading, setActivityLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'posts' | 'about' | 'activity'>('posts');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());
  const { getUserStats } = useNetwork();

  // Animated values for smooth transitions
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const tabIndicatorAnim = useRef(new Animated.Value(0)).current;

  const userId = authUser?.id || '';

  // Animate content fade-in on mount
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, []);

  // Animate tab indicator when tab changes
  useEffect(() => {
    const tabPositions = { posts: 0, about: 1, activity: 2 };
    Animated.spring(tabIndicatorAnim, {
      toValue: tabPositions[activeTab],
      useNativeDriver: true,
      friction: 8,
      tension: 40,
    }).start();

    // Load activity data when Activity tab is selected
    if (activeTab === 'activity' && userId) {
      loadActivity();
    }
  }, [activeTab]);

  // Safe navigation wrapper
  const safeNavigate = (screen: string, params?: any) => {
    try {
      (navigation as any).navigate(screen, params);
    } catch (error) {
      console.error('Navigation error:', error);
    }
  };

  useEffect(() => {
    loadProfile();
    loadPosts();
    loadStats();
  }, [userId]);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const data = await profileApi.getProfile();
      setProfileData(data);
    } catch (error: any) {
      console.error('Failed to load profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadPosts = async () => {
    try {
      setPostsLoading(true);
      if (userId) {
        const posts = await postsApi.getUserPosts(userId, 20, 0);
        setUserPosts(posts);
      }
    } catch (error: any) {
      console.error('Failed to load posts:', error);
    } finally {
      setPostsLoading(false);
    }
  };

  const loadStats = async () => {
    if (!userId) return;
    const stats = await getUserStats(userId);
    if (stats) {
      setNetworkStats(stats);
    }
  };

  const loadActivity = async () => {
    if (!userId) return;
    setActivityLoading(true);
    try {
      const [liked, comments] = await Promise.all([
        postsApi.getUserLikedPosts(userId, 20, 0),
        postsApi.getUserComments(userId, 20, 0),
      ]);
      setLikedPosts(liked);
      setUserComments(comments);
    } catch (error: any) {
      console.error('Failed to load activity:', error);
    } finally {
      setActivityLoading(false);
    }
  };

  const onRefresh = async () => {
    // Haptic feedback on pull
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setRefreshing(true);
    await Promise.all([loadProfile(), loadPosts(), loadStats()]);
    setRefreshing(false);
  };

  const handleUploadCoverImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please grant photo library access');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      try {
        await profileApi.uploadCoverImage(result.assets[0].uri);
        await loadProfile();
        Alert.alert('Success', 'Cover image updated');
      } catch (error) {
        Alert.alert('Error', 'Failed to upload cover image');
      }
    }
  };

  const handleUploadProfileImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please grant photo library access');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      try {
        await profileApi.uploadProfileImage(result.assets[0].uri);
        await loadProfile();
        Alert.alert('Success', 'Profile image updated');
      } catch (error) {
        Alert.alert('Error', 'Failed to upload profile image');
      }
    }
  };

  const renderHeader = () => (
    <View style={styles.header}>
      {/* Cover Photo with Gradient Overlay */}
      <TouchableOpacity onPress={handleUploadCoverImage} activeOpacity={0.9}>
        <View>
          {profileData?.profile?.coverImageUrl ? (
            <>
              <Image
                source={{ uri: profileData.profile.coverImageUrl }}
                style={styles.coverImage}
              />
              {/* Gradient Overlay for Better Text Contrast */}
              <LinearGradient
                colors={['rgba(0,0,0,0.3)', 'transparent', 'rgba(0,0,0,0.5)']}
                style={styles.coverGradient}
                pointerEvents="none"
              />
            </>
          ) : (
            <LinearGradient
              colors={['#667eea', '#764ba2']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.coverImage}
            >
              <Ionicons name="camera" size={32} color="rgba(255,255,255,0.7)" />
            </LinearGradient>
          )}
        </View>
      </TouchableOpacity>

      {/* Profile Section */}
      <View style={styles.profileSection}>
        {/* Profile Picture with Status Ring */}
        <TouchableOpacity 
          onPress={handleUploadProfileImage} 
          style={styles.profileImageContainer}
          activeOpacity={0.8}
          accessible={true}
          accessibilityLabel="Profile picture"
          accessibilityHint="Tap to change your profile picture"
          accessibilityRole="button"
        >
          {/* Online Status Ring */}
          <View 
            style={[styles.statusRing, styles.statusOnline]} 
          />
          
          {profileData?.profile?.profileImageUrl ? (
            <Image
              source={{ uri: profileData.profile.profileImageUrl }}
              style={styles.profileImage}
              accessible={true}
              accessibilityLabel={`${profileData?.user?.name}'s profile picture`}
            />
          ) : (
            <View style={[styles.profileImage, styles.profileImagePlaceholder]}>
              <Text style={styles.profileInitial}>
                {profileData?.user?.name?.[0]?.toUpperCase() || 'U'}
              </Text>
            </View>
          )}
          
          {/* Open to Work Badge */}
          {profileData?.profile?.openToWork && (
            <View style={styles.openToWorkBadge}>
              <MaterialIcons name="work" size={14} color="#10A37F" />
            </View>
          )}
        </TouchableOpacity>

        {/* Settings Button */}
        <TouchableOpacity 
          style={styles.editButton}
          onPress={() => navigation.navigate('EditProfile', { profileData })}
        >
          <Ionicons name="pencil" size={18} color="#0A66C2" />
        </TouchableOpacity>
      </View>

      {/* Name & Headline */}
      <View style={styles.nameSection}>
        <Text style={styles.name}>{profileData?.user?.name || 'User'}</Text>
        
        {/* Role Badge */}
        {profileData?.profile?.headline && (
          <View style={styles.roleBadge}>
            <Text style={styles.roleBadgeText}>{profileData.profile.headline}</Text>
          </View>
        )}
        
        {/* Clickable Location */}
        {profileData?.profile?.location && (
          <TouchableOpacity style={styles.locationRow} activeOpacity={0.7}>
            <Ionicons name="location" size={14} color="#0A66C2" />
            <Text style={styles.locationText}>{profileData.profile.location}</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Stats */}
      <View style={styles.statsContainer}>
        <TouchableOpacity 
          style={styles.statItem}
          accessible={true}
          accessibilityLabel={`${userPosts.length} posts`}
          accessibilityRole="button"
        >
          <Text style={styles.statValue}>{userPosts.length}</Text>
          <Text style={styles.statLabel}>Posts</Text>
        </TouchableOpacity>
        <View style={styles.statDivider} />
        <TouchableOpacity 
          style={styles.statItem}
          onPress={() => {
            if (Platform.OS !== 'web') {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }
            navigation.navigate('Connections', { initialTab: 'followers' });
          }}
          accessible={true}
          accessibilityLabel={`${networkStats?.followersCount || 0} followers. Tap to view`}
          accessibilityRole="button"
          accessibilityHint="Opens your followers list"
        >
          <Text style={styles.statValue}>
            {networkStats?.followersCount?.toLocaleString() || 0}
          </Text>
          <Text style={styles.statLabel}>Followers</Text>
        </TouchableOpacity>
        <View style={styles.statDivider} />
        <TouchableOpacity 
          style={styles.statItem}
          onPress={() => {
            if (Platform.OS !== 'web') {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }
            navigation.navigate('Connections', { initialTab: 'following' });
          }}
          accessible={true}
          accessibilityLabel={`${networkStats?.followingCount || 0} following. Tap to view`}
          accessibilityRole="button"
          accessibilityHint="Opens your following list"
        >
          <Text style={styles.statValue}>
            {networkStats?.followingCount?.toLocaleString() || 0}
          </Text>
          <Text style={styles.statLabel}>Following</Text>
        </TouchableOpacity>
        <View style={styles.statDivider} />
        <TouchableOpacity 
          style={styles.statItem}
          onPress={() => {
            if (Platform.OS !== 'web') {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }
            navigation.navigate('Connections', { initialTab: 'connections' });
          }}
          accessible={true}
          accessibilityLabel={`${networkStats?.connectionsCount || 0} connections. Tap to view`}
          accessibilityRole="button"
          accessibilityHint="Opens your connections list"
        >
          <Text style={styles.statValue}>
            {networkStats?.connectionsCount?.toLocaleString() || 0}
          </Text>
          <Text style={styles.statLabel}>Connections</Text>
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={styles.tabsWrapper}>
        <View style={styles.tabs}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'posts' && styles.activeTab]}
            onPress={() => {
              if (Platform.OS !== 'web') {
                Haptics.selectionAsync();
              }
              setActiveTab('posts');
            }}
            accessible={true}
            accessibilityLabel="Posts tab"
            accessibilityRole="tab"
            accessibilityState={{ selected: activeTab === 'posts' }}
          >
          <Ionicons 
            name="grid" 
            size={20} 
            color={activeTab === 'posts' ? '#0A66C2' : '#666'} 
          />
          <Text style={[styles.tabText, activeTab === 'posts' && styles.activeTabText]}>
            Posts
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, activeTab === 'about' && styles.activeTab]}
          onPress={() => {
            if (Platform.OS !== 'web') {
              Haptics.selectionAsync();
            }
            setActiveTab('about');
          }}
          accessible={true}
          accessibilityLabel="About tab"
          accessibilityRole="tab"
          accessibilityState={{ selected: activeTab === 'about' }}
        >
          <Ionicons 
            name="information-circle" 
            size={20} 
            color={activeTab === 'about' ? '#0A66C2' : '#666'} 
          />
          <Text style={[styles.tabText, activeTab === 'about' && styles.activeTabText]}>
            About
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, activeTab === 'activity' && styles.activeTab]}
          onPress={() => {
            if (Platform.OS !== 'web') {
              Haptics.selectionAsync();
            }
            setActiveTab('activity');
          }}
          accessible={true}
          accessibilityLabel="Activity tab"
          accessibilityRole="tab"
          accessibilityState={{ selected: activeTab === 'activity' }}
        >
          <Ionicons 
            name="pulse" 
            size={20} 
            color={activeTab === 'activity' ? '#0A66C2' : '#666'} 
          />
          <Text style={[styles.tabText, activeTab === 'activity' && styles.activeTabText]}>
            Activity
          </Text>
        </TouchableOpacity>
      </View>
      
      {/* Animated Tab Indicator */}
      <Animated.View
        style={[
          styles.tabIndicator,
          {
            transform: [
              {
                translateX: tabIndicatorAnim.interpolate({
                  inputRange: [0, 1, 2],
                  outputRange: [0, width / 3, (width * 2) / 3],
                }),
              },
            ],
          },
        ]}
      />
    </View>
    </View>
  );

  const renderPostsGrid = () => {
    if (postsLoading) {
      return (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#0A66C2" />
        </View>
      );
    }

    if (userPosts.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconContainer}>
            <Ionicons name="images-outline" size={64} color="#0A66C2" />
          </View>
          <Text style={styles.emptyText}>No posts yet</Text>
          <Text style={styles.emptySubtext}>Share your professional journey</Text>
          <TouchableOpacity style={styles.emptyButton} onPress={() => safeNavigate('CreatePost')}>
            <Ionicons name="add-circle" size={20} color="#fff" />
            <Text style={styles.emptyButtonText}>Create Post</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View style={styles.postsContainer}>
        {/* View Toggle */}
        <View style={styles.viewToggleContainer}>
          <TouchableOpacity
            style={[styles.viewToggleButton, viewMode === 'grid' && styles.viewToggleActive]}
            onPress={() => {
              if (Platform.OS !== 'web') {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }
              setViewMode('grid');
            }}
            accessible={true}
            accessibilityLabel="Grid view"
            accessibilityRole="button"
            accessibilityState={{ selected: viewMode === 'grid' }}
          >
            <Ionicons name="grid" size={20} color={viewMode === 'grid' ? '#0A66C2' : '#666'} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.viewToggleButton, viewMode === 'list' && styles.viewToggleActive]}
            onPress={() => {
              if (Platform.OS !== 'web') {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }
              setViewMode('list');
            }}
            accessible={true}
            accessibilityLabel="List view"
            accessibilityRole="button"
            accessibilityState={{ selected: viewMode === 'list' }}
          >
            <Ionicons name="list" size={20} color={viewMode === 'list' ? '#0A66C2' : '#666'} />
          </TouchableOpacity>
        </View>

        {viewMode === 'grid' ? renderGridView() : renderListView()}
      </View>
    );
  };

  const renderGridView = () => {
    // Group posts into rows of 3
    const rows = [];
    for (let i = 0; i < userPosts.length; i += 3) {
      rows.push(userPosts.slice(i, i + 3));
    }

    return (
      <View style={styles.postsGrid}>
        {rows.map((row, rowIndex) => (
          <View key={rowIndex} style={styles.postRow}>
            {row.map((post) => (
              <TouchableOpacity
                key={post._id}
                style={styles.postItem}
                onPress={() => safeNavigate('PostDetail', { postId: post._id })}
                activeOpacity={0.7}
              >
                {post.media && post.media.length > 0 ? (
                  imageErrors.has(post.media[0].mediaUrl) ? (
                    <View style={[styles.postImage, styles.postError]}>
                      <Ionicons name="image-outline" size={40} color="#999" />
                      <Text style={styles.errorText}>Failed to load</Text>
                    </View>
                  ) : (
                    <Image
                      source={{ uri: post.media[0].mediaUrl }}
                      style={styles.postImage}
                      resizeMode="cover"
                      onError={() => {
                        setImageErrors(prev => new Set(prev).add(post.media[0].mediaUrl));
                      }}
                    />
                  )
                ) : (
                  <View style={[styles.postImage, styles.postPlaceholder]}>
                    <Ionicons name="text" size={32} color="#999" />
                    <Text style={styles.captionPreview} numberOfLines={3}>
                      {post.caption}
                    </Text>
                  </View>
                )}
                {post.media && post.media.length > 1 && (
                  <View style={styles.multipleIndicator}>
                    <Ionicons name="copy-outline" size={14} color="#fff" />
                  </View>
                )}
                {(post.likeCount > 0 || post.commentCount > 0) && (
                  <View style={styles.postStats}>
                    {post.likeCount > 0 && (
                      <View style={styles.postStatItem}>
                        <Ionicons name="heart" size={12} color="#fff" />
                        <Text style={styles.postStatText}>{post.likeCount}</Text>
                      </View>
                    )}
                    {post.commentCount > 0 && (
                      <View style={styles.postStatItem}>
                        <Ionicons name="chatbubble" size={12} color="#fff" />
                        <Text style={styles.postStatText}>{post.commentCount}</Text>
                      </View>
                    )}
                  </View>
                )}
              </TouchableOpacity>
            ))}
            {/* Fill remaining slots with empty views */}
            {row.length < 3 &&
              Array.from({ length: 3 - row.length }).map((_, index) => (
                <View key={`empty-${index}`} style={styles.postItem} />
              ))}
          </View>
        ))}
      </View>
    );
  };

  const renderListView = () => {
    return (
      <View style={styles.postsList}>
        {userPosts.map((post) => (
          <TouchableOpacity
            key={post._id}
            style={styles.listPostItem}
            onPress={() => safeNavigate('PostDetail', { postId: post._id })}
            activeOpacity={0.7}
          >
            {/* Post Header */}
            <View style={styles.listPostHeader}>
              <View style={styles.listPostAuthor}>
                <View style={styles.listAuthorAvatar}>
                  <Text style={styles.listAuthorInitial}>
                    {profileData?.user?.name?.[0]?.toUpperCase() || 'U'}
                  </Text>
                </View>
                <View style={styles.listAuthorInfo}>
                  <Text style={styles.listAuthorName}>{profileData?.user?.name || 'User'}</Text>
                  <Text style={styles.listPostTime}>
                    {new Date(post.createdAt).toLocaleDateString()}
                  </Text>
                </View>
              </View>
            </View>

            {/* Post Content */}
            {post.caption && (
              <Text style={styles.listPostCaption} numberOfLines={3}>
                {post.caption}
              </Text>
            )}

            {/* Post Media */}
            {post.media && post.media.length > 0 && (
              <View style={styles.listPostMedia}>
                {imageErrors.has(post.media[0].mediaUrl) ? (
                  <View style={[styles.listMediaImage, styles.postError]}>
                    <Ionicons name="image-outline" size={48} color="#999" />
                    <Text style={styles.errorText}>Failed to load</Text>
                  </View>
                ) : (
                  <Image
                    source={{ uri: post.media[0].mediaUrl }}
                    style={styles.listMediaImage}
                    resizeMode="cover"
                    onError={() => {
                      setImageErrors(prev => new Set(prev).add(post.media[0].mediaUrl));
                    }}
                  />
                )}
                {post.media.length > 1 && (
                  <View style={styles.listMultipleIndicator}>
                    <Ionicons name="copy-outline" size={16} color="#fff" />
                    <Text style={styles.listMultipleText}>+{post.media.length - 1}</Text>
                  </View>
                )}
              </View>
            )}

            {/* Post Stats & Actions */}
            <View style={styles.listPostFooter}>
              <View style={styles.listPostStats}>
                <View style={styles.listStatItem}>
                  <Ionicons name="heart-outline" size={20} color="#666" />
                  <Text style={styles.listStatText}>{post.likeCount || 0}</Text>
                </View>
                <View style={styles.listStatItem}>
                  <Ionicons name="chatbubble-outline" size={20} color="#666" />
                  <Text style={styles.listStatText}>{post.commentCount || 0}</Text>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const renderAbout = () => (
    <View style={styles.aboutContainer}>
      {/* Personal Info */}
      <View style={styles.aboutSection}>
        <Text style={styles.aboutTitle}>Profile Information</Text>
        
        {/* Headline */}
        {profileData?.profile?.headline ? (
          <View style={styles.infoRow}>
            <MaterialIcons name="work-outline" size={20} color="#666" />
            <Text style={styles.infoText}>{profileData.profile.headline}</Text>
          </View>
        ) : (
          <View style={styles.infoRow}>
            <MaterialIcons name="work-outline" size={20} color="#ccc" />
            <Text style={styles.infoTextEmpty}>Add your professional headline</Text>
          </View>
        )}
        
        {/* Location */}
        {profileData?.profile?.location ? (
          <View style={styles.infoRow}>
            <MaterialIcons name="location-on" size={20} color="#666" />
            <Text style={styles.infoText}>{profileData.profile.location}</Text>
          </View>
        ) : (
          <View style={styles.infoRow}>
            <MaterialIcons name="location-on" size={20} color="#ccc" />
            <Text style={styles.infoTextEmpty}>Add your location</Text>
          </View>
        )}
        
        {/* Connections */}
        <View style={styles.infoRow}>
          <MaterialIcons name="people" size={20} color="#666" />
          <Text style={styles.infoText}>
            {networkStats?.followers || 0} followers · {networkStats?.following || 0} following
          </Text>
        </View>
        
        {/* Member Since */}
        {profileData?.createdAt && (
          <View style={styles.infoRow}>
            <MaterialIcons name="event" size={20} color="#666" />
            <Text style={styles.infoText}>
              Member since {new Date(profileData.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </Text>
          </View>
        )}
        
        {/* Open to Work */}
        {profileData?.profile?.openToWork && (
          <View style={styles.openToWorkBanner}>
            <MaterialIcons name="work" size={18} color="#10A37F" />
            <Text style={styles.openToWorkText}>Open to work</Text>
          </View>
        )}
      </View>

      {/* Bio */}
      {profileData?.profile?.bio ? (
        <View style={styles.aboutSection}>
          <Text style={styles.aboutTitle}>About</Text>
          <Text style={styles.aboutText}>{profileData.profile.bio}</Text>
        </View>
      ) : (
        <View style={styles.aboutSection}>
          <Text style={styles.aboutTitle}>About</Text>
          <Text style={styles.aboutTextEmpty}>Tell us about yourself...</Text>
        </View>
      )}

      {/* Skills */}
      {profileData?.profile?.skills && profileData.profile.skills.length > 0 ? (
        <View style={styles.aboutSection}>
          <Text style={styles.aboutTitle}>Skills</Text>
          <View style={styles.skillsContainer}>
            {profileData.profile.skills.map((skill, index) => (
              <View key={index} style={styles.skillTag}>
                <Text style={styles.skillText}>{skill}</Text>
              </View>
            ))}
          </View>
        </View>
      ) : (
        <View style={styles.aboutSection}>
          <Text style={styles.aboutTitle}>Skills</Text>
          <Text style={styles.aboutTextEmpty}>Add your skills to showcase your expertise</Text>
        </View>
      )}

      {/* Experience */}
      {profileData?.profile?.experience && profileData.profile.experience.length > 0 ? (
        <View style={styles.aboutSection}>
          <Text style={styles.aboutTitle}>Experience</Text>
          {profileData.profile.experience.map((exp, index) => (
            <View key={index} style={styles.experienceItem}>
              <View style={styles.experienceIcon}>
                <MaterialIcons name="work" size={20} color="#0A66C2" />
              </View>
              <View style={styles.experienceContent}>
                <Text style={styles.experienceTitle}>{exp.title}</Text>
                <Text style={styles.experienceCompany}>{exp.company}</Text>
                {exp.location && (
                  <Text style={styles.experienceLocation}>{exp.location}</Text>
                )}
                {(exp.startDate || exp.endDate) && (
                  <Text style={styles.experienceDate}>
                    {exp.startDate ? new Date(exp.startDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'Present'}
                    {' - '}
                    {exp.endDate ? new Date(exp.endDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'Present'}
                  </Text>
                )}
              </View>
            </View>
          ))}
        </View>
      ) : (
        <View style={styles.aboutSection}>
          <Text style={styles.aboutTitle}>Experience</Text>
          <Text style={styles.aboutTextEmpty}>Add your work experience</Text>
        </View>
      )}

      {/* Education */}
      {profileData?.profile?.education && profileData.profile.education.length > 0 ? (
        <View style={styles.aboutSection}>
          <Text style={styles.aboutTitle}>Education</Text>
          {profileData.profile.education.map((edu, index) => (
            <View key={index} style={styles.experienceItem}>
              <View style={styles.experienceIcon}>
                <MaterialIcons name="school" size={20} color="#0A66C2" />
              </View>
              <View style={styles.experienceContent}>
                <Text style={styles.experienceTitle}>{edu.school}</Text>
                <Text style={styles.experienceCompany}>{edu.degree}</Text>
                {edu.field && (
                  <Text style={styles.experienceLocation}>{edu.field}</Text>
                )}
                {(edu.startDate || edu.endDate) && (
                  <Text style={styles.experienceDate}>
                    {edu.startDate ? new Date(edu.startDate).toLocaleDateString('en-US', { year: 'numeric' }) : ''}
                    {' - '}
                    {edu.endDate ? new Date(edu.endDate).toLocaleDateString('en-US', { year: 'numeric' }) : 'Present'}
                  </Text>
                )}
              </View>
            </View>
          ))}
        </View>
      ) : (
        <View style={styles.aboutSection}>
          <Text style={styles.aboutTitle}>Education</Text>
          <Text style={styles.aboutTextEmpty}>Add your educational background</Text>
        </View>
      )}

      {/* Website */}
      {profileData?.profile?.website && (
        <View style={styles.aboutSection}>
          <Text style={styles.aboutTitle}>Website</Text>
          <TouchableOpacity>
            <Text style={styles.websiteLink}>{profileData.profile.website}</Text>
          </TouchableOpacity>
        </View>
      )}
      
      {/* Edit Profile CTA */}
      <TouchableOpacity 
        style={styles.editProfileButton}
        onPress={() => safeNavigate('EditProfile', { profileData })}
      >
        <MaterialIcons name="edit" size={20} color="#fff" />
        <Text style={styles.editProfileButtonText}>Edit Profile</Text>
      </TouchableOpacity>
    </View>
  );

  const renderActivity = () => {
    if (activityLoading) {
      return (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#0A66C2" />
        </View>
      );
    }

    const hasActivity = likedPosts.length > 0 || userComments.length > 0;

    if (!hasActivity) {
      return (
        <View style={styles.activityContainer}>
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconContainer}>
              <Ionicons name="pulse-outline" size={48} color="#0A66C2" />
            </View>
            <Text style={styles.emptyText}>No Recent Activity</Text>
            <Text style={styles.emptySubtext}>
              Your likes, comments, and posts will appear here
            </Text>
          </View>
        </View>
      );
    }

    // Combine and sort activity by date
    const combinedActivity = [
      ...likedPosts.map(post => ({ type: 'like', data: post, date: (post as any).likedAt || post.createdAt })),
      ...userComments.map(comment => ({ type: 'comment', data: comment, date: comment.createdAt })),
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return (
      <ScrollView style={styles.activityContainer}>
        {combinedActivity.map((item, index) => {
          if (item.type === 'like') {
            const post = item.data as Post;
            return (
              <TouchableOpacity
                key={`like-${post._id}-${index}`}
                style={styles.activityItem}
                onPress={() => safeNavigate('PostDetail', { postId: post._id })}
              >
                <View style={styles.activityIconContainer}>
                  <Ionicons name="heart" size={24} color="#EF4444" />
                </View>
                <View style={styles.activityContent}>
                  <Text style={styles.activityText}>
                    You liked <Text style={styles.activityBold}>{post.author?.name}'s</Text> post
                  </Text>
                  {post.caption && (
                    <Text style={styles.activityCaption} numberOfLines={2}>
                      {post.caption}
                    </Text>
                  )}
                  <Text style={styles.activityTime}>
                    {new Date(item.date).toLocaleDateString()}
                  </Text>
                </View>
                {post.media && post.media[0] && (
                  <Image
                    source={{ uri: post.media[0].mediaUrl }}
                    style={styles.activityThumbnail}
                  />
                )}
              </TouchableOpacity>
            );
          } else {
            const comment = item.data as any;
            return (
              <TouchableOpacity
                key={`comment-${comment._id}-${index}`}
                style={styles.activityItem}
                onPress={() => safeNavigate('PostDetail', { postId: comment.postId._id })}
              >
                <View style={styles.activityIconContainer}>
                  <Ionicons name="chatbubble" size={24} color="#0A66C2" />
                </View>
                <View style={styles.activityContent}>
                  <Text style={styles.activityText}>
                    You commented on <Text style={styles.activityBold}>{comment.postId?.author?.name}'s</Text> post
                  </Text>
                  <Text style={styles.activityCaption} numberOfLines={2}>
                    {comment.text}
                  </Text>
                  <Text style={styles.activityTime}>
                    {new Date(item.date).toLocaleDateString()}
                  </Text>
                </View>
                {comment.postId?.media?.[0] && (
                  <Image
                    source={{ uri: comment.postId.media[0].mediaUrl }}
                    style={styles.activityThumbnail}
                  />
                )}
              </TouchableOpacity>
            );
          }
        })}
      </ScrollView>
    );
  };

  const renderMedia = () => {
    const mediaItems = userPosts
      .filter(post => post.media && post.media.length > 0)
      .flatMap(post => post.media);

    if (mediaItems.length === 0) {
      return (
        <View style={styles.mediaContainer}>
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconContainer}>
              <Ionicons name="images-outline" size={48} color="#0A66C2" />
            </View>
            <Text style={styles.emptyText}>No Media Yet</Text>
            <Text style={styles.emptySubtext}>
              Photos and videos from your posts will appear here
            </Text>
          </View>
        </View>
      );
    }

    return (
      <View style={styles.mediaContainer}>
        <View style={styles.postsGrid}>
          {Array.from({ length: Math.ceil(mediaItems.length / 3) }).map((_, rowIndex) => {
            const row = mediaItems.slice(rowIndex * 3, (rowIndex + 1) * 3);
            return (
              <View key={rowIndex} style={styles.postRow}>
                {row.map((media, index) => (
                  <View key={`${media._id}-${index}`} style={styles.postItem}>
                    {imageErrors.has(media.mediaUrl) ? (
                      <View style={[styles.postItem, styles.postError]}>
                        <Ionicons name="image-outline" size={32} color="#ccc" />
                        <Text style={styles.errorText}>Failed to load</Text>
                      </View>
                    ) : (
                      <Image
                        source={{ uri: media.mediaUrl }}
                        style={styles.postImage}
                        onError={() => setImageErrors(prev => new Set(prev).add(media.mediaUrl))}
                      />
                    )}
                  </View>
                ))}
                {row.length < 3 &&
                  Array.from({ length: 3 - row.length }).map((_, index) => (
                    <View key={`empty-${index}`} style={styles.postItem} />
                  ))}
              </View>
            );
          })}
        </View>
      </View>
    );
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'posts':
        return renderPostsGrid();
      case 'about':
        return renderAbout();
      case 'activity':
        return renderActivity();
      default:
        return renderPostsGrid();
    }
  };

  const renderSkeletonLoader = () => (
    <View style={styles.skeletonContainer}>
      {/* Cover Skeleton */}
      <View style={styles.skeletonCover} />
      
      {/* Profile Section Skeleton */}
      <View style={styles.skeletonProfileSection}>
        <View style={styles.skeletonAvatar} />
      </View>
      
      {/* Name Skeleton */}
      <View style={styles.skeletonNameSection}>
        <View style={[styles.skeletonLine, { width: '40%', height: 24 }]} />
        <View style={[styles.skeletonLine, { width: '60%', height: 16, marginTop: 8 }]} />
        <View style={[styles.skeletonLine, { width: '30%', height: 14, marginTop: 8 }]} />
      </View>
      
      {/* Stats Skeleton */}
      <View style={styles.skeletonStats}>
        {[1, 2, 3, 4].map((i) => (
          <View key={i} style={styles.skeletonStatItem}>
            <View style={[styles.skeletonLine, { width: 40, height: 20 }]} />
            <View style={[styles.skeletonLine, { width: 60, height: 12, marginTop: 4 }]} />
          </View>
        ))}
      </View>
      
      {/* Tabs Skeleton */}
      <View style={styles.skeletonTabs}>
        {[1, 2, 3, 4].map((i) => (
          <View key={i} style={[styles.skeletonLine, { flex: 1, height: 40, marginHorizontal: 4 }]} />
        ))}
      </View>
      
      {/* Grid Skeleton */}
      <View style={styles.skeletonGrid}>
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <View key={i} style={styles.skeletonGridItem} />
        ))}
      </View>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        {renderSkeletonLoader()}
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl 
              refreshing={refreshing} 
              onRefresh={onRefresh}
              tintColor="#0A66C2"
              colors={['#0A66C2']}
            />
          }
          showsVerticalScrollIndicator={false}
        >
          {renderHeader()}
          {renderTabContent()}
        </ScrollView>
      </Animated.View>
      
      {/* Floating Edit Profile FAB */}
      <TouchableOpacity 
        style={styles.fab}
        onPress={() => {
          if (Platform.OS !== 'web') {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          }
          safeNavigate('EditProfile', { profileData });
        }}
        activeOpacity={0.8}
        accessible={true}
        accessibilityLabel="Edit profile"
        accessibilityHint="Opens the edit profile screen"
        accessibilityRole="button"
      >
        <Ionicons name="create" size={24} color="#fff" />
      </TouchableOpacity>
      
      {/* Bottom Navigation */}
      <BottomNavigation 
        activeTab="profile" 
        navigation={navigation as any}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  header: {
    backgroundColor: '#fff',
    marginBottom: 8,
  },
  coverImage: {
    width: '100%',
    height: COVER_HEIGHT,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  coverGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  profileSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 16,
    marginTop: -PROFILE_SIZE / 2,
  },
  profileImageContainer: {
    position: 'relative',
  },
  statusRing: {
    position: 'absolute',
    width: PROFILE_SIZE + 8,
    height: PROFILE_SIZE + 8,
    borderRadius: (PROFILE_SIZE + 8) / 2,
    borderWidth: 3,
    top: -4,
    left: -4,
    zIndex: 1,
  },
  statusOnline: {
    borderColor: '#10B981',
  },
  statusBusy: {
    borderColor: '#F59E0B',
  },
  statusInvisible: {
    borderColor: '#9CA3AF',
  },
  profileImage: {
    width: PROFILE_SIZE,
    height: PROFILE_SIZE,
    borderRadius: PROFILE_SIZE / 2,
    backgroundColor: '#fff',
    borderWidth: 4,
    borderColor: '#fff',
    zIndex: 2,
  },
  profileImagePlaceholder: {
    backgroundColor: '#0A66C2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInitial: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#fff',
  },
  openToWorkBadge: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#E6F7F3',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
    zIndex: 3,
  },
  editButton: {
    marginTop: 60,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#0A66C2',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  nameSection: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 8,
  },
  roleBadge: {
    backgroundColor: '#E0EFFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  roleBadgeText: {
    fontSize: 13,
    color: '#0A66C2',
    fontWeight: '600',
  },
  headline: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start',
  },
  locationText: {
    fontSize: 13,
    color: '#0A66C2',
    fontWeight: '500',
  },
  location: {
    fontSize: 12,
    color: '#666',
  },
  statsContainer: {
    flexDirection: 'row',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    marginTop: 12,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    backgroundColor: '#eee',
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
  },
  tabsWrapper: {
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    position: 'relative',
  },
  tabs: {
    flexDirection: 'row',
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 6,
  },
  activeTab: {
    // Removed border since we have animated indicator
  },
  tabIndicator: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: width / 3,
    height: 3,
    backgroundColor: '#0A66C2',
    borderRadius: 2,
  },
  tabText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#0A66C2',
  },
  postsContainer: {
    backgroundColor: '#fff',
  },
  viewToggleContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    gap: 8,
  },
  viewToggleButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
  },
  viewToggleActive: {
    backgroundColor: '#E0EFFF',
  },
  postsGrid: {
    backgroundColor: '#fff',
  },
  postsList: {
    backgroundColor: '#fff',
  },
  listPostItem: {
    backgroundColor: '#fff',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  listPostHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  listPostAuthor: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  listAuthorAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#0A66C2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  listAuthorInitial: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  listAuthorInfo: {
    flex: 1,
  },
  listAuthorName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#000',
  },
  listPostTime: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  listPostCaption: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
    marginBottom: 12,
  },
  listPostMedia: {
    position: 'relative',
    marginBottom: 12,
  },
  listMediaImage: {
    width: '100%',
    height: 250,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
  },
  listMultipleIndicator: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  listMultipleText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '600',
  },
  listPostFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  listPostStats: {
    flexDirection: 'row',
    gap: 16,
  },
  listStatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  listStatText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  postsGrid: {
    backgroundColor: '#fff',
  },
  postRow: {
    flexDirection: 'row',
    gap: 2,
  },
  postItem: {
    width: (width - 4) / 3,
    height: (width - 4) / 3,
    backgroundColor: '#f0f0f0',
    position: 'relative',
    overflow: 'hidden',
  },
  postImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#f5f5f5',
  },
  postPlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 8,
    backgroundColor: '#fafafa',
  },
  postError: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
  },
  errorText: {
    fontSize: 10,
    color: '#999',
    marginTop: 4,
    textAlign: 'center',
  },
  captionPreview: {
    fontSize: 11,
    color: '#666',
    textAlign: 'center',
    marginTop: 8,
    paddingHorizontal: 4,
  },
  multipleIndicator: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 10,
    padding: 4,
    flexDirection: 'row',
    alignItems: 'center',
  },
  postStats: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    flexDirection: 'row',
    paddingHorizontal: 8,
    paddingVertical: 4,
    gap: 8,
  },
  postStatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  postStatText: {
    fontSize: 11,
    color: '#fff',
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 80,
    paddingHorizontal: 32,
    backgroundColor: '#fff',
  },
  emptyIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#E0EFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 15,
    color: '#666',
    marginTop: 8,
    textAlign: 'center',
  },
  emptyButton: {
    marginTop: 24,
    backgroundColor: '#0A66C2',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  emptyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  aboutContainer: {
    backgroundColor: '#fff',
    padding: 16,
  },
  aboutSection: {
    marginBottom: 24,
  },
  aboutTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 12,
  },
  aboutText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  aboutTextEmpty: {
    fontSize: 14,
    color: '#999',
    lineHeight: 20,
    fontStyle: 'italic',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  infoTextEmpty: {
    fontSize: 14,
    color: '#999',
    flex: 1,
    fontStyle: 'italic',
  },
  openToWorkBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#E6F7F3',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    marginTop: 8,
  },
  openToWorkText: {
    fontSize: 14,
    color: '#10A37F',
    fontWeight: '600',
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  skillTag: {
    backgroundColor: '#E0EFFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  skillText: {
    fontSize: 13,
    color: '#0A66C2',
    fontWeight: '500',
  },
  experienceItem: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 12,
  },
  experienceIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E0EFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  experienceContent: {
    flex: 1,
  },
  experienceTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#000',
    marginBottom: 2,
  },
  experienceCompany: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  experienceLocation: {
    fontSize: 13,
    color: '#999',
  },
  experienceDate: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  websiteLink: {
    fontSize: 14,
    color: '#0A66C2',
    textDecorationLine: 'underline',
  },
  editProfileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#0A66C2',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 24,
    marginTop: 8,
  },
  editProfileButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
  activityContainer: {
    backgroundColor: '#fff',
    minHeight: 400,
  },
  mediaContainer: {
    backgroundColor: '#fff',
    minHeight: 400,
  },
  fab: {
    position: 'absolute',
    bottom: 96,
    right: 16,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#0A66C2',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  skeletonContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  skeletonCover: {
    width: '100%',
    height: COVER_HEIGHT,
    backgroundColor: '#e0e0e0',
  },
  skeletonProfileSection: {
    paddingHorizontal: 16,
    marginTop: -PROFILE_SIZE / 2,
  },
  skeletonAvatar: {
    width: PROFILE_SIZE,
    height: PROFILE_SIZE,
    borderRadius: PROFILE_SIZE / 2,
    backgroundColor: '#e0e0e0',
    borderWidth: 4,
    borderColor: '#fff',
  },
  skeletonNameSection: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  skeletonLine: {
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
  },
  skeletonStats: {
    flexDirection: 'row',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    marginTop: 12,
  },
  skeletonStatItem: {
    flex: 1,
    alignItems: 'center',
  },
  skeletonTabs: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  skeletonGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 2,
    padding: 0,
  },
  skeletonGridItem: {
    width: (width - 4) / 3,
    height: (width - 4) / 3,
    backgroundColor: '#e0e0e0',
  },
  activityItem: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    backgroundColor: '#fff',
    alignItems: 'center',
    gap: 12,
  },
  activityIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  activityContent: {
    flex: 1,
  },
  activityText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 4,
  },
  activityBold: {
    fontWeight: '600',
    color: '#000',
  },
  activityCaption: {
    fontSize: 13,
    color: '#666',
    marginBottom: 4,
  },
  activityTime: {
    fontSize: 12,
    color: '#999',
  },
  activityThumbnail: {
    width: 50,
    height: 50,
    borderRadius: 6,
    backgroundColor: '#e0e0e0',
  },
});

export default ProfileScreen;

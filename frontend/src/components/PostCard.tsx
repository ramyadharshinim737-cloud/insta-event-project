import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, Alert, Image, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Video, ResizeMode, AVPlaybackStatus } from 'expo-av';
import { Post } from '../utils/types';
import { postsApi, Post as BackendPost } from '../services/posts.api';
import { useAuth } from '../context/AuthContext';
import CommentsModal from './CommentsModal';
import ShareModal from './ShareModal';

interface PostCardProps {
  post: Post | BackendPost;
  onLikeUpdated?: () => void;
  onPostDeleted?: () => void;
}

const PostCard: React.FC<PostCardProps> = ({ post, onLikeUpdated, onPostDeleted }) => {
  const { user } = useAuth();
  // Check if post is from backend (has _id) or mock (has id)
  const isBackendPost = '_id' in post;
  const [likeCount, setLikeCount] = useState(isBackendPost ? (post as BackendPost).likeCount : (post as Post).likes);
  const [isLiked, setIsLiked] = useState(isBackendPost ? (post as BackendPost).userLiked : false);
  const [isLiking, setIsLiking] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [commentCount, setCommentCount] = useState(isBackendPost ? (post as BackendPost).commentCount : (post as Post).comments);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [isVideoLoading, setIsVideoLoading] = useState(false);
  const videoRef = useRef<Video>(null);

  // Debug: Log media data
  if (isBackendPost) {
    const backendPost = post as BackendPost;
    console.log('📸 Post media data:', {
      postId: backendPost._id,
      hasMedia: !!backendPost.media,
      mediaCount: backendPost.media?.length || 0,
      mediaUrls: backendPost.media?.map(m => m.mediaUrl) || []
    });
  }

  // Get post data based on type
  const userName = isBackendPost ? (post as BackendPost).author?.name : (post as Post).user.name;
  const communityName = isBackendPost ? (post as BackendPost).community?.name : undefined;
  const profileImageUrl = isBackendPost ? (post as BackendPost).author?.profileImageUrl : undefined;
  const content = isBackendPost ? (post as BackendPost).caption : (post as Post).content;
  
  // Debug: Log community data
  if (isBackendPost) {
    console.log('🏘️ Post community data:', {
      postId: (post as BackendPost)._id,
      communityId: (post as BackendPost).communityId,
      community: (post as BackendPost).community,
      communityName
    });
  }
  
  // Format date as DD/MM/YYYY
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };
  
  const timestamp = isBackendPost ? formatDate((post as BackendPost).createdAt) : (post as Post).timestamp;
  const postId = isBackendPost ? (post as BackendPost)._id : (post as Post).id;
  
  // Extract authorId - use author._id since author is populated
  let authorId: string | null = null;
  if (isBackendPost) {
    const backendPost = post as BackendPost;
    // First try to get from author object (populated)
    if (backendPost.author?._id) {
      authorId = backendPost.author._id;
    } 
    // Fallback to authorId if it's a plain string
    else if (typeof backendPost.authorId === 'string') {
      authorId = backendPost.authorId;
    }
  }
  
  const isOwner = isBackendPost && user && authorId && authorId === user.id;

  // Debug: Log ownership check
  if (isBackendPost) {
    const backendPost = post as BackendPost;
    console.log('🔒 Ownership check:', {
      postId,
      authorId,
      'author._id': backendPost.author?._id,
      'raw authorId': typeof backendPost.authorId,
      userId: user?.id,
      isOwner,
      match: authorId === user?.id
    });
  }

  const handleLike = async () => {
    if (!isBackendPost || isLiking) return;

    setIsLiking(true);
    try {
      if (isLiked) {
        const result = await postsApi.unlikePost(postId);
        setLikeCount(result.likeCount);
        setIsLiked(false);
        console.log('❤️ Post unliked');
      } else {
        const result = await postsApi.likePost(postId);
        setLikeCount(result.likeCount);
        setIsLiked(true);
        console.log('💙 Post liked');
      }
      onLikeUpdated?.();
    } catch (error) {
      console.error('❌ Like error:', error);
      Alert.alert('Error', 'Failed to update like');
    } finally {
      setIsLiking(false);
    }
  };

  const handleDelete = async () => {
    if (!isBackendPost || !isOwner) return;

    Alert.alert(
      'Delete Post',
      'Are you sure you want to delete this post?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await postsApi.deletePost(postId);
              Alert.alert('Success', 'Post deleted successfully');
              onPostDeleted?.();
            } catch (error) {
              console.error('❌ Delete error:', error);
              Alert.alert('Error', 'Failed to delete post');
            }
          },
        },
      ]
    );
  };

  const handleComment = () => {
    if (!isBackendPost) return;
    setShowComments(true);
  };

  const handleShare = () => {
    if (!isBackendPost) return;
    setShowShare(true);
  };

  const handleCommentAdded = () => {
    setCommentCount(prev => prev + 1);
  };

  const handleVideoPress = async () => {
    if (!videoRef.current) return;
    
    try {
      if (isVideoPlaying) {
        await videoRef.current.pauseAsync();
        setIsVideoPlaying(false);
      } else {
        await videoRef.current.playAsync();
        setIsVideoPlaying(true);
      }
    } catch (error) {
      console.error('Video control error:', error);
    }
  };

  const handleVideoStatusUpdate = (status: AVPlaybackStatus) => {
    if (status.isLoaded) {
      setIsVideoLoading(false);
      setIsVideoPlaying(status.isPlaying);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.userInfo}>
          <View style={styles.avatarContainer}>
            {profileImageUrl ? (
              <Image 
                source={{ uri: profileImageUrl }} 
                style={styles.profileImage}
              />
            ) : (
              <Ionicons name="person-circle" size={40} color="#0A66C2" />
            )}
          </View>
          <View style={styles.userDetails}>
            <View style={styles.nameRow}>
              <Text style={styles.userName} numberOfLines={1} ellipsizeMode="tail">
                {userName}
              </Text>
            </View>
            {communityName && (
              <Text style={styles.communityName} numberOfLines={1} ellipsizeMode="tail">
                From Community {communityName}
              </Text>
            )}
            <Text style={styles.timestamp} numberOfLines={1}>
              {timestamp}
            </Text>
          </View>
        </View>
        {isOwner && (
          <TouchableOpacity style={styles.menuButton} activeOpacity={0.6} onPress={handleDelete}>
            <Ionicons name="trash-outline" size={22} color="#FF3250" />
          </TouchableOpacity>
        )}
      </View>

      {/* Content */}
      <Text style={styles.content} numberOfLines={10} ellipsizeMode="tail">
        {content}
      </Text>

      {/* Media Images and Videos */}
      {isBackendPost && (post as BackendPost).media && (post as BackendPost).media!.length > 0 && (
        <View style={styles.mediaContainer}>
          {(post as BackendPost).media!.map((mediaItem, index) => {
            // Skip local file URIs (only show http/https URLs)
            const isValidUrl = mediaItem.mediaUrl.startsWith('http://') || mediaItem.mediaUrl.startsWith('https://');
            
            if (mediaItem.mediaType === 'image') {
              if (!isValidUrl) {
                console.warn('⚠️ Skipping invalid image URL:', mediaItem.mediaUrl);
                return null;
              }
              return (
                <Image
                  key={mediaItem._id}
                  source={{ uri: mediaItem.mediaUrl }}
                  style={styles.postImage}
                  resizeMode="cover"
                  onError={(error) => {
                    console.error('❌ Image load error:', mediaItem.mediaUrl, error.nativeEvent.error);
                  }}
                  onLoad={() => {
                    console.log('✅ Image loaded:', mediaItem.mediaUrl);
                  }}
                />
              );
            } else if (mediaItem.mediaType === 'video') {
              if (!isValidUrl) {
                console.warn('⚠️ Skipping invalid video URL:', mediaItem.mediaUrl);
                return null;
              }
              return (
                <View key={mediaItem._id} style={styles.videoWrapper}>
                  <Video
                    ref={videoRef}
                    source={{ uri: mediaItem.mediaUrl }}
                    style={styles.postVideo}
                    resizeMode={ResizeMode.CONTAIN}
                    shouldPlay={false}
                    isLooping={false}
                    onPlaybackStatusUpdate={handleVideoStatusUpdate}
                    onLoadStart={() => setIsVideoLoading(true)}
                    onLoad={() => {
                      setIsVideoLoading(false);
                      console.log('✅ Video loaded:', mediaItem.mediaUrl);
                    }}
                    onError={(error) => {
                      setIsVideoLoading(false);
                      console.error('❌ Video load error:', mediaItem.mediaUrl, error);
                    }}
                  />
                  
                  {/* Video Loading Indicator */}
                  {isVideoLoading && (
                    <View style={styles.videoLoadingOverlay}>
                      <ActivityIndicator size="large" color="#FFFFFF" />
                    </View>
                  )}
                  
                  {/* Custom Play/Pause Button */}
                  {!isVideoLoading && (
                    <TouchableOpacity 
                      style={styles.videoControlOverlay}
                      activeOpacity={0.9}
                      onPress={handleVideoPress}
                    >
                      {!isVideoPlaying && (
                        <View style={styles.playButton}>
                          <Ionicons name="play" size={48} color="#FFFFFF" />
                        </View>
                      )}
                    </TouchableOpacity>
                  )}
                </View>
              );
            }
            return null;
          })}
        </View>
      )}

      {/* Action Buttons */}
      <View style={styles.actions}>
        <TouchableOpacity 
          style={styles.actionButton} 
          activeOpacity={0.6}
          onPress={handleLike}
          disabled={isLiking}
        >
          <Ionicons 
            name={isLiked ? "heart" : "heart-outline"} 
            size={24} 
            color={isLiked ? "#FF3250" : "#666666"} 
          />
          <Text style={[styles.actionText, isLiked && styles.actionTextLiked]} numberOfLines={1}>
            {likeCount} {likeCount === 1 ? 'Like' : 'Likes'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton} activeOpacity={0.6} onPress={handleComment}>
          <Ionicons name="chatbubble-outline" size={24} color="#666666" />
          <Text style={styles.actionText} numberOfLines={1}>{commentCount} {commentCount === 1 ? 'Comment' : 'Comments'}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton} activeOpacity={0.6} onPress={handleShare}>
          <Ionicons name="paper-plane-outline" size={24} color="#666666" />
          <Text style={styles.actionText} numberOfLines={1}>Share</Text>
        </TouchableOpacity>
      </View>

      {/* Comments Modal */}
      {isBackendPost && (
        <CommentsModal
          visible={showComments}
          onClose={() => setShowComments(false)}
          postId={postId}
          commentCount={commentCount}
          onCommentAdded={handleCommentAdded}
        />
      )}

      {/* Share Modal */}
      {isBackendPost && (
        <ShareModal
          visible={showShare}
          onClose={() => setShowShare(false)}
          postId={postId}
          postContent={content}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    marginBottom: 12,
    borderRadius: 12,
    marginHorizontal: 4,
    paddingBottom: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.12,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 5,
  },
  userInfo: {
    flexDirection: 'row',
    flex: 1,
    alignItems: 'center',
  },
  avatarContainer: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#F8F9FA',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#EFEFEF',
    overflow: 'hidden',
  },
  profileImage: {
    width: 52,
    height: 52,
    borderRadius: 26,
  },
  userDetails: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  userName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1D2226',
    maxWidth: '80%',
  },
  userTitle: {
    fontSize: 13,
    color: '#666666',
    marginTop: 2,
  },
  communityName: {
    fontSize: 13,
    color: '#0A66C2',
    marginTop: 2,
    fontWeight: '500',
  },
  timestamp: {
    fontSize: 12,
    color: '#8E8E8E',
    marginTop: 2,
  },
  menuButton: {
    padding: 8,
  },
  content: {
    fontSize: 15,
    lineHeight: 22,
    color: '#1D2226',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  mediaContainer: {
    width: '100%',
    marginBottom: 8,
  },
  videoWrapper: {
    width: '100%',
    height: 300,
    backgroundColor: '#000000',
    position: 'relative',
  },
  postImage: {
    width: '100%',
    height: 300,
    backgroundColor: '#F0F0F0',
  },
  postVideo: {
    width: '100%',
    height: 300,
    backgroundColor: '#000000',
  },
  imageContainer: {
    width: '100%',
    height: 300,
    backgroundColor: '#5B4CCC',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  videoControlOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  playButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  videoLoadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  engagementStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  leftStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  likeIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#ED4956',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsText: {
    fontSize: 13,
    color: '#666666',
    marginRight: 16,
  },
  rightStats: {
    flexDirection: 'row',
    gap: 12,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 4,
    paddingBottom: 12,
    paddingHorizontal: 8,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    gap: 6,
  },
  actionText: {
    fontSize: 14,
    color: '#666666',
    fontWeight: '600',
  },
  actionTextLiked: {
    color: '#FF3250',
  },
});

export default PostCard;


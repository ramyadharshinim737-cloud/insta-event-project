import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Video, ResizeMode } from 'expo-av';
import { Post } from '../utils/types';

interface VideoReelProps {
  post: Post;
  isActive: boolean;
  onVisibilityChange?: (id: string, isVisible: boolean) => void;
  onReelPress?: (post: Post) => void;
}

const VideoReel: React.FC<VideoReelProps> = ({ post, isActive, onVisibilityChange, onReelPress }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef<Video>(null);

  // Control playback based on isActive prop
  useEffect(() => {
    if (videoRef.current && post.videoUri) {
      if (isActive) {
        videoRef.current.playAsync();
      } else {
        videoRef.current.pauseAsync();
      }
    }
  }, [isActive, post.videoUri]);

  const handlePlayPause = async () => {
    if (videoRef.current) {
      if (isPlaying) {
        await videoRef.current.pauseAsync();
      } else {
        await videoRef.current.playAsync();
      }
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.userInfo}>
          <View style={styles.avatarContainer}>
            <Ionicons name={post.user.avatar as any} size={24} color="#262626" />
          </View>
          <View style={styles.userDetails}>
            <View style={styles.nameRow}>
              <Text style={styles.userName}>{post.user.name}</Text>
              {post.user.verified && (
                <Ionicons name="checkmark-circle" size={14} color="#0095f6" />
              )}
            </View>
            <Text style={styles.userTitle}>{post.user.title}</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.menuButton}>
          <Ionicons name="ellipsis-horizontal" size={20} color="#262626" />
        </TouchableOpacity>
      </View>

      {/* Video Container */}
      <TouchableOpacity 
        style={styles.videoContainer} 
        onPress={() => onReelPress?.(post)}
        activeOpacity={0.9}
      >
        {post.videoUri ? (
          <Video
            ref={videoRef}
            source={post.videoUri}
            style={styles.video}
            resizeMode={ResizeMode.COVER}
            isLooping
            shouldPlay={isActive}
            useNativeControls={false}
            onPlaybackStatusUpdate={(status: any) => {
              if (status.isLoaded) {
                setIsPlaying(status.isPlaying);
              }
            }}
          />
        ) : (
          <Ionicons name={post.videoIcon as any} size={80} color="#fff" />
        )}
        
        {!post.videoUri && !isPlaying && (
          <View style={styles.playButton}>
            <Ionicons name="play" size={40} color="#fff" />
          </View>
        )}
        
        <View style={styles.reelBadge}>
          <Ionicons name="videocam" size={16} color="#fff" />
          <Text style={styles.reelText}>Reel</Text>
        </View>
        
        {post.views && (
          <View style={styles.viewsBadge}>
            <Ionicons name="eye" size={14} color="#fff" />
            <Text style={styles.viewsText}>{post.views.toLocaleString()} views</Text>
          </View>
        )}
      </TouchableOpacity>

      {/* Content */}
      <Text style={styles.content} numberOfLines={2}>
        {post.content}
      </Text>

      {/* Engagement Stats */}
      <View style={styles.engagementStats}>
        <View style={styles.leftStats}>
          <Ionicons name="heart" size={14} color="#ed4956" />
          <Text style={styles.statsText}> {post.likes.toLocaleString()}</Text>
        </View>
        <View style={styles.rightStats}>
          <Text style={styles.statsText}>{post.comments} comments</Text>
          <Text style={styles.statsText}>{post.shares} shares</Text>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actions}>
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="heart-outline" size={24} color="#262626" />
          <Text style={styles.actionText}>Like</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="chatbubble-outline" size={24} color="#262626" />
          <Text style={styles.actionText}>Comment</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="paper-plane-outline" size={24} color="#262626" />
          <Text style={styles.actionText}>Share</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    marginBottom: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: '#dbdbdb',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  userInfo: {
    flexDirection: 'row',
    flex: 1,
    alignItems: 'center',
  },
  avatarContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fafafa',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#dbdbdb',
  },
  userDetails: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#262626',
    marginRight: 4,
  },
  userTitle: {
    fontSize: 12,
    color: '#8e8e8e',
    marginTop: 1,
  },
  menuButton: {
    padding: 4,
  },
  videoContainer: {
    width: '100%',
    height: 400,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  video: {
    width: '100%',
    height: '100%',
  },
  playButton: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  reelBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
  },
  reelText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  viewsBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
  },
  viewsText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  content: {
    fontSize: 14,
    lineHeight: 18,
    color: '#262626',
    paddingHorizontal: 12,
    marginTop: 8,
    marginBottom: 8,
  },
  engagementStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderTopWidth: 0.5,
    borderTopColor: '#efefef',
  },
  leftStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statsText: {
    fontSize: 12,
    color: '#8e8e8e',
    marginRight: 12,
  },
  rightStats: {
    flexDirection: 'row',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 4,
    paddingBottom: 8,
    paddingHorizontal: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  actionText: {
    fontSize: 13,
    color: '#262626',
    fontWeight: '600',
    marginLeft: 4,
  },
});

export default VideoReel;

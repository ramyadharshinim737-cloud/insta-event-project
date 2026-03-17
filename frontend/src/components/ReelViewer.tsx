import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  PanResponder,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Video, ResizeMode, AVPlaybackStatus } from 'expo-av';
import { Post } from '../utils/types';
import CommentsModal from './CommentsModal';
import ShareModal from './ShareModal';
import LikeAnimation from './LikeAnimation';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface ReelViewerProps {
  visible: boolean;
  reels: Post[];
  initialIndex: number;
  onClose: () => void;
}

const ReelViewer: React.FC<ReelViewerProps> = ({
  visible,
  reels,
  initialIndex,
  onClose,
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [showCommentsModal, setShowCommentsModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showLikeAnimation, setShowLikeAnimation] = useState(false);

  const videoRef = useRef<Video>(null);
  const controlsTimeout = useRef<NodeJS.Timeout | null>(null);
  const translateY = useRef(new Animated.Value(0)).current;
  const lastTap = useRef<number>(0);

  const currentReel = reels[currentIndex];

  // Reset to initial index when modal opens
  useEffect(() => {
    if (visible) {
      setCurrentIndex(initialIndex);
      setIsPlaying(true);
      setShowControls(true);
    }
  }, [visible, initialIndex]);

  // Auto-hide controls after 3 seconds
  useEffect(() => {
    if (showControls) {
      if (controlsTimeout.current) {
        clearTimeout(controlsTimeout.current);
      }
      controlsTimeout.current = setTimeout(() => {
        setShowControls(false);
      }, 3000);
    }
    return () => {
      if (controlsTimeout.current) {
        clearTimeout(controlsTimeout.current);
      }
    };
  }, [showControls]);

  // Pan responder for swipe gestures
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dy) > 10;
      },
      onPanResponderMove: (_, gestureState) => {
        translateY.setValue(gestureState.dy);
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy < -100 && currentIndex < reels.length - 1) {
          // Swipe up - next reel
          handleNextReel();
        } else if (gestureState.dy > 100 && currentIndex > 0) {
          // Swipe down - previous reel
          handlePreviousReel();
        }
        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: true,
        }).start();
      },
    })
  ).current;

  const handleNextReel = () => {
    if (currentIndex < reels.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setProgress(0);
      setIsPlaying(true);
    }
  };

  const handlePreviousReel = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setProgress(0);
      setIsPlaying(true);
    }
  };

  const handlePlayPause = async () => {
    if (videoRef.current) {
      if (isPlaying) {
        await videoRef.current.pauseAsync();
      } else {
        await videoRef.current.playAsync();
      }
      setIsPlaying(!isPlaying);
    }
    setShowControls(true);
  };

  const handleMuteToggle = async () => {
    if (videoRef.current) {
      await videoRef.current.setIsMutedAsync(!isMuted);
      setIsMuted(!isMuted);
    }
    setShowControls(true);
  };

  const handleProgressBarPress = async (event: any) => {
    const position = event.nativeEvent.locationX;
    const percentage = position / SCREEN_WIDTH;
    const seekPosition = percentage * duration;
    
    if (videoRef.current) {
      await videoRef.current.setPositionAsync(seekPosition);
    }
    setShowControls(true);
  };

  const handlePlaybackStatusUpdate = (status: AVPlaybackStatus) => {
    if (status.isLoaded) {
      setIsPlaying(status.isPlaying);
      setProgress(status.positionMillis || 0);
      setDuration(status.durationMillis || 0);
      
      // Loop to next reel when current one ends
      if (status.didJustFinish && currentIndex < reels.length - 1) {
        handleNextReel();
      }
    }
  };

  const handleScreenTap = () => {
    const now = Date.now();
    const DOUBLE_TAP_DELAY = 300;

    if (now - lastTap.current < DOUBLE_TAP_DELAY) {
      // Double tap - like
      if (!isLiked) {
        setIsLiked(true);
        setShowLikeAnimation(true);
      }
    } else {
      // Single tap - toggle controls
      setShowControls(!showControls);
    }

    lastTap.current = now;
  };

  const handleLike = () => {
    if (!isLiked) {
      setShowLikeAnimation(true);
    }
    setIsLiked(!isLiked);
    setShowControls(true);
  };

  const handleComment = () => {
    setShowCommentsModal(true);
  };

  const handleShare = () => {
    setShowShareModal(true);
  };

  const formatTime = (millis: number) => {
    const totalSeconds = Math.floor(millis / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  if (!currentReel) return null;

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={false}
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <StatusBar hidden />
      <View style={styles.container}>
        <Animated.View
          style={[
            styles.videoContainer,
            { transform: [{ translateY }] },
          ]}
          {...panResponder.panHandlers}
        >
          {/* Video */}
          <TouchableOpacity
            style={styles.videoTouchable}
            activeOpacity={1}
            onPress={handleScreenTap}
          >
            <Video
              ref={videoRef}
              source={currentReel.videoUri || { uri: 'https://www.w3schools.com/html/mov_bbb.mp4' }}
              style={styles.video}
              resizeMode={ResizeMode.COVER}
              shouldPlay={isPlaying}
              isLooping={false}
              isMuted={isMuted}
              onPlaybackStatusUpdate={handlePlaybackStatusUpdate}
            />
          </TouchableOpacity>

          {/* Top Gradient Overlay */}
          <View style={styles.topGradient}>
            {/* Close Button */}
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Ionicons name="close" size={32} color="#fff" />
            </TouchableOpacity>
          </View>

          {/* Bottom Gradient Overlay */}
          <View style={styles.bottomGradient}>
            {/* User Info */}
            <View style={styles.userInfo}>
              <View style={styles.userHeader}>
                <View style={styles.avatarContainer}>
                  <Ionicons name={currentReel.user.avatar as any} size={24} color="#fff" />
                </View>
                <View style={styles.userDetails}>
                  <View style={styles.nameRow}>
                    <Text style={styles.userName}>{currentReel.user.name}</Text>
                    {currentReel.user.verified && (
                      <Ionicons name="checkmark-circle" size={16} color="#0095f6" />
                    )}
                  </View>
                  <Text style={styles.userTitle}>{currentReel.user.title}</Text>
                </View>
                <TouchableOpacity style={styles.followButton}>
                  <Text style={styles.followText}>Follow</Text>
                </TouchableOpacity>
              </View>
              
              {/* Caption */}
              <Text style={styles.caption} numberOfLines={2}>
                {currentReel.content}
              </Text>
            </View>

            {/* Progress Bar */}
            {showControls && (
              <View style={styles.progressContainer}>
                <Text style={styles.timeText}>{formatTime(progress)}</Text>
                <TouchableOpacity
                  style={styles.progressBar}
                  onPress={handleProgressBarPress}
                  activeOpacity={1}
                >
                  <View style={styles.progressBackground}>
                    <View
                      style={[
                        styles.progressFill,
                        { width: `${(progress / duration) * 100}%` },
                      ]}
                    />
                  </View>
                </TouchableOpacity>
                <Text style={styles.timeText}>{formatTime(duration)}</Text>
              </View>
            )}
          </View>

          {/* Right Side Actions */}
          <View style={styles.rightActions}>
            {/* Like */}
            <TouchableOpacity style={styles.actionButton} onPress={handleLike}>
              <Ionicons
                name={isLiked ? 'heart' : 'heart-outline'}
                size={32}
                color={isLiked ? '#ed4956' : '#fff'}
              />
              <Text style={styles.actionText}>
                {(currentReel.likes + (isLiked ? 1 : 0)).toLocaleString()}
              </Text>
            </TouchableOpacity>

            {/* Comment */}
            <TouchableOpacity style={styles.actionButton} onPress={handleComment}>
              <Ionicons name="chatbubble-outline" size={32} color="#fff" />
              <Text style={styles.actionText}>{currentReel.comments}</Text>
            </TouchableOpacity>

            {/* Share */}
            <TouchableOpacity style={styles.actionButton} onPress={handleShare}>
              <Ionicons name="paper-plane-outline" size={32} color="#fff" />
              <Text style={styles.actionText}>{currentReel.shares}</Text>
            </TouchableOpacity>

            {/* More */}
            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="ellipsis-horizontal" size={32} color="#fff" />
            </TouchableOpacity>

            {/* Mute/Unmute */}
            <TouchableOpacity style={styles.actionButton} onPress={handleMuteToggle}>
              <Ionicons
                name={isMuted ? 'volume-mute' : 'volume-high'}
                size={28}
                color="#fff"
              />
            </TouchableOpacity>
          </View>

          {/* Play/Pause Button (center) */}
          {showControls && !isPlaying && (
            <TouchableOpacity style={styles.playPauseButton} onPress={handlePlayPause}>
              <Ionicons name="play" size={60} color="#fff" />
            </TouchableOpacity>
          )}

          {/* Like Animation */}
          <LikeAnimation 
            show={showLikeAnimation} 
            onComplete={() => setShowLikeAnimation(false)}
          />
        </Animated.View>
      </View>

      {/* Comments Modal */}
      <CommentsModal
        visible={showCommentsModal}
        onClose={() => setShowCommentsModal(false)}
        postId={currentReel.id}
        commentCount={currentReel.comments}
      />

      {/* Share Modal */}
      <ShareModal
        visible={showShareModal}
        onClose={() => setShowShareModal(false)}
        postId={currentReel.id}
        postTitle={currentReel.content}
      />
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  videoContainer: {
    flex: 1,
    position: 'relative',
  },
  videoTouchable: {
    flex: 1,
  },
  video: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
  },
  topGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 120,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    paddingTop: 50,
    paddingHorizontal: 16,
  },
  closeButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingBottom: 40,
    paddingHorizontal: 16,
    paddingTop: 60,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  userInfo: {
    marginBottom: 16,
  },
  userHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    borderWidth: 2,
    borderColor: '#fff',
  },
  userDetails: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  userName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
    marginRight: 6,
  },
  userTitle: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  followButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: '#fff',
  },
  followText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
  },
  caption: {
    fontSize: 14,
    color: '#fff',
    lineHeight: 20,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  progressBar: {
    flex: 1,
    height: 30,
    justifyContent: 'center',
  },
  progressBackground: {
    height: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#fff',
  },
  timeText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '600',
    minWidth: 40,
  },
  rightActions: {
    position: 'absolute',
    right: 16,
    bottom: 200,
    gap: 32,
  },
  actionButton: {
    alignItems: 'center',
    gap: 6,
  },
  actionText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '600',
  },
  playPauseButton: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -40 }, { translateY: -40 }],
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ReelViewer;

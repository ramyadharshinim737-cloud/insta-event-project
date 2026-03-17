import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Animated,
  Dimensions,
  Modal,
  Image,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Video, AVPlaybackStatus } from 'expo-av';
import { UserStories, storiesApi } from '../services/stories.api';

const { width, height } = Dimensions.get('screen');

interface StoryViewerProps {
  visible: boolean;
  stories: UserStories[];
  initialIndex: number;
  onClose: () => void;
}

const StoryViewer: React.FC<StoryViewerProps> = ({
  visible,
  stories,
  initialIndex,
  onClose,
}) => {
  const [currentUserIndex, setCurrentUserIndex] = useState(initialIndex);
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
  const [progress] = useState(new Animated.Value(0));
  const [isLiked, setIsLiked] = useState(false);
  const [comment, setComment] = useState('');
  const [showCommentInput, setShowCommentInput] = useState(false);
  const videoRef = useRef<Video>(null);

  const currentUserStory = stories[currentUserIndex];
  const currentStory = currentUserStory?.stories[currentStoryIndex];
  const STORY_DURATION = currentStory?.duration ? currentStory.duration * 1000 : 5000;

  useEffect(() => {
    if (visible) {
      setCurrentUserIndex(initialIndex);
      setCurrentStoryIndex(0);
    }
  }, [visible, initialIndex]);

  useEffect(() => {
    if (visible && currentStory) {
      startProgress();
      // Mark story as viewed
      markStoryAsViewed();
      
      // Play video if it's a video story
      if (currentStory.mediaType === 'video' && videoRef.current) {
        videoRef.current.playAsync();
      }
    }
    
    return () => {
      // Pause video when leaving
      if (videoRef.current) {
        videoRef.current.pauseAsync();
      }
    };
  }, [currentUserIndex, currentStoryIndex, visible]);

  const markStoryAsViewed = async () => {
    if (currentStory && !currentStory.hasViewed) {
      try {
        await storiesApi.viewStory(currentStory.id);
      } catch (error) {
        console.error('Failed to mark story as viewed:', error);
      }
    }
  };

  const startProgress = () => {
    progress.setValue(0);
    Animated.timing(progress, {
      toValue: 1,
      duration: STORY_DURATION,
      useNativeDriver: false,
    }).start(({ finished }) => {
      if (finished) {
        handleNext();
      }
    });
  };

  const handleNext = () => {
    // Move to next story in current user's stories
    if (currentStoryIndex < currentUserStory.stories.length - 1) {
      setCurrentStoryIndex(currentStoryIndex + 1);
      setIsLiked(false);
    } 
    // Move to next user's stories
    else if (currentUserIndex < stories.length - 1) {
      setCurrentUserIndex(currentUserIndex + 1);
      setCurrentStoryIndex(0);
      setIsLiked(false);
    } 
    // No more stories, close viewer
    else {
      onClose();
    }
  };

  const handlePrevious = () => {
    // Move to previous story in current user's stories
    if (currentStoryIndex > 0) {
      setCurrentStoryIndex(currentStoryIndex - 1);
      setIsLiked(false);
    } 
    // Move to previous user's stories
    else if (currentUserIndex > 0) {
      setCurrentUserIndex(currentUserIndex - 1);
      const prevUserStories = stories[currentUserIndex - 1];
      setCurrentStoryIndex(prevUserStories.stories.length - 1);
      setIsLiked(false);
    }
  };

  const handleLike = () => {
    setIsLiked(!isLiked);
  };

  const handleSendComment = () => {
    if (comment.trim()) {
      // Handle comment submission
      console.log('Comment:', comment);
      setComment('');
      setShowCommentInput(false);
    }
  };

  if (!visible || !currentUserStory || !currentStory) return null;

  return (
    <Modal
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={styles.container}>
        {/* Story Content */}
        <View
          style={[
            styles.storyContent,
            { backgroundColor: currentStory.backgroundColor || '#000' },
          ]}
        >
          {/* Progress Bars */}
          <View style={styles.progressContainer}>
            {currentUserStory.stories.map((_, index) => (
              <View key={index} style={styles.progressBarBackground}>
                <Animated.View
                  style={[
                    styles.progressBar,
                    {
                      width:
                        index === currentStoryIndex
                          ? progress.interpolate({
                              inputRange: [0, 1],
                              outputRange: ['0%', '100%'],
                            })
                          : index < currentStoryIndex
                          ? '100%'
                          : '0%',
                    },
                  ]}
                />
              </View>
            ))}
          </View>

          {/* Story Content - Image or Video */}
          {currentStory.mediaType === 'video' && currentStory.mediaUrl ? (
            <Video
              ref={videoRef}
              source={{ uri: currentStory.mediaUrl }}
              style={styles.storyVideo}
              resizeMode="contain"
              shouldPlay={visible}
              isLooping={false}
              onPlaybackStatusUpdate={(status: AVPlaybackStatus) => {
                if (status.isLoaded && status.didJustFinish) {
                  handleNext();
                }
              }}
            />
          ) : currentStory.mediaType === 'image' && currentStory.mediaUrl ? (
            <Image
              source={{ uri: currentStory.mediaUrl }}
              style={styles.storyImage}
              resizeMode="contain"
            />
          ) : currentStory.caption ? (
            <View style={styles.contentContainer}>
              <Text style={styles.contentText}>{currentStory.caption}</Text>
            </View>
          ) : null}

          {/* Header with gradient overlay for photos */}
          {currentStory.mediaUrl && <View style={styles.headerGradient} />}
          
          <View style={styles.header}>
            <View style={styles.userInfo}>
              <View style={styles.avatarContainer}>
                <Ionicons name="person-circle" size={32} color="#fff" />
              </View>
              <View>
                <View style={styles.nameRow}>
                  <Text style={styles.userName}>{currentUserStory.user.name}</Text>
                </View>
                <Text style={styles.timestamp}>
                  {new Date(currentStory.timestamp).toLocaleDateString()}
                </Text>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={28} color="#fff" />
            </TouchableOpacity>
          </View>

          {/* Navigation Arrows */}
          {(currentUserIndex > 0 || currentStoryIndex > 0) && (
            <TouchableOpacity style={styles.navArrowLeft} onPress={handlePrevious}>
              <Ionicons name="chevron-back" size={32} color="#fff" />
            </TouchableOpacity>
          )}
          
          {(currentUserIndex < stories.length - 1 || currentStoryIndex < currentUserStory.stories.length - 1) && (
            <TouchableOpacity style={styles.navArrowRight} onPress={handleNext}>
              <Ionicons name="chevron-forward" size={32} color="#fff" />
            </TouchableOpacity>
          )}

          {/* Tap Navigation Areas (invisible) */}
          <View style={styles.navigationContainer}>
            <TouchableOpacity
              style={styles.navLeft}
              onPress={handlePrevious}
              activeOpacity={1}
            />
            <TouchableOpacity
              style={styles.navRight}
              onPress={handleNext}
              activeOpacity={1}
            />
          </View>
        </View>

        {/* Bottom Actions */}
        <View style={styles.bottomActions}>
          {/* Like Button */}
          <TouchableOpacity onPress={handleLike} style={styles.actionButton}>
            <Ionicons
              name={isLiked ? 'heart' : 'heart-outline'}
              size={28}
              color={isLiked ? '#ed4956' : '#fff'}
            />
          </TouchableOpacity>

          {/* Comment Input */}
          {showCommentInput ? (
            <View style={styles.commentInputContainer}>
              <TouchableOpacity 
                onPress={() => {
                  setShowCommentInput(false);
                  setComment('');
                }}
                style={styles.cancelButton}
              >
                <Ionicons name="close-circle" size={24} color="rgba(255, 255, 255, 0.7)" />
              </TouchableOpacity>
              <TextInput
                style={styles.commentInput}
                placeholder="Add a comment..."
                placeholderTextColor="rgba(255, 255, 255, 0.6)"
                value={comment}
                onChangeText={setComment}
                autoFocus
              />
              {comment.trim().length > 0 && (
                <TouchableOpacity onPress={handleSendComment} style={styles.sendButton}>
                  <Ionicons name="send" size={22} color="#0095f6" />
                </TouchableOpacity>
              )}
            </View>
          ) : (
            <TouchableOpacity
              style={styles.commentButton}
              onPress={() => setShowCommentInput(true)}
            >
              <Ionicons name="chatbubble-outline" size={28} color="#fff" />
            </TouchableOpacity>
          )}

          {/* Share Button */}
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="paper-plane-outline" size={28} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  storyContent: {
    flex: 1,
    width: width,
    height: height,
  },
  progressContainer: {
    flexDirection: 'row',
    paddingHorizontal: 8,
    paddingTop: (StatusBar.currentHeight || 0) + 8,
    gap: 4,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 20,
  },
  progressBarBackground: {
    flex: 1,
    height: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 1,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#fff',
  },
  headerGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 120,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  header: {
    position: 'absolute',
    top: (StatusBar.currentHeight || 0) + 40,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    zIndex: 10,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  userName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  timestamp: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 2,
  },
  closeButton: {
    padding: 4,
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  contentText: {
    fontSize: 24,
    fontWeight: '600',
    color: '#fff',
    textAlign: 'center',
    lineHeight: 32,
  },
  storyImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: width,
    height: height,
  },
  storyVideo: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: width,
    height: height,
    backgroundColor: '#000',
  },
  navigationContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 100,
    flexDirection: 'row',
  },
  navLeft: {
    flex: 1,
  },
  navRight: {
    flex: 1,
  },
  navArrowLeft: {
    position: 'absolute',
    left: 16,
    top: '50%',
    marginTop: -20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 5,
  },
  navArrowRight: {
    position: 'absolute',
    right: 16,
    top: '50%',
    marginTop: -20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 5,
  },
  bottomActions: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    gap: 12,
  },
  actionButton: {
    padding: 8,
  },
  commentButton: {
    flex: 1,
    padding: 8,
  },
  commentInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
  },
  cancelButton: {
    padding: 2,
  },
  commentInput: {
    flex: 1,
    fontSize: 15,
    color: '#fff',
  },
  sendButton: {
    padding: 4,
  },
});

export default StoryViewer;

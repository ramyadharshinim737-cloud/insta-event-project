import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { UserStories } from '../services/stories.api';

interface StoryCarouselProps {
  stories: UserStories[];
  userStories?: any[];
  onStoryPress?: (index: number) => void;
  onAddStory?: () => void;
  onYourStoryPress?: () => void;
  currentUserName?: string;
  currentUserProfileImage?: string | null;
}

const StoryCarousel: React.FC<StoryCarouselProps> = ({
  stories,
  userStories = [],
  onStoryPress,
  onAddStory,
  onYourStoryPress,
  currentUserName,
  currentUserProfileImage
}) => {
  const hasUserStories = userStories.length > 0;
  const latestUserStory = hasUserStories ? userStories[userStories.length - 1] : null;

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Your Story / Add Story */}
        <TouchableOpacity
          style={styles.storyItem}
          onPress={hasUserStories ? onYourStoryPress : onAddStory}
          activeOpacity={0.7}
        >
          <View style={[
            styles.storyRing,
            hasUserStories ? styles.activeStoryRing : styles.addStoryRing
          ]}>
            <View style={styles.storyAvatar}>
              {currentUserProfileImage ? (
                <Image
                  source={{ uri: currentUserProfileImage }}
                  style={styles.avatarImage}
                />
              ) : (
                <Ionicons name="person-circle" size={66} color="#CCCCCC" />
              )}
            </View>
            {!hasUserStories && (
              <View style={styles.addIconBadge}>
                <Ionicons name="add" size={20} color="#FFFFFF" />
              </View>
            )}
          </View>
          <Text style={styles.storyName} numberOfLines={1} ellipsizeMode="tail">
            {currentUserName ? currentUserName.split(' ')[0] : 'Your Story'}
          </Text>
        </TouchableOpacity>

        {/* Other Stories */}
        {stories.map((userStory, index) => (
          <TouchableOpacity
            key={userStory.user.id}
            style={styles.storyItem}
            onPress={() => onStoryPress?.(index)}
            activeOpacity={0.7}
          >
            <View style={[
              styles.storyRing,
              userStory.stories.length > 0 && styles.activeStoryRing
            ]}>
              <View style={styles.storyAvatar}>
                {userStory.user.profileImageUrl ? (
                  <Image
                    source={{ uri: userStory.user.profileImageUrl }}
                    style={styles.avatarImage}
                  />
                ) : (
                  <Ionicons name="person-circle" size={66} color="#CCCCCC" />
                )}
              </View>
            </View>
            <Text style={styles.storyName} numberOfLines={1} ellipsizeMode="tail">
              {userStory.user.name.split(' ')[0]}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#DBDBDB',
  },
  scrollContent: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 16,
  },
  storyItem: {
    alignItems: 'center',
    width: 80,
  },
  storyRing: {
    width: 74,
    height: 74,
    borderRadius: 37,
    padding: 2,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    position: 'relative',
    borderWidth: 2,
    borderColor: '#DBDBDB',
  },
  unviewedRing: {
    borderColor: '#E1306C',
    ...Platform.select({
      ios: {
        shadowColor: '#E1306C',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  activeStoryRing: {
    borderWidth: 3,
    borderColor: '#0A66C2', // Blue color for active story ring
  },
  addStoryRing: {
    borderColor: '#DBDBDB',
    borderWidth: 2,
  },
  storyAvatar: {
    width: 66,
    height: 66,
    borderRadius: 33,
    backgroundColor: '#FAFAFA',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  addIconBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#0A66C2',
    borderRadius: 14,
    width: 28,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  storyName: {
    fontSize: 12,
    color: '#262626',
    marginTop: 6,
    textAlign: 'center',
    fontWeight: '400',
    maxWidth: 80,
  },
});

export default StoryCarousel;

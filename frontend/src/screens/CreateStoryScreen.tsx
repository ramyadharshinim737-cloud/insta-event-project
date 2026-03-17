import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  ActivityIndicator,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Video } from 'expo-av';
import { MediaPickerService, MediaResult } from '../utils/MediaPickerService';
import BottomNavigation from '../components/BottomNavigation';
import { useStories } from '../context/StoryContext';
import { useUser } from '../context/UserContext';
import { storiesApi } from '../services/stories.api';

interface CreateStoryScreenProps {
  navigation?: any;
}

interface StoryData {
  content: string;
  mediaType?: 'image' | 'video' | null;
  mediaUri?: string;
  hashtags?: string[];
}

const CreateStoryScreen: React.FC<CreateStoryScreenProps> = ({ navigation }) => {
  const { addStory } = useStories();
  const { userState } = useUser();
  const [storyText, setStoryText] = useState('');
  const [mediaUri, setMediaUri] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<'image' | 'video' | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Get current user data from UserContext
  const currentUser = {
    id: userState.profile?.id || 'current_user',
    name: userState.profile?.fullName || 'User',
    title: userState.profile?.title || '',
    avatar: 'person-circle',
  };

  const extractHashtags = (text: string): string[] => {
    const hashtagRegex = /#[\w]+/g;
    return text.match(hashtagRegex) || [];
  };

  const validateStory = (): boolean => {
    if (!storyText.trim() && !mediaUri) {
      Alert.alert('Error', 'Please add some text or media to your story');
      return false;
    }
    if (storyText.length > 500) {
      Alert.alert('Error', 'Story text cannot exceed 500 characters');
      return false;
    }
    return true;
  };

  const handlePost = async () => {
    if (!validateStory()) return;

    setIsLoading(true);

    try {
      console.log('📱 Posting story to backend...');
      
      // If there's media, use the media upload API
      if (mediaUri && mediaType) {
        const fileName = mediaUri.split('/').pop() || `story_${Date.now()}`;
        
        // Ensure proper file extension and mime type
        let finalFileName = fileName;
        let mimeType = 'image/jpeg';
        
        if (mediaType === 'video') {
          // Ensure video has proper extension
          if (!finalFileName.match(/\.(mp4|mov|m4v)$/i)) {
            finalFileName = `${finalFileName.replace(/\.[^.]+$/, '')}.mp4`;
          }
          mimeType = 'video/mp4';
        } else {
          // Ensure image has proper extension
          if (!finalFileName.match(/\.(jpg|jpeg|png|gif)$/i)) {
            finalFileName = `${finalFileName.replace(/\.[^.]+$/, '')}.jpg`;
          }
          mimeType = 'image/jpeg';
        }
        
        console.log('📤 Uploading story with media:', { 
          fileName: finalFileName, 
          mimeType, 
          mediaType,
          caption: storyText 
        });
        
        await storiesApi.createStoryWithMedia(
          {
            uri: mediaUri,
            type: mimeType,
            name: finalFileName,
          },
          storyText.trim() || undefined,
          undefined, // backgroundColor
          mediaType === 'video' ? 15 : 5 // duration: 15s for video, 5s for image
        );
      } else {
        // Text-only story
        console.log('📝 Creating text-only story:', storyText);
        
        await storiesApi.createStory({
          mediaUrl: 'text-only', // Placeholder for text-only stories
          mediaType: 'image',
          caption: storyText.trim(),
          backgroundColor: '#0A66C2',
          duration: 5,
        });
      }
      
      console.log('✅ Story posted successfully to backend');
      
      // Also save to local context for immediate display
      await addStory({
        user: currentUser,
        content: storyText.trim(),
        mediaType: mediaType || undefined,
        mediaUri: mediaUri || undefined,
        backgroundColor: !mediaUri ? '#0A66C2' : undefined,
      });
      
      // Reset form
      setStoryText('');
      setMediaUri(null);
      setMediaType(null);
      
      Alert.alert('Success', 'Story posted!', [
        { text: 'OK', onPress: () => navigation?.navigate('Home') }
      ]);
    } catch (error: any) {
      console.error('❌ Error posting story:', error);
      Alert.alert(
        'Error', 
        error.message || 'Failed to post story. Please check your connection and try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddPhoto = async () => {
    const options = [
      { 
        text: 'Choose from Gallery', 
        onPress: async () => {
          const result = await MediaPickerService.pickImage();
          if (result) {
            setMediaUri(result.uri);
            setMediaType('image');
          }
        }
      },
      { 
        text: 'Take Photo', 
        onPress: async () => {
          const result = await MediaPickerService.takePhoto();
          if (result) {
            setMediaUri(result.uri);
            setMediaType('image');
          }
        }
      },
      { text: 'Cancel', style: 'cancel' as const }
    ];
    Alert.alert('Add Photo', 'Choose an option', options);
  };

  const handleAddVideo = async () => {
    const options = [
      { 
        text: 'Choose from Gallery', 
        onPress: async () => {
          const result = await MediaPickerService.pickVideo();
          if (result) {
            setMediaUri(result.uri);
            setMediaType('video');
          }
        }
      },
      { 
        text: 'Record Video', 
        onPress: async () => {
          const result = await MediaPickerService.recordVideo();
          if (result) {
            setMediaUri(result.uri);
            setMediaType('video');
          }
        }
      },
      { text: 'Cancel', style: 'cancel' as const }
    ];
    Alert.alert('Add Video', 'Choose an option', options);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation?.goBack()} disabled={isLoading}>
          <Ionicons name="close" size={28} color="#262626" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Share Story</Text>
        <TouchableOpacity onPress={handlePost} disabled={isLoading}>
          {isLoading ? (
            <ActivityIndicator size="small" color="#0A66C2" />
          ) : (
            <Text style={styles.postButton}>Post</Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {/* Story Input */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="What's on your mind?"
            placeholderTextColor="#999"
            multiline
            value={storyText}
            onChangeText={setStoryText}
            maxLength={500}
            autoFocus
            editable={!isLoading}
          />
          <Text style={styles.charCount}>{storyText.length}/500</Text>
        </View>

        {/* Media Preview */}
        {mediaUri && (
          <View style={styles.mediaPreview}>
            {mediaType === 'image' ? (
              <Image source={{ uri: mediaUri }} style={styles.previewImage} />
            ) : (
              <Video
                source={{ uri: mediaUri }}
                style={styles.previewVideo}
                useNativeControls
                resizeMode="contain"
                isLooping
              />
            )}
            <TouchableOpacity 
              style={styles.removeMedia}
              onPress={() => {
                setMediaUri(null);
                setMediaType(null);
              }}
            >
              <Ionicons name="close-circle" size={28} color="#fff" />
            </TouchableOpacity>
          </View>
        )}

        {/* Media Options */}
        <View style={styles.mediaOptions}>
          <TouchableOpacity 
            style={styles.mediaButton}
            onPress={handleAddPhoto}
            disabled={isLoading}
          >
            <Ionicons name="image-outline" size={24} color="#0A66C2" />
            <Text style={styles.mediaText}>Add Photo</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.mediaButton}
            onPress={handleAddVideo}
            disabled={isLoading}
          >
            <Ionicons name="videocam-outline" size={24} color="#0A66C2" />
            <Text style={styles.mediaText}>Add Video</Text>
          </TouchableOpacity>
        </View>

        {/* Quick Tips */}
        <View style={styles.tipsContainer}>
          <Text style={styles.tipsTitle}>💡 Quick Tips</Text>
          <Text style={styles.tipText}>• Keep it short and engaging</Text>
          <Text style={styles.tipText}>• Share updates about your work</Text>
          <Text style={styles.tipText}>• Use hashtags to reach more people</Text>
        </View>
      </ScrollView>

      {/* Bottom Navigation */}
      <BottomNavigation activeTab="Create" navigation={navigation} />
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
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#262626',
  },
  postButton: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0A66C2',
  },
  content: {
    flex: 1,
  },
  inputContainer: {
    padding: 16,
  },
  input: {
    fontSize: 16,
    color: '#262626',
    minHeight: 150,
    textAlignVertical: 'top',
  },
  charCount: {
    fontSize: 12,
    color: '#999',
    textAlign: 'right',
    marginTop: 8,
  },
  mediaOptions: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 12,
  },
  mediaButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#0A66C2',
    borderRadius: 8,
    gap: 8,
  },
  mediaText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0A66C2',
  },
  mediaPreview: {
    margin: 16,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  previewImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
  },
  previewVideo: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    backgroundColor: '#000',
  },
  videoPreview: {
    width: '100%',
    height: 200,
    backgroundColor: '#f0f0f0',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoText: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
  },
  removeMedia: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 14,
  },
  tipsContainer: {
    margin: 16,
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#262626',
    marginBottom: 12,
  },
  tipText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
});

export default CreateStoryScreen;

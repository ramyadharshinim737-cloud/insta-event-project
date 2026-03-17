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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Video } from 'expo-av';
import { LinearGradient } from 'expo-linear-gradient';
import BottomNavigation from '../components/BottomNavigation';
import { MediaPickerService } from '../utils/MediaPickerService';
import { postsApi } from '../services/posts.api';

interface CreateReelScreenProps {
  navigation?: any;
}

const CreateReelScreen: React.FC<CreateReelScreenProps> = ({ navigation }) => {
  const [caption, setCaption] = useState('');
  const [selectedOption, setSelectedOption] = useState<'record' | 'upload' | null>(null);
  const [videoUri, setVideoUri] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleRecord = async () => {
    setSelectedOption('record');
    const result = await MediaPickerService.recordVideo();
    if (result) {
      setVideoUri(result.uri);
    }
  };

  const handleUpload = async () => {
    setSelectedOption('upload');
    const result = await MediaPickerService.pickVideo();
    if (result) {
      setVideoUri(result.uri);
    }
  };

  const handlePost = async () => {
    if (!videoUri) {
      Alert.alert('Error', 'Please select or record a video');
      return;
    }

    if (!caption.trim()) {
      Alert.alert('Error', 'Please add a caption');
      return;
    }

    setIsLoading(true);

    try {
      console.log('🎬 Uploading reel to backend...');
      
      // Prepare video file for upload
      const fileName = videoUri.split('/').pop() || `reel_${Date.now()}.mp4`;
      const finalFileName = fileName.match(/\.(mp4|mov|m4v)$/i) 
        ? fileName 
        : `${fileName.replace(/\.[^.]+$/, '')}.mp4`;
      
      const mediaFile = {
        uri: videoUri,
        type: 'video' as const,
        name: finalFileName
      };
      
      // Add 🎬 emoji to caption to mark it as a reel
      const reelCaption = `🎬 ${caption}`;
      
      console.log('📤 Uploading reel video:', finalFileName);
      
      // Upload reel using posts API with media
      await postsApi.createPostWithMedia(reelCaption, [mediaFile]);
      
      console.log('✅ Reel posted successfully');
      
      // Reset form
      setCaption('');
      setVideoUri(null);
      setSelectedOption(null);
      
      Alert.alert('Success', 'Reel posted!', [
        { text: 'OK', onPress: () => navigation?.navigate('Home') }
      ]);
    } catch (error: any) {
      console.error('❌ Error posting reel:', error);
      Alert.alert('Error', error.message || 'Failed to post reel. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation?.goBack()} disabled={isLoading}>
          <Ionicons name="close" size={28} color="#262626" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Reel</Text>
        <TouchableOpacity onPress={handlePost} disabled={isLoading}>
          {isLoading ? (
            <ActivityIndicator size="small" color="#0A66C2" />
          ) : (
            <Text style={styles.postButton}>Post</Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {/* Record/Upload Options */}
        <View style={styles.optionsContainer}>
          <Text style={styles.sectionTitle}>Choose an option</Text>
          
          <TouchableOpacity
            style={styles.optionCard}
            onPress={handleRecord}
            activeOpacity={0.8}
            disabled={isLoading}
          >
            <LinearGradient
              colors={['#EC4899', '#F472B6'] as const}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.gradientCard}
            >
              <View style={styles.iconCircle}>
                <Ionicons name="videocam" size={32} color="#fff" />
              </View>
              <Text style={styles.optionTitle}>Record Video</Text>
              <Text style={styles.optionDescription}>
                Record a new reel using your camera
              </Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.optionCard}
            onPress={handleUpload}
            activeOpacity={0.8}
            disabled={isLoading}
          >
            <LinearGradient
              colors={['#7C3AED', '#A855F7'] as const}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.gradientCard}
            >
              <View style={styles.iconCircle}>
                <Ionicons name="cloud-upload" size={32} color="#fff" />
              </View>
              <Text style={styles.optionTitle}>Upload Video</Text>
              <Text style={styles.optionDescription}>
                Choose a video from your gallery
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Video Preview */}
        {videoUri && (
          <View style={styles.videoPreviewContainer}>
            <Video
              source={{ uri: videoUri }}
              style={styles.videoPreview}
              useNativeControls
              resizeMode="contain"
              isLooping
            />
            <TouchableOpacity 
              style={styles.removeVideo}
              onPress={() => {
                setVideoUri(null);
                setSelectedOption(null);
              }}
              disabled={isLoading}
            >
              <Ionicons name="close-circle" size={28} color="#fff" />
            </TouchableOpacity>
          </View>
        )}

        {/* Caption Input */}
        <View style={styles.captionContainer}>
          <Text style={styles.sectionTitle}>Add a caption</Text>
          <TextInput
            style={styles.captionInput}
            placeholder="Write a catchy caption..."
            placeholderTextColor="#999"
            multiline
            value={caption}
            onChangeText={setCaption}
            maxLength={150}
            editable={!isLoading}
          />
          <Text style={styles.charCount}>{caption.length}/150</Text>
        </View>

        {/* Reel Tips */}
        <View style={styles.tipsContainer}>
          <Text style={styles.tipsTitle}>🎬 Reel Tips</Text>
          <Text style={styles.tipText}>• Keep it under 60 seconds</Text>
          <Text style={styles.tipText}>• Use vertical format (9:16)</Text>
          <Text style={styles.tipText}>• Add trending music or sounds</Text>
          <Text style={styles.tipText}>• Include captions for accessibility</Text>
          <Text style={styles.tipText}>• Use hashtags to increase reach</Text>
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
  optionsContainer: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#262626',
    marginBottom: 16,
  },
  optionCard: {
    marginBottom: 16,
  },
  gradientCard: {
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  optionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 8,
  },
  optionDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
  },
  captionContainer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  captionInput: {
    fontSize: 16,
    color: '#262626',
    minHeight: 80,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
  },
  charCount: {
    fontSize: 12,
    color: '#999',
    textAlign: 'right',
    marginTop: 8,
  },
  videoPreviewContainer: {
    margin: 16,
    marginTop: 0,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  videoPreview: {
    width: '100%',
    height: 400,
    backgroundColor: '#000',
    borderRadius: 12,
  },
  videoPlaceholder: {
    width: '100%',
    height: 200,
    backgroundColor: '#f0f0f0',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  videoSelectedText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0A66C2',
    marginTop: 12,
  },
  videoUriText: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  removeVideo: {
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

export default CreateReelScreen;

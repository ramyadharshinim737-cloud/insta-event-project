// Stories API service
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getApiUrl } from './api';

export interface StoryUser {
  id: string;
  name: string;
  email: string;
  avatar: string;
  profileImageUrl?: string;
}

export interface StoryItem {
  id: string;
  mediaUrl: string;
  mediaType: 'image' | 'video';
  caption?: string;
  backgroundColor?: string;
  duration: number;
  viewCount: number;
  hasViewed: boolean;
  timestamp: string;
  expiresAt: string;
}

export interface UserStories {
  user: StoryUser;
  stories: StoryItem[];
  isOwn: boolean;
}

export interface CreateStoryData {
  mediaUrl: string;
  mediaType: 'image' | 'video';
  caption?: string;
  backgroundColor?: string;
  duration?: number;
}

// Helper to get authorization headers
const getAuthHeaders = async () => {
  const token = await AsyncStorage.getItem('token');
  if (!token) {
    console.warn('⚠️ No token found in AsyncStorage');
    throw new Error('No authentication token found');
  }
  console.log('🔑 Token retrieved for stories:', token.substring(0, 20) + '...');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  };
};

export const storiesApi = {
  // Get all active stories
  getStories: async (): Promise<UserStories[]> => {
    console.log('📱 Fetching stories...');
    try {
      const apiUrl = await getApiUrl();
      const headers = await getAuthHeaders();
      const response = await fetch(`${apiUrl}/api/stories`, {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        const error = await response.json();
        if (response.status === 401) {
          // Token is invalid/expired - clear auth and force re-login
          await AsyncStorage.removeItem('token');
          await AsyncStorage.removeItem('user');
          console.error('🚫 Token expired - please log in again');
          throw new Error('Session expired. Please log in again.');
        }
        console.error('❌ Get stories error:', error);
        throw new Error(error.error || 'Failed to fetch stories');
      }

      const data = await response.json();
      console.log('✅ Stories fetched successfully:', data.stories.length);
      return data.stories;
    } catch (error: any) {
      console.error('❌ Get stories error:', error);
      throw error;
    }
  },

  // Get my stories
  getMyStories: async (): Promise<StoryItem[]> => {
    console.log('📱 Fetching my stories...');
    try {
      const apiUrl = await getApiUrl();
      const headers = await getAuthHeaders();
      const response = await fetch(`${apiUrl}/api/stories/my-stories`, {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        const error = await response.json();
        console.error('❌ Get my stories error:', error);
        throw new Error(error.error || 'Failed to fetch my stories');
      }

      const data = await response.json();
      console.log('✅ My stories fetched successfully:', data.stories.length);
      return data.stories;
    } catch (error: any) {
      console.error('❌ Get my stories error:', error);
      throw error;
    }
  },

  // Create a story
  createStory: async (storyData: CreateStoryData): Promise<StoryItem> => {
    console.log('📱 Creating story...');
    try {
      const apiUrl = await getApiUrl();
      const headers = await getAuthHeaders();
      const response = await fetch(`${apiUrl}/api/stories`, {
        method: 'POST',
        headers,
        body: JSON.stringify(storyData),
      });

      if (!response.ok) {
        const error = await response.json();
        console.error('❌ Create story error:', error);
        throw new Error(error.error || 'Failed to create story');
      }

      const data = await response.json();
      console.log('✅ Story created successfully');
      return data.story;
    } catch (error: any) {
      console.error('❌ Create story error:', error);
      throw error;
    }
  },

  // Create story with media upload
  createStoryWithMedia: async (
    mediaFile: { uri: string; type: string; name: string },
    caption?: string,
    backgroundColor?: string,
    duration?: number
  ): Promise<StoryItem> => {
    console.log('📱 Creating story with media...');
    try {
      const apiUrl = await getApiUrl();
      const token = await AsyncStorage.getItem('token');
      const formData = new FormData();
      
      // Add media file with proper format for React Native
      formData.append('media', {
        uri: mediaFile.uri,
        type: mediaFile.type,
        name: mediaFile.name,
      } as any);
      
      if (caption) formData.append('caption', caption);
      if (backgroundColor) formData.append('backgroundColor', backgroundColor);
      if (duration) formData.append('duration', duration.toString());

      console.log('📤 Uploading story media:', mediaFile.name);

      const response = await fetch(`${apiUrl}/api/stories/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          // Don't set Content-Type for FormData, browser will set it with boundary
        },
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        console.error('❌ Create story with media error:', error);
        throw new Error(error.error || 'Failed to create story with media');
      }

      const data = await response.json();
      console.log('✅ Story with media created successfully');
      return data.story;
    } catch (error: any) {
      console.error('❌ Create story with media error:', error);
      throw error;
    }
  },

  // View a story
  viewStory: async (storyId: string): Promise<void> => {
    console.log('📱 Viewing story...');
    try {
      const apiUrl = await getApiUrl();
      const headers = await getAuthHeaders();
      const response = await fetch(`${apiUrl}/api/stories/${storyId}/view`, {
        method: 'POST',
        headers,
      });

      if (!response.ok) {
        const error = await response.json();
        console.error('❌ View story error:', error);
        throw new Error(error.error || 'Failed to view story');
      }

      console.log('✅ Story viewed successfully');
    } catch (error: any) {
      console.error('❌ View story error:', error);
      throw error;
    }
  },

  // Delete a story
  deleteStory: async (storyId: string): Promise<void> => {
    console.log('📱 Deleting story...');
    try {
      const apiUrl = await getApiUrl();
      const headers = await getAuthHeaders();
      const response = await fetch(`${apiUrl}/api/stories/${storyId}`, {
        method: 'DELETE',
        headers,
      });

      if (!response.ok) {
        const error = await response.json();
        console.error('❌ Delete story error:', error);
        throw new Error(error.error || 'Failed to delete story');
      }

      console.log('✅ Story deleted successfully');
    } catch (error: any) {
      console.error('❌ Delete story error:', error);
      throw error;
    }
  },

  // Get story viewers
  getStoryViewers: async (storyId: string): Promise<{ viewCount: number; viewers: any[] }> => {
    console.log('📱 Fetching story viewers...');
    try {
      const apiUrl = await getApiUrl();
      const headers = await getAuthHeaders();
      const response = await fetch(`${apiUrl}/api/stories/${storyId}/viewers`, {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        const error = await response.json();
        console.error('❌ Get story viewers error:', error);
        throw new Error(error.error || 'Failed to fetch story viewers');
      }

      const data = await response.json();
      console.log('✅ Story viewers fetched successfully');
      return data;
    } catch (error: any) {
      console.error('❌ Get story viewers error:', error);
      throw error;
    }
  },
};

/**
 * Upload API Service
 * Handles image and media uploads to Cloudinary via backend
 */

import { getApiUrl } from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface UploadResult {
  url: string;
  publicId: string;
}

/**
 * Upload an image to Cloudinary via backend
 */
export const uploadImage = async (imageUri: string): Promise<UploadResult> => {
  try {
    console.log('📤 Uploading image:', imageUri);

    // Get auth token
    const token = await AsyncStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found');
    }

    // Create form data
    const formData = new FormData();
    
    // Extract filename from URI
    const filename = imageUri.split('/').pop() || 'image.jpg';
    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `image/${match[1]}` : 'image/jpeg';

    // Add image to form data
    formData.append('image', {
      uri: imageUri,
      name: filename,
      type: type,
    } as any);

    // Get API URL
    const apiUrl = await getApiUrl();
    const url = `${apiUrl}/api/posts/upload/image`;

    console.log('📡 POST', url);

    // Upload image
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'multipart/form-data',
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.error || errorData.message || `HTTP ${response.status}`;
      console.error('❌ Upload failed:', errorMessage);
      throw new Error(errorMessage);
    }

    const result = await response.json();
    console.log('✅ Image uploaded:', result.url);

    return {
      url: result.url,
      publicId: result.publicId || '',
    };
  } catch (error: any) {
    console.error('❌ Upload error:', error);
    throw new Error(error.message || 'Failed to upload image');
  }
};

/**
 * Upload a video to Cloudinary via backend
 */
export const uploadVideo = async (videoUri: string): Promise<UploadResult> => {
  try {
    console.log('📤 Uploading video:', videoUri);

    // Get auth token
    const token = await AsyncStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found');
    }

    // Create form data
    const formData = new FormData();
    
    // Extract filename from URI
    const filename = videoUri.split('/').pop() || 'video.mp4';
    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `video/${match[1]}` : 'video/mp4';

    // Add video to form data
    formData.append('video', {
      uri: videoUri,
      name: filename,
      type: type,
    } as any);

    // Get API URL
    const apiUrl = await getApiUrl();
    const url = `${apiUrl}/api/posts/upload/video`;

    console.log('📡 POST', url);

    // Upload video
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'multipart/form-data',
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.error || errorData.message || `HTTP ${response.status}`;
      console.error('❌ Upload failed:', errorMessage);
      throw new Error(errorMessage);
    }

    const result = await response.json();
    console.log('✅ Video uploaded:', result.url);

    return {
      url: result.url,
      publicId: result.publicId || '',
    };
  } catch (error: any) {
    console.error('❌ Upload error:', error);
    throw new Error(error.message || 'Failed to upload video');
  }
};

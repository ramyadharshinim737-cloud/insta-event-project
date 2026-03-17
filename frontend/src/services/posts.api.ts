// Posts API service
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getApiUrl } from './api';

export interface PostMedia {
  url: string;
  type: 'image' | 'video';
}

export interface CreatePostData {
  caption: string;
  eventId?: string;
  communityId?: string;
  media?: PostMedia[];
}

export interface Post {
  _id: string;
  authorId: string;
  eventId?: string;
  communityId?: string;
  caption: string;
  media?: {
    _id: string;
    postId: string;
    mediaType: 'image' | 'video';
    mediaUrl: string;
  }[];
  author?: {
    _id: string;
    name: string;
    email: string;
    profileImageUrl?: string;
  };
  event?: {
    _id: string;
    title: string;
  };
  community?: {
    _id: string;
    name: string;
  };
  likeCount: number;
  commentCount: number;
  userLiked?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  _id: string;
  postId: string;
  userId: string;
  text: string;
  user?: {
    _id: string;
    name: string;
    email: string;
  };
  createdAt: string;
}

// Helper to get authorization header
const getAuthHeaders = async () => {
  const token = await AsyncStorage.getItem('token');
  if (!token) {
    console.warn('⚠️ No token found in AsyncStorage');
    throw new Error('No authentication token found');
  }
  console.log('🔑 Token retrieved:', token.substring(0, 20) + '...');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  };
};

export const postsApi = {
  // Create a new post with media upload
  createPostWithMedia: async (
    caption: string,
    mediaFiles: { uri: string; type: 'image' | 'video'; name: string }[],
    eventId?: string,
    communityId?: string
  ): Promise<Post> => {
    try {
      const apiUrl = await getApiUrl();
      const token = await AsyncStorage.getItem('token');

      const formData = new FormData();
      formData.append('caption', caption);
      if (eventId) formData.append('eventId', eventId);
      if (communityId) formData.append('communityId', communityId);

      // Add media files
      mediaFiles.forEach((file, index) => {
        formData.append('media', {
          uri: file.uri,
          type: file.type === 'image' ? 'image/jpeg' : 'video/mp4',
          name: file.name || `media_${index}.${file.type === 'image' ? 'jpg' : 'mp4'}`,
        } as any);
      });

      console.log('📝 Creating post with media:', caption.substring(0, 50));

      const response = await fetch(`${apiUrl}/api/posts/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          // Don't set Content-Type, let fetch set it with boundary
        },
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create post');
      }

      console.log('✅ Post created with media:', result._id);
      return result;
    } catch (error) {
      console.error('❌ Create post with media error:', error);
      throw error;
    }
  },

  // Create a new post
  createPost: async (data: CreatePostData): Promise<Post> => {
    try {
      const apiUrl = await getApiUrl();
      const headers = await getAuthHeaders();
      
      console.log('📝 Creating post:', data.caption.substring(0, 50));
      
      const response = await fetch(`${apiUrl}/api/posts`, {
        method: 'POST',
        headers,
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create post');
      }

      console.log('✅ Post created:', result._id);
      return result;
    } catch (error) {
      console.error('❌ Create post error:', error);
      throw error;
    }
  },

  // Get feed (posts from network)
  getFeed: async (limit: number = 20, skip: number = 0): Promise<Post[]> => {
    try {
      const apiUrl = await getApiUrl();
      const headers = await getAuthHeaders();
      
      console.log(`📱 Fetching feed: limit=${limit}, skip=${skip}`);
      
      const response = await fetch(`${apiUrl}/api/posts?limit=${limit}&skip=${skip}`, {
        method: 'GET',
        headers,
      });

      const result = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          // Token is invalid/expired - clear auth and force re-login
          await AsyncStorage.removeItem('token');
          await AsyncStorage.removeItem('user');
          console.error('🚫 Token expired - please log in again');
          throw new Error('Session expired. Please log in again.');
        }
        throw new Error(result.error || 'Failed to fetch feed');
      }

      console.log(`✅ Feed fetched: ${result.length} posts`);
      return result;
    } catch (error) {
      console.error('❌ Fetch feed error:', error);
      throw error;
    }
  },

  // Get posts by specific user
  getUserPosts: async (userId: string, limit: number = 20, skip: number = 0): Promise<Post[]> => {
    try {
      const apiUrl = await getApiUrl();
      const headers = await getAuthHeaders();
      
      console.log(`📱 Fetching posts for user ${userId}: limit=${limit}, skip=${skip}`);
      
      const response = await fetch(`${apiUrl}/api/posts/user/${userId}?limit=${limit}&skip=${skip}`, {
        method: 'GET',
        headers,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch user posts');
      }

      console.log(`✅ User posts fetched: ${result.length} posts`);
      return result;
    } catch (error) {
      console.error('❌ Fetch user posts error:', error);
      throw error;
    }
  },

  // Get a single post
  getPost: async (postId: string): Promise<Post> => {
    try {
      const apiUrl = await getApiUrl();
      const headers = await getAuthHeaders();
      
      const response = await fetch(`${apiUrl}/api/posts/${postId}`, {
        method: 'GET',
        headers,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch post');
      }

      return result;
    } catch (error) {
      console.error('❌ Fetch post error:', error);
      throw error;
    }
  },

  // Delete a post
  deletePost: async (postId: string): Promise<{ message: string }> => {
    try {
      const apiUrl = await getApiUrl();
      const headers = await getAuthHeaders();
      
      console.log('🗑️ Deleting post:', postId);
      
      const response = await fetch(`${apiUrl}/api/posts/${postId}`, {
        method: 'DELETE',
        headers,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to delete post');
      }

      console.log('✅ Post deleted');
      return result;
    } catch (error) {
      console.error('❌ Delete post error:', error);
      throw error;
    }
  },

  // Like a post
  likePost: async (postId: string): Promise<{ message: string; likeCount: number }> => {
    try {
      const apiUrl = await getApiUrl();
      const headers = await getAuthHeaders();
      
      const response = await fetch(`${apiUrl}/api/posts/${postId}/like`, {
        method: 'POST',
        headers,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to like post');
      }

      return result;
    } catch (error) {
      console.error('❌ Like post error:', error);
      throw error;
    }
  },

  // Unlike a post
  unlikePost: async (postId: string): Promise<{ message: string; likeCount: number }> => {
    try {
      const apiUrl = await getApiUrl();
      const headers = await getAuthHeaders();
      
      const response = await fetch(`${apiUrl}/api/posts/${postId}/like`, {
        method: 'DELETE',
        headers,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to unlike post');
      }

      return result;
    } catch (error) {
      console.error('❌ Unlike post error:', error);
      throw error;
    }
  },

  // Add a comment
  addComment: async (postId: string, text: string): Promise<Comment> => {
    try {
      const apiUrl = await getApiUrl();
      const headers = await getAuthHeaders();
      
      const response = await fetch(`${apiUrl}/api/posts/${postId}/comment`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ text }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to add comment');
      }

      return result;
    } catch (error) {
      console.error('❌ Add comment error:', error);
      throw error;
    }
  },

  // Get comments for a post
  getComments: async (postId: string): Promise<Comment[]> => {
    try {
      const apiUrl = await getApiUrl();
      const headers = await getAuthHeaders();
      
      const response = await fetch(`${apiUrl}/api/posts/${postId}/comments`, {
        method: 'GET',
        headers,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch comments');
      }

      return result;
    } catch (error) {
      console.error('❌ Fetch comments error:', error);
      throw error;
    }
  },

  // Delete a comment
  deleteComment: async (postId: string, commentId: string): Promise<{ message: string }> => {
    try {
      const apiUrl = await getApiUrl();
      const headers = await getAuthHeaders();
      
      const response = await fetch(`${apiUrl}/api/posts/${postId}/comments/${commentId}`, {
        method: 'DELETE',
        headers,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to delete comment');
      }

      return result;
    } catch (error) {
      console.error('❌ Delete comment error:', error);
      throw error;
    }
  },

  // Get posts liked by user
  getUserLikedPosts: async (userId: string, limit: number = 20, skip: number = 0): Promise<Post[]> => {
    try {
      const apiUrl = await getApiUrl();
      const headers = await getAuthHeaders();
      
      const response = await fetch(`${apiUrl}/api/posts/user/${userId}/likes?limit=${limit}&skip=${skip}`, {
        method: 'GET',
        headers,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch liked posts');
      }

      return result;
    } catch (error) {
      console.error('❌ Fetch liked posts error:', error);
      throw error;
    }
  },

  // Get comments made by user
  getUserComments: async (userId: string, limit: number = 20, skip: number = 0): Promise<Comment[]> => {
    try {
      const apiUrl = await getApiUrl();
      const headers = await getAuthHeaders();
      
      const response = await fetch(`${apiUrl}/api/posts/user/${userId}/comments?limit=${limit}&skip=${skip}`, {
        method: 'GET',
        headers,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch user comments');
      }

      return result;
    } catch (error) {
      console.error('❌ Fetch user comments error:', error);
      throw error;
    }
  },

  // Create community post
  createCommunityPost: async (communityId: string, caption: string, media?: PostMedia[]): Promise<Post> => {
    try {
      const apiUrl = await getApiUrl();
      const headers = await getAuthHeaders();

      const response = await fetch(`${apiUrl}/api/posts/community/${communityId}`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ caption, media }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create community post');
      }

      return result;
    } catch (error) {
      console.error('❌ Create community post error:', error);
      throw error;
    }
  },

  // Get community posts
  getCommunityPosts: async (communityId: string, limit: number = 20, skip: number = 0): Promise<Post[]> => {
    try {
      const apiUrl = await getApiUrl();
      const headers = await getAuthHeaders();

      const response = await fetch(`${apiUrl}/api/posts/community/${communityId}?limit=${limit}&skip=${skip}`, {
        method: 'GET',
        headers,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch community posts');
      }

      return result;
    } catch (error) {
      console.error('❌ Fetch community posts error:', error);
      throw error;
    }
  },
};

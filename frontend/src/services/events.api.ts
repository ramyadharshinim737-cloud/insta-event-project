/**
 * Events API Service
 * Handles all event-related API calls to the backend
 */

import { apiRequest } from './api';

export interface CreateEventPayload {
  title: string;
  description?: string;
  category?: string;
  date?: string; // ISO date string
  time?: string;
  venue?: string;
  isOnline?: boolean;
  meetingLink?: string;
  coverImage?: string;
}

export interface Event {
  _id: string;
  title: string;
  description?: string;
  category?: string;
  date?: string;
  time?: string;
  venue?: string;
  isOnline: boolean;
  meetingLink?: string;
  coverImage?: string;
  createdBy: {
    _id: string;
    name: string;
    email: string;
  };
  attendeeCount?: number;
  createdAt: string;
}

export interface EventRsvp {
  _id: string;
  eventId: string;
  userId: string;
  status: 'going' | 'interested' | 'notGoing';
  createdAt: string;
}

export interface EventsResponse {
  events: Event[];
  total?: number;
}

/**
 * Create a new event
 */
export const createEvent = async (eventData: CreateEventPayload): Promise<Event> => {
  const response = await apiRequest<Event>('POST', '/events', eventData);
  return response;
};

/**
 * Get all events with optional filters
 */
export const getAllEvents = async (params?: {
  search?: string;
  category?: string;
  upcoming?: boolean;
  limit?: number;
  skip?: number;
}): Promise<Event[]> => {
  const queryParams = new URLSearchParams();
  
  if (params?.search) queryParams.append('search', params.search);
  if (params?.category) queryParams.append('category', params.category);
  if (params?.upcoming) queryParams.append('upcoming', 'true');
  if (params?.limit) queryParams.append('limit', params.limit.toString());
  if (params?.skip) queryParams.append('skip', params.skip.toString());
  
  const queryString = queryParams.toString();
  const endpoint = queryString ? `/events?${queryString}` : '/events';
  
  const response = await apiRequest<Event[]>('GET', endpoint);
  return response;
};

/**
 * Get a single event by ID
 */
export const getEventById = async (eventId: string): Promise<Event> => {
  const response = await apiRequest<Event>('GET', `/events/${eventId}`);
  return response;
};

/**
 * Register for an event (RSVP)
 */
export const registerForEvent = async (eventId: string): Promise<{ message: string; rsvp: EventRsvp }> => {
  const response = await apiRequest<{ message: string; rsvp: EventRsvp }>(
    'POST',
    `/events/${eventId}/rsvp`
  );
  return response;
};

/**
 * Cancel RSVP for an event
 */
export const cancelRsvp = async (eventId: string): Promise<{ message: string }> => {
  const response = await apiRequest<{ message: string }>(
    'DELETE',
    `/events/${eventId}/rsvp`
  );
  return response;
};

/**
 * Check if user has RSVP'd to an event
 */
export const checkUserRsvp = async (eventId: string): Promise<{ hasRsvp: boolean }> => {
  const response = await apiRequest<{ hasRsvp: boolean }>(
    'GET',
    `/events/${eventId}/check-rsvp`
  );
  return response;
};

/**
 * Get attendees for an event
 */
export const getEventAttendees = async (eventId: string): Promise<any[]> => {
  const response = await apiRequest<any[]>('GET', `/events/${eventId}/attendees`);
  return response;
};

/**
 * Delete an event (only by creator)
 */
export const deleteEvent = async (eventId: string): Promise<{ message: string }> => {
  const response = await apiRequest<{ message: string }>('DELETE', `/events/${eventId}`);
  return response;
};

/**
 * Get events created by current user (My Events)
 */
export const getMyEvents = async (): Promise<Event[]> => {
  const response = await apiRequest<Event[]>('GET', '/events/my-events');
  return response;
};

/**
 * Get events user has RSVP'd to (My Tickets)
 */
export const getMyTickets = async (): Promise<Event[]> => {
  const response = await apiRequest<Event[]>('GET', '/events/my-tickets');
  return response;
};

/**
 * Upload event cover image to Cloudinary
 */
export const uploadEventCoverImage = async (imageUri: string): Promise<string> => {
  try {
    console.log('📸 Uploading event cover image...');
    
    // Create form data
    const formData = new FormData();
    const filename = imageUri.split('/').pop() || 'event-cover.jpg';
    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `image/${match[1]}` : 'image/jpeg';
    
    formData.append('coverImage', {
      uri: imageUri,
      name: filename,
      type,
    } as any);
    
    // Get API URL and token
    const { getApiUrl } = require('./api');
    const AsyncStorage = require('@react-native-async-storage/async-storage').default;
    
    const apiUrl = await getApiUrl();
    const token = await AsyncStorage.getItem('token');
    
    const response = await fetch(`${apiUrl}/api/events/upload-cover`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to upload image');
    }
    
    const result = await response.json();
    console.log('✅ Cover image uploaded:', result.coverImage);
    return result.coverImage;
  } catch (error: any) {
    console.error('❌ Error uploading cover image:', error);
    throw error;
  }
};


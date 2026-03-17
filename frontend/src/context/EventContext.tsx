import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { EventFormData } from '../utils/eventFormTypes';
import { createEvent as createEventApi, uploadEventCoverImage, deleteEvent as deleteEventApi, registerForEvent, cancelRsvp } from '../services/events.api';

export interface UserEvent extends EventFormData {
  id: string;
  createdAt: string;
  publishedAt?: string;
  status: 'draft' | 'published';
  hasRSVPd?: boolean;
  attendeeCount?: number;
}

interface EventContextType {
  userEvents: UserEvent[];
  addEvent: (eventData: EventFormData) => Promise<void>;
  deleteEvent: (eventId: string) => Promise<void>;
  saveDraft: (eventData: EventFormData) => Promise<void>;
  getDraft: () => Promise<EventFormData | null>;
  clearDraft: () => Promise<void>;
  updateEventRSVP: (eventId: string, hasRSVPd: boolean, attendeeCount?: number) => Promise<void>;
}

const EventContext = createContext<EventContextType | undefined>(undefined);

const EVENTS_STORAGE_KEY = '@linsta_user_events';
const DRAFT_STORAGE_KEY = '@linsta_event_draft';

export const EventProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [userEvents, setUserEvents] = useState<UserEvent[]>([]);

  // Load events from AsyncStorage on mount
  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      const eventsJson = await AsyncStorage.getItem(EVENTS_STORAGE_KEY);
      if (eventsJson) {
        const events: UserEvent[] = JSON.parse(eventsJson);
        // Sort by publishedAt (newest first)
        events.sort((a, b) => {
          const timeA = new Date(a.publishedAt || a.createdAt).getTime();
          const timeB = new Date(b.publishedAt || b.createdAt).getTime();
          return timeB - timeA;
        });
        setUserEvents(events);
      }
    } catch (error) {
      console.error('Error loading events:', error);
    }
  };

  const addEvent = async (eventData: EventFormData) => {
    try {
      console.log('📅 Creating event via backend API...');
      
      // Upload cover image first if provided
      let coverImageUrl = eventData.coverImageUri;
      if (eventData.coverImageUri && eventData.coverImageUri.startsWith('file://')) {
        console.log('📸 Uploading cover image to Cloudinary...');
        coverImageUrl = await uploadEventCoverImage(eventData.coverImageUri);
        console.log('✅ Cover image uploaded:', coverImageUrl);
      }
      
      // Create event via backend API
      const backendEvent = await createEventApi({
        title: eventData.title,
        description: eventData.description,
        category: eventData.category,
        date: eventData.startDate,
        time: eventData.startTime,
        venue: eventData.venueAddress,
        isOnline: eventData.isOnline,
        meetingLink: eventData.meetingLink,
        coverImage: coverImageUrl,
      });
      
      console.log('✅ Event created successfully:', backendEvent._id);
      
      // Also store locally for offline access
      const newEvent: UserEvent = {
        ...eventData,
        id: backendEvent._id,
        createdAt: backendEvent.createdAt,
        publishedAt: new Date().toISOString(),
        status: 'published',
      };

      const updatedEvents = [newEvent, ...userEvents];
      setUserEvents(updatedEvents);
      await AsyncStorage.setItem(EVENTS_STORAGE_KEY, JSON.stringify(updatedEvents));
      
      return backendEvent;
    } catch (error: any) {
      console.error('❌ Error creating event:', error);
      
      // Provide better error message for authentication errors
      if (error.message && error.message.includes('401')) {
        throw new Error('Please login to create events. Authentication required.');
      }
      
      throw error;
    }
  };

  const deleteEvent = async (eventId: string) => {
    try {
      console.log('🗑️ Deleting event:', eventId);
      
      // Delete from backend
      await deleteEventApi(eventId);
      console.log('✅ Event deleted from backend');
      
      // Remove from local state
      const updatedEvents = userEvents.filter(event => event.id !== eventId);
      setUserEvents(updatedEvents);
      await AsyncStorage.setItem(EVENTS_STORAGE_KEY, JSON.stringify(updatedEvents));
      
      console.log('✅ Event removed from local storage');
    } catch (error: any) {
      console.error('❌ Error deleting event:', error);
      
      // Provide better error messages
      if (error.message && error.message.includes('Unauthorized')) {
        throw new Error('Only the event creator can delete this event.');
      }
      
      throw error;
    }
  };

  const saveDraft = async (eventData: EventFormData) => {
    try {
      const draft: EventFormData = {
        ...eventData,
        status: 'draft',
      };
      await AsyncStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draft));
    } catch (error) {
      console.error('Error saving draft:', error);
    }
  };

  const getDraft = async (): Promise<EventFormData | null> => {
    try {
      const draftJson = await AsyncStorage.getItem(DRAFT_STORAGE_KEY);
      if (draftJson) {
        return JSON.parse(draftJson);
      }
      return null;
    } catch (error) {
      console.error('Error getting draft:', error);
      return null;
    }
  };

  const clearDraft = async () => {
    try {
      await AsyncStorage.removeItem(DRAFT_STORAGE_KEY);
    } catch (error) {
      console.error('Error clearing draft:', error);
    }
  };

  const updateEventRSVP = async (eventId: string, hasRSVPd: boolean, attendeeCount?: number) => {
    try {
      console.log(`${hasRSVPd ? '✅' : '❌'} ${hasRSVPd ? 'Registering' : 'Canceling'} RSVP for event ${eventId}...`);
      
      // Call backend API to register or cancel RSVP
      if (hasRSVPd) {
        await registerForEvent(eventId);
        console.log('✅ RSVP registered in backend');
      } else {
        await cancelRsvp(eventId);
        console.log('✅ RSVP cancelled in backend');
      }
      
      // Update local state
      const updatedEvents = userEvents.map(event => {
        if (event.id === eventId) {
          const updated: any = { ...event, hasRSVPd };
          if (attendeeCount !== undefined) {
            updated.attendeeCount = attendeeCount;
          }
          return updated;
        }
        return event;
      });
      setUserEvents(updatedEvents);
      await AsyncStorage.setItem(EVENTS_STORAGE_KEY, JSON.stringify(updatedEvents));
    } catch (error: any) {
      console.error('❌ Error updating RSVP:', error);
      throw error; // Re-throw to let EventDetailScreen handle it
    }
  };

  return (
    <EventContext.Provider value={{ userEvents, addEvent, deleteEvent, saveDraft, getDraft, clearDraft, updateEventRSVP }}>
      {children}
    </EventContext.Provider>
  );
};

export const useEvents = () => {
  const context = useContext(EventContext);
  if (context === undefined) {
    throw new Error('useEvents must be used within an EventProvider');
  }
  return context;
};

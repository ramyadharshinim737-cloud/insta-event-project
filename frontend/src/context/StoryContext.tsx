import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Story } from '../utils/types';

interface StoryContextType {
  userStories: Story[];
  addStory: (story: Omit<Story, 'id' | 'timestamp'>) => Promise<void>;
  removeExpiredStories: () => Promise<void>;
}

const StoryContext = createContext<StoryContextType | undefined>(undefined);

const STORAGE_KEY = '@linsta_user_stories';
const STORY_EXPIRY_HOURS = 24;

export const StoryProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [userStories, setUserStories] = useState<Story[]>([]);

  // Load stories from AsyncStorage on mount
  useEffect(() => {
    loadStories();
  }, []);

  const loadStories = async () => {
    try {
      const storiesJson = await AsyncStorage.getItem(STORAGE_KEY);
      if (storiesJson) {
        const stories: Story[] = JSON.parse(storiesJson);
        // Filter out expired stories
        const validStories = stories.filter(story => !isStoryExpired(story));
        // Sort by timestamp (oldest to newest)
        validStories.sort((a, b) => {
          const timeA = new Date(a.timestamp).getTime();
          const timeB = new Date(b.timestamp).getTime();
          return timeA - timeB; // Ascending order
        });
        setUserStories(validStories);
        // Save back the filtered stories
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(validStories));
      }
    } catch (error) {
      console.error('Error loading stories:', error);
    }
  };

  const isStoryExpired = (story: Story): boolean => {
    // Parse timestamp - handle both relative (e.g., "2h") and absolute timestamps
    const now = new Date().getTime();
    const storyTime = new Date(story.timestamp).getTime();
    
    // If timestamp is a valid date
    if (!isNaN(storyTime)) {
      const hoursDiff = (now - storyTime) / (1000 * 60 * 60);
      return hoursDiff >= STORY_EXPIRY_HOURS;
    }
    
    return false;
  };

  const addStory = async (storyData: Omit<Story, 'id' | 'timestamp'>) => {
    try {
      const newStory: Story = {
        ...storyData,
        id: `user_story_${Date.now()}`,
        timestamp: new Date().toISOString(),
        isOwn: true,
      };

      const updatedStories = [...userStories, newStory]; // Append to end
      setUserStories(updatedStories);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedStories));
    } catch (error) {
      console.error('Error adding story:', error);
      throw error;
    }
  };

  const removeExpiredStories = async () => {
    try {
      const validStories = userStories.filter(story => !isStoryExpired(story));
      if (validStories.length !== userStories.length) {
        setUserStories(validStories);
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(validStories));
      }
    } catch (error) {
      console.error('Error removing expired stories:', error);
    }
  };

  return (
    <StoryContext.Provider value={{ userStories, addStory, removeExpiredStories }}>
      {children}
    </StoryContext.Provider>
  );
};

export const useStories = () => {
  const context = useContext(StoryContext);
  if (context === undefined) {
    throw new Error('useStories must be used within a StoryProvider');
  }
  return context;
};

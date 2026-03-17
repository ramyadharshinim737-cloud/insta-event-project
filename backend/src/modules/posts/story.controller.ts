// Story controller
import { Request, Response } from "express";
import { Story } from "./story.model";
import { User } from "../users/user.model";
import { UserProfile } from "../users/profile.model";
import { Types } from "mongoose";
import notificationService from "../notifications/notification.service";

export class StoryController {
  // Create a new story
  static async createStory(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.userId;
      const { mediaUrl, mediaType, caption, backgroundColor, duration } = req.body;

      // Allow text-only stories (caption without media)
      if (!caption && !mediaUrl) {
        res.status(400).json({ error: "Caption or media is required" });
        return;
      }

      // For text-only stories, create a placeholder
      const finalMediaUrl = mediaUrl || 'text-only';
      const finalMediaType = mediaType || 'image';

      // Set expiration to 24 hours from now
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

      const story = await Story.create({
        userId,
        mediaUrl: finalMediaUrl,
        mediaType: finalMediaType,
        caption,
        backgroundColor: backgroundColor || '#0A66C2',
        duration: duration || (finalMediaType === 'video' ? 15 : 5),
        expiresAt,
      });

      // Get user info for notification
      const user = await User.findById(userId).select('name');
      const userName = user?.name || 'Someone';

      // For now, broadcast to all users (in production, would be followers only)
      // You can enhance this later to only notify followers
      // Example: const followers = await getFollowers(userId);
      // notificationService.createBroadcastNotification(userId, followers, 'NEW_STORY', message, story._id.toString());

      res.status(201).json({ story });
    } catch (error: any) {
      console.error("Error creating story:", error);
      res.status(500).json({ error: error.message });
    }
  }

  // Get all active stories (not expired)
  static async getStories(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.userId;
      const now = new Date();

      // Find all active stories
      const stories = await Story.find({
        expiresAt: { $gt: now },
      })
        .populate({
          path: "userId",
          select: "name email"
        })
        .sort({ createdAt: -1 });

      // Get unique user IDs from stories
      const userIds = [...new Set(stories.map((story: any) => story.userId._id.toString()))];
      
      // Fetch profiles for all users
      const profiles = await UserProfile.find({ userId: { $in: userIds } }).select('userId profileImageUrl');
      const profileMap = new Map(profiles.map((p: any) => [p.userId.toString(), p.profileImageUrl]));

      // Group stories by user
      const groupedStories: any = {};
      
      for (const story of stories) {
        const userIdStr = story.userId._id.toString();
        
        if (!groupedStories[userIdStr]) {
          const user: any = story.userId;
          groupedStories[userIdStr] = {
            user: {
              id: user._id,
              name: user.name,
              email: user.email,
              avatar: 'person-circle', // Default avatar
              profileImageUrl: profileMap.get(userIdStr) || null,
            },
            stories: [],
            isOwn: userIdStr === userId,
          };
        }
        
        groupedStories[userIdStr].stories.push({
          id: story._id,
          mediaUrl: story.mediaUrl,
          mediaType: story.mediaType,
          caption: story.caption,
          backgroundColor: story.backgroundColor,
          duration: story.duration,
          viewCount: story.viewCount,
          hasViewed: story.viewedBy.some(id => id.toString() === userId),
          timestamp: story.createdAt,
          expiresAt: story.expiresAt,
        });
      }

      // Convert to array
      const storiesArray = Object.values(groupedStories);

      res.status(200).json({ stories: storiesArray });
    } catch (error: any) {
      console.error("Error fetching stories:", error);
      res.status(500).json({ error: error.message });
    }
  }

  // Get user's own stories
  static async getMyStories(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.userId;
      const now = new Date();

      const stories = await Story.find({
        userId,
        expiresAt: { $gt: now },
      }).sort({ createdAt: -1 });

      res.status(200).json({ stories });
    } catch (error: any) {
      console.error("Error fetching my stories:", error);
      res.status(500).json({ error: error.message });
    }
  }

  // View a story (mark as viewed)
  static async viewStory(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.userId;
      const { id } = req.params;

      const story = await Story.findById(id);
      
      if (!story) {
        res.status(404).json({ error: "Story not found" });
        return;
      }

      // Check if not expired
      if (story.expiresAt < new Date()) {
        res.status(410).json({ error: "Story has expired" });
        return;
      }

      // Add user to viewedBy if not already viewed
      if (!story.viewedBy.some(id => id.toString() === userId)) {
        story.viewedBy.push(new Types.ObjectId(userId));
        story.viewCount += 1;
        await story.save();
      }

      res.status(200).json({ message: "Story viewed", viewCount: story.viewCount });
    } catch (error: any) {
      console.error("Error viewing story:", error);
      res.status(500).json({ error: error.message });
    }
  }

  // Delete a story
  static async deleteStory(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.userId;
      const { id } = req.params;

      const story = await Story.findById(id);
      
      if (!story) {
        res.status(404).json({ error: "Story not found" });
        return;
      }

      // Check if user owns the story
      if (story.userId.toString() !== userId) {
        res.status(403).json({ error: "Not authorized to delete this story" });
        return;
      }

      await Story.findByIdAndDelete(id);
      res.status(200).json({ message: "Story deleted successfully" });
    } catch (error: any) {
      console.error("Error deleting story:", error);
      res.status(500).json({ error: error.message });
    }
  }

  // Get story viewers
  static async getStoryViewers(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.userId;
      const { id } = req.params;

      const story = await Story.findById(id).populate("viewedBy", "name email");
      
      if (!story) {
        res.status(404).json({ error: "Story not found" });
        return;
      }

      // Check if user owns the story
      if (story.userId.toString() !== userId) {
        res.status(403).json({ error: "Not authorized to view story viewers" });
        return;
      }

      res.status(200).json({ 
        viewCount: story.viewCount,
        viewers: story.viewedBy 
      });
    } catch (error: any) {
      console.error("Error fetching story viewers:", error);
      res.status(500).json({ error: error.message });
    }
  }
}

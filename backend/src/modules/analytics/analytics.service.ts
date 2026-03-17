import { Types } from "mongoose";
import EventAnalytics from "./event-analytics.model";
import PostAnalytics from "./post-analytics.model";
import UserActivityLog from "./user-activity-log.model";

export class AnalyticsService {
  /**
   * Increment event views count
   */
  async trackEventView(eventId: string): Promise<void> {
    try {
      const objId = new Types.ObjectId(eventId);
      
      // Update or create event analytics
      await EventAnalytics.findOneAndUpdate(
        { eventId: objId },
        {
          $inc: { viewsCount: 1 },
          eventId: objId,
        },
        { upsert: true, new: true }
      );
    } catch (error) {
      console.error("Failed to track event view:", error);
    }
  }

  /**
   * Increment RSVP count for event
   */
  async trackEventRSVP(eventId: string): Promise<void> {
    try {
      const objId = new Types.ObjectId(eventId);
      
      await EventAnalytics.findOneAndUpdate(
        { eventId: objId },
        {
          $inc: { rsvpCount: 1 },
          eventId: objId,
        },
        { upsert: true, new: true }
      );
    } catch (error) {
      console.error("Failed to track event RSVP:", error);
    }
  }

  /**
   * Increment likes count for post
   */
  async trackPostLike(postId: string): Promise<void> {
    try {
      const objId = new Types.ObjectId(postId);
      
      await PostAnalytics.findOneAndUpdate(
        { postId: objId },
        {
          $inc: { likesCount: 1 },
          postId: objId,
        },
        { upsert: true, new: true }
      );
    } catch (error) {
      console.error("Failed to track post like:", error);
    }
  }

  /**
   * Increment comments count for post
   */
  async trackPostComment(postId: string): Promise<void> {
    try {
      const objId = new Types.ObjectId(postId);
      
      await PostAnalytics.findOneAndUpdate(
        { postId: objId },
        {
          $inc: { commentsCount: 1 },
          postId: objId,
        },
        { upsert: true, new: true }
      );
    } catch (error) {
      console.error("Failed to track post comment:", error);
    }
  }

  /**
   * Log user activity
   */
  async logUserActivity(
    userId: string,
    action: "VIEW_EVENT" | "RSVP_EVENT" | "CREATE_POST" | "LIKE_POST" | "COMMENT_POST" | "FOLLOW_USER" | "LOGIN" | "LOGOUT",
    referenceId?: string
  ): Promise<void> {
    try {
      const log = new UserActivityLog({
        userId: new Types.ObjectId(userId),
        action,
        referenceId: referenceId ? new Types.ObjectId(referenceId) : undefined,
      });
      
      await log.save();
    } catch (error) {
      console.error("Failed to log user activity:", error);
    }
  }

  /**
   * Get event analytics
   */
  async getEventAnalytics(eventId: string): Promise<any> {
    try {
      const analytics = await EventAnalytics.findOne({
        eventId: new Types.ObjectId(eventId),
      }).lean();

      if (!analytics) {
        // Return default values if no analytics found
        return {
          eventId,
          viewsCount: 0,
          rsvpCount: 0,
          updatedAt: new Date(),
        };
      }

      return analytics;
    } catch (error) {
      console.error("Failed to get event analytics:", error);
      throw error;
    }
  }

  /**
   * Get post analytics
   */
  async getPostAnalytics(postId: string): Promise<any> {
    try {
      const analytics = await PostAnalytics.findOne({
        postId: new Types.ObjectId(postId),
      }).lean();

      if (!analytics) {
        // Return default values if no analytics found
        return {
          postId,
          likesCount: 0,
          commentsCount: 0,
          updatedAt: new Date(),
        };
      }

      return analytics;
    } catch (error) {
      console.error("Failed to get post analytics:", error);
      throw error;
    }
  }

  /**
   * Get user activity logs
   */
  async getUserActivityLogs(
    userId: string,
    limit: number = 20,
    skip: number = 0
  ): Promise<any[]> {
    try {
      const logs = await UserActivityLog.find({
        userId: new Types.ObjectId(userId),
      })
        .sort({ createdAt: -1 })
        .limit(limit)
        .skip(skip)
        .lean();

      return logs;
    } catch (error) {
      console.error("Failed to get user activity logs:", error);
      throw error;
    }
  }
}

export default new AnalyticsService();

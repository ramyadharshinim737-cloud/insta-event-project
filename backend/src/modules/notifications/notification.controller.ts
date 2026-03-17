import { Request, Response } from 'express';
import notificationService from './notification.service';
import Notification from './notification.model';
import mongoose from 'mongoose';

export class NotificationController {
  /**
   * GET /api/notifications
   * Get all notifications for logged-in user
   * Query: limit, skip
   */
  async getNotifications(req: Request, res: Response): Promise<void> {
    try {
      console.log('📥 getNotifications - START');
      const userId = req.userId;
      const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
      const skip = parseInt(req.query.skip as string) || 0;

      console.log('📥 getNotifications - userId:', userId);
      console.log('📥 getNotifications - limit:', limit, 'skip:', skip);

      if (!userId) {
        console.error('❌ getNotifications - Missing userId');
        res.status(401).json({ error: 'Missing or invalid token' });
        return;
      }

      const notifications = await notificationService.getNotifications(
        userId,
        limit,
        skip
      );

      console.log('✅ getNotifications - Found', notifications.length, 'notifications');
      console.log('✅ getNotifications - Sending response:', JSON.stringify(notifications, null, 2));

      res.status(200).json(notifications);
    } catch (error) {
      console.error('❌ getNotifications - Error:', error);
      res.status(500).json({ error: 'Failed to fetch notifications' });
    }
  }

  /**
   * PUT /api/notifications/:id/read
   * Mark notification as read
   */
  async markAsRead(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.userId;
      const { id } = req.params;

      if (!userId) {
        res.status(401).json({ error: 'Missing or invalid token' });
        return;
      }

      if (!id) {
        res.status(400).json({ error: 'Missing notification ID' });
        return;
      }

      const notification = await notificationService.markAsRead(id);

      if (!notification) {
        res.status(404).json({ error: 'Notification not found' });
        return;
      }

      res.status(200).json(notification);
    } catch (error) {
      res.status(500).json({ error: 'Failed to update notification' });
    }
  }

  /**
   * GET /api/notifications/unread/count
   * Get unread notification count
   */
  async getUnreadCount(req: Request, res: Response): Promise<void> {
    try {
      console.log('📊 getUnreadCount - START');
      const userId = req.userId;

      console.log('📊 getUnreadCount - userId:', userId);

      if (!userId) {
        console.error('❌ getUnreadCount - Missing userId');
        res.status(401).json({ error: 'Missing or invalid token' });
        return;
      }

      const count = await notificationService.getUnreadCount(userId);

      console.log('✅ getUnreadCount - Count:', count);
      console.log('✅ getUnreadCount - Sending response:', { unreadCount: count });

      res.status(200).json({ unreadCount: count });
    } catch (error) {
      console.error('❌ getUnreadCount - Error:', error);
      res.status(500).json({ error: 'Failed to fetch unread count' });
    }
  }

  /**
   * PUT /api/notifications/mark-all-read
   * Mark all notifications as read
   */
  async markAllAsRead(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.userId;

      if (!userId) {
        res.status(401).json({ error: 'Missing or invalid token' });
        return;
      }

      await notificationService.markAllAsRead(userId);

      res.status(200).json({ message: 'All notifications marked as read' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to update notifications' });
    }
  }

  /**
   * POST /api/notifications/test/create
   * Create test notifications (Development only!)
   */
  async createTestNotifications(req: Request, res: Response): Promise<void> {
    try {
      console.log('🧪 createTestNotifications - START');
      const userId = req.userId;

      if (!userId) {
        console.error('❌ createTestNotifications - Missing userId');
        res.status(401).json({ error: 'Missing or invalid token' });
        return;
      }

      console.log('🧪 Creating test notifications for user:', userId);

      // Create diverse test notifications
      const testNotifications = [
        {
          userId: new mongoose.Types.ObjectId(userId),
          type: 'LIKE' as const,
          message: 'John Smith liked your post "Amazing sunset photo"',
          referenceId: new mongoose.Types.ObjectId(),
          isRead: false,
          createdAt: new Date(Date.now() - 5 * 60000), // 5 minutes ago
        },
        {
          userId: new mongoose.Types.ObjectId(userId),
          type: 'COMMENT' as const,
          message: 'Sarah Johnson commented: "This is awesome! 🔥"',
          referenceId: new mongoose.Types.ObjectId(),
          isRead: false,
          createdAt: new Date(Date.now() - 15 * 60000), // 15 minutes ago
        },
        {
          userId: new mongoose.Types.ObjectId(userId),
          type: 'EVENT_RSVP' as const,
          message: 'Mike Wilson RSVP\'d to your event "Tech Meetup 2026"',
          referenceId: new mongoose.Types.ObjectId(),
          isRead: false,
          createdAt: new Date(Date.now() - 30 * 60000), // 30 minutes ago
        },
        {
          userId: new mongoose.Types.ObjectId(userId),
          type: 'NEW_POST' as const,
          message: 'Emma Davis shared a new post',
          referenceId: new mongoose.Types.ObjectId(),
          isRead: false,
          createdAt: new Date(Date.now() - 60 * 60000), // 1 hour ago
        },
        {
          userId: new mongoose.Types.ObjectId(userId),
          type: 'NEW_EVENT' as const,
          message: 'David Brown created a new event: "Coffee Networking"',
          referenceId: new mongoose.Types.ObjectId(),
          isRead: true, // One read notification
          createdAt: new Date(Date.now() - 2 * 60 * 60000), // 2 hours ago
        },
        {
          userId: new mongoose.Types.ObjectId(userId),
          type: 'NEW_STORY' as const,
          message: 'Lisa Anderson posted a new story',
          referenceId: new mongoose.Types.ObjectId(),
          isRead: false,
          createdAt: new Date(Date.now() - 3 * 60 * 60000), // 3 hours ago
        },
      ];

      const created = await Notification.insertMany(testNotifications);
      console.log('✅ createTestNotifications - Created', created.length, 'notifications');

      // Get updated counts
      const unreadCount = await notificationService.getUnreadCount(userId);
      const totalCount = created.length;

      const response = {
        message: 'Test notifications created successfully',
        created: totalCount,
        unreadCount: unreadCount,
        notifications: created.map(n => ({
          id: n._id,
          type: n.type,
          message: n.message,
          isRead: n.isRead,
          createdAt: n.createdAt,
        })),
      };

      console.log('✅ createTestNotifications - Response:', response);
      res.status(201).json(response);
    } catch (error) {
      console.error('❌ createTestNotifications - Error:', error);
      res.status(500).json({ error: 'Failed to create test notifications' });
    }
  }
}

export default new NotificationController();

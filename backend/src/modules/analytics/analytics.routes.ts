import { Router, Request, Response } from "express";
import { authMiddleware } from "../../middlewares/auth.middleware";
import analyticsService from "./analytics.service";

const router = Router();

// Get event analytics
router.get(
  "/events/:eventId",
  authMiddleware,
  async (req: Request, res: Response): Promise<any> => {
    try {
      const { eventId } = req.params;

      if (!eventId) {
        return res.status(400).json({ error: "eventId is required" });
      }

      const analytics = await analyticsService.getEventAnalytics(eventId);

      res.json({
        eventId: eventId,
        viewsCount: analytics.viewsCount || 0,
        rsvpCount: analytics.rsvpCount || 0,
        updatedAt: analytics.updatedAt || new Date(),
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
);

// Get post analytics
router.get(
  "/posts/:postId",
  authMiddleware,
  async (req: Request, res: Response): Promise<any> => {
    try {
      const { postId } = req.params;

      if (!postId) {
        return res.status(400).json({ error: "postId is required" });
      }

      const analytics = await analyticsService.getPostAnalytics(postId);

      res.json({
        postId: postId,
        likesCount: analytics.likesCount || 0,
        commentsCount: analytics.commentsCount || 0,
        updatedAt: analytics.updatedAt || new Date(),
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
);

// Get user activity logs (read-only for self)
router.get(
  "/activity",
  authMiddleware,
  async (req: Request, res: Response): Promise<any> => {
    try {
      const userId = (req as any).userId;
      const limit = parseInt(req.query.limit as string) || 20;
      const skip = parseInt(req.query.skip as string) || 0;

      const logs = await analyticsService.getUserActivityLogs(userId, limit, skip);

      res.json(logs);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
);

export default router;

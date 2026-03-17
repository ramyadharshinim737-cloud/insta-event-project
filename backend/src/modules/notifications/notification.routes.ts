import { Router } from 'express';
import notificationController from './notification.controller';
import { authMiddleware } from "../../middlewares/auth.middleware";

const router = Router();

// All notification routes are protected - require JWT token

/**
 * GET /api/notifications
 * Get all notifications for logged-in user
 */
router.get('/', authMiddleware, (req, res) =>
  notificationController.getNotifications(req, res)
);

/**
 * GET /api/notifications/unread/count
 * Get unread notification count
 * IMPORTANT: Place before /:id route to avoid param conflict
 */
router.get('/unread/count', authMiddleware, (req, res) =>
  notificationController.getUnreadCount(req, res)
);

/**
 * PUT /api/notifications/:id/read
 * Mark notification as read
 */
router.put('/:id/read', authMiddleware, (req, res) =>
  notificationController.markAsRead(req, res)
);

/**
 * PUT /api/notifications/mark-all-read
 * Mark all notifications as read
 * IMPORTANT: Place before /:id route to avoid param conflict
 */
router.put('/mark-all/read', authMiddleware, (req, res) =>
  notificationController.markAllAsRead(req, res)
);

/**
 * POST /api/notifications/test/create
 * Create test notifications for development
 * WARNING: Development only! Remove in production
 */
router.post('/test/create', authMiddleware, (req, res) =>
  notificationController.createTestNotifications(req, res)
);

export default router;

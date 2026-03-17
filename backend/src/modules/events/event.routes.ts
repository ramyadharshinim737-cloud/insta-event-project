// Event routes
import { Router } from "express";
import { EventController } from "./event.controller";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { upload } from "../../middlewares/upload.middleware";

const router = Router();

// Public routes
router.get("/", EventController.getAllEvents);

// Protected routes (must be BEFORE /:id to avoid conflicts)
router.get("/my-events", authMiddleware, EventController.getMyEvents);
router.get("/my-tickets", authMiddleware, EventController.getMyTickets);

// Public routes with :id parameter
router.get("/:id", EventController.getEventById);
router.get("/:id/attendees", EventController.getEventAttendees);

// Protected routes with :id parameter
router.post("/", authMiddleware, EventController.createEvent);
router.post("/upload-cover", authMiddleware, upload.single('coverImage'), EventController.uploadCoverImage);
router.get("/:id/check-rsvp", authMiddleware, EventController.checkUserRsvp);
router.delete("/:id", authMiddleware, EventController.deleteEvent);
router.post("/:id/rsvp", authMiddleware, EventController.registerForEvent);
router.delete("/:id/rsvp", authMiddleware, EventController.cancelRsvp);

export default router;

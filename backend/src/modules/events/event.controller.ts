// Event API controllers
import { Request, Response } from "express";
import { EventService } from "./event.service";
import { uploadImage } from "../../config/cloudinary";

export class EventController {
  // POST /api/events - Create event
  static async createEvent(req: Request, res: Response): Promise<void> {
    try {
      const { title, description, category, date, time, venue, isOnline, meetingLink, coverImage } = req.body;
      const userId = req.userId;

      // Validation
      if (!title) {
        res.status(400).json({ error: "Title is required" });
        return;
      }

      if (!userId) {
        res.status(401).json({ error: "User not authenticated" });
        return;
      }

      const event = await EventService.createEvent(
        {
          title,
          description,
          category,
          date,
          time,
          venue,
          isOnline: isOnline || false,
          meetingLink,
          coverImage,
        },
        userId
      );

      res.status(201).json(event);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  // GET /api/events - Get all events with optional search & filters
  static async getAllEvents(req: Request, res: Response): Promise<void> {
    try {
      // Get query parameters
      const search = req.query.search as string | undefined;
      const category = req.query.category as string | undefined;
      const upcoming = req.query.upcoming === "true"; // Convert string to boolean
      const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
      const skip = parseInt(req.query.skip as string) || 0;

      const events = await EventService.getAllEvents(
        search,
        category,
        upcoming,
        limit,
        skip
      );

      res.status(200).json(events);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  // GET /api/events/:id - Get single event
  static async getEventById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const event = await EventService.getEventById(id);
      res.status(200).json(event);
    } catch (error: any) {
      res.status(404).json({ error: error.message });
    }
  }

  // POST /api/events/:id/rsvp - Register for event
  static async registerForEvent(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.userId;

      if (!userId) {
        res.status(401).json({ error: "User not authenticated" });
        return;
      }

      console.log(`📝 Registering user ${userId} for event ${id}...`);
      const rsvp = await EventService.registerForEvent(id, userId);
      console.log(`✅ RSVP created successfully`);
      res.status(201).json({ message: "Successfully registered for event", rsvp });
    } catch (error: any) {
      console.error(`❌ Error registering for event:`, error);
      if (error.message.includes("Already registered")) {
        res.status(409).json({ error: error.message });
      } else if (error.message.includes("not found")) {
        res.status(404).json({ error: error.message });
      } else {
        res.status(500).json({ error: error.message });
      }
    }
  }

  // GET /api/events/:id/attendees - Get event attendees
  static async getEventAttendees(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const attendees = await EventService.getEventAttendees(id);
      res.status(200).json(attendees);
    } catch (error: any) {
      res.status(404).json({ error: error.message });
    }
  }

  // GET /api/events/:id/check-rsvp - Check if user has RSVP'd
  static async checkUserRsvp(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.userId;

      if (!userId) {
        res.status(401).json({ error: "User not authenticated" });
        return;
      }

      const hasRsvp = await EventService.checkUserRsvp(id, userId);
      res.status(200).json({ hasRsvp });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  // DELETE /api/events/:id/rsvp - Cancel RSVP
  static async cancelRsvp(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.userId;

      if (!userId) {
        res.status(401).json({ error: "User not authenticated" });
        return;
      }

      await EventService.cancelRsvp(id, userId);
      res.status(200).json({ message: "RSVP cancelled successfully" });
    } catch (error: any) {
      res.status(404).json({ error: error.message });
    }
  }

  // POST /api/events/upload-cover - Upload event cover image
  static async uploadCoverImage(req: Request, res: Response): Promise<void> {
    try {
      if (!req.file) {
        res.status(400).json({ error: "No image file provided" });
        return;
      }

      console.log('📸 Uploading event cover image to Cloudinary...');
      console.log('📁 File info:', {
        originalname: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
      });

      // Convert buffer to base64 data URI (multer uses memory storage)
      const b64 = Buffer.from(req.file.buffer).toString('base64');
      const dataURI = `data:${req.file.mimetype};base64,${b64}`;

      const imageUrl = await uploadImage(dataURI);
      console.log('✅ Event cover image uploaded:', imageUrl);

      res.status(200).json({ 
        message: "Cover image uploaded successfully", 
        coverImage: imageUrl 
      });
    } catch (error: any) {
      console.error('❌ Cover image upload error:', error);
      res.status(500).json({ error: error.message || "Failed to upload cover image" });
    }
  }

  // DELETE /api/events/:id - Delete event (only by creator)
  static async deleteEvent(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.userId;

      if (!userId) {
        res.status(401).json({ error: "User not authenticated" });
        return;
      }

      await EventService.deleteEvent(id, userId);
      res.status(200).json({ message: "Event deleted successfully" });
    } catch (error: any) {
      if (error.message.includes("Unauthorized")) {
        res.status(403).json({ error: error.message });
      } else if (error.message.includes("not found")) {
        res.status(404).json({ error: error.message });
      } else {
        res.status(500).json({ error: error.message });
      }
    }
  }

  // GET /api/events/my-events - Get events created by user
  static async getMyEvents(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.userId;

      if (!userId) {
        res.status(401).json({ error: "User not authenticated" });
        return;
      }

      const events = await EventService.getMyEvents(userId);
      res.status(200).json(events);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  // GET /api/events/my-tickets - Get events user has RSVP'd to
  static async getMyTickets(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.userId;

      console.log('🎟️ getMyTickets called for userId:', userId);

      if (!userId) {
        console.error('❌ No userId found in request');
        res.status(401).json({ error: "User not authenticated" });
        return;
      }

      const tickets = await EventService.getMyTickets(userId);
      console.log(`✅ Found ${tickets.length} tickets for user ${userId}`);
      res.status(200).json(tickets);
    } catch (error: any) {
      console.error('❌ Error in getMyTickets:', error);
      res.status(500).json({ error: error.message });
    }
  }
}

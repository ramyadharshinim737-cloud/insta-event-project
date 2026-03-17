// Event service - Business logic
import { Event, IEvent } from "./event.model";
import { EventRsvp, IEventRsvp } from "./rsvp.model";
import { Types } from "mongoose";
import notificationService from "../notifications/notification.service";
import analyticsService from "../analytics/analytics.service";

export class EventService {
  // Create a new event
  static async createEvent(
    data: {
      title: string;
      description?: string;
      category?: string;
      date?: Date;
      time?: string;
      venue?: string;
      isOnline: boolean;
      meetingLink?: string;
      coverImage?: string;
    },
    createdBy: string
  ): Promise<IEvent> {
    const event = await Event.create({
      ...data,
      createdBy: new Types.ObjectId(createdBy),
    });
    return event;
  }

  // Get all events with optional search and filters
  static async getAllEvents(
    search?: string,
    category?: string,
    upcoming?: boolean,
    limit: number = 20,
    skip: number = 0
  ): Promise<IEvent[]> {
    // Build query object
    const query: any = {};

    // Search by title (case-insensitive regex)
    if (search && search.trim()) {
      query.title = { $regex: search.trim(), $options: "i" };
    }

    // Filter by category
    if (category && category.trim()) {
      query.category = { $regex: category.trim(), $options: "i" };
    }

    // Filter for upcoming events (date >= today)
    if (upcoming === true) {
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Start of today
      query.date = { $gte: today };
    }

    const events = await Event.find(query)
      .populate("createdBy", "name email")
      .sort({ date: -1, createdAt: -1 })
      .limit(limit)
      .skip(skip);

    return events;
  }

  // Get event by ID with attendee count
  static async getEventById(eventId: string): Promise<any> {
    const event = await Event.findById(eventId).populate("createdBy", "name email");
    if (!event) {
      throw new Error("Event not found");
    }

    // Get attendee count
    const attendeeCount = await EventRsvp.countDocuments({ eventId });

    // Track event view asynchronously (don't wait)
    analyticsService.trackEventView(eventId).catch((err) => {
      console.error("Failed to track event view:", err);
    });

    return {
      ...event.toObject(),
      attendeeCount,
    };
  }

  // Register user for an event (RSVP)
  static async registerForEvent(eventId: string, userId: string): Promise<IEventRsvp> {
    // Check if event exists
    const event = await Event.findById(eventId);
    if (!event) {
      throw new Error("Event not found");
    }

    // Check if already registered
    const existingRsvp = await EventRsvp.findOne({
      eventId: new Types.ObjectId(eventId),
      userId: new Types.ObjectId(userId),
    });

    if (existingRsvp) {
      throw new Error("Already registered for this event");
    }

    // Create RSVP
    const rsvp = await EventRsvp.create({
      eventId: new Types.ObjectId(eventId),
      userId: new Types.ObjectId(userId),
    });

    // Track RSVP analytics asynchronously
    analyticsService.trackEventRSVP(eventId).catch((err) => {
      console.error("Failed to track RSVP:", err);
    });

    // Log user activity
    analyticsService.logUserActivity(userId, "RSVP_EVENT", eventId).catch((err) => {
      console.error("Failed to log RSVP activity:", err);
    });

    // Notify event creator (if not the RSVP user) - asynchronously to avoid blocking
    const creator = event.createdBy.toString();
    if (creator !== userId) {
      try {
        const User = require("../users/user.model").default;
        const user = await User.findById(userId).select("name");
        const userName = user?.name || "Someone";

        notificationService.createNotification(
          creator,
          userId,
          'EVENT_RSVP',
          `${userName} registered for your event`,
          eventId
        ).catch((err) => {
          console.error("Failed to create notification:", err);
        });
      } catch (err) {
        console.error("Failed to notify event creator:", err);
      }
    }

    return rsvp;
  }

  // Get event attendees
  static async getEventAttendees(eventId: string): Promise<any[]> {
    // Check if event exists
    const event = await Event.findById(eventId);
    if (!event) {
      throw new Error("Event not found");
    }

    // Get all RSVPs with user details
    const attendees = await EventRsvp.find({ eventId })
      .populate("userId", "name email")
      .sort({ registeredAt: -1 });

    return attendees.map((rsvp) => ({
      userId: rsvp.userId,
      registeredAt: rsvp.registeredAt,
    }));
  }

  // Check if user has RSVP'd to an event
  static async checkUserRsvp(eventId: string, userId: string): Promise<boolean> {
    const rsvp = await EventRsvp.findOne({
      eventId: new Types.ObjectId(eventId),
      userId: new Types.ObjectId(userId),
    });
    return !!rsvp;
  }

  // Cancel RSVP
  static async cancelRsvp(eventId: string, userId: string): Promise<void> {
    const result = await EventRsvp.deleteOne({
      eventId: new Types.ObjectId(eventId),
      userId: new Types.ObjectId(userId),
    });

    if (result.deletedCount === 0) {
      throw new Error("RSVP not found");
    }
  }

  // Delete event (only by creator)
  static async deleteEvent(eventId: string, userId: string): Promise<void> {
    const event = await Event.findById(eventId);
    
    if (!event) {
      throw new Error("Event not found");
    }

    // Check if user is the creator
    if (event.createdBy.toString() !== userId) {
      throw new Error("Unauthorized: Only the event creator can delete this event");
    }

    // Delete all RSVPs associated with this event
    await EventRsvp.deleteMany({ eventId: new Types.ObjectId(eventId) });

    // Delete the event
    await Event.findByIdAndDelete(eventId);
  }

  // Get events created by user
  static async getMyEvents(userId: string): Promise<any[]> {
    const events = await Event.find({ createdBy: new Types.ObjectId(userId) })
      .sort({ createdAt: -1 });

    // Get attendee count for each event
    const eventsWithAttendees = await Promise.all(
      events.map(async (event) => {
        const attendeeCount = await EventRsvp.countDocuments({ eventId: event._id });
        return {
          ...event.toObject(),
          attendeeCount,
        };
      })
    );

    return eventsWithAttendees;
  }

  // Get events user has RSVP'd to (My Tickets)
  static async getMyTickets(userId: string): Promise<any[]> {
    console.log('🎟️ EventService.getMyTickets - userId:', userId);
    
    const rsvps = await EventRsvp.find({ userId: new Types.ObjectId(userId) })
      .populate({
        path: 'eventId',
        populate: {
          path: 'createdBy',
          select: 'name email'
        }
      })
      .sort({ registeredAt: -1 });

    console.log(`📋 Found ${rsvps.length} RSVPs for user`);

    // Filter out RSVPs where event was deleted and map to proper format
    const tickets = rsvps
      .filter((rsvp) => {
        if (!rsvp.eventId) {
          console.warn('⚠️ RSVP has no eventId (event may have been deleted)');
          return false;
        }
        return true;
      })
      .map((rsvp) => {
        const event = rsvp.eventId as any;
        return {
          _id: event._id?.toString() || '',
          title: event.title || 'Unknown Event',
          description: event.description || '',
          date: event.date || new Date(),
          location: event.location || '',
          category: event.category || 'other',
          coverImage: event.coverImage || '',
          createdBy: event.createdBy
            ? {
                _id: event.createdBy._id?.toString() || '',
                name: event.createdBy.name || 'Unknown',
                email: event.createdBy.email || '',
              }
            : undefined,
          attendeeCount: event.attendeeCount || 0,
          price: event.price || 0,
          maxAttendees: event.maxAttendees,
          rsvpDate: rsvp.registeredAt,
          createdAt: event.createdAt,
          updatedAt: event.updatedAt,
        };
      });

    console.log(`✅ Returning ${tickets.length} valid tickets`);
    return tickets;
  }
}

/**
 * Organizer Event Utilities
 * Helper functions for organizer event management
 */

import { EventStatus, OrganizerEvent } from '../types/organizerEvent.types';

/**
 * Get status color for event badges
 */
export const getEventStatusColor = (status: EventStatus): string => {
    const colors: Record<EventStatus, string> = {
        draft: '#6B7280',
        published: '#3B82F6',
        upcoming: '#10B981',
        live: '#EF4444',
        completed: '#8B5CF6',
        cancelled: '#DC2626',
    };
    return colors[status];
};

/**
 * Get status label
 */
export const getEventStatusLabel = (status: EventStatus): string => {
    const labels: Record<EventStatus, string> = {
        draft: 'Draft',
        published: 'Published',
        upcoming: 'Upcoming',
        live: 'Live Now',
        completed: 'Completed',
        cancelled: 'Cancelled',
    };
    return labels[status];
};

/**
 * Calculate event status based on dates
 */
export const calculateEventStatus = (
    startDate: string,
    endDate: string,
    currentStatus: EventStatus
): EventStatus => {
    if (currentStatus === 'draft' || currentStatus === 'cancelled') {
        return currentStatus;
    }

    const now = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (now >= start && now <= end) {
        return 'live';
    } else if (now > end) {
        return 'completed';
    } else {
        return 'upcoming';
    }
};

/**
 * Format currency
 */
export const formatRevenue = (amount: number): string => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0,
    }).format(amount);
};

/**
 * Calculate revenue percentage
 */
export const calculateRevenuePercentage = (paid: number, total: number): number => {
    if (total === 0) return 0;
    return Math.round((paid / total) * 100);
};

/**
 * Get ticket sales percentage
 */
export const getTicketSalesPercentage = (sold: number, capacity: number): number => {
    if (capacity === 0) return 0;
    return Math.round((sold / capacity) * 100);
};

/**
 * Filter events by status and search
 */
export const filterEvents = (
    events: OrganizerEvent[],
    statusFilter: string,
    searchQuery: string
): OrganizerEvent[] => {
    return events.filter((event) => {
        // Status filter
        let matchesStatus = true;
        if (statusFilter === 'upcoming') {
            matchesStatus = event.status === 'upcoming' || event.status === 'published';
        } else if (statusFilter === 'past') {
            matchesStatus = event.status === 'completed';
        } else if (statusFilter === 'drafts') {
            matchesStatus = event.status === 'draft';
        } else if (statusFilter === 'live') {
            matchesStatus = event.status === 'live';
        }

        // Search filter
        const matchesSearch =
            event.eventName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            event.eventCategory.toLowerCase().includes(searchQuery.toLowerCase()) ||
            event.venue.name.toLowerCase().includes(searchQuery.toLowerCase());

        return matchesStatus && matchesSearch;
    });
};

/**
 * Sort events by date
 */
export const sortEventsByDate = (
    events: OrganizerEvent[],
    order: 'asc' | 'desc' = 'desc'
): OrganizerEvent[] => {
    return [...events].sort((a, b) => {
        const dateA = new Date(a.startDate).getTime();
        const dateB = new Date(b.startDate).getTime();
        return order === 'asc' ? dateA - dateB : dateB - dateA;
    });
};

/**
 * Get event link for sharing
 */
export const getEventShareLink = (eventId: string): string => {
    return `https://linsta.app/events/${eventId}`;
};

/**
 * Format attendee count
 */
export const formatAttendeeCount = (count: number): string => {
    if (count === 0) return 'No attendees';
    if (count === 1) return '1 attendee';
    return `${count} attendees`;
};

/**
 * Get check-in percentage
 */
export const getCheckInPercentage = (checkedIn: number, total: number): number => {
    if (total === 0) return 0;
    return Math.round((checkedIn / total) * 100);
};

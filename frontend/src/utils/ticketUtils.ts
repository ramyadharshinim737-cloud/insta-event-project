/**
 * Ticket Utility Functions
 * Helper functions for ticket operations
 */

import { Ticket, TicketStatus } from '../types/ticket.types';

/**
 * Calculate time remaining until event starts
 */
export const getTimeRemaining = (startDate: string): {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    total: number;
} => {
    const now = new Date().getTime();
    const eventStart = new Date(startDate).getTime();
    const total = eventStart - now;

    if (total <= 0) {
        return { days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 };
    }

    const seconds = Math.floor((total / 1000) % 60);
    const minutes = Math.floor((total / 1000 / 60) % 60);
    const hours = Math.floor((total / (1000 * 60 * 60)) % 24);
    const days = Math.floor(total / (1000 * 60 * 60 * 24));

    return { days, hours, minutes, seconds, total };
};

/**
 * Format countdown display
 */
export const formatCountdown = (startDate: string): string => {
    const { days, hours, minutes, total } = getTimeRemaining(startDate);

    if (total <= 0) return 'Event started';

    if (days > 0) {
        return `Starts in ${days}d ${hours}h`;
    } else if (hours > 0) {
        return `Starts in ${hours}h ${minutes}m`;
    } else {
        return `Starts in ${minutes}m`;
    }
};

/**
 * Get ticket status based on dates
 */
export const getTicketStatus = (
    startDate: string,
    endDate: string,
    cancelled: boolean = false
): TicketStatus => {
    if (cancelled) return 'cancelled';

    const now = new Date().getTime();
    const start = new Date(startDate).getTime();
    const end = new Date(endDate).getTime();

    if (now < start) return 'upcoming';
    if (now >= start && now <= end) return 'ongoing';
    return 'completed';
};

/**
 * Format date for display
 */
export const formatEventDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    });
};

/**
 * Format time for display
 */
export const formatEventTime = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
    });
};

/**
 * Format date and time together
 */
export const formatEventDateTime = (dateString: string): string => {
    return `${formatEventDate(dateString)} at ${formatEventTime(dateString)}`;
};

/**
 * Get status color
 */
export const getStatusColor = (status: TicketStatus): string => {
    switch (status) {
        case 'upcoming':
            return '#0A66C2';
        case 'ongoing':
            return '#27AE60';
        case 'completed':
            return '#6B7280';
        case 'cancelled':
            return '#DC2626';
        default:
            return '#6B7280';
    }
};

/**
 * Get status label
 */
export const getStatusLabel = (status: TicketStatus): string => {
    switch (status) {
        case 'upcoming':
            return 'Upcoming';
        case 'ongoing':
            return 'Live Now';
        case 'completed':
            return 'Completed';
        case 'cancelled':
            return 'Cancelled';
        default:
            return 'Unknown';
    }
};

/**
 * Filter tickets by status
 */
export const filterTickets = (
    tickets: Ticket[],
    filter: 'all' | TicketStatus
): Ticket[] => {
    if (filter === 'all') return tickets;
    return tickets.filter((ticket) => ticket.status === filter);
};

/**
 * Sort tickets (upcoming first, then by date)
 */
export const sortTickets = (tickets: Ticket[]): Ticket[] => {
    return [...tickets].sort((a, b) => {
        // Upcoming first
        if (a.status === 'upcoming' && b.status !== 'upcoming') return -1;
        if (a.status !== 'upcoming' && b.status === 'upcoming') return 1;

        // Then by start date
        return new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
    });
};

/**
 * Calculate refund amount
 */
export const calculateRefund = (
    totalAmount: number,
    startDate: string
): number => {
    const { days } = getTimeRemaining(startDate);

    if (days >= 7) return totalAmount * 0.9; // 90% refund
    if (days >= 3) return totalAmount * 0.5; // 50% refund
    if (days >= 1) return totalAmount * 0.25; // 25% refund
    return 0; // No refund
};

/**
 * Format currency
 */
export const formatCurrency = (amount: number): string => {
    return `₹${amount.toLocaleString('en-IN')}`;
};

/**
 * Generate QR code data (mock)
 */
export const generateQRData = (ticketId: string): string => {
    return `TICKET:${ticketId}:${Date.now()}`;
};

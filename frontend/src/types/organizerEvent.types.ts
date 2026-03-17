/**
 * Organizer Event Types
 * Type definitions for events created by organizers
 */

export type EventStatus = 'draft' | 'published' | 'upcoming' | 'live' | 'completed' | 'cancelled';
export type TicketStatus = 'paid' | 'pending' | 'refunded';
export type CheckInStatus = 'checked-in' | 'not-checked-in';

export interface TicketType {
    id: string;
    name: string;
    price: number;
    quantity: number;
    sold: number;
    description?: string;
}

export interface Attendee {
    id: string;
    name: string;
    email: string;
    phone?: string;
    ticketType: string;
    ticketId: string;
    paymentStatus: TicketStatus;
    checkInStatus: CheckInStatus;
    checkInTime?: string;
    bookingDate: string;
    amountPaid: number;
}

export interface Transaction {
    id: string;
    attendeeName: string;
    ticketType: string;
    amount: number;
    status: TicketStatus;
    paymentMethod: string;
    transactionDate: string;
}

export interface RevenueStats {
    totalRevenue: number;
    paidAmount: number;
    pendingAmount: number;
    refundedAmount: number;
    totalTicketsSold: number;
    paidTickets: number;
    pendingTickets: number;
}

export interface OrganizerEvent {
    id: string;
    eventName: string;
    eventCategory: string;
    eventPoster: string;
    eventBanner: string;
    description: string;
    startDate: string;
    endDate: string;
    duration: string;
    venue: {
        name: string;
        address: string;
        city: string;
        state: string;
        zipCode: string;
        latitude?: number;
        longitude?: number;
    };
    status: EventStatus;
    ticketTypes: TicketType[];
    totalCapacity: number;
    ticketsSold: number;
    revenue: RevenueStats;
    parkingInfo?: {
        available: boolean;
        totalSlots: number;
        fee?: number;
    };
    rules?: string[];
    organizerName: string;
    organizerEmail: string;
    organizerPhone: string;
    createdDate: string;
    publishedDate?: string;
    eventLink: string;
    attendees: Attendee[];
    transactions: Transaction[];
}

export interface EventFilters {
    status: 'all' | 'upcoming' | 'past' | 'drafts' | 'live';
    search: string;
}

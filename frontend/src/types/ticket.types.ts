/**
 * Ticket Type Definitions
 * TypeScript interfaces for tickets system
 */

export type TicketStatus = 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
export type TicketType = 'regular' | 'vip' | 'early-bird' | 'group';
export type PaymentStatus = 'paid' | 'pending' | 'refunded' | 'failed';
export type ParkingType = 'car' | 'bike' | 'both' | 'none';

export interface EventVenue {
    name: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    latitude?: number;
    longitude?: number;
    landmark?: string;
}

export interface ParkingInfo {
    totalSlots: number;
    availableSlots: number;
    parkingType: ParkingType;
    parkingFee?: number;
    entryGate?: string;
}

export interface TicketInfo {
    ticketId: string;
    ticketType: TicketType;
    quantity: number;
    seatNumber?: string;
    zone?: string;
    entryGate?: string;
    qrCode?: string; // URL or data
}

export interface PaymentInfo {
    status: PaymentStatus;
    totalAmount: number;
    basePrice: number;
    taxes: number;
    platformFee: number;
    discount?: number;
    walletUsed?: number;
    walletBalance?: number;
    paymentMethod?: string;
    transactionId?: string;
    paymentDate?: string;
}

export interface TimelineStep {
    id: string;
    title: string;
    description: string;
    timestamp: string;
    completed: boolean;
}

export interface Ticket {
    id: string;
    eventId: string;
    eventName: string;
    eventCategory: string;
    eventPoster: string;
    eventBanner: string;
    startDate: string; // ISO timestamp
    endDate: string; // ISO timestamp
    duration: string; // e.g., "3 hours"
    venue: EventVenue;
    status: TicketStatus;
    ticketInfo: TicketInfo;
    parkingInfo?: ParkingInfo;
    paymentInfo: PaymentInfo;
    bookingDate: string; // ISO timestamp
    organizerName: string;
    organizerContact?: string;
    timeline: TimelineStep[];
    isCancellable: boolean;
    isRefundable: boolean;
    refundPolicy?: string;
}

export interface TicketFilters {
    status: 'all' | TicketStatus;
    search: string;
}

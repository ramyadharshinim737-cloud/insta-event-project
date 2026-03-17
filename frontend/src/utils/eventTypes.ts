export type EventCategory = 'Academic' | 'Cultural' | 'Sports' | 'Networking' | 'Workshops';

export type LocationType = 'Online' | 'In-Person';

export interface EventHost {
  id: string;
  name: string;
  logo?: string;
  verified?: boolean;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  shortDescription: string;
  date: string; // ISO date string
  time: string;
  endTime?: string;
  location: string;
  locationType: LocationType;
  category: EventCategory;
  host: EventHost;
  bannerColor: string;
  bannerIcon: string;
  attendeeCount: number;
  maxAttendees?: number;
  isBookmarked?: boolean;
  hasRSVPd?: boolean;
  imageUrl?: string;
  ticketType?: 'Free' | 'Paid';
}

export interface EventFilter {
  category?: EventCategory;
  location?: string;
  dateRange?: 'today' | 'week' | 'month' | 'custom';
  searchQuery?: string;
}

export type EventCategory =
  | 'Conference'
  | 'Workshop'
  | 'Meetup'
  | 'Webinar'
  | 'Networking'
  | 'Festival';

export type TicketType = 'Free' | 'Paid';

export interface EventFormData {
  // Step 1
  title: string;
  description: string;
  category?: EventCategory;
  coverImageUri?: string;

  // Step 2
  startDate?: string; // ISO date string
  endDate?: string; // ISO date string
  startTime?: string; // HH:mm
  endTime?: string; // HH:mm
  timezone?: string;

  // Step 3
  isOnline: boolean;
  meetingLink?: string;
  venueAddress?: string;

  // Step 4
  ticketType: TicketType;
  capacity?: number;
  registrationDeadline?: string; // ISO date

  // Meta
  id?: string;
  status?: 'draft' | 'published';
}

export const defaultEventFormData: EventFormData = {
  title: '',
  description: '',
  category: undefined,
  coverImageUri: undefined,
  startDate: undefined,
  endDate: undefined,
  startTime: undefined,
  endTime: undefined,
  timezone: 'UTC',
  isOnline: true,
  meetingLink: '',
  venueAddress: '',
  ticketType: 'Free',
  capacity: undefined,
  registrationDeadline: undefined,
  status: 'draft',
};

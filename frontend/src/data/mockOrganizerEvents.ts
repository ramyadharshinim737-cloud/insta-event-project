/**
 * Mock Organizer Events Data
 * Comprehensive dummy data for event organizer management
 */

import { OrganizerEvent, Attendee, Transaction } from '../types/organizerEvent.types';

export const getMockOrganizerEvents = (): OrganizerEvent[] => {
    const now = new Date();
    const timestamp = Date.now();

    return [
        {
            id: 'org-event-1',
            eventName: 'Tech Summit 2024',
            eventCategory: 'Conference',
            eventPoster: `https://picsum.photos/seed/techsummit${timestamp}/400/300`,
            eventBanner: `https://picsum.photos/seed/techsummitbanner${timestamp}/1200/400`,
            description:
                'Join us for the biggest tech conference of the year! Network with industry leaders, attend workshops, and discover the latest in technology innovation.',
            startDate: new Date(now.getTime() + 15 * 24 * 60 * 60 * 1000).toISOString(),
            endDate: new Date(now.getTime() + 15 * 24 * 60 * 60 * 1000 + 8 * 60 * 60 * 1000).toISOString(),
            duration: '8 hours',
            venue: {
                name: 'Bangalore International Convention Centre',
                address: '26/1, Dr Rajkumar Road, Malleshwaram West',
                city: 'Bengaluru',
                state: 'Karnataka',
                zipCode: '560055',
                latitude: 13.0067,
                longitude: 77.5545,
            },
            status: 'upcoming',
            ticketTypes: [
                {
                    id: 'tt-1',
                    name: 'Early Bird',
                    price: 999,
                    quantity: 100,
                    sold: 85,
                    description: 'Limited early bird offer',
                },
                {
                    id: 'tt-2',
                    name: 'Regular',
                    price: 1499,
                    quantity: 200,
                    sold: 120,
                },
                {
                    id: 'tt-3',
                    name: 'VIP',
                    price: 2999,
                    quantity: 50,
                    sold: 35,
                },
            ],
            totalCapacity: 350,
            ticketsSold: 240,
            revenue: {
                totalRevenue: 389415,
                paidAmount: 350000,
                pendingAmount: 39415,
                refundedAmount: 0,
                totalTicketsSold: 240,
                paidTickets: 215,
                pendingTickets: 25,
            },
            parkingInfo: {
                available: true,
                totalSlots: 150,
                fee: 100,
            },
            rules: [
                'Entry only with valid ticket and ID proof',
                'No outside food or beverages allowed',
                'Photography allowed for personal use only',
                'Please arrive 30 minutes before the event starts',
            ],
            organizerName: 'TechEvents India',
            organizerEmail: 'contact@techevents.in',
            organizerPhone: '+91 98765 43210',
            createdDate: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString(),
            publishedDate: new Date(now.getTime() - 25 * 24 * 60 * 60 * 1000).toISOString(),
            eventLink: 'https://linsta.app/events/tech-summit-2024',
            attendees: generateMockAttendees(240, 215),
            transactions: generateMockTransactions(240),
        },
        {
            id: 'org-event-2',
            eventName: 'Startup Networking Mixer',
            eventCategory: 'Networking',
            eventPoster: `https://picsum.photos/seed/startupmixer${timestamp}/400/300`,
            eventBanner: `https://picsum.photos/seed/startupmixerbanner${timestamp}/1200/400`,
            description:
                'Connect with fellow entrepreneurs, investors, and startup enthusiasts. Great opportunity to pitch your ideas and find co-founders!',
            startDate: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString(),
            endDate: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000).toISOString(),
            duration: '4 hours',
            venue: {
                name: '91Springboard Koramangala',
                address: '175/A, 3rd Floor, Koramangala 4th Block',
                city: 'Bengaluru',
                state: 'Karnataka',
                zipCode: '560034',
            },
            status: 'upcoming',
            ticketTypes: [
                {
                    id: 'tt-4',
                    name: 'General Entry',
                    price: 299,
                    quantity: 80,
                    sold: 65,
                },
            ],
            totalCapacity: 80,
            ticketsSold: 65,
            revenue: {
                totalRevenue: 19435,
                paidAmount: 19435,
                pendingAmount: 0,
                refundedAmount: 0,
                totalTicketsSold: 65,
                paidTickets: 65,
                pendingTickets: 0,
            },
            parkingInfo: {
                available: true,
                totalSlots: 30,
                fee: 50,
            },
            rules: [
                'Business cards recommended for networking',
                'Smart casual dress code',
                'Complimentary refreshments included',
            ],
            organizerName: 'Startup Circle Bangalore',
            organizerEmail: 'hello@startupcircle.in',
            organizerPhone: '+91 87654 32109',
            createdDate: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000).toISOString(),
            publishedDate: new Date(now.getTime() - 8 * 24 * 60 * 60 * 1000).toISOString(),
            eventLink: 'https://linsta.app/events/startup-mixer-2024',
            attendees: generateMockAttendees(65, 65),
            transactions: generateMockTransactions(65),
        },
        {
            id: 'org-event-3',
            eventName: 'Music Festival - Summer Vibes',
            eventCategory: 'Entertainment',
            eventPoster: `https://picsum.photos/seed/musicfest${timestamp}/400/300`,
            eventBanner: `https://picsum.photos/seed/musicfestbanner${timestamp}/1200/400`,
            description:
                'Experience the best of indie and electronic music! Featuring 10+ artists, food trucks, and an amazing outdoor venue.',
            startDate: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString(),
            endDate: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000 + 10 * 60 * 60 * 1000).toISOString(),
            duration: '10 hours',
            venue: {
                name: 'Jayamahal Palace Grounds',
                address: 'Jayamahal Main Road',
                city: 'Bengaluru',
                state: 'Karnataka',
                zipCode: '560046',
            },
            status: 'completed',
            ticketTypes: [
                {
                    id: 'tt-5',
                    name: 'General Admission',
                    price: 799,
                    quantity: 500,
                    sold: 500,
                },
                {
                    id: 'tt-6',
                    name: 'VIP Pass',
                    price: 1999,
                    quantity: 100,
                    sold: 100,
                },
            ],
            totalCapacity: 600,
            ticketsSold: 600,
            revenue: {
                totalRevenue: 599400,
                paidAmount: 599400,
                pendingAmount: 0,
                refundedAmount: 0,
                totalTicketsSold: 600,
                paidTickets: 600,
                pendingTickets: 0,
            },
            parkingInfo: {
                available: true,
                totalSlots: 200,
                fee: 150,
            },
            rules: [
                'Age 18+ only',
                'No illegal substances',
                'Security check at entry',
                'Lost and found available',
            ],
            organizerName: 'Live Music Productions',
            organizerEmail: 'info@livemusicprod.com',
            organizerPhone: '+91 99887 76655',
            createdDate: new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000).toISOString(),
            publishedDate: new Date(now.getTime() - 55 * 24 * 60 * 60 * 1000).toISOString(),
            eventLink: 'https://linsta.app/events/summer-vibes-2024',
            attendees: generateMockAttendees(600, 600),
            transactions: generateMockTransactions(600),
        },
        {
            id: 'org-event-4',
            eventName: 'Design Thinking Workshop',
            eventCategory: 'Workshop',
            eventPoster: `https://picsum.photos/seed/designworkshop${timestamp}/400/300`,
            eventBanner: `https://picsum.photos/seed/designworkshopbanner${timestamp}/1200/400`,
            description:
                'Learn the fundamentals of design thinking and human-centered design. Hands-on workshop with real case studies.',
            startDate: new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000).toISOString(),
            endDate: new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000 + 6 * 60 * 60 * 1000).toISOString(),
            duration: '6 hours',
            venue: {
                name: 'Design Studio HSR',
                address: '27th Main Road, HSR Layout Sector 1',
                city: 'Bengaluru',
                state: 'Karnataka',
                zipCode: '560102',
            },
            status: 'upcoming',
            ticketTypes: [
                {
                    id: 'tt-7',
                    name: 'Workshop Pass',
                    price: 1299,
                    quantity: 30,
                    sold: 28,
                },
            ],
            totalCapacity: 30,
            ticketsSold: 28,
            revenue: {
                totalRevenue: 36372,
                paidAmount: 32373,
                pendingAmount: 3999,
                refundedAmount: 0,
                totalTicketsSold: 28,
                paidTickets: 25,
                pendingTickets: 3,
            },
            parkingInfo: {
                available: false,
                totalSlots: 0,
            },
            rules: [
                'Bring your own laptop',
                'Materials will be provided',
                'Certificate of completion included',
            ],
            organizerName: 'Design Academy',
            organizerEmail: 'learn@designacademy.in',
            organizerPhone: '+91 88776 65544',
            createdDate: new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000).toISOString(),
            publishedDate: new Date(now.getTime() - 12 * 24 * 60 * 60 * 1000).toISOString(),
            eventLink: 'https://linsta.app/events/design-thinking-workshop',
            attendees: generateMockAttendees(28, 25),
            transactions: generateMockTransactions(28),
        },
        {
            id: 'org-event-5',
            eventName: 'Food & Wine Festival',
            eventCategory: 'Food & Beverage',
            eventPoster: `https://picsum.photos/seed/foodfest${timestamp}/400/300`,
            eventBanner: `https://picsum.photos/seed/foodfestbanner${timestamp}/1200/400`,
            description: 'A celebration of culinary excellence! Sample dishes from 20+ restaurants and wineries.',
            startDate: new Date(now.getTime() + 20 * 24 * 60 * 60 * 1000).toISOString(),
            endDate: new Date(now.getTime() + 20 * 24 * 60 * 60 * 1000 + 6 * 60 * 60 * 1000).toISOString(),
            duration: '6 hours',
            venue: {
                name: 'UB City Amphitheatre',
                address: '24, Vittal Mallya Road',
                city: 'Bengaluru',
                state: 'Karnataka',
                zipCode: '560001',
            },
            status: 'draft',
            ticketTypes: [
                {
                    id: 'tt-8',
                    name: 'Tasting Pass',
                    price: 1599,
                    quantity: 200,
                    sold: 0,
                },
                {
                    id: 'tt-9',
                    name: 'Premium Experience',
                    price: 2999,
                    quantity: 50,
                    sold: 0,
                },
            ],
            totalCapacity: 250,
            ticketsSold: 0,
            revenue: {
                totalRevenue: 0,
                paidAmount: 0,
                pendingAmount: 0,
                refundedAmount: 0,
                totalTicketsSold: 0,
                paidTickets: 0,
                pendingTickets: 0,
            },
            parkingInfo: {
                available: true,
                totalSlots: 100,
                fee: 200,
            },
            rules: [
                'Age 21+ for wine tasting',
                'Valid ID required',
                'Designated driver recommended',
            ],
            organizerName: 'Gourmet Events',
            organizerEmail: 'events@gourmet.in',
            organizerPhone: '+91 77665 54433',
            createdDate: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            eventLink: 'https://linsta.app/events/food-wine-festival',
            attendees: [],
            transactions: [],
        },
    ];
};

// Helper function to generate mock attendees
function generateMockAttendees(total: number, paid: number): Attendee[] {
    const attendees: Attendee[] = [];
    const now = new Date();
    const firstNames = ['Rahul', 'Priya', 'Amit', 'Sneha', 'Vikram', 'Anjali', 'Rohan', 'Divya', 'Arjun', 'Kavya'];
    const lastNames = ['Sharma', 'Kumar', 'Patel', 'Singh', 'Reddy', 'Nair', 'Gupta', 'Iyer', 'Mehta', 'Joshi'];

    for (let i = 0; i < total; i++) {
        const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
        const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
        const isPaid = i < paid;
        const isCheckedIn = isPaid && Math.random() > 0.3;

        attendees.push({
            id: `attendee-${i + 1}`,
            name: `${firstName} ${lastName}`,
            email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@example.com`,
            phone: `+91 ${Math.floor(Math.random() * 9000000000) + 1000000000}`,
            ticketType: i < 50 ? 'Early Bird' : i < 150 ? 'Regular' : 'VIP',
            ticketId: `TKT-${String(i + 1).padStart(6, '0')}`,
            paymentStatus: isPaid ? 'paid' : 'pending',
            checkInStatus: isCheckedIn ? 'checked-in' : 'not-checked-in',
            checkInTime: isCheckedIn ? new Date(now.getTime() - Math.random() * 3 * 60 * 60 * 1000).toISOString() : undefined,
            bookingDate: new Date(now.getTime() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
            amountPaid: isPaid ? (i < 50 ? 999 : i < 150 ? 1499 : 2999) : 0,
        });
    }

    return attendees;
}

// Helper function to generate mock transactions
function generateMockTransactions(count: number): Transaction[] {
    const transactions: Transaction[] = [];
    const now = new Date();
    const methods = ['UPI', 'Credit Card', 'Debit Card', 'Net Banking', 'Wallet'];

    for (let i = 0; i < count; i++) {
        const isPaid = i < count * 0.9;
        transactions.push({
            id: `txn-${String(i + 1).padStart(8, '0')}`,
            attendeeName: `Attendee ${i + 1}`,
            ticketType: i < 50 ? 'Early Bird' : i < 150 ? 'Regular' : 'VIP',
            amount: i < 50 ? 999 : i < 150 ? 1499 : 2999,
            status: isPaid ? 'paid' : 'pending',
            paymentMethod: isPaid ? methods[Math.floor(Math.random() * methods.length)] : 'Pending',
            transactionDate: new Date(now.getTime() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
        });
    }

    return transactions;
}

export const getOrganizerEventById = (id: string): OrganizerEvent | undefined => {
    return getMockOrganizerEvents().find((event) => event.id === id);
};

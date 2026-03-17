import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    TextInput,
    Share,
    Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';

interface Attendee {
    id: string;
    name: string;
    email: string;
    ticketType: string;
    registeredDate: string;
    checkInStatus: 'Checked In' | 'Not Checked In';
    checkInTime?: string;
}

interface EventDetail {
    id: string;
    title: string;
    description: string;
    category: string;
    dateTime: string;
    location: string;
    status: 'Upcoming' | 'Draft' | 'Past';
    bannerColor: string;
    registrations: number;
    capacity: number;
    revenue: number;
    views: number;
    shares: number;
    organizer: string;
}

const mockEventDetail: EventDetail = {
    id: 'e1',
    title: 'Tech Networking Night',
    description: 'Join us for an evening of networking with tech professionals, entrepreneurs, and innovators. Great opportunity to expand your network, share ideas, and collaborate on exciting projects.',
    category: 'Networking',
    dateTime: 'Jan 20, 2025 • 6:00 PM - 9:00 PM',
    location: 'Indiranagar, Bengaluru',
    status: 'Upcoming',
    bannerColor: '#667eea',
    registrations: 128,
    capacity: 200,
    revenue: 64000,
    views: 1250,
    shares: 45,
    organizer: 'John Doe',
};

const mockAttendees: Attendee[] = [
    {
        id: 'a1',
        name: 'Alice Johnson',
        email: 'alice.j@example.com',
        ticketType: 'VIP',
        registeredDate: 'Dec 15, 2024',
        checkInStatus: 'Checked In',
        checkInTime: 'Jan 20, 6:15 PM',
    },
    {
        id: 'a2',
        name: 'Bob Smith',
        email: 'bob.smith@example.com',
        ticketType: 'General',
        registeredDate: 'Dec 18, 2024',
        checkInStatus: 'Not Checked In',
    },
    {
        id: 'a3',
        name: 'Carol Williams',
        email: 'carol.w@example.com',
        ticketType: 'Early Bird',
        registeredDate: 'Dec 10, 2024',
        checkInStatus: 'Checked In',
        checkInTime: 'Jan 20, 6:05 PM',
    },
    {
        id: 'a4',
        name: 'David Brown',
        email: 'david.b@example.com',
        ticketType: 'General',
        registeredDate: 'Dec 20, 2024',
        checkInStatus: 'Not Checked In',
    },
    {
        id: 'a5',
        name: 'Emma Davis',
        email: 'emma.davis@example.com',
        ticketType: 'VIP',
        registeredDate: 'Dec 12, 2024',
        checkInStatus: 'Checked In',
        checkInTime: 'Jan 20, 6:20 PM',
    },
];

interface Props {
    navigation?: any;
    route?: any;
}

const EventDetailScreen: React.FC<Props> = ({ navigation, route }) => {
    const { colors } = useTheme();
    const eventId = route?.params?.eventId || 'e1';

    const [event] = useState<EventDetail>(mockEventDetail);
    const [attendees, setAttendees] = useState<Attendee[]>(mockAttendees);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState<'All' | 'Checked In' | 'Not Checked In'>('All');

    const filteredAttendees = attendees.filter((attendee) => {
        const matchesSearch = attendee.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            attendee.email.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesFilter = filterStatus === 'All' || attendee.checkInStatus === filterStatus;
        return matchesSearch && matchesFilter;
    });

    const stats = {
        checkedIn: attendees.filter(a => a.checkInStatus === 'Checked In').length,
        notCheckedIn: attendees.filter(a => a.checkInStatus === 'Not Checked In').length,
        fillRate: ((event.registrations / event.capacity) * 100).toFixed(0),
        avgTicketPrice: (event.revenue / event.registrations).toFixed(0),
    };

    const handleShare = async () => {
        try {
            await Share.share({
                message: `Check out this event: ${event.title}\n${event.dateTime}\n${event.location}`,
            });
        } catch (error) {
            Alert.alert('Error', 'Could not share event');
        }
    };

    const handleEdit = () => {
        navigation?.navigate?.('EditEvent', { eventId: event.id });
    };

    const handleCancel = () => {
        Alert.alert(
            'Cancel Event',
            'Are you sure you want to cancel this event? This action cannot be undone.',
            [
                { text: 'No', style: 'cancel' },
                {
                    text: 'Yes, Cancel Event', style: 'destructive', onPress: () => {
                        Alert.alert('Event Cancelled', 'The event has been cancelled.');
                        navigation?.goBack?.();
                    }
                },
            ]
        );
    };

    const toggleCheckIn = (attendeeId: string) => {
        setAttendees(attendees.map(a => {
            if (a.id === attendeeId) {
                const newStatus: 'Checked In' | 'Not Checked In' =
                    a.checkInStatus === 'Checked In' ? 'Not Checked In' : 'Checked In';
                return {
                    ...a,
                    checkInStatus: newStatus,
                    checkInTime: newStatus === 'Checked In' ? new Date().toLocaleString() : undefined,
                };
            }
            return a;
        }));
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Upcoming': return '#10b981';
            case 'Draft': return '#f59e0b';
            case 'Past': return '#6b7280';
            default: return colors.textSecondary;
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            {/* Header */}
            <View style={[styles.header, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation?.goBack?.()}
                    activeOpacity={0.7}
                >
                    <Ionicons name="arrow-back" size={24} color={colors.text} />
                </TouchableOpacity>
                <View style={styles.headerTitleContainer}>
                    <Text style={[styles.headerTitle, { color: colors.text }]}>Event Details</Text>
                </View>
                <TouchableOpacity
                    style={styles.shareButton}
                    onPress={handleShare}
                    activeOpacity={0.7}
                >
                    <Ionicons name="share-social-outline" size={24} color={colors.text} />
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                {/* Event Banner */}
                <View style={[styles.banner, { backgroundColor: event.bannerColor }]}>
                    <View style={styles.bannerOverlay}>
                        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(event.status) }]}>
                            <Text style={styles.statusBadgeText}>{event.status}</Text>
                        </View>
                        <View style={styles.categoryBadge}>
                            <Text style={styles.categoryBadgeText}>{event.category}</Text>
                        </View>
                    </View>
                </View>

                {/* Event Info */}
                <View style={[styles.section, { backgroundColor: colors.surface }]}>
                    <Text style={[styles.eventTitle, { color: colors.text }]}>{event.title}</Text>

                    <View style={styles.infoRow}>
                        <Ionicons name="time-outline" size={20} color={colors.textSecondary} />
                        <Text style={[styles.infoText, { color: colors.text }]}>{event.dateTime}</Text>
                    </View>

                    <View style={styles.infoRow}>
                        <Ionicons name="location-outline" size={20} color={colors.textSecondary} />
                        <Text style={[styles.infoText, { color: colors.text }]}>{event.location}</Text>
                    </View>

                    <View style={styles.infoRow}>
                        <Ionicons name="person-outline" size={20} color={colors.textSecondary} />
                        <Text style={[styles.infoText, { color: colors.text }]}>Organized by {event.organizer}</Text>
                    </View>

                    <View style={[styles.divider, { backgroundColor: colors.border }]} />

                    <Text style={[styles.sectionTitle, { color: colors.text }]}>Description</Text>
                    <Text style={[styles.description, { color: colors.textSecondary }]}>{event.description}</Text>
                </View>

                {/* Statistics */}
                <View style={[styles.section, { backgroundColor: colors.surface }]}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>Event Statistics</Text>

                    <View style={styles.statsGrid}>
                        <View style={[styles.statBox, { backgroundColor: colors.background }]}>
                            <Ionicons name="people" size={28} color="#0284c7" />
                            <Text style={[styles.statValue, { color: colors.text }]}>{event.registrations}/{event.capacity}</Text>
                            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Registrations</Text>
                        </View>

                        <View style={[styles.statBox, { backgroundColor: colors.background }]}>
                            <Ionicons name="trending-up" size={28} color="#10b981" />
                            <Text style={[styles.statValue, { color: colors.text }]}>{stats.fillRate}%</Text>
                            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Fill Rate</Text>
                        </View>

                        <View style={[styles.statBox, { backgroundColor: colors.background }]}>
                            <Ionicons name="cash" size={28} color="#be185d" />
                            <Text style={[styles.statValue, { color: colors.text }]}>₹{(event.revenue / 1000).toFixed(0)}k</Text>
                            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Revenue</Text>
                        </View>

                        <View style={[styles.statBox, { backgroundColor: colors.background }]}>
                            <Ionicons name="eye" size={28} color="#7c3aed" />
                            <Text style={[styles.statValue, { color: colors.text }]}>{event.views}</Text>
                            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Views</Text>
                        </View>

                        <View style={[styles.statBox, { backgroundColor: colors.background }]}>
                            <Ionicons name="checkmark-done" size={28} color="#16a34a" />
                            <Text style={[styles.statValue, { color: colors.text }]}>{stats.checkedIn}</Text>
                            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Checked In</Text>
                        </View>

                        <View style={[styles.statBox, { backgroundColor: colors.background }]}>
                            <Ionicons name="pricetag" size={28} color="#ea580c" />
                            <Text style={[styles.statValue, { color: colors.text }]}>₹{stats.avgTicketPrice}</Text>
                            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Avg Price</Text>
                        </View>
                    </View>
                </View>

                {/* Quick Actions */}
                <View style={[styles.section, { backgroundColor: colors.surface }]}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>Quick Actions</Text>

                    <View style={styles.actionsGrid}>
                        <TouchableOpacity
                            style={[styles.actionCard, { backgroundColor: colors.background, borderColor: colors.border }]}
                            onPress={handleEdit}
                        >
                            <Ionicons name="create-outline" size={32} color={colors.primary} />
                            <Text style={[styles.actionText, { color: colors.text }]}>Edit Event</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.actionCard, { backgroundColor: colors.background, borderColor: colors.border }]}
                            onPress={() => Alert.alert('Export', 'Export attendee list')}
                        >
                            <Ionicons name="download-outline" size={32} color="#10b981" />
                            <Text style={[styles.actionText, { color: colors.text }]}>Export List</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.actionCard, { backgroundColor: colors.background, borderColor: colors.border }]}
                            onPress={() => Alert.alert('Send Update', 'Send update to attendees')}
                        >
                            <Ionicons name="mail-outline" size={32} color="#0284c7" />
                            <Text style={[styles.actionText, { color: colors.text }]}>Send Update</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.actionCard, { backgroundColor: colors.background, borderColor: colors.border }]}
                            onPress={handleCancel}
                        >
                            <Ionicons name="close-circle-outline" size={32} color="#ef4444" />
                            <Text style={[styles.actionText, { color: colors.text }]}>Cancel Event</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Attendees Section */}
                <View style={[styles.section, { backgroundColor: colors.surface }]}>
                    <View style={styles.attendeesHeader}>
                        <Text style={[styles.sectionTitle, { color: colors.text }]}>
                            Attendees ({filteredAttendees.length})
                        </Text>
                        <TouchableOpacity
                            style={[styles.scanButton, { backgroundColor: colors.primary }]}
                            onPress={() => Alert.alert('Scan QR', 'Open QR scanner for check-in')}
                        >
                            <Ionicons name="qr-code-outline" size={18} color="#fff" />
                            <Text style={styles.scanButtonText}>Scan</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Search */}
                    <View style={[styles.searchContainer, { backgroundColor: colors.background, borderColor: colors.border }]}>
                        <Ionicons name="search" size={20} color={colors.textSecondary} />
                        <TextInput
                            style={[styles.searchInput, { color: colors.text }]}
                            placeholder="Search attendees..."
                            placeholderTextColor={colors.textSecondary}
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                        />
                        {searchQuery.length > 0 && (
                            <TouchableOpacity onPress={() => setSearchQuery('')}>
                                <Ionicons name="close-circle" size={20} color={colors.textSecondary} />
                            </TouchableOpacity>
                        )}
                    </View>

                    {/* Filter Tabs */}
                    <View style={styles.filterTabs}>
                        {(['All', 'Checked In', 'Not Checked In'] as const).map((filter) => (
                            <TouchableOpacity
                                key={filter}
                                style={[
                                    styles.filterTab,
                                    {
                                        backgroundColor: filterStatus === filter ? colors.primary : colors.background,
                                        borderColor: colors.border,
                                    }
                                ]}
                                onPress={() => setFilterStatus(filter)}
                            >
                                <Text style={[
                                    styles.filterTabText,
                                    { color: filterStatus === filter ? '#fff' : colors.text }
                                ]}>
                                    {filter}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    {/* Attendee List */}
                    <View style={styles.attendeesList}>
                        {filteredAttendees.map((attendee) => (
                            <View
                                key={attendee.id}
                                style={[styles.attendeeCard, { backgroundColor: colors.background, borderColor: colors.border }]}
                            >
                                <View style={styles.attendeeInfo}>
                                    <View style={[styles.attendeeAvatar, { backgroundColor: colors.primary }]}>
                                        <Text style={styles.attendeeInitials}>
                                            {attendee.name.split(' ').map(n => n[0]).join('')}
                                        </Text>
                                    </View>

                                    <View style={styles.attendeeDetails}>
                                        <Text style={[styles.attendeeName, { color: colors.text }]}>{attendee.name}</Text>
                                        <Text style={[styles.attendeeEmail, { color: colors.textSecondary }]}>{attendee.email}</Text>
                                        <View style={styles.attendeeMeta}>
                                            <View style={[styles.ticketTypeBadge, { backgroundColor: colors.surface }]}>
                                                <Text style={[styles.ticketTypeText, { color: colors.text }]}>{attendee.ticketType}</Text>
                                            </View>
                                            <Text style={[styles.registeredDate, { color: colors.textSecondary }]}>
                                                • Registered {attendee.registeredDate}
                                            </Text>
                                        </View>
                                        {attendee.checkInTime && (
                                            <Text style={[styles.checkInTime, { color: '#10b981' }]}>
                                                ✓ Checked in at {attendee.checkInTime}
                                            </Text>
                                        )}
                                    </View>
                                </View>

                                <TouchableOpacity
                                    style={[
                                        styles.checkInButton,
                                        {
                                            backgroundColor: attendee.checkInStatus === 'Checked In' ? '#dcfce7' : colors.primary,
                                            borderColor: attendee.checkInStatus === 'Checked In' ? '#16a34a' : colors.primary,
                                        }
                                    ]}
                                    onPress={() => toggleCheckIn(attendee.id)}
                                >
                                    <Ionicons
                                        name={attendee.checkInStatus === 'Checked In' ? 'checkmark-circle' : 'scan-outline'}
                                        size={20}
                                        color={attendee.checkInStatus === 'Checked In' ? '#16a34a' : '#fff'}
                                    />
                                    <Text style={[
                                        styles.checkInButtonText,
                                        { color: attendee.checkInStatus === 'Checked In' ? '#16a34a' : '#fff' }
                                    ]}>
                                        {attendee.checkInStatus === 'Checked In' ? 'Checked In' : 'Check In'}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        ))}

                        {filteredAttendees.length === 0 && (
                            <View style={styles.emptyAttendees}>
                                <Ionicons name="people-outline" size={48} color={colors.textSecondary} />
                                <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                                    {searchQuery ? 'No attendees found' : 'No attendees yet'}
                                </Text>
                            </View>
                        )}
                    </View>
                </View>

                <View style={{ height: 40 }} />
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderBottomWidth: 1,
    },
    backButton: {
        padding: 8,
        marginRight: 8,
    },
    headerTitleContainer: {
        flex: 1,
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
        letterSpacing: 0.3,
    },
    shareButton: {
        padding: 8,
    },
    scrollContent: {
        paddingBottom: 20,
    },
    banner: {
        height: 200,
        justifyContent: 'flex-end',
    },
    bannerOverlay: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 16,
    },
    statusBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
    },
    statusBadgeText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '700',
        textTransform: 'uppercase',
    },
    categoryBadge: {
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
    },
    categoryBadgeText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#262626',
    },
    section: {
        padding: 16,
        marginTop: 16,
        marginHorizontal: 16,
        borderRadius: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    eventTitle: {
        fontSize: 24,
        fontWeight: '700',
        marginBottom: 16,
        lineHeight: 32,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 12,
    },
    infoText: {
        fontSize: 15,
        flex: 1,
    },
    divider: {
        height: 1,
        marginVertical: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        marginBottom: 12,
    },
    description: {
        fontSize: 15,
        lineHeight: 22,
    },
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    statBox: {
        flex: 1,
        minWidth: '30%',
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        gap: 8,
    },
    statValue: {
        fontSize: 20,
        fontWeight: '700',
    },
    statLabel: {
        fontSize: 12,
        textAlign: 'center',
    },
    actionsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    actionCard: {
        flex: 1,
        minWidth: '45%',
        padding: 20,
        borderRadius: 12,
        borderWidth: 1,
        alignItems: 'center',
        gap: 8,
    },
    actionText: {
        fontSize: 14,
        fontWeight: '600',
        textAlign: 'center',
    },
    attendeesHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    scanButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 8,
        gap: 6,
    },
    scanButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 12,
        borderWidth: 1,
        marginBottom: 12,
        gap: 10,
    },
    searchInput: {
        flex: 1,
        fontSize: 15,
        padding: 0,
    },
    filterTabs: {
        flexDirection: 'row',
        gap: 8,
        marginBottom: 16,
    },
    filterTab: {
        flex: 1,
        paddingVertical: 10,
        paddingHorizontal: 12,
        borderRadius: 8,
        borderWidth: 1,
        alignItems: 'center',
    },
    filterTabText: {
        fontSize: 13,
        fontWeight: '600',
    },
    attendeesList: {
        gap: 12,
    },
    attendeeCard: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 12,
        borderRadius: 12,
        borderWidth: 1,
        gap: 12,
    },
    attendeeInfo: {
        flex: 1,
        flexDirection: 'row',
        gap: 12,
    },
    attendeeAvatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
    },
    attendeeInitials: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '700',
    },
    attendeeDetails: {
        flex: 1,
        gap: 4,
    },
    attendeeName: {
        fontSize: 15,
        fontWeight: '600',
    },
    attendeeEmail: {
        fontSize: 13,
    },
    attendeeMeta: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        flexWrap: 'wrap',
    },
    ticketTypeBadge: {
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 6,
    },
    ticketTypeText: {
        fontSize: 11,
        fontWeight: '600',
    },
    registeredDate: {
        fontSize: 11,
    },
    checkInTime: {
        fontSize: 12,
        fontWeight: '500',
    },
    checkInButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 8,
        borderWidth: 1,
        gap: 6,
    },
    checkInButtonText: {
        fontSize: 13,
        fontWeight: '600',
    },
    emptyAttendees: {
        padding: 48,
        alignItems: 'center',
        gap: 12,
    },
    emptyText: {
        fontSize: 15,
    },
});

export default EventDetailScreen;

/**
 * EventDashboardScreen
 * Comprehensive event management dashboard with tabs
 */

import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Image,
    TextInput,
    Modal,
    Alert,
    Share,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../context/ThemeContext';
import { getOrganizerEventById } from '../../data/mockOrganizerEvents';
import {
    getEventStatusColor,
    getEventStatusLabel,
    formatRevenue,
    getTicketSalesPercentage,
    getCheckInPercentage,
    formatAttendeeCount,
} from '../../utils/organizerEventUtils';
import { formatEventDate, formatEventTime } from '../../utils/ticketUtils';
import CountdownTimer from '../../components/tickets/CountdownTimer';

interface Props {
    navigation?: any;
    route?: any;
}

type TabType = 'details' | 'attendees' | 'revenue';

const EventDashboardScreen: React.FC<Props> = ({ navigation, route }) => {
    const { colors } = useTheme();
    const eventId = route?.params?.eventId || 'org-event-1';
    const event = getOrganizerEventById(eventId);

    const [activeTab, setActiveTab] = useState<TabType>('details');
    const [searchAttendee, setSearchAttendee] = useState('');
    const [attendeeFilter, setAttendeeFilter] = useState<'all' | 'paid' | 'pending'>('all');
    const [showShareModal, setShowShareModal] = useState(false);

    if (!event) {
        return (
            <View style={[styles.container, { backgroundColor: colors.background }]}>
                <Text style={{ color: colors.text }}>Event not found</Text>
            </View>
        );
    }

    const salesPercentage = getTicketSalesPercentage(event.ticketsSold, event.totalCapacity);
    const checkedInCount = event.attendees.filter((a) => a.checkInStatus === 'checked-in').length;
    const checkInPercentage = getCheckInPercentage(checkedInCount, event.attendees.length);

    // Filter attendees
    const filteredAttendees = event.attendees.filter((attendee) => {
        const matchesSearch =
            attendee.name.toLowerCase().includes(searchAttendee.toLowerCase()) ||
            attendee.email.toLowerCase().includes(searchAttendee.toLowerCase());
        const matchesFilter =
            attendeeFilter === 'all' ||
            (attendeeFilter === 'paid' && attendee.paymentStatus === 'paid') ||
            (attendeeFilter === 'pending' && attendee.paymentStatus === 'pending');
        return matchesSearch && matchesFilter;
    });

    const handleShare = async () => {
        try {
            await Share.share({
                message: `Check out ${event.eventName}! ${event.eventLink}`,
                title: event.eventName,
            });
        } catch (error) {
            console.error(error);
        }
    };

    const handleCheckIn = (attendeeId: string) => {
        Alert.alert('Check-in Successful', 'Attendee has been checked in!');
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            {/* Event Banner Header */}
            <View style={styles.bannerContainer}>
                <Image source={{ uri: event.eventBanner }} style={styles.banner} />
                <LinearGradient
                    colors={['rgba(0,0,0,0.3)', 'rgba(0,0,0,0.8)']}
                    style={styles.bannerGradient}
                >
                    {/* Back Button */}
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => navigation?.goBack?.()}
                        activeOpacity={0.7}
                    >
                        <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
                    </TouchableOpacity>

                    {/* Event Info */}
                    <View style={styles.bannerContent}>
                        <View
                            style={[
                                styles.statusBadge,
                                { backgroundColor: getEventStatusColor(event.status) },
                            ]}
                        >
                            <View style={styles.statusDot} />
                            <Text style={styles.statusText}>{getEventStatusLabel(event.status)}</Text>
                        </View>
                        <Text style={styles.eventTitle}>{event.eventName}</Text>
                        <Text style={styles.eventCategory}>{event.eventCategory}</Text>
                    </View>
                </LinearGradient>
            </View>

            {/* Countdown Timer */}
            {event.status === 'upcoming' && (
                <View style={[styles.countdownSection, { backgroundColor: colors.surface }]}>
                    <CountdownTimer startDate={event.startDate} />
                </View>
            )}

            {/* Quick Actions Bar */}
            <View style={[styles.actionsBar, { backgroundColor: colors.surface }]}>
                <TouchableOpacity
                    style={[styles.actionButton, { backgroundColor: colors.background }]}
                    onPress={() => navigation?.navigate?.('EditEvent', { eventId: event.id })}
                    activeOpacity={0.7}
                >
                    <Ionicons name="create-outline" size={20} color={colors.primary} />
                    <Text style={[styles.actionButtonText, { color: colors.text }]}>Edit</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.actionButton, { backgroundColor: colors.background }]}
                    onPress={() => setShowShareModal(true)}
                    activeOpacity={0.7}
                >
                    <Ionicons name="share-social-outline" size={20} color={colors.primary} />
                    <Text style={[styles.actionButtonText, { color: colors.text }]}>Share</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.actionButton, { backgroundColor: colors.primary }]}
                    activeOpacity={0.7}
                >
                    <Ionicons name="people-outline" size={20} color="#FFFFFF" />
                    <Text style={styles.actionButtonTextPrimary}>
                        {formatAttendeeCount(event.attendees.length)}
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Tab Navigation */}
            <View style={[styles.tabBar, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
                <TouchableOpacity
                    style={[
                        styles.tab,
                        activeTab === 'details' && { borderBottomColor: colors.primary },
                    ]}
                    onPress={() => setActiveTab('details')}
                    activeOpacity={0.7}
                >
                    <Ionicons
                        name="information-circle-outline"
                        size={20}
                        color={activeTab === 'details' ? colors.primary : colors.textSecondary}
                    />
                    <Text
                        style={[
                            styles.tabText,
                            {
                                color: activeTab === 'details' ? colors.primary : colors.textSecondary,
                            },
                        ]}
                    >
                        Details
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[
                        styles.tab,
                        activeTab === 'attendees' && { borderBottomColor: colors.primary },
                    ]}
                    onPress={() => setActiveTab('attendees')}
                    activeOpacity={0.7}
                >
                    <Ionicons
                        name="people-outline"
                        size={20}
                        color={activeTab === 'attendees' ? colors.primary : colors.textSecondary}
                    />
                    <Text
                        style={[
                            styles.tabText,
                            {
                                color: activeTab === 'attendees' ? colors.primary : colors.textSecondary,
                            },
                        ]}
                    >
                        Attendees
                    </Text>
                    {event.attendees.length > 0 && (
                        <View style={[styles.tabBadge, { backgroundColor: colors.primary }]}>
                            <Text style={styles.tabBadgeText}>{event.attendees.length}</Text>
                        </View>
                    )}
                </TouchableOpacity>

                <TouchableOpacity
                    style={[
                        styles.tab,
                        activeTab === 'revenue' && { borderBottomColor: colors.primary },
                    ]}
                    onPress={() => setActiveTab('revenue')}
                    activeOpacity={0.7}
                >
                    <Ionicons
                        name="trending-up-outline"
                        size={20}
                        color={activeTab === 'revenue' ? colors.primary : colors.textSecondary}
                    />
                    <Text
                        style={[
                            styles.tabText,
                            {
                                color: activeTab === 'revenue' ? colors.primary : colors.textSecondary,
                            },
                        ]}
                    >
                        Revenue
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Tab Content */}
            <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
                {/* DETAILS TAB */}
                {activeTab === 'details' && (
                    <View style={styles.detailsTab}>
                        {/* Description */}
                        <View style={[styles.section, { backgroundColor: colors.surface }]}>
                            <Text style={[styles.sectionTitle, { color: colors.text }]}>
                                About Event
                            </Text>
                            <Text style={[styles.description, { color: colors.textSecondary }]}>
                                {event.description}
                            </Text>
                        </View>

                        {/* Date & Time */}
                        <View style={[styles.section, { backgroundColor: colors.surface }]}>
                            <Text style={[styles.sectionTitle, { color: colors.text }]}>
                                Date & Time
                            </Text>
                            <View style={styles.infoRow}>
                                <Ionicons name="calendar" size={20} color={colors.primary} />
                                <View style={styles.infoContent}>
                                    <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
                                        Date
                                    </Text>
                                    <Text style={[styles.infoValue, { color: colors.text }]}>
                                        {formatEventDate(event.startDate)}
                                    </Text>
                                </View>
                            </View>
                            <View style={styles.infoRow}>
                                <Ionicons name="time" size={20} color={colors.primary} />
                                <View style={styles.infoContent}>
                                    <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
                                        Time
                                    </Text>
                                    <Text style={[styles.infoValue, { color: colors.text }]}>
                                        {formatEventTime(event.startDate)}
                                    </Text>
                                </View>
                            </View>
                            <View style={styles.infoRow}>
                                <Ionicons name="hourglass" size={20} color={colors.primary} />
                                <View style={styles.infoContent}>
                                    <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
                                        Duration
                                    </Text>
                                    <Text style={[styles.infoValue, { color: colors.text }]}>
                                        {event.duration}
                                    </Text>
                                </View>
                            </View>
                        </View>

                        {/* Venue */}
                        <View style={[styles.section, { backgroundColor: colors.surface }]}>
                            <Text style={[styles.sectionTitle, { color: colors.text }]}>Venue</Text>
                            <View style={styles.infoRow}>
                                <Ionicons name="location" size={20} color={colors.primary} />
                                <View style={styles.infoContent}>
                                    <Text style={[styles.infoValue, { color: colors.text }]}>
                                        {event.venue.name}
                                    </Text>
                                    <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
                                        {event.venue.address}
                                    </Text>
                                    <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
                                        {event.venue.city}, {event.venue.state} {event.venue.zipCode}
                                    </Text>
                                </View>
                            </View>
                        </View>

                        {/* Ticket Types */}
                        <View style={[styles.section, { backgroundColor: colors.surface }]}>
                            <Text style={[styles.sectionTitle, { color: colors.text }]}>
                                Ticket Types
                            </Text>
                            {event.ticketTypes.map((ticket) => (
                                <View
                                    key={ticket.id}
                                    style={[styles.ticketTypeCard, { backgroundColor: colors.background }]}
                                >
                                    <View style={styles.ticketTypeHeader}>
                                        <Text style={[styles.ticketTypeName, { color: colors.text }]}>
                                            {ticket.name}
                                        </Text>
                                        <Text style={[styles.ticketTypePrice, { color: colors.primary }]}>
                                            {formatRevenue(ticket.price)}
                                        </Text>
                                    </View>
                                    <View style={styles.ticketTypeStats}>
                                        <Text style={[styles.ticketTypeStat, { color: colors.textSecondary }]}>
                                            {ticket.sold} / {ticket.quantity} sold
                                        </Text>
                                        <View style={[styles.ticketTypeProgress, { backgroundColor: colors.border }]}>
                                            <View
                                                style={[
                                                    styles.ticketTypeProgressFill,
                                                    {
                                                        width: `${(ticket.sold / ticket.quantity) * 100}%`,
                                                        backgroundColor: colors.primary,
                                                    },
                                                ]}
                                            />
                                        </View>
                                    </View>
                                </View>
                            ))}
                        </View>

                        {/* Parking */}
                        {event.parkingInfo && event.parkingInfo.available && (
                            <View style={[styles.section, { backgroundColor: colors.surface }]}>
                                <Text style={[styles.sectionTitle, { color: colors.text }]}>
                                    Parking
                                </Text>
                                <View style={styles.infoRow}>
                                    <Ionicons name="car" size={20} color={colors.primary} />
                                    <View style={styles.infoContent}>
                                        <Text style={[styles.infoValue, { color: colors.text }]}>
                                            {event.parkingInfo.totalSlots} slots available
                                        </Text>
                                        {event.parkingInfo.fee && (
                                            <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
                                                Fee: {formatRevenue(event.parkingInfo.fee)}
                                            </Text>
                                        )}
                                    </View>
                                </View>
                            </View>
                        )}

                        {/* Event Rules */}
                        {event.rules && event.rules.length > 0 && (
                            <View style={[styles.section, { backgroundColor: colors.surface }]}>
                                <Text style={[styles.sectionTitle, { color: colors.text }]}>
                                    Event Rules
                                </Text>
                                {event.rules.map((rule, index) => (
                                    <View key={index} style={styles.ruleItem}>
                                        <Ionicons name="checkmark-circle" size={18} color={colors.primary} />
                                        <Text style={[styles.ruleText, { color: colors.textSecondary }]}>
                                            {rule}
                                        </Text>
                                    </View>
                                ))}
                            </View>
                        )}

                        {/* Organizer */}
                        <View style={[styles.section, { backgroundColor: colors.surface }]}>
                            <Text style={[styles.sectionTitle, { color: colors.text }]}>
                                Organizer
                            </Text>
                            <View style={styles.infoRow}>
                                <Ionicons name="person" size={20} color={colors.primary} />
                                <View style={styles.infoContent}>
                                    <Text style={[styles.infoValue, { color: colors.text }]}>
                                        {event.organizerName}
                                    </Text>
                                    <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
                                        {event.organizerEmail}
                                    </Text>
                                    {event.organizerPhone && (
                                        <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
                                            {event.organizerPhone}
                                        </Text>
                                    )}
                                </View>
                            </View>
                        </View>
                    </View>
                )}

                {/* ATTENDEES TAB */}
                {activeTab === 'attendees' && (
                    <View style={styles.attendeesTab}>
                        {/* Stats Cards */}
                        <View style={styles.attendeeStats}>
                            <View style={[styles.attendeeStatCard, { backgroundColor: colors.surface }]}>
                                <Ionicons name="people" size={24} color={colors.primary} />
                                <Text style={[styles.attendeeStatValue, { color: colors.text }]}>
                                    {event.attendees.length}
                                </Text>
                                <Text style={[styles.attendeeStatLabel, { color: colors.textSecondary }]}>
                                    Total
                                </Text>
                            </View>
                            <View style={[styles.attendeeStatCard, { backgroundColor: colors.surface }]}>
                                <Ionicons name="checkmark-done" size={24} color="#10B981" />
                                <Text style={[styles.attendeeStatValue, { color: colors.text }]}>
                                    {checkedInCount}
                                </Text>
                                <Text style={[styles.attendeeStatLabel, { color: colors.textSecondary }]}>
                                    Checked In
                                </Text>
                            </View>
                            <View style={[styles.attendeeStatCard, { backgroundColor: colors.surface }]}>
                                <Ionicons name="cash" size={24} color="#10B981" />
                                <Text style={[styles.attendeeStatValue, { color: colors.text }]}>
                                    {event.revenue.paidTickets}
                                </Text>
                                <Text style={[styles.attendeeStatLabel, { color: colors.textSecondary }]}>
                                    Paid
                                </Text>
                            </View>
                        </View>

                        {/* Search & Filter */}
                        <View style={[styles.section, { backgroundColor: colors.surface }]}>
                            <View
                                style={[
                                    styles.searchContainer,
                                    { backgroundColor: colors.background, borderColor: colors.border },
                                ]}
                            >
                                <Ionicons name="search" size={20} color={colors.textSecondary} />
                                <TextInput
                                    style={[styles.searchInput, { color: colors.text }]}
                                    placeholder="Search attendees..."
                                    placeholderTextColor={colors.textSecondary}
                                    value={searchAttendee}
                                    onChangeText={setSearchAttendee}
                                />
                            </View>

                            <View style={styles.attendeeFilters}>
                                {(['all', 'paid', 'pending'] as const).map((f) => (
                                    <TouchableOpacity
                                        key={f}
                                        style={[
                                            styles.attendeeFilterBtn,
                                            {
                                                backgroundColor:
                                                    attendeeFilter === f ? colors.primary : colors.background,
                                                borderColor: colors.border,
                                            },
                                        ]}
                                        onPress={() => setAttendeeFilter(f)}
                                        activeOpacity={0.7}
                                    >
                                        <Text
                                            style={[
                                                styles.attendeeFilterText,
                                                { color: attendeeFilter === f ? '#FFFFFF' : colors.text },
                                            ]}
                                        >
                                            {f.charAt(0).toUpperCase() + f.slice(1)}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                        {/* Attendees List */}
                        <View style={[styles.section, { backgroundColor: colors.surface }]}>
                            <View style={styles.sectionHeader}>
                                <Text style={[styles.sectionTitle, { color: colors.text }]}>
                                    Attendees ({filteredAttendees.length})
                                </Text>
                                <TouchableOpacity activeOpacity={0.7}>
                                    <Ionicons name="download-outline" size={20} color={colors.primary} />
                                </TouchableOpacity>
                            </View>

                            {filteredAttendees.slice(0, 20).map((attendee) => (
                                <View
                                    key={attendee.id}
                                    style={[styles.attendeeCard, { backgroundColor: colors.background }]}
                                >
                                    <View style={styles.attendeeInfo}>
                                        <View
                                            style={[
                                                styles.attendeeAvatar,
                                                { backgroundColor: colors.primary + '20' },
                                            ]}
                                        >
                                            <Text style={[styles.attendeeInitial, { color: colors.primary }]}>
                                                {attendee.name.charAt(0)}
                                            </Text>
                                        </View>
                                        <View style={styles.attendeeDetails}>
                                            <Text style={[styles.attendeeName, { color: colors.text }]}>
                                                {attendee.name}
                                            </Text>
                                            <Text style={[styles.attendeeEmail, { color: colors.textSecondary }]}>
                                                {attendee.email}
                                            </Text>
                                            <View style={styles.attendeeMeta}>
                                                <View
                                                    style={[
                                                        styles.attendeeMetaBadge,
                                                        {
                                                            backgroundColor:
                                                                attendee.paymentStatus === 'paid'
                                                                    ? '#10B98120'
                                                                    : '#F5972020',
                                                        },
                                                    ]}
                                                >
                                                    <Text
                                                        style={[
                                                            styles.attendeeMetaText,
                                                            {
                                                                color:
                                                                    attendee.paymentStatus === 'paid' ? '#10B981' : '#F59720',
                                                            },
                                                        ]}
                                                    >
                                                        {attendee.paymentStatus === 'paid' ? 'Paid' : 'Pending'}
                                                    </Text>
                                                </View>
                                                <Text style={[styles.attendeeTicketType, { color: colors.textTertiary }]}>
                                                    {attendee.ticketType}
                                                </Text>
                                            </View>
                                        </View>
                                    </View>
                                    {attendee.checkInStatus === 'checked-in' ? (
                                        <View style={styles.checkedInBadge}>
                                            <Ionicons name="checkmark-circle" size={20} color="#10B981" />
                                        </View>
                                    ) : (
                                        <TouchableOpacity
                                            style={[styles.checkInButton, { backgroundColor: colors.primary }]}
                                            onPress={() => handleCheckIn(attendee.id)}
                                            activeOpacity={0.7}
                                        >
                                            <Text style={styles.checkInButtonText}>Check In</Text>
                                        </TouchableOpacity>
                                    )}
                                </View>
                            ))}

                            {filteredAttendees.length === 0 && (
                                <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                                    No attendees found
                                </Text>
                            )}
                        </View>
                    </View>
                )}

                {/* REVENUE TAB */}
                {activeTab === 'revenue' && (
                    <View style={styles.revenueTab}>
                        {/* Revenue Summary */}
                        <View style={styles.revenueSummary}>
                            <View style={[styles.revenueCard, { backgroundColor: colors.surface }]}>
                                <View style={[styles.revenueIconContainer, { backgroundColor: colors.primary + '20' }]}>
                                    <Ionicons name="trending-up" size={28} color={colors.primary} />
                                </View>
                                <Text style={[styles.revenueLabel, { color: colors.textSecondary }]}>
                                    Total Revenue
                                </Text>
                                <Text style={[styles.revenueAmount, { color: colors.text }]}>
                                    {formatRevenue(event.revenue.totalRevenue)}
                                </Text>
                            </View>

                            <View style={[styles.revenueCard, { backgroundColor: colors.surface }]}>
                                <View style={[styles.revenueIconContainer, { backgroundColor: '#10B98120' }]}>
                                    <Ionicons name="checkmark-circle" size={28} color="#10B981" />
                                </View>
                                <Text style={[styles.revenueLabel, { color: colors.textSecondary }]}>
                                    Paid Amount
                                </Text>
                                <Text style={[styles.revenueAmount, { color: '#10B981' }]}>
                                    {formatRevenue(event.revenue.paidAmount)}
                                </Text>
                            </View>

                            <View style={[styles.revenueCard, { backgroundColor: colors.surface }]}>
                                <View style={[styles.revenueIconContainer, { backgroundColor: '#F5972020' }]}>
                                    <Ionicons name="time" size={28} color="#F59720" />
                                </View>
                                <Text style={[styles.revenueLabel, { color: colors.textSecondary }]}>
                                    Pending
                                </Text>
                                <Text style={[styles.revenueAmount, { color: '#F59720' }]}>
                                    {formatRevenue(event.revenue.pendingAmount)}
                                </Text>
                            </View>
                        </View>

                        {/* Transactions */}
                        <View style={[styles.section, { backgroundColor: colors.surface }]}>
                            <View style={styles.sectionHeader}>
                                <Text style={[styles.sectionTitle, { color: colors.text }]}>
                                    Recent Transactions
                                </Text>
                                <TouchableOpacity activeOpacity={0.7}>
                                    <Ionicons name="download-outline" size={20} color={colors.primary} />
                                </TouchableOpacity>
                            </View>

                            {event.transactions.slice(0, 15).map((txn) => (
                                <View
                                    key={txn.id}
                                    style={[styles.transactionCard, { backgroundColor: colors.background }]}
                                >
                                    <View style={styles.transactionInfo}>
                                        <Text style={[styles.transactionName, { color: colors.text }]}>
                                            {txn.attendeeName}
                                        </Text>
                                        <Text style={[styles.transactionType, { color: colors.textSecondary }]}>
                                            {txn.ticketType}
                                        </Text>
                                        <Text style={[styles.transactionDate, { color: colors.textTertiary }]}>
                                            {formatEventDate(txn.transactionDate)}
                                        </Text>
                                    </View>
                                    <View style={styles.transactionRight}>
                                        <Text style={[styles.transactionAmount, { color: colors.text }]}>
                                            {formatRevenue(txn.amount)}
                                        </Text>
                                        <View
                                            style={[
                                                styles.transactionStatus,
                                                {
                                                    backgroundColor:
                                                        txn.status === 'paid' ? '#10B98120' : '#F5972020',
                                                },
                                            ]}
                                        >
                                            <Text
                                                style={[
                                                    styles.transactionStatusText,
                                                    { color: txn.status === 'paid' ? '#10B981' : '#F59720' },
                                                ]}
                                            >
                                                {txn.status === 'paid' ? 'Paid' : 'Pending'}
                                            </Text>
                                        </View>
                                    </View>
                                </View>
                            ))}
                        </View>
                    </View>
                )}

                <View style={styles.bottomSpacing} />
            </ScrollView>

            {/* Share Modal */}
            <Modal
                visible={showShareModal}
                transparent
                animationType="slide"
                onRequestClose={() => setShowShareModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
                        <View style={styles.modalHeader}>
                            <Text style={[styles.modalTitle, { color: colors.text }]}>Share Event</Text>
                            <TouchableOpacity onPress={() => setShowShareModal(false)}>
                                <Ionicons name="close" size={28} color={colors.text} />
                            </TouchableOpacity>
                        </View>

                        <View style={[styles.linkContainer, { backgroundColor: colors.background }]}>
                            <Text style={[styles.linkText, { color: colors.textSecondary }]} numberOfLines={1}>
                                {event.eventLink}
                            </Text>
                            <TouchableOpacity
                                style={[styles.copyButton, { backgroundColor: colors.primary }]}
                                onPress={() => Alert.alert('Copied!', 'Event link copied to clipboard')}
                                activeOpacity={0.7}
                            >
                                <Ionicons name="copy" size={18} color="#FFFFFF" />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.socialButtons}>
                            <TouchableOpacity
                                style={[styles.socialButton, { backgroundColor: '#25D366' }]}
                                onPress={handleShare}
                                activeOpacity={0.7}
                            >
                                <Ionicons name="logo-whatsapp" size={24} color="#FFFFFF" />
                                <Text style={styles.socialButtonText}>WhatsApp</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.socialButton, { backgroundColor: '#E4405F' }]}
                                onPress={handleShare}
                                activeOpacity={0.7}
                            >
                                <Ionicons name="logo-instagram" size={24} color="#FFFFFF" />
                                <Text style={styles.socialButtonText}>Instagram</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.socialButton, { backgroundColor: '#0A66C2' }]}
                                onPress={handleShare}
                                activeOpacity={0.7}
                            >
                                <Ionicons name="logo-linkedin" size={24} color="#FFFFFF" />
                                <Text style={styles.socialButtonText}>LinkedIn</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.socialButton, { backgroundColor: '#1DA1F2' }]}
                                onPress={handleShare}
                                activeOpacity={0.7}
                            >
                                <Ionicons name="logo-twitter" size={24} color="#FFFFFF" />
                                <Text style={styles.socialButtonText}>Twitter</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    bannerContainer: {
        height: 280,
        position: 'relative',
    },
    banner: {
        width: '100%',
        height: '100%',
        backgroundColor: '#E1E8ED',
    },
    bannerGradient: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'space-between',
        padding: 20,
        paddingTop: 50,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        alignSelf: 'flex-start',
    },
    bannerContent: {
        gap: 8,
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 20,
        gap: 6,
    },
    statusDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: '#FFFFFF',
    },
    statusText: {
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: '700',
        textTransform: 'uppercase',
    },
    eventTitle: {
        fontSize: 28,
        fontWeight: '800',
        color: '#FFFFFF',
    },
    eventCategory: {
        fontSize: 16,
        color: 'rgba(255,255,255,0.9)',
        fontWeight: '600',
    },
    countdownSection: {
        paddingVertical: 16,
    },
    actionsBar: {
        flexDirection: 'row',
        padding: 16,
        gap: 12,
    },
    actionButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingVertical: 12,
        borderRadius: 12,
    },
    actionButtonText: {
        fontSize: 14,
        fontWeight: '600',
    },
    actionButtonTextPrimary: {
        fontSize: 14,
        fontWeight: '600',
        color: '#FFFFFF',
    },
    tabBar: {
        flexDirection: 'row',
        borderBottomWidth: 1,
    },
    tab: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        paddingVertical: 14,
        borderBottomWidth: 3,
        borderBottomColor: 'transparent',
    },
    tabText: {
        fontSize: 14,
        fontWeight: '600',
    },
    tabBadge: {
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 10,
        minWidth: 20,
        alignItems: 'center',
    },
    tabBadgeText: {
        color: '#FFFFFF',
        fontSize: 11,
        fontWeight: '700',
    },
    tabContent: {
        flex: 1,
    },
    detailsTab: {
        padding: 16,
        gap: 16,
    },
    section: {
        padding: 16,
        borderRadius: 16,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        marginBottom: 16,
    },
    description: {
        fontSize: 15,
        lineHeight: 24,
    },
    infoRow: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 16,
    },
    infoContent: {
        flex: 1,
    },
    infoLabel: {
        fontSize: 13,
        marginBottom: 4,
    },
    infoValue: {
        fontSize: 15,
        fontWeight: '600',
    },
    ticketTypeCard: {
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
    },
    ticketTypeHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    ticketTypeName: {
        fontSize: 16,
        fontWeight: '700',
    },
    ticketTypePrice: {
        fontSize: 18,
        fontWeight: '700',
    },
    ticketTypeStats: {
        gap: 8,
    },
    ticketTypeStat: {
        fontSize: 13,
    },
    ticketTypeProgress: {
        height: 6,
        borderRadius: 3,
        overflow: 'hidden',
    },
    ticketTypeProgressFill: {
        height: '100%',
    },
    ruleItem: {
        flexDirection: 'row',
        gap: 10,
        marginBottom: 12,
    },
    ruleText: {
        flex: 1,
        fontSize: 14,
        lineHeight: 20,
    },
    attendeesTab: {
        padding: 16,
        gap: 16,
    },
    attendeeStats: {
        flexDirection: 'row',
        gap: 12,
    },
    attendeeStatCard: {
        flex: 1,
        padding: 16,
        borderRadius: 16,
        alignItems: 'center',
    },
    attendeeStatValue: {
        fontSize: 24,
        fontWeight: '700',
        marginTop: 8,
        marginBottom: 4,
    },
    attendeeStatLabel: {
        fontSize: 12,
        fontWeight: '600',
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 12,
        borderWidth: 1,
        gap: 10,
        marginBottom: 12,
    },
    searchInput: {
        flex: 1,
        fontSize: 15,
        padding: 0,
    },
    attendeeFilters: {
        flexDirection: 'row',
        gap: 10,
    },
    attendeeFilterBtn: {
        flex: 1,
        paddingVertical: 10,
        borderRadius: 10,
        borderWidth: 1,
        alignItems: 'center',
    },
    attendeeFilterText: {
        fontSize: 14,
        fontWeight: '600',
    },
    attendeeCard: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 12,
        borderRadius: 12,
        marginBottom: 12,
    },
    attendeeInfo: {
        flexDirection: 'row',
        gap: 12,
        flex: 1,
    },
    attendeeAvatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
    },
    attendeeInitial: {
        fontSize: 20,
        fontWeight: '700',
    },
    attendeeDetails: {
        flex: 1,
    },
    attendeeName: {
        fontSize: 15,
        fontWeight: '600',
        marginBottom: 4,
    },
    attendeeEmail: {
        fontSize: 13,
        marginBottom: 6,
    },
    attendeeMeta: {
        flexDirection: 'row',
        gap: 8,
        alignItems: 'center',
    },
    attendeeMetaBadge: {
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 8,
    },
    attendeeMetaText: {
        fontSize: 11,
        fontWeight: '700',
    },
    attendeeTicketType: {
        fontSize: 11,
    },
    checkedInBadge: {
        padding: 8,
    },
    checkInButton: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 10,
    },
    checkInButtonText: {
        color: '#FFFFFF',
        fontSize: 13,
        fontWeight: '600',
    },
    emptyText: {
        textAlign: 'center',
        padding: 32,
        fontSize: 14,
    },
    revenueTab: {
        padding: 16,
        gap: 16,
    },
    revenueSummary: {
        gap: 12,
    },
    revenueCard: {
        padding: 20,
        borderRadius: 16,
    },
    revenueIconContainer: {
        width: 56,
        height: 56,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    revenueLabel: {
        fontSize: 13,
        marginBottom: 8,
    },
    revenueAmount: {
        fontSize: 28,
        fontWeight: '700',
    },
    transactionCard: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 12,
        borderRadius: 12,
        marginBottom: 12,
    },
    transactionInfo: {
        flex: 1,
    },
    transactionName: {
        fontSize: 15,
        fontWeight: '600',
        marginBottom: 4,
    },
    transactionType: {
        fontSize: 13,
        marginBottom: 4,
    },
    transactionDate: {
        fontSize: 12,
    },
    transactionRight: {
        alignItems: 'flex-end',
        gap: 6,
    },
    transactionAmount: {
        fontSize: 16,
        fontWeight: '700',
    },
    transactionStatus: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
    },
    transactionStatusText: {
        fontSize: 11,
        fontWeight: '700',
    },
    bottomSpacing: {
        height: 32,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 24,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    modalTitle: {
        fontSize: 22,
        fontWeight: '700',
    },
    linkContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 12,
        gap: 12,
        marginBottom: 24,
    },
    linkText: {
        flex: 1,
        fontSize: 14,
    },
    copyButton: {
        padding: 10,
        borderRadius: 10,
    },
    socialButtons: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    socialButton: {
        flex: 1,
        minWidth: '45%',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingVertical: 14,
        borderRadius: 12,
    },
    socialButtonText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '600',
    },
});

export default EventDashboardScreen;

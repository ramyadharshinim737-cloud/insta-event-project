/**
 * Enhanced MyTicketsScreen
 * List of all booked tickets with filters and countdown timers
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Image,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { getMyTickets } from '../../services/events.api';
import { Ticket } from '../../types/ticket.types';
import CountdownTimer from '../../components/tickets/CountdownTimer';

type FilterType = 'all' | 'upcoming' | 'completed' | 'cancelled';

interface Props {
  navigation?: any;
}

// Helper function for formatting currency
const formatCurrency = (amount: number) => {
  return `₹${amount.toLocaleString()}`;
};

const MyTicketsScreen: React.FC<Props> = ({ navigation }) => {
  const { colors } = useTheme();
  const [filter, setFilter] = useState<FilterType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [showQRModal, setShowQRModal] = useState(false);
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchMyTickets();
  }, []);

  const fetchMyTickets = async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      
      console.log('🎟️ Fetching my tickets...');
      const myTickets = await getMyTickets();
      console.log('✅ Fetched', myTickets.length, 'tickets');
      setTickets(myTickets);
    } catch (error) {
      console.error('❌ Error fetching my tickets:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const filteredTickets = tickets.filter((t) => {
    const matchesSearch = t.title?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const stats = {
    total: tickets.length,
    upcoming: tickets.filter((t) => new Date(t.date) > new Date()).length,
    completed: tickets.filter((t) => new Date(t.date) <= new Date()).length,
    totalSpent: 0,
  };

  const showQRCode = (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setShowQRModal(true);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View
        style={[
          styles.headerBar,
          { backgroundColor: colors.background, borderBottomColor: colors.border },
        ]}
      >
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation?.goBack?.()}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={[styles.header, { color: colors.text }]}>My Tickets</Text>
        </View>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => fetchMyTickets(true)}
          />
        }
      >
        {loading ? (
          <View style={{ padding: 40, alignItems: 'center' }}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={{ color: colors.textSecondary, marginTop: 12 }}>
              Loading your tickets...
            </Text>
          </View>
        ) : (
          <>
            {/* Statistics Cards */}
            <View style={styles.statsContainer}>
          <View style={[styles.statCard, { backgroundColor: colors.surface }]}>
            <View style={[styles.statIconContainer, { backgroundColor: '#e0f2fe' }]}>
              <Ionicons name="ticket-outline" size={24} color="#0284c7" />
            </View>
            <Text style={[styles.statValue, { color: colors.text }]}>
              {stats.total}
            </Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
              Total Tickets
            </Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: colors.surface }]}>
            <View style={[styles.statIconContainer, { backgroundColor: '#dcfce7' }]}>
              <Ionicons name="calendar-outline" size={24} color="#16a34a" />
            </View>
            <Text style={[styles.statValue, { color: colors.text }]}>
              {stats.upcoming}
            </Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
              Upcoming
            </Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: colors.surface }]}>
            <View style={[styles.statIconContainer, { backgroundColor: '#fef3c7' }]}>
              <Ionicons name="checkmark-done-outline" size={24} color="#ca8a04" />
            </View>
            <Text style={[styles.statValue, { color: colors.text }]}>
              {stats.completed}
            </Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
              Attended
            </Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: colors.surface }]}>
            <View style={[styles.statIconContainer, { backgroundColor: '#fce7f3' }]}>
              <Ionicons name="cash-outline" size={24} color="#be185d" />
            </View>
            <Text style={[styles.statValue, { color: colors.text }]}>
              {formatCurrency(stats.totalSpent)}
            </Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
              Total Spent
            </Text>
          </View>
        </View>

        {/* Search Bar */}
        <View
          style={[
            styles.searchContainer,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          <Ionicons name="search" size={20} color={colors.textSecondary} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Search tickets..."
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
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabsContainer}
        >
          {(['all', 'upcoming', 'completed', 'cancelled'] as FilterType[]).map((f) => (
            <TouchableOpacity
              key={f}
              onPress={() => setFilter(f)}
              style={[
                styles.tab,
                {
                  borderColor: colors.border,
                  backgroundColor: filter === f ? colors.primary : colors.surface,
                },
              ]}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.tabText,
                  { color: filter === f ? '#fff' : colors.text },
                ]}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </Text>
              {f !== 'all' && (
                <View
                  style={[
                    styles.tabBadge,
                    {
                      backgroundColor:
                        filter === f ? 'rgba(255,255,255,0.3)' : colors.border,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.tabBadgeText,
                      { color: filter === f ? '#fff' : colors.textSecondary },
                    ]}
                  >
                    {tickets.filter((ticket) => ticket.status === f).length}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Tickets List */}
        <View style={styles.ticketsContainer}>
          {filteredTickets.map((ticket) => (
            <TouchableOpacity
              key={ticket._id}
              style={[
                styles.ticketCard,
                { backgroundColor: colors.surface, borderColor: colors.border },
              ]}
              activeOpacity={0.7}
              onPress={() =>
                navigation?.navigate?.('EventDetail', { eventId: ticket._id })
              }
            >
              {/* Event Poster */}
              {ticket.coverImage && (
                <Image source={{ uri: ticket.coverImage }} style={styles.poster} />
              )}

              {/* Ticket Content */}
              <View style={styles.ticketContent}>
                {/* Status Badge */}
                <View
                  style={[
                    styles.statusBadge,
                    { backgroundColor: new Date(ticket.date) > new Date() ? '#dcfce7' : '#fef3c7' },
                  ]}
                >
                  <Text style={styles.statusText}>
                    {new Date(ticket.date) > new Date() ? 'Upcoming' : 'Completed'}
                  </Text>
                </View>

                {/* Event Info */}
                <Text style={[styles.eventTitle, { color: colors.text }]} numberOfLines={2}>
                  {ticket.title}
                </Text>
                <Text style={[styles.eventCategory, { color: colors.textSecondary }]}>
                  {ticket.category}
                </Text>

                {/* Date & Time */}
                <View style={styles.infoRow}>
                  <Ionicons name="calendar" size={16} color={colors.textSecondary} />
                  <Text style={[styles.infoText, { color: colors.textSecondary }]}>
                    {new Date(ticket.date).toLocaleDateString()}
                  </Text>
                </View>

                <View style={styles.infoRow}>
                  <Ionicons name="time" size={16} color={colors.textSecondary} />
                  <Text style={[styles.infoText, { color: colors.textSecondary }]}>
                    {ticket.time || 'TBD'}
                  </Text>
                </View>

                <View style={styles.infoRow}>
                  <Ionicons name="location" size={16} color={colors.textSecondary} />
                  <Text
                    style={[styles.infoText, { color: colors.textSecondary }]}
                    numberOfLines={1}
                  >
                    {ticket.isOnline ? 'Online Event' : ticket.venue || 'Venue TBD'}
                  </Text>
                </View>

                {/* RSVP Date */}
                {ticket.rsvpDate && (
                  <View style={styles.priceRow}>
                    <Text style={[styles.priceLabel, { color: colors.textSecondary }]}>
                      Registered on
                    </Text>
                    <Text style={[styles.priceValue, { color: colors.primary }]}>
                      {new Date(ticket.rsvpDate).toLocaleDateString()}
                    </Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          ))}

          {/* Empty State */}
          {filteredTickets.length === 0 && (
            <View style={[styles.emptyState, { borderColor: colors.border }]}>
              <Ionicons name="ticket-outline" size={64} color={colors.textTertiary} />
              <Text style={[styles.emptyStateTitle, { color: colors.text }]}>
                {searchQuery ? 'No tickets found' : `No ${filter} tickets`}
              </Text>
              <Text style={[styles.emptyStateText, { color: colors.textSecondary }]}>
                {searchQuery
                  ? 'Try adjusting your search query'
                  : 'Browse events and get your first ticket'}
              </Text>
              {!searchQuery && (
                <TouchableOpacity
                  style={[styles.emptyStateButton, { backgroundColor: colors.primary }]}
                  onPress={() => navigation?.navigate?.('Events')}
                >
                  <Ionicons name="search" size={20} color="#fff" />
                  <Text style={styles.emptyStateButtonText}>Browse Events</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>
      </>
        )}
      </ScrollView>

      {/* QR Code Modal */}
      <Modal
        visible={showQRModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowQRModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                Entry QR Code
              </Text>
              <TouchableOpacity onPress={() => setShowQRModal(false)}>
                <Ionicons name="close" size={28} color={colors.text} />
              </TouchableOpacity>
            </View>

            {selectedTicket && (
              <>
                <View style={styles.qrCodeContainer}>
                  <View style={styles.qrCodePlaceholder}>
                    <Ionicons name="qr-code" size={200} color="#000" />
                  </View>
                  <Text style={styles.qrCodeId}>
                    {selectedTicket.ticketInfo.qrCode}
                  </Text>
                </View>

                <View style={styles.modalTicketInfo}>
                  <Text style={[styles.modalEventTitle, { color: colors.text }]}>
                    {selectedTicket.eventName}
                  </Text>
                  <View style={styles.modalInfoRow}>
                    <Ionicons name="time" size={18} color={colors.textSecondary} />
                    <Text style={[styles.modalInfoText, { color: colors.textSecondary }]}>
                      {formatEventDate(selectedTicket.startDate)} at{' '}
                      {formatEventTime(selectedTicket.startDate)}
                    </Text>
                  </View>
                  <View style={styles.modalInfoRow}>
                    <Ionicons name="location" size={18} color={colors.textSecondary} />
                    <Text style={[styles.modalInfoText, { color: colors.textSecondary }]}>
                      {selectedTicket.venue.name}
                    </Text>
                  </View>
                </View>

                <Text style={[styles.modalNote, { color: colors.textSecondary }]}>
                  Show this QR code at the event entrance for check-in
                </Text>
              </>
            )}
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
  headerBar: {
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
  header: {
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  headerSpacer: {
    width: 40,
  },
  scrollContent: {
    padding: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    padding: 0,
  },
  tabsContainer: {
    gap: 10,
    marginBottom: 20,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    gap: 8,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
  },
  tabBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  tabBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  ticketsContainer: {
    gap: 16,
  },
  ticketCard: {
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  poster: {
    width: '100%',
    height: 180,
    backgroundColor: '#E1E8ED',
  },
  ticketContent: {
    padding: 16,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 12,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  eventTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  eventCategory: {
    fontSize: 14,
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    flex: 1,
  },
  countdownContainer: {
    marginVertical: 12,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  priceLabel: {
    fontSize: 14,
  },
  priceValue: {
    fontSize: 18,
    fontWeight: '700',
  },
  qrButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 12,
  },
  qrButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  emptyState: {
    padding: 48,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 32,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
  },
  emptyStateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
    gap: 8,
  },
  emptyStateButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 20,
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
  qrCodeContainer: {
    backgroundColor: '#FFFFFF',
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 24,
  },
  qrCodePlaceholder: {
    width: 200,
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  qrCodeId: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  modalTicketInfo: {
    gap: 12,
    marginBottom: 20,
  },
  modalEventTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  modalInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  modalInfoText: {
    fontSize: 14,
    flex: 1,
  },
  modalNote: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default MyTicketsScreen;

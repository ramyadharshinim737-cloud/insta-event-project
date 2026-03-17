/**
 * Enhanced MyEventsScreen
 * Premium organizer events list with modern UI
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  RefreshControl,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../context/ThemeContext';
import { getMyEvents } from '../../services/events.api';
import { EventFilters } from '../../types/organizerEvent.types';

interface Props {
  navigation?: any;
}

// Helper function for formatting revenue
const formatRevenue = (amount: number) => {
  return `₹${amount.toLocaleString()}`;
};

const MyEventsScreen: React.FC<Props> = ({ navigation }) => {
  const { colors } = useTheme();
  const [filter, setFilter] = useState<EventFilters['status']>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchMyEvents();
  }, []);

  const fetchMyEvents = async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      
      console.log('📅 Fetching my events...');
      const myEvents = await getMyEvents();
      console.log('✅ Fetched', myEvents.length, 'events');
      setEvents(myEvents);
    } catch (error) {
      console.error('❌ Error fetching my events:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Filter events
  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  // Calculate stats
  const stats = {
    total: events.length,
    upcoming: events.filter((e) => new Date(e.date) > new Date()).length,
    live: 0,
    drafts: 0,
    totalRevenue: 0,
    totalAttendees: events.reduce((sum, e) => sum + (e.attendeeCount || 0), 0),
  };

  const filters: { id: EventFilters['status']; label: string; icon: string; count?: number }[] = [
    { id: 'all', label: 'All', icon: 'grid-outline', count: stats.total },
    { id: 'upcoming', label: 'Upcoming', icon: 'time-outline', count: stats.upcoming },
    { id: 'live', label: 'Live', icon: 'radio-outline', count: stats.live },
    { id: 'past', label: 'Past', icon: 'checkmark-done-outline' },
    { id: 'drafts', label: 'Drafts', icon: 'document-text-outline', count: stats.drafts },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Premium Header with Gradient */}
      <LinearGradient
        colors={[colors.primary, colors.primary + 'DD']}
        style={styles.headerGradient}
      >
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation?.goBack?.()}
            style={styles.backButton}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>My Events</Text>
            <Text style={styles.headerSubtitle}>Organize & manage your events</Text>
          </View>
          <TouchableOpacity
            style={styles.createButton}
            activeOpacity={0.8}
            onPress={() => navigation?.navigate?.('CreateOrganizerEvent')}
          >
            <LinearGradient
              colors={['#FFFFFF', '#F3F4F6']}
              style={styles.createButtonGradient}
            >
              <Ionicons name="add" size={28} color={colors.primary} />
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats.totalAttendees}</Text>
            <Text style={styles.statLabel}>Attendees</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{formatRevenue(stats.totalRevenue)}</Text>
            <Text style={styles.statLabel}>Revenue</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats.upcoming}</Text>
            <Text style={styles.statLabel}>Upcoming</Text>
          </View>
        </View>
      </LinearGradient>

      <ScrollView 
        showsVerticalScrollIndicator={false} 
        style={styles.scrollView}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => fetchMyEvents(true)}
          />
        }
      >
        {loading ? (
          <View style={{ padding: 40, alignItems: 'center' }}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={{ color: colors.textSecondary, marginTop: 12 }}>
              Loading your events...
            </Text>
          </View>
        ) : (
          <>
            {/* Search Bar */}
            <View style={styles.searchSection}>
          <View
            style={[
              styles.searchContainer,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            <Ionicons name="search" size={22} color={colors.textSecondary} />
            <TextInput
              style={[styles.searchInput, { color: colors.text }]}
              placeholder="Search events, venues, categories..."
              placeholderTextColor={colors.textSecondary}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={22} color={colors.textSecondary} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Filter Pills */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersContainer}
        >
          {filters.map((f) => (
            <TouchableOpacity
              key={f.id}
              style={[
                styles.filterPill,
                {
                  backgroundColor: filter === f.id ? colors.primary : colors.surface,
                  borderColor: filter === f.id ? colors.primary : colors.border,
                },
              ]}
              onPress={() => setFilter(f.id)}
              activeOpacity={0.7}
            >
              <Ionicons
                name={f.icon as any}
                size={18}
                color={filter === f.id ? '#FFFFFF' : colors.text}
              />
              <Text
                style={[
                  styles.filterText,
                  { color: filter === f.id ? '#FFFFFF' : colors.text },
                ]}
              >
                {f.label}
              </Text>
              {f.count !== undefined && f.count > 0 && (
                <View
                  style={[
                    styles.filterBadge,
                    {
                      backgroundColor:
                        filter === f.id ? 'rgba(255,255,255,0.3)' : colors.primary + '20',
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.filterBadgeText,
                      { color: filter === f.id ? '#FFFFFF' : colors.primary },
                    ]}
                  >
                    {f.count}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Events List */}
        <View style={styles.eventsContainer}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            All Events
            {filteredEvents.length > 0 && (
              <Text style={{ color: colors.textSecondary }}> ({filteredEvents.length})</Text>
            )}
          </Text>

          {filteredEvents.map((event) => (
            <TouchableOpacity
              key={event._id}
              style={[styles.eventCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
              onPress={() => navigation?.navigate?.('EventDetail', { eventId: event._id })}
              activeOpacity={0.7}
            >
              {/* Event Cover Image */}
              {event.coverImage && (
                <Image 
                  source={{ uri: event.coverImage }} 
                  style={styles.eventImage}
                  resizeMode="cover"
                />
              )}
              
              {/* Event Content */}
              <View style={styles.eventContent}>
                <Text style={[styles.eventTitle, { color: colors.text }]} numberOfLines={2}>
                  {event.title}
                </Text>
                
                <View style={styles.eventMeta}>
                  <View style={styles.metaRow}>
                    <Ionicons name="calendar-outline" size={14} color={colors.textSecondary} />
                    <Text style={[styles.metaText, { color: colors.textSecondary }]}>
                      {new Date(event.date).toLocaleDateString()}
                    </Text>
                  </View>
                  
                  <View style={styles.metaRow}>
                    <Ionicons name="location-outline" size={14} color={colors.textSecondary} />
                    <Text style={[styles.metaText, { color: colors.textSecondary }]} numberOfLines={1}>
                      {event.isOnline ? 'Online' : event.venue || 'TBD'}
                    </Text>
                  </View>
                  
                  <View style={styles.metaRow}>
                    <Ionicons name="people-outline" size={14} color={colors.primary} />
                    <Text style={[styles.metaText, { color: colors.primary }]}>
                      {event.attendeeCount || 0} attendees
                    </Text>
                  </View>
                </View>
                
                <View style={styles.eventActions}>
                  <TouchableOpacity 
                    style={[styles.actionButton, { backgroundColor: colors.primary }]}
                    onPress={() => navigation?.navigate?.('EventDetail', { eventId: event._id })}
                  >
                    <Text style={styles.actionButtonText}>View Details</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableOpacity>
          ))}

          {/* Empty State */}
          {filteredEvents.length === 0 && (
            <View style={[styles.emptyState, { backgroundColor: colors.surface }]}>
              <LinearGradient
                colors={[colors.primary + '20', colors.primary + '10']}
                style={styles.emptyIconContainer}
              >
                <Ionicons
                  name={
                    searchQuery
                      ? 'search-outline'
                      : filter === 'drafts'
                        ? 'document-text-outline'
                        : 'calendar-outline'
                  }
                  size={64}
                  color={colors.primary}
                />
              </LinearGradient>
              <Text style={[styles.emptyTitle, { color: colors.text }]}>
                {searchQuery
                  ? 'No events found'
                  : filter === 'drafts'
                    ? 'No draft events'
                    : filter === 'live'
                      ? 'No live events right now'
                      : filter === 'past'
                        ? 'No past events'
                        : 'No events yet'}
              </Text>
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                {searchQuery
                  ? 'Try different keywords or filters'
                  : 'Create your first event and start managing attendees'}
              </Text>
              {!searchQuery && (
                <TouchableOpacity
                  style={[styles.emptyButton, { backgroundColor: colors.primary }]}
                  activeOpacity={0.8}
                  onPress={() => navigation?.navigate?.('CreateOrganizerEvent')}
                >
                  <Ionicons name="add-circle" size={22} color="#FFFFFF" />
                  <Text style={styles.emptyButtonText}>Create New Event</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>

        <View style={styles.bottomSpacing} />
        </>
      )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerGradient: {
    paddingTop: 50,
    paddingBottom: 24,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTextContainer: {
    flex: 1,
    marginLeft: 12,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '500',
  },
  createButton: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  createButtonGradient: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '600',
  },
  statDivider: {
    width: 1,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  scrollView: {
    flex: 1,
  },
  searchSection: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 1,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    padding: 0,
  },
  filtersContainer: {
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 20,
  },
  filterPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 24,
    borderWidth: 1.5,
    gap: 8,
  },
  filterText: {
    fontSize: 14,
    fontWeight: '600',
  },
  filterBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    minWidth: 24,
    alignItems: 'center',
  },
  filterBadgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  eventsContainer: {
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
  },
  emptyState: {
    padding: 48,
    borderRadius: 24,
    alignItems: 'center',
    marginTop: 32,
  },
  emptyIconContainer: {
    width: 140,
    height: 140,
    borderRadius: 70,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 15,
    textAlign: 'center',
    marginBottom: 28,
    lineHeight: 22,
    paddingHorizontal: 20,
  },
  emptyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 16,
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  emptyButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  bottomSpacing: {
    height: 40,
  },
  eventCard: {
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  eventImage: {
    width: '100%',
    height: 180,
    backgroundColor: '#f0f0f0',
  },
  eventContent: {
    padding: 16,
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
  },
  eventMeta: {
    gap: 8,
    marginBottom: 16,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  metaText: {
    fontSize: 14,
    flex: 1,
  },
  eventActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default MyEventsScreen;

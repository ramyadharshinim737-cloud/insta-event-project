import React, { useState, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import EventCard from '../../components/EventCard';
import FilterChip from '../../components/FilterChip';
import BottomNavigation from '../../components/BottomNavigation';
import CreateContentModal from '../../components/CreateContentModal';
import { Event, EventCategory } from '../../utils/eventTypes';
import { useEvents } from '../../context/EventContext';
import { getAllEvents } from '../../services/events.api';

interface EventsDiscoveryScreenProps {
  navigation?: any;
}

const EventsDiscoveryScreen: React.FC<EventsDiscoveryScreenProps> = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<EventCategory | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [backendEvents, setBackendEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const categories: EventCategory[] = ['Academic', 'Cultural', 'Sports', 'Networking', 'Workshops'];
  const locations = ['Online', 'San Francisco', 'New York', 'Los Angeles', 'Chicago'];

  // Fetch events from backend
  const fetchEvents = async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      
      console.log('📅 Fetching events from backend...');
      const events = await getAllEvents({
        upcoming: true,
        limit: 50
      });
      
      console.log('✅ Fetched events:', events.length);
      setBackendEvents(events);
    } catch (error) {
      console.error('❌ Error fetching events:', error);
      Alert.alert('Error', 'Failed to load events. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  // Convert backend events to display format
  const allEvents = useMemo(() => {
    return backendEvents.map(event => ({
      id: event._id,
      title: event.title,
      description: event.description || '',
      shortDescription: (event.description || '').substring(0, 100),
      category: (event.category || 'Networking') as EventCategory,
      date: event.date || new Date().toISOString(),
      time: event.time || '00:00',
      endTime: event.endTime,
      location: event.isOnline ? 'Online' : (event.venue || 'TBD'),
      locationType: (event.isOnline ? 'Online' : 'In-Person') as LocationType,
      host: {
        id: event.createdBy?._id || 'unknown',
        name: event.createdBy?.name || 'Unknown',
        verified: false,
      },
      bannerColor: '#0A66C2',
      bannerIcon: 'calendar',
      attendeeCount: event.attendeeCount || 0,
      maxAttendees: event.maxAttendees,
      imageUrl: event.coverImage,
      ticketType: 'Free',
      hasRSVPd: false,
      meetingLink: event.meetingLink,
    }));
  }, [backendEvents]);

  // Filter events based on search and filters
  const filteredEvents = useMemo(() => {
    return allEvents.filter((event) => {
      const matchesSearch = searchQuery === '' || 
        event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.description.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCategory = !selectedCategory || event.category === selectedCategory;
      
      const matchesLocation = !selectedLocation || 
        (selectedLocation === 'Online' ? event.locationType === 'Online' : event.location.includes(selectedLocation));

      return matchesSearch && matchesCategory && matchesLocation;
    });
  }, [allEvents, searchQuery, selectedCategory, selectedLocation]);

  const handleEventPress = (event: Event) => {
    // Navigate to event detail screen
    if (navigation) {
      navigation.navigate('EventDetail', { event });
    }
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory(null);
    setSelectedLocation(null);
  };

  const handleCreatePress = () => {
    setShowCreateModal(true);
  };

  const handleCreateStory = () => {
    Alert.alert('Create Story', 'Story creation coming soon!');
  };

  const handleCreatePost = () => {
    Alert.alert('Write Article', 'Article creation coming soon!');
  };

  const handleCreateEvent = () => {
    if (navigation) {
      navigation.navigate('CreateEvent');
    }
  };

  const handleCreateReel = () => {
    Alert.alert('Record Reel', 'Reel recording coming soon!');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Events</Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search events..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor="#999"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={20} color="#666" />
          </TouchableOpacity>
        )}
      </View>

      {/* Category Filters */}
      <View style={styles.filterSection}>
        <Text style={styles.filterLabel}>Category</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScroll}
        >
          {categories.map((category) => (
            <FilterChip
              key={category}
              label={category}
              isActive={selectedCategory === category}
              onPress={() => setSelectedCategory(selectedCategory === category ? null : category)}
            />
          ))}
        </ScrollView>
      </View>

      {/* Location Filters */}
      <View style={styles.filterSection}>
        <Text style={styles.filterLabel}>Location</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScroll}
        >
          {locations.map((location) => (
            <FilterChip
              key={location}
              label={location}
              isActive={selectedLocation === location}
              onPress={() => setSelectedLocation(selectedLocation === location ? null : location)}
              icon={location === 'Online' ? 'videocam' : 'location'}
            />
          ))}
        </ScrollView>
      </View>

      {/* Clear Filters */}
      {(selectedCategory || selectedLocation || searchQuery) && (
        <TouchableOpacity style={styles.clearButton} onPress={clearFilters}>
          <Text style={styles.clearButtonText}>Clear all filters</Text>
        </TouchableOpacity>
      )}

      {/* Events List */}
      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading events...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredEvents}
          renderItem={({ item }) => (
            <EventCard event={item} onPress={() => handleEventPress(item)} />
          )}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshing={refreshing}
          onRefresh={() => fetchEvents(true)}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons name="calendar-outline" size={64} color="#ccc" />
              <Text style={styles.emptyTitle}>No events found</Text>
              <Text style={styles.emptyText}>
                {filteredEvents.length === 0 && allEvents.length > 0 
                  ? 'Try adjusting your filters or search query'
                  : 'Be the first to create an event!'}
              </Text>
            </View>
          }
        />
      )}

      {/* Bottom Navigation */}
      <BottomNavigation 
        activeTab="Events" 
        navigation={navigation} 
        onCreatePress={handleCreatePress}
      />

      {/* Create Content Modal */}
      <CreateContentModal
        visible={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreateStory={handleCreateStory}
        onCreatePost={handleCreatePost}
        onCreateEvent={handleCreateEvent}
        onCreateReel={handleCreateReel}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fafafa',
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 0.5,
    borderBottomColor: '#dbdbdb',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#262626',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 0.5,
    borderColor: '#dbdbdb',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#262626',
  },
  filterSection: {
    marginBottom: 12,
  },
  filterLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#262626',
    marginLeft: 16,
    marginBottom: 8,
  },
  filterScroll: {
    paddingHorizontal: 16,
  },
  clearButton: {
    alignSelf: 'center',
    paddingVertical: 6,
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  clearButtonText: {
    fontSize: 13,
    color: '#0a66c2',
    fontWeight: '600',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 90, // Increased to account for fixed bottom navigation
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#8e8e8e',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#8e8e8e',
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    fontSize: 16,
    color: '#8e8e8e',
    marginTop: 12,
  },
});

export default EventsDiscoveryScreen;

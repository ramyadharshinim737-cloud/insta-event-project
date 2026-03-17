import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Share,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Event } from '../../utils/eventTypes';
import { useEvents } from '../../context/EventContext';
import { useAuth } from '../../context/AuthContext';
import { getEventById } from '../../services/events.api';

interface EventDetailScreenProps {
  route?: any;
  navigation?: any;
}

const EventDetailScreen: React.FC<EventDetailScreenProps> = ({ route, navigation }) => {
  const eventFromParams: Event = route?.params?.event;
  const eventId: string = route?.params?.eventId;
  
  // Debug logging
  console.log('🔍 EventDetailScreen - Params:', {
    hasEvent: !!eventFromParams,
    hasEventId: !!eventId,
    eventId: eventId,
    eventTitle: eventFromParams?.title,
    allParams: route?.params
  });
  
  const [event, setEvent] = useState<Event | null>(eventFromParams || null);
  const [loading, setLoading] = useState(!eventFromParams && !!eventId);
  
  const { updateEventRSVP, userEvents, deleteEvent } = useEvents();
  const { user } = useAuth();
  const [isBookmarked, setIsBookmarked] = useState(event?.isBookmarked || false);
  const [hasRSVPd, setHasRSVPd] = useState(event?.hasRSVPd || false);
  const [attendeeCount, setAttendeeCount] = useState(event?.attendeeCount || 0);
  
  // Check if current user is the event owner
  const isOwner = user?.id === event?.host?.id || user?.id === event?.createdBy;

  // Fetch event if only ID is provided
  useEffect(() => {
    const fetchEvent = async () => {
      if (!eventFromParams && eventId) {
        try {
          console.log('📥 Fetching event details for ID:', eventId);
          setLoading(true);
          const fetchedEvent = await getEventById(eventId);
          console.log('✅ Event fetched:', fetchedEvent.title);
          
          // Convert API event to Event type
          const convertedEvent: Event = {
            id: fetchedEvent._id,
            title: fetchedEvent.title,
            description: fetchedEvent.description,
            date: fetchedEvent.date,
            time: fetchedEvent.time,
            venue: fetchedEvent.venue,
            category: fetchedEvent.category,
            coverImage: fetchedEvent.coverImage,
            isOnline: fetchedEvent.isOnline,
            meetingLink: fetchedEvent.meetingLink || '',
            attendeeCount: fetchedEvent.attendeeCount || 0,
            hasRSVPd: false,
            host: {
              id: fetchedEvent.createdBy,
              name: 'Event Host',
              avatar: '',
            },
            createdBy: fetchedEvent.createdBy,
          };
          
          setEvent(convertedEvent);
          setAttendeeCount(convertedEvent.attendeeCount);
        } catch (error) {
          console.error('❌ Error fetching event:', error);
          Alert.alert('Error', 'Failed to load event details');
        } finally {
          setLoading(false);
        }
      }
    };

    fetchEvent();
  }, [eventId, eventFromParams]);

  // Check RSVP status from backend when event is loaded
  useEffect(() => {
    const checkRsvpStatus = async () => {
      if (event?.id && !event.id.startsWith('user_event_')) {
        try {
          const { checkUserRsvp } = await import('../../services/events.api');
          const { hasRsvp } = await checkUserRsvp(event.id);
          console.log('🎫 RSVP status checked:', hasRsvp);
          setHasRSVPd(hasRsvp);
        } catch (error) {
          console.error('❌ Error checking RSVP status:', error);
        }
      }
    };

    checkRsvpStatus();
  }, [event?.id]);

  // Load persisted state from EventContext on mount
  useEffect(() => {
    if (event?.id.startsWith('user_event_')) {
      const persistedEvent = userEvents.find(e => e.id === event.id);
      if (persistedEvent) {
        setHasRSVPd(persistedEvent.hasRSVPd || false);
        setAttendeeCount(persistedEvent.attendeeCount || 0);
      }
    }
  }, [event?.id, userEvents]);

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0A66C2" />
          <Text style={styles.loadingText}>Loading event details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!event) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color="#EF4444" />
          <Text style={styles.errorText}>Event not found</Text>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation?.goBack?.()}
          >
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = { 
      weekday: 'long',
      month: 'long', 
      day: 'numeric',
      year: 'numeric'
    };
    return date.toLocaleDateString('en-US', options);
  };

  const handleRSVP = async () => {
    const newRSVPState = !hasRSVPd;
    
    // Check capacity limit when RSVPing (not when un-RSVPing)
    if (newRSVPState && event.maxAttendees && attendeeCount >= event.maxAttendees) {
      Alert.alert(
        'Event Full',
        `This event has reached its maximum capacity of ${event.maxAttendees} attendees.`,
        [{ text: 'OK' }]
      );
      return;
    }

    const previousRSVPState = hasRSVPd;
    const previousAttendeeCount = attendeeCount;

    try {
      // Update UI optimistically
      setHasRSVPd(newRSVPState);
      const newAttendeeCount = newRSVPState ? attendeeCount + 1 : attendeeCount - 1;
      setAttendeeCount(newAttendeeCount);

      // Call backend API through EventContext
      await updateEventRSVP(event.id, newRSVPState, newAttendeeCount);
      
      // Verify RSVP status from backend after update
      try {
        const { checkUserRsvp } = await import('../../services/events.api');
        const { hasRsvp } = await checkUserRsvp(event.id);
        console.log('✅ RSVP verified from backend:', hasRsvp);
        setHasRSVPd(hasRsvp);
      } catch (verifyError) {
        console.warn('⚠️ Could not verify RSVP status:', verifyError);
      }

      // Refetch event to get updated attendee count
      try {
        const { getEventById } = await import('../../services/events.api');
        const updatedEvent = await getEventById(event.id);
        setAttendeeCount(updatedEvent.attendeeCount || attendeeCount);
        console.log('✅ Event refreshed, attendee count:', updatedEvent.attendeeCount);
      } catch (refreshError) {
        console.warn('⚠️ Could not refresh event data:', refreshError);
      }
      
      // Show success message
      Alert.alert(
        'Success',
        newRSVPState ? '✅ You are registered for this event!' : '✅ RSVP cancelled successfully',
        [{ text: 'OK' }]
      );
    } catch (error: any) {
      // Check if error is "Already registered" - treat as success
      if (error.message && error.message.includes('Already registered')) {
        console.log('ℹ️ Already registered, updating UI state');
        setHasRSVPd(true); // Ensure UI shows registered state
        Alert.alert(
          'Already Registered',
          'You are already registered for this event!',
          [{ text: 'OK' }]
        );
        return;
      }
      
      // For other errors, revert UI
      setHasRSVPd(previousRSVPState);
      setAttendeeCount(previousAttendeeCount);
      
      console.error('❌ RSVP Error:', error);
      Alert.alert(
        'Error',
        error.message || 'Failed to update RSVP. Please try again.',
        [{ text: 'OK' }]
      );
    }
  };

  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked);
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Check out this event: ${event.title}\n${formatDate(event.date)} at ${event.time}\n${event.location}`,
      });
    } catch (error) {
      console.error(error);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Event',
      'Are you sure you want to delete this event? This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteEvent(event.id);
              Alert.alert('Success', 'Event deleted successfully', [
                { text: 'OK', onPress: () => navigation?.goBack() }
              ]);
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to delete event');
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header with Back Button */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation?.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#262626" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Event Details</Text>
        {isOwner ? (
          <TouchableOpacity onPress={handleDelete} style={styles.deleteButton}>
            <Ionicons name="trash-outline" size={24} color="#ff3b30" />
          </TouchableOpacity>
        ) : (
          <View style={{ width: 24 }} />
        )}
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Banner */}
        <View style={[styles.banner, !event.imageUrl && { backgroundColor: event.bannerColor }]}>
          {event.imageUrl ? (
            <Image source={{ uri: event.imageUrl }} style={styles.bannerImage} resizeMode="cover" />
          ) : (
            <Ionicons name={event.bannerIcon as any} size={80} color="#fff" />
          )}
        </View>

        {/* Content */}
        <View style={styles.content}>
          {/* Category Badge */}
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{event.category}</Text>
          </View>

          {/* Title */}
          <Text style={styles.title}>{event.title}</Text>

          {/* Host */}
          <View style={styles.hostRow}>
            <Text style={styles.hostLabel}>Hosted by </Text>
            <Text style={styles.hostName}>{event.host.name}</Text>
            {event.host.verified && (
              <Ionicons name="checkmark-circle" size={16} color="#0095f6" style={{ marginLeft: 4 }} />
            )}
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[styles.primaryButton, hasRSVPd && styles.rsvpdButton]}
              onPress={handleRSVP}
            >
              <Ionicons 
                name={hasRSVPd ? "checkmark-circle" : (event.ticketType === 'Paid' ? 'ticket' : 'calendar')} 
                size={20} 
                color="#fff" 
              />
              <Text style={styles.primaryButtonText}>
                {hasRSVPd 
                  ? (event.ticketType === 'Paid' ? 'Booked' : 'RSVP\'d')
                  : (event.ticketType === 'Paid' ? 'Book Ticket' : 'RSVP')
                }
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={handleBookmark}
            >
              <Ionicons 
                name={isBookmarked ? "bookmark" : "bookmark-outline"} 
                size={20} 
                color="#0a66c2" 
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={handleShare}
            >
              <Ionicons name="share-social-outline" size={20} color="#0a66c2" />
            </TouchableOpacity>
          </View>

          {/* Event Details */}
          <View style={styles.detailsSection}>
            <Text style={styles.sectionTitle}>Event Details</Text>

            {/* Date & Time */}
            <View style={styles.detailRow}>
              <View style={styles.iconContainer}>
                <Ionicons name="calendar-outline" size={24} color="#0a66c2" />
              </View>
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Date & Time</Text>
                <Text style={styles.detailValue}>{formatDate(event.date)}</Text>
                <Text style={styles.detailValue}>
                  {event.time}{event.endTime ? ` - ${event.endTime}` : ''}
                </Text>
              </View>
            </View>

            {/* Location */}
            <View style={styles.detailRow}>
              <View style={styles.iconContainer}>
                <Ionicons 
                  name={event.locationType === 'Online' ? 'videocam-outline' : 'location-outline'} 
                  size={24} 
                  color="#0a66c2" 
                />
              </View>
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Location</Text>
                <Text style={styles.detailValue}>{event.location}</Text>
                {event.locationType === 'Online' && (
                  <View style={styles.onlineBadge}>
                    <Text style={styles.onlineText}>Online Event</Text>
                  </View>
                )}
              </View>
            </View>

            {/* Attendees */}
            <View style={styles.detailRow}>
              <View style={styles.iconContainer}>
                <Ionicons name="people-outline" size={24} color="#0a66c2" />
              </View>
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Attendees</Text>
                <Text style={styles.detailValue}>
                  {attendeeCount.toLocaleString()} attending
                  {event.maxAttendees && ` • ${event.maxAttendees.toLocaleString()} max`}
                </Text>
              </View>
            </View>
          </View>

          {/* Description */}
          <View style={styles.descriptionSection}>
            <Text style={styles.sectionTitle}>About This Event</Text>
            <Text style={styles.description}>{event.description}</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fafafa',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 0.5,
    borderBottomColor: '#dbdbdb',
  },
  backButton: {
    padding: 4,
  },
  deleteButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#262626',
  },
  banner: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  bannerImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  content: {
    padding: 16,
    backgroundColor: '#fff',
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#e3f2fd',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginBottom: 12,
  },
  categoryText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#0a66c2',
    textTransform: 'uppercase',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#262626',
    marginBottom: 12,
    lineHeight: 32,
  },
  hostRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  hostLabel: {
    fontSize: 13,
    color: '#8e8e8e',
  },
  hostName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#262626',
  },
  actionButtons: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  primaryButton: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#0a66c2',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  rsvpdButton: {
    backgroundColor: '#4caf50',
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
    marginLeft: 8,
  },
  secondaryButton: {
    width: 44,
    height: 44,
    borderRadius: 8,
    borderWidth: 0.5,
    borderColor: '#dbdbdb',
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 6,
  },
  detailsSection: {
    marginBottom: 20,
    backgroundColor: '#fff',
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#262626',
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#e3f2fd',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  detailContent: {
    flex: 1,
    justifyContent: 'center',
  },
  detailLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#8e8e8e',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 15,
    color: '#262626',
    lineHeight: 20,
  },
  onlineBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#4caf50',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 6,
  },
  onlineText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#fff',
  },
  descriptionSection: {
    marginBottom: 20,
    backgroundColor: '#fff',
    padding: 16,
  },
  description: {
    fontSize: 15,
    color: '#262626',
    lineHeight: 22,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#8e8e8e',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    marginTop: 16,
    fontSize: 18,
    fontWeight: '600',
    color: '#262626',
    marginBottom: 24,
  },
  backButton: {
    backgroundColor: '#0A66C2',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default EventDetailScreen;

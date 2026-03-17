import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Event } from '../utils/eventTypes';

interface EventCardProps {
  event: Event;
  onPress: () => void;
}

const EventCard: React.FC<EventCardProps> = ({ event, onPress }) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    };
    return date.toLocaleDateString('en-US', options);
  };

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.9}>
      {/* Banner */}
      <View style={[styles.banner, !event.imageUrl && { backgroundColor: event.bannerColor }]}>
        {event.imageUrl ? (
          <Image source={{ uri: event.imageUrl }} style={styles.bannerImage} resizeMode="cover" />
        ) : (
          <Ionicons name={event.bannerIcon as any} size={60} color="#fff" />
        )}
        {event.isBookmarked && (
          <View style={styles.bookmarkBadge}>
            <Ionicons name="bookmark" size={20} color="#ffd700" />
          </View>
        )}
      </View>

      {/* Content */}
      <View style={styles.content}>
        {/* Category Badge */}
        <View style={styles.categoryBadge}>
          <Text style={styles.categoryText}>{event.category}</Text>
        </View>

        {/* Title */}
        <Text style={styles.title} numberOfLines={2}>
          {event.title}
        </Text>

        {/* Date & Time */}
        <View style={styles.infoRow}>
          <Ionicons name="calendar-outline" size={16} color="#666" />
          <Text style={styles.infoText}>
            {formatDate(event.date)} • {event.time}
          </Text>
        </View>

        {/* Location */}
        <View style={styles.infoRow}>
          <Ionicons 
            name={event.locationType === 'Online' ? 'videocam-outline' : 'location-outline'} 
            size={16} 
            color="#666" 
          />
          <Text style={styles.infoText}>{event.location}</Text>
          {event.locationType === 'Online' && (
            <View style={styles.onlineBadge}>
              <Text style={styles.onlineText}>Online</Text>
            </View>
          )}
        </View>

        {/* Host & Attendees */}
        <View style={styles.footer}>
          <View style={styles.hostInfo}>
            <Text style={styles.hostText} numberOfLines={1}>
              {event.host.name}
            </Text>
            {event.host.verified && (
              <Ionicons name="checkmark-circle" size={14} color="#0095f6" />
            )}
          </View>
          <View style={styles.attendeeInfo}>
            <Ionicons name="people" size={14} color="#666" />
            <Text style={styles.attendeeText}>
              {event.attendeeCount.toLocaleString()}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 12,
    overflow: 'hidden',
    borderWidth: 0.5,
    borderColor: '#dbdbdb',
  },
  banner: {
    height: 160,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  bannerImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  bookmarkBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 20,
    padding: 6,
  },
  content: {
    padding: 12,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#e3f2fd',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 8,
  },
  categoryText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#0a66c2',
    textTransform: 'uppercase',
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#262626',
    marginBottom: 10,
    lineHeight: 22,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  infoText: {
    fontSize: 13,
    color: '#8e8e8e',
    marginLeft: 6,
    flex: 1,
  },
  onlineBadge: {
    backgroundColor: '#4caf50',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginLeft: 8,
  },
  onlineText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#fff',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 0.5,
    borderTopColor: '#efefef',
  },
  hostInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 12,
  },
  hostText: {
    fontSize: 12,
    color: '#8e8e8e',
    marginRight: 4,
  },
  attendeeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  attendeeText: {
    fontSize: 12,
    color: '#8e8e8e',
    marginLeft: 4,
    fontWeight: '500',
  },
});

export default EventCard;

/**
 * Enhanced EventCard Component
 * Premium card design for organizer events
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../context/ThemeContext';
import { OrganizerEvent } from '../../types/organizerEvent.types';
import {
  getEventStatusColor,
  getEventStatusLabel,
  formatRevenue,
  getTicketSalesPercentage,
} from '../../utils/organizerEventUtils';
import { formatEventDate, formatEventTime } from '../../utils/ticketUtils';

interface EventCardProps {
  event: OrganizerEvent;
  onPress: () => void;
  onEdit: () => void;
  onShare: () => void;
}

const EventCard: React.FC<EventCardProps> = ({ event, onPress, onEdit, onShare }) => {
  const { colors } = useTheme();
  const salesPercentage = getTicketSalesPercentage(event.ticketsSold, event.totalCapacity);

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: colors.surface }]}
      onPress={onPress}
      activeOpacity={0.9}
    >
      {/* Event Banner with Gradient */}
      <View style={styles.bannerContainer}>
        <Image source={{ uri: event.eventPoster }} style={styles.banner} />
        <LinearGradient
          colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.8)']}
          style={styles.bannerGradient}
        />

        {/* Status Badge */}
        <View style={styles.statusContainer}>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: getEventStatusColor(event.status) },
            ]}
          >
            <View style={styles.statusDot} />
            <Text style={styles.statusText}>{getEventStatusLabel(event.status)}</Text>
          </View>
        </View>

        {/* Event Title Overlay */}
        <View style={styles.titleOverlay}>
          <Text style={styles.eventTitle} numberOfLines={2}>
            {event.eventName}
          </Text>
          <View style={styles.categoryBadge}>
            <Ionicons name="pricetag" size={12} color="#FFFFFF" />
            <Text style={styles.categoryText}>{event.eventCategory}</Text>
          </View>
        </View>
      </View>

      {/* Content Section */}
      <View style={styles.content}>
        {/* Date & Time Row */}
        <View style={styles.dateTimeRow}>
          <View style={[styles.dateTimeCard, { backgroundColor: colors.background }]}>
            <Ionicons name="calendar" size={16} color={colors.primary} />
            <Text style={[styles.dateTimeText, { color: colors.text }]}>
              {formatEventDate(event.startDate)}
            </Text>
          </View>
          <View style={[styles.dateTimeCard, { backgroundColor: colors.background }]}>
            <Ionicons name="time" size={16} color={colors.primary} />
            <Text style={[styles.dateTimeText, { color: colors.text }]}>
              {formatEventTime(event.startDate)}
            </Text>
          </View>
        </View>

        {/* Venue */}
        <View style={styles.venueRow}>
          <Ionicons name="location" size={16} color={colors.textSecondary} />
          <Text style={[styles.venueText, { color: colors.textSecondary }]} numberOfLines={1}>
            {event.venue.name}, {event.venue.city}
          </Text>
        </View>

        {/* Stats Grid */}
        {event.status !== 'draft' && (
          <View style={styles.statsGrid}>
            <View style={[styles.statBox, { backgroundColor: colors.background }]}>
              <Text style={[styles.statValue, { color: colors.primary }]}>
                {event.ticketsSold}
              </Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                Sold
              </Text>
            </View>
            <View style={[styles.statBox, { backgroundColor: colors.background }]}>
              <Text style={[styles.statValue, { color: colors.text }]}>
                {event.totalCapacity}
              </Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                Capacity
              </Text>
            </View>
            <View style={[styles.statBox, { backgroundColor: colors.background }]}>
              <Text style={[styles.statValue, { color: '#10B981' }]}>
                {salesPercentage}%
              </Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                Filled
              </Text>
            </View>
          </View>
        )}

        {/* Revenue Section */}
        {event.status !== 'draft' && (
          <View style={styles.revenueSection}>
            <View style={styles.revenueHeader}>
              <Ionicons name="trending-up" size={18} color={colors.primary} />
              <Text style={[styles.revenueLabel, { color: colors.textSecondary }]}>
                Revenue
              </Text>
            </View>
            <View style={styles.revenueAmounts}>
              <View>
                <Text style={[styles.revenueTotal, { color: colors.text }]}>
                  {formatRevenue(event.revenue.totalRevenue)}
                </Text>
                <Text style={[styles.revenueSubtext, { color: colors.textTertiary }]}>
                  Total
                </Text>
              </View>
              <View style={styles.revenueDivider} />
              <View>
                <Text style={[styles.revenuePaid, { color: '#10B981' }]}>
                  {formatRevenue(event.revenue.paidAmount)}
                </Text>
                <Text style={[styles.revenueSubtext, { color: colors.textTertiary }]}>
                  Collected
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.actionBtn, styles.secondaryBtn, { borderColor: colors.border }]}
            onPress={(e) => {
              e.stopPropagation();
              onEdit();
            }}
            activeOpacity={0.7}
          >
            <Ionicons name="create-outline" size={18} color={colors.text} />
            <Text style={[styles.actionBtnText, { color: colors.text }]}>Edit</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionBtn, styles.secondaryBtn, { borderColor: colors.border }]}
            onPress={(e) => {
              e.stopPropagation();
              onShare();
            }}
            activeOpacity={0.7}
          >
            <Ionicons name="share-social-outline" size={18} color={colors.text} />
            <Text style={[styles.actionBtnText, { color: colors.text }]}>Share</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionBtn, styles.primaryBtn, { backgroundColor: colors.primary }]}
            onPress={onPress}
            activeOpacity={0.7}
          >
            <Ionicons name="analytics-outline" size={18} color="#FFFFFF" />
            <Text style={styles.primaryBtnText}>Dashboard</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
  },
  bannerContainer: {
    height: 200,
    position: 'relative',
  },
  banner: {
    width: '100%',
    height: '100%',
    backgroundColor: '#E1E8ED',
  },
  bannerGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '70%',
  },
  statusContainer: {
    position: 'absolute',
    top: 16,
    right: 16,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
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
    letterSpacing: 0.5,
  },
  titleOverlay: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
  },
  eventTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
    backdropFilter: 'blur(10px)',
  },
  categoryText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
  },
  content: {
    padding: 20,
  },
  dateTimeRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
  },
  dateTimeCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  dateTimeText: {
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
  },
  venueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  venueText: {
    fontSize: 14,
    flex: 1,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 12,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  revenueSection: {
    marginBottom: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  revenueHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
  },
  revenueLabel: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  revenueAmounts: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  revenueTotal: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  revenuePaid: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  revenueSubtext: {
    fontSize: 11,
    textAlign: 'center',
  },
  revenueDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#E5E7EB',
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: 12,
  },
  secondaryBtn: {
    borderWidth: 1.5,
  },
  primaryBtn: {
    flex: 1.3,
  },
  actionBtnText: {
    fontSize: 14,
    fontWeight: '600',
  },
  primaryBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default EventCard;

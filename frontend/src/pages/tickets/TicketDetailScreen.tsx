/**
 * Comprehensive TicketDetailScreen
 * Complete ticket details with all requested features
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Modal,
  Alert,
  Platform,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { getTicketById } from '../../data/mockTickets';
import CountdownTimer from '../../components/tickets/CountdownTimer';
import {
  formatEventDate,
  formatEventTime,
  formatCurrency,
  getStatusColor,
  getStatusLabel,
  calculateRefund,
} from '../../utils/ticketUtils';

interface Props {
  navigation?: any;
  route?: any;
}

const TicketDetailScreen: React.FC<Props> = ({ navigation, route }) => {
  const { colors } = useTheme();
  const ticketId = route?.params?.ticketId || 'ticket-1';
  const ticket = getTicketById(ticketId);

  const [showQRModal, setShowQRModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);

  if (!ticket) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.text }}>Ticket not found</Text>
      </View>
    );
  }

  const handleCancel = () => {
    const refundAmount = calculateRefund(ticket.paymentInfo.totalAmount, ticket.startDate);
    Alert.alert(
      'Cancel Ticket',
      `You will receive a refund of ${formatCurrency(refundAmount)}`,
      [
        { text: 'Keep Ticket', style: 'cancel' },
        {
          text: 'Cancel Ticket',
          style: 'destructive',
          onPress: () => {
            setShowCancelModal(false);
            Alert.alert('Success', 'Ticket cancelled. Refund will be processed in 5-7 business days.');
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
      edges={['left', 'right', 'bottom']}
    >
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      {/* Header */}
      <LinearGradient
        colors={['rgba(0,0,0,0.7)', 'transparent']}
        style={styles.headerGradient}
      >
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation?.goBack?.()}
            style={styles.headerButton}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Ticket Details</Text>
          <TouchableOpacity style={styles.headerButton} activeOpacity={0.7}>
            <Ionicons name="share-social-outline" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Event Banner */}
        <View style={styles.bannerContainer}>
          <Image source={{ uri: ticket.eventBanner }} style={styles.banner} />
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.8)']}
            style={styles.bannerOverlay}
          >
            <View style={styles.bannerContent}>
              <View
                style={[
                  styles.statusBadge,
                  { backgroundColor: getStatusColor(ticket.status) },
                ]}
              >
                <Text style={styles.statusText}>{getStatusLabel(ticket.status)}</Text>
              </View>
              <Text style={styles.eventTitle}>{ticket.eventName}</Text>
              <Text style={styles.eventCategory}>{ticket.eventCategory}</Text>
            </View>
          </LinearGradient>
        </View>

        {/* Countdown Timer */}
        {ticket.status === 'upcoming' && (
          <View style={[styles.section, { backgroundColor: colors.surface }]}>
            <CountdownTimer startDate={ticket.startDate} />
          </View>
        )}

        {/* Event Info */}
        <View style={[styles.section, { backgroundColor: colors.surface }]}>
          <SectionHeader title="Event Information" icon="information-circle" colors={colors} />
          <InfoRow
            icon="calendar"
            label="Date"
            value={formatEventDate(ticket.startDate)}
            colors={colors}
          />
          <InfoRow
            icon="time"
            label="Time"
            value={formatEventTime(ticket.startDate)}
            colors={colors}
          />
          <InfoRow
            icon="hourglass"
            label="Duration"
            value={ticket.duration}
            colors={colors}
          />
          <InfoRow
            icon="location"
            label="Venue"
            value={`${ticket.venue.name}\n${ticket.venue.address}, ${ticket.venue.city}`}
            colors={colors}
            multiline
          />
        </View>

        {/* Ticket Information */}
        <View style={[styles.section, { backgroundColor: colors.surface }]}>
          <SectionHeader title="Ticket Information" icon="ticket" colors={colors} />
          <InfoRow
            icon="barcode"
            label="Ticket ID"
            value={ticket.ticketInfo.ticketId}
            colors={colors}
          />
          <InfoRow
            icon="pricetag"
            label="Type"
            value={ticket.ticketInfo.ticketType.toUpperCase()}
            colors={colors}
          />
          <InfoRow
            icon="people"
            label="Quantity"
            value={`${ticket.ticketInfo.quantity} ticket(s)`}
            colors={colors}
          />
          {ticket.ticketInfo.seatNumber && (
            <InfoRow
              icon="apps"
              label="Seat"
              value={ticket.ticketInfo.seatNumber}
              colors={colors}
            />
          )}
          {ticket.ticketInfo.zone && (
            <InfoRow
              icon="location"
              label="Zone"
              value={ticket.ticketInfo.zone}
              colors={colors}
            />
          )}
          {ticket.ticketInfo.entryGate && (
            <InfoRow
              icon="enter"
              label="Entry Gate"
              value={ticket.ticketInfo.entryGate}
              colors={colors}
            />
          )}

          {/* QR Code Button */}
          {ticket.status !== 'cancelled' && (
            <TouchableOpacity
              style={[styles.qrButton, { backgroundColor: colors.primary }]}
              onPress={() => setShowQRModal(true)}
              activeOpacity={0.8}
            >
              <Ionicons name="qr-code" size={24} color="#FFFFFF" />
              <Text style={styles.qrButtonText}>Show QR Code</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Parking Information */}
        {ticket.parkingInfo && (
          <View style={[styles.section, { backgroundColor: colors.surface }]}>
            <SectionHeader title="Parking Information" icon="car" colors={colors} />
            <InfoRow
              icon="car-sport"
              label="Parking Type"
              value={ticket.parkingInfo.parkingType.toUpperCase()}
              colors={colors}
            />
            <InfoRow
              icon="grid"
              label="Total Slots"
              value={`${ticket.parkingInfo.totalSlots} slots`}
              colors={colors}
            />
            <InfoRow
              icon="checkmark-circle"
              label="Available"
              value={`${ticket.parkingInfo.availableSlots} slots`}
              colors={colors}
              valueColor={
                ticket.parkingInfo.availableSlots > 20 ? '#27AE60' : '#E67E22'
              }
            />
            {ticket.parkingInfo.parkingFee && (
              <InfoRow
                icon="cash"
                label="Parking Fee"
                value={formatCurrency(ticket.parkingInfo.parkingFee)}
                colors={colors}
              />
            )}
            {ticket.parkingInfo.entryGate && (
              <InfoRow
                icon="enter"
                label="Parking Gate"
                value={ticket.parkingInfo.entryGate}
                colors={colors}
              />
            )}
          </View>
        )}

        {/* Payment Information */}
        <View style={[styles.section, { backgroundColor: colors.surface }]}>
          <SectionHeader title="Payment Details" icon="card" colors={colors} />
          <View
            style={[
              styles.paymentStatus,
              {
                backgroundColor:
                  ticket.paymentInfo.status === 'paid'
                    ? '#27AE6020'
                    : '#E67E2220',
              },
            ]}
          >
            <Ionicons
              name={
                ticket.paymentInfo.status === 'paid'
                  ? 'checkmark-circle'
                  : 'time'
              }
              size={24}
              color={ticket.paymentInfo.status === 'paid' ? '#27AE60' : '#E67E22'}
            />
            <Text
              style={[
                styles.paymentStatusText,
                {
                  color:
                    ticket.paymentInfo.status === 'paid' ? '#27AE60' : '#E67E22',
                },
              ]}
            >
              {ticket.paymentInfo.status.toUpperCase()}
            </Text>
          </View>

          <View style={styles.priceBreakdown}>
            <PriceRow
              label="Base Price"
              value={ticket.paymentInfo.basePrice}
              colors={colors}
            />
            <PriceRow
              label="Taxes & Fees"
              value={ticket.paymentInfo.taxes}
              colors={colors}
            />
            <PriceRow
              label="Platform Fee"
              value={ticket.paymentInfo.platformFee}
              colors={colors}
            />
            {ticket.paymentInfo.discount && (
              <PriceRow
                label="Discount"
                value={-ticket.paymentInfo.discount}
                colors={colors}
                isDiscount
              />
            )}
            {ticket.paymentInfo.walletUsed && (
              <PriceRow
                label="Wallet Used"
                value={-ticket.paymentInfo.walletUsed}
                colors={colors}
                isDiscount
              />
            )}
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            <View style={styles.totalRow}>
              <Text style={[styles.totalLabel, { color: colors.text }]}>
                Total Paid
              </Text>
              <Text style={[styles.totalValue, { color: colors.primary }]}>
                {formatCurrency(ticket.paymentInfo.totalAmount)}
              </Text>
            </View>
          </View>

          {ticket.paymentInfo.paymentMethod && (
            <InfoRow
              icon="card"
              label="Payment Method"
              value={ticket.paymentInfo.paymentMethod}
              colors={colors}
            />
          )}
          {ticket.paymentInfo.transactionId && (
            <InfoRow
              icon="receipt"
              label="Transaction ID"
              value={ticket.paymentInfo.transactionId}
              colors={colors}
            />
          )}

          {ticket.paymentInfo.walletBalance !== undefined && (
            <View
              style={[
                styles.walletCard,
                { backgroundColor: colors.primary + '10', borderColor: colors.primary },
              ]}
            >
              <Ionicons name="wallet" size={24} color={colors.primary} />
              <View style={styles.walletInfo}>
                <Text style={[styles.walletLabel, { color: colors.textSecondary }]}>
                  Wallet Balance
                </Text>
                <Text style={[styles.walletBalance, { color: colors.primary }]}>
                  {formatCurrency(ticket.paymentInfo.walletBalance)}
                </Text>
              </View>
            </View>
          )}
        </View>

        {/* Location & Navigation */}
        <View style={[styles.section, { backgroundColor: colors.surface }]}>
          <SectionHeader title="Location & Navigation" icon="map" colors={colors} />

          {/* Map Placeholder */}
          <View style={[styles.mapPlaceholder, { backgroundColor: colors.background }]}>
            <Ionicons name="map" size={48} color={colors.textTertiary} />
            <Text style={[styles.mapText, { color: colors.textSecondary }]}>
              Map Preview (UI Only)
            </Text>
          </View>

          <InfoRow
            icon="location"
            label="Address"
            value={`${ticket.venue.address}\n${ticket.venue.city}, ${ticket.venue.state} ${ticket.venue.zipCode}`}
            colors={colors}
            multiline
          />
          {ticket.venue.landmark && (
            <InfoRow
              icon="navigate"
              label="Landmark"
              value={ticket.venue.landmark}
              colors={colors}
            />
          )}

          <TouchableOpacity
            style={[styles.directionsButton, { backgroundColor: colors.primary }]}
            activeOpacity={0.8}
          >
            <Ionicons name="navigate" size={20} color="#FFFFFF" />
            <Text style={styles.directionsButtonText}>Get Directions</Text>
          </TouchableOpacity>
        </View>

        {/* Timeline */}
        <View style={[styles.section, { backgroundColor: colors.surface }]}>
          <SectionHeader title="Booking Timeline" icon="time" colors={colors} />
          {ticket.timeline.map((step, index) => (
            <View key={step.id} style={styles.timelineItem}>
              <View style={styles.timelineLeft}>
                <View
                  style={[
                    styles.timelineDot,
                    {
                      backgroundColor: step.completed
                        ? colors.primary
                        : colors.border,
                    },
                  ]}
                >
                  {step.completed && (
                    <Ionicons name="checkmark" size={12} color="#FFFFFF" />
                  )}
                </View>
                {index < ticket.timeline.length - 1 && (
                  <View
                    style={[
                      styles.timelineLine,
                      {
                        backgroundColor: step.completed
                          ? colors.primary
                          : colors.border,
                      },
                    ]}
                  />
                )}
              </View>
              <View style={styles.timelineRight}>
                <Text
                  style={[
                    styles.timelineTitle,
                    { color: step.completed ? colors.text : colors.textSecondary },
                  ]}
                >
                  {step.title}
                </Text>
                <Text style={[styles.timelineDesc, { color: colors.textSecondary }]}>
                  {step.description}
                </Text>
                <Text style={[styles.timelineDate, { color: colors.textTertiary }]}>
                  {formatEventDate(step.timestamp)}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* Organizer Info */}
        <View style={[styles.section, { backgroundColor: colors.surface }]}>
          <SectionHeader title="Organizer" icon="person" colors={colors} />
          <InfoRow
            icon="business"
            label="Name"
            value={ticket.organizerName}
            colors={colors}
          />
          {ticket.organizerContact && (
            <TouchableOpacity
              style={[styles.contactButton, { borderColor: colors.border }]}
              activeOpacity={0.7}
            >
              <Ionicons name="call" size={20} color={colors.primary} />
              <Text style={[styles.contactButtonText, { color: colors.primary }]}>
                {ticket.organizerContact}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Actions */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
            activeOpacity={0.7}
          >
            <Ionicons name="download-outline" size={22} color={colors.text} />
            <Text style={[styles.actionButtonText, { color: colors.text }]}>
              Download Ticket
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
            activeOpacity={0.7}
          >
            <Ionicons name="calendar-outline" size={22} color={colors.text} />
            <Text style={[styles.actionButtonText, { color: colors.text }]}>
              Add to Calendar
            </Text>
          </TouchableOpacity>

          {ticket.isCancellable && ticket.status === 'upcoming' && (
            <TouchableOpacity
              style={[styles.cancelButton, { borderColor: '#DC2626' }]}
              onPress={() => setShowCancelModal(true)}
              activeOpacity={0.7}
            >
              <Ionicons name="close-circle-outline" size={22} color="#DC2626" />
              <Text style={styles.cancelButtonText}>Cancel Ticket</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.bottomSpacing} />
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

            <View style={styles.qrCodeContainer}>
              <View style={styles.qrCodePlaceholder}>
                <Ionicons name="qr-code" size={200} color="#000000" />
              </View>
              <Text style={styles.qrCodeId}>{ticket.ticketInfo.qrCode}</Text>
            </View>

            <Text style={[styles.qrNote, { color: colors.textSecondary }]}>
              Show this QR code at the event entrance for check-in
            </Text>
          </View>
        </View>
      </Modal>

      {/* Cancel Confirmation Modal */}
      <Modal
        visible={showCancelModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowCancelModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                Cancel Ticket?
              </Text>
              <TouchableOpacity onPress={() => setShowCancelModal(false)}>
                <Ionicons name="close" size={28} color={colors.text} />
              </TouchableOpacity>
            </View>

            <Text style={[styles.cancelModalText, { color: colors.textSecondary }]}>
              {ticket.refundPolicy}
            </Text>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: colors.background, borderColor: colors.border }]}
                onPress={() => setShowCancelModal(false)}
                activeOpacity={0.7}
              >
                <Text style={[styles.modalButtonText, { color: colors.text }]}>
                  Keep Ticket
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonDanger]}
                onPress={handleCancel}
                activeOpacity={0.7}
              >
                <Text style={styles.modalButtonTextDanger}>Cancel Ticket</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

// Helper Components
const SectionHeader: React.FC<{ title: string; icon: string; colors: any }> = ({
  title,
  icon,
  colors,
}) => (
  <View style={styles.sectionHeader}>
    <Ionicons name={icon as any} size={20} color={colors.primary} />
    <Text style={[styles.sectionTitle, { color: colors.text }]}>{title}</Text>
  </View>
);

const InfoRow: React.FC<{
  icon: string;
  label: string;
  value: string;
  colors: any;
  multiline?: boolean;
  valueColor?: string;
}> = ({ icon, label, value, colors, multiline = false, valueColor }) => (
  <View style={styles.infoRow}>
    <View style={styles.infoLeft}>
      <Ionicons name={icon as any} size={18} color={colors.textSecondary} />
      <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>{label}</Text>
    </View>
    <Text
      style={[
        styles.infoValue,
        { color: valueColor || colors.text },
        multiline && styles.infoValueMultiline,
      ]}
      numberOfLines={multiline ? undefined : 1}
    >
      {value}
    </Text>
  </View>
);

const PriceRow: React.FC<{
  label: string;
  value: number;
  colors: any;
  isDiscount?: boolean;
}> = ({ label, value, colors, isDiscount = false }) => (
  <View style={styles.priceRow}>
    <Text style={[styles.priceLabel, { color: colors.textSecondary }]}>{label}</Text>
    <Text
      style={[
        styles.priceValue,
        { color: isDiscount ? '#27AE60' : colors.text },
      ]}
    >
      {isDiscount && value < 0 ? '-' : ''}
      {formatCurrency(Math.abs(value))}
    </Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  bannerContainer: {
    height: 300,
    position: 'relative',
  },
  banner: {
    width: '100%',
    height: '100%',
  },
  bannerOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
  },
  bannerContent: {
    gap: 8,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  eventTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  eventCategory: {
    fontSize: 16,
    color: '#FFFFFFCC',
  },
  section: {
    marginTop: 16,
    marginHorizontal: 16,
    padding: 16,
    borderRadius: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 12,
    gap: 16,
  },
  infoLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'right',
    flex: 1,
  },
  infoValueMultiline: {
    textAlign: 'left',
  },
  qrButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 8,
  },
  qrButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  paymentStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  paymentStatusText: {
    fontSize: 16,
    fontWeight: '700',
  },
  priceBreakdown: {
    marginBottom: 16,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  priceLabel: {
    fontSize: 14,
  },
  priceValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    marginVertical: 8,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 8,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '700',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: '700',
  },
  walletCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 12,
  },
  walletInfo: {
    flex: 1,
  },
  walletLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  walletBalance: {
    fontSize: 20,
    fontWeight: '700',
  },
  mapPlaceholder: {
    height: 150,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  mapText: {
    fontSize: 14,
    marginTop: 8,
  },
  directionsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 8,
  },
  directionsButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  timelineLeft: {
    alignItems: 'center',
    marginRight: 16,
  },
  timelineDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  timelineLine: {
    width: 2,
    flex: 1,
    marginTop: 4,
  },
  timelineRight: {
    flex: 1,
    paddingBottom: 8,
  },
  timelineTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  timelineDesc: {
    fontSize: 14,
    marginBottom: 4,
  },
  timelineDate: {
    fontSize: 12,
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 8,
  },
  contactButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  actionsContainer: {
    marginHorizontal: 16,
    marginTop: 16,
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    backgroundColor: '#FEE2E2',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#DC2626',
  },
  bottomSpacing: {
    height: 32,
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
    marginBottom: 16,
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
    color: '#000000',
  },
  qrNote: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  cancelModalText: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 24,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  modalButtonDanger: {
    backgroundColor: '#DC2626',
    borderColor: '#DC2626',
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  modalButtonTextDanger: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default TicketDetailScreen;

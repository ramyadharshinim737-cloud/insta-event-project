import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../../context/ThemeContext';

export type TicketStatus = 'Active' | 'Used' | 'Cancelled';

export interface TicketListItemProps {
  title: string;
  dateTime: string;
  locationSummary: string;
  status: TicketStatus;
  onPress?: () => void;
}

const statusColors: Record<TicketStatus, string> = {
  Active: '#16a34a',
  Used: '#6b7280',
  Cancelled: '#ef4444',
};

const TicketListItem: React.FC<TicketListItemProps> = ({ title, dateTime, locationSummary, status, onPress }) => {
  const { colors } = useTheme();
  return (
    <TouchableOpacity onPress={onPress} style={[styles.container, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={{ flex: 1 }}>
        <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
        <Text style={{ color: colors.text }}>{dateTime}</Text>
        <Text style={{ color: colors.text, marginTop: 2 }}>{locationSummary}</Text>
      </View>
      <View style={[styles.badge, { backgroundColor: statusColors[status] }]}>
        <Text style={styles.badgeText}>{status}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 12, borderWidth: 1, gap: 12, marginBottom: 10 },
  title: { fontWeight: '700', fontSize: 15, marginBottom: 2 },
  badge: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 9999 },
  badgeText: { color: '#fff', fontWeight: '700', fontSize: 12 },
});

export default TicketListItem;

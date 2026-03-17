import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { useTheme } from '../../context/ThemeContext';

interface Props {
  title: string;
  dateTime: string;
  locationSummary: string;
  ticketId: string;
}

const TicketQRCard: React.FC<Props> = ({ title, dateTime, locationSummary, ticketId }) => {
  const { colors } = useTheme();

  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={{ padding: 16 }}>
        <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
        <Text style={{ color: colors.text }}>{dateTime}</Text>
        <Text style={{ color: colors.text, marginTop: 4 }}>{locationSummary}</Text>
      </View>
      <View style={[styles.qrWrap, { borderTopColor: colors.border }]}>
        <Image source={{ uri: 'https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=' + encodeURIComponent(ticketId) }} style={styles.qr} />
        <Text style={{ color: colors.text, marginTop: 8 }}>Ticket ID: {ticketId}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: { borderWidth: 1, borderRadius: 12, overflow: 'hidden' },
  title: { fontWeight: '700', fontSize: 16, marginBottom: 4 },
  qrWrap: { alignItems: 'center', padding: 16, borderTopWidth: 1 },
  qr: { width: 160, height: 160 },
});

export default TicketQRCard;

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import RSVPEventSummaryCard from '../../components/rsvp/RSVPEventSummaryCard';

interface Props { navigation?: any }

const RegistrationSuccessScreen: React.FC<Props> = ({ navigation }) => {
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.headerBar}>
        <Text style={[styles.header, { color: colors.text }]}>You're in! 🎉</Text>
        <Text onPress={() => (navigation?.goBack ? navigation.goBack() : null)} style={[styles.backLink, { color: colors.text }]}>Back</Text>
      </View>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <Text style={{ color: colors.text, marginBottom: 12 }}>Your spot has been reserved. You'll receive an email with details.</Text>
        <RSVPEventSummaryCard
          title="Tech Networking Night"
          coverImageUri="https://picsum.photos/640/360"
          dateRange="Jan 20, 6:00 PM – 9:00 PM (IST)"
          locationSummary="Offline • Indiranagar, Bengaluru"
        />
      </ScrollView>

      <View style={[styles.footer, { borderTopColor: colors.border }] }>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <TouchableOpacity onPress={() => navigation?.navigate?.('TicketDetail')} style={[styles.button, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={{ color: colors.text }}>View Ticket</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation?.navigate?.('MyTickets')} style={[styles.button, { backgroundColor: colors.primary, borderColor: colors.border }]}>
            <Text style={{ color: '#fff' }}>My Events</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerBar: { paddingHorizontal: 16, paddingTop: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  header: { fontSize: 20, fontWeight: '700', marginBottom: 8 },
  backLink: { fontSize: 14 },
  footer: { padding: 12, borderTopWidth: 1 },
  button: { paddingVertical: 12, paddingHorizontal: 16, borderRadius: 8, borderWidth: 1, flex: 1, alignItems: 'center' },
});

export default RegistrationSuccessScreen;

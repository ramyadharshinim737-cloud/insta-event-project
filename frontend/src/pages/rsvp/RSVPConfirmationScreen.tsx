import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import RSVPEventSummaryCard from '../../components/rsvp/RSVPEventSummaryCard';
import CancelConfirmationModal from '../../components/rsvp/CancelConfirmationModal';

interface Props { navigation?: any }

const RSVPConfirmationScreen: React.FC<Props> = ({ navigation }) => {
  const { colors } = useTheme();
  const [cancelOpen, setCancelOpen] = useState(false);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <Text style={[styles.header, { color: colors.text }]}>Confirm RSVP</Text>
        <RSVPEventSummaryCard
          title="Tech Networking Night"
          coverImageUri="https://picsum.photos/640/360"
          dateRange="Jan 20, 6:00 PM – 9:00 PM (IST)"
          locationSummary="Offline • Indiranagar, Bengaluru"
        />
        <Text style={{ color: colors.text, marginTop: 12 }}>You're about to reserve a spot. We'll send you a confirmation email.</Text>
      </ScrollView>

      <View style={[styles.footer, { borderTopColor: colors.border }] }>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <TouchableOpacity onPress={() => setCancelOpen(true)} style={[styles.button, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={{ color: colors.text }}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation?.navigate?.('RSVPForm')} style={[styles.button, { backgroundColor: colors.primary, borderColor: colors.border }]}>
            <Text style={{ color: '#fff' }}>Confirm RSVP</Text>
          </TouchableOpacity>
        </View>
      </View>

      <CancelConfirmationModal visible={cancelOpen} onClose={() => setCancelOpen(false)} onConfirm={() => { setCancelOpen(false); }} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { fontSize: 20, fontWeight: '700', marginBottom: 8 },
  footer: { padding: 12, borderTopWidth: 1 },
  button: { paddingVertical: 12, paddingHorizontal: 16, borderRadius: 8, borderWidth: 1, flex: 1, alignItems: 'center' },
});

export default RSVPConfirmationScreen;

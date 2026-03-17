import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import RSVPEventSummaryCard from '../../components/rsvp/RSVPEventSummaryCard';

interface Props { navigation?: any }

const RegistrationFormScreen: React.FC<Props> = ({ navigation }) => {
  const { colors } = useTheme();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [ticketType, setTicketType] = useState<'Free' | 'Paid'>('Free');

  const canSubmit = name.trim() && email.trim();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.headerBar}>
        <Text style={[styles.header, { color: colors.text }]}>Registration</Text>
        <Text onPress={() => (navigation?.goBack ? navigation.goBack() : null)} style={[styles.backLink, { color: colors.text }]}>Back</Text>
      </View>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <RSVPEventSummaryCard
          title="Tech Networking Night"
          coverImageUri="https://picsum.photos/640/360"
          dateRange="Jan 20, 6:00 PM – 9:00 PM (IST)"
          locationSummary="Offline • Indiranagar, Bengaluru"
        />

        <Text style={[styles.label, { color: colors.text }]}>Name</Text>
        <TextInput
          placeholder="Your full name"
          placeholderTextColor={colors.border}
          value={name}
          onChangeText={setName}
          style={[styles.input, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
        />

        <Text style={[styles.label, { color: colors.text }]}>Email</Text>
        <TextInput
          placeholder="you@example.com"
          placeholderTextColor={colors.border}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          style={[styles.input, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
        />

        <Text style={[styles.label, { color: colors.text }]}>Ticket type (UI only)</Text>
        <View style={{ flexDirection: 'row', marginBottom: 8 }}>
          {(['Free', 'Paid'] as const).map((tt) => (
            <TouchableOpacity
              key={tt}
              onPress={() => setTicketType(tt)}
              style={{
                paddingVertical: 8,
                paddingHorizontal: 12,
                borderRadius: 16,
                borderWidth: 1,
                borderColor: ticketType === tt ? colors.primary : colors.border,
                backgroundColor: ticketType === tt ? colors.primary : colors.card,
                marginRight: 8,
              }}
            >
              <Text style={{ color: ticketType === tt ? '#fff' : colors.text }}>{tt}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <View style={[styles.footer, { borderTopColor: colors.border }] }>
        <TouchableOpacity disabled={!canSubmit} onPress={() => navigation?.navigate?.('RSVPSuccess')} style={[styles.button, { backgroundColor: canSubmit ? colors.primary : colors.card, borderColor: colors.border }]}>
          <Text style={{ color: canSubmit ? '#fff' : colors.text }}>Submit</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerBar: { paddingHorizontal: 16, paddingTop: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  header: { fontSize: 20, fontWeight: '700', marginBottom: 8 },
  backLink: { fontSize: 14 },
  label: { fontWeight: '600', marginBottom: 6, marginTop: 12 },
  input: { borderWidth: 1, borderRadius: 8, padding: 12 },
  footer: { padding: 12, borderTopWidth: 1 },
  button: { paddingVertical: 12, paddingHorizontal: 16, borderRadius: 8, borderWidth: 1, alignItems: 'center' },
});

export default RegistrationFormScreen;

import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import AttendeeList, { Attendee } from '../../components/organizer/AttendeeList';
import RegistrationStats from '../../components/organizer/RegistrationStats';

const mockAttendees: Attendee[] = [
  { id: 'a1', name: 'Priya Sharma', email: 'priya@example.com', ticketType: 'Free', status: 'Registered' },
  { id: 'a2', name: 'Rahul Singh', email: 'rahul@example.com', ticketType: 'Paid', status: 'Registered' },
  { id: 'a3', name: 'Ananya Rao', email: 'ananya@example.com', ticketType: 'Free', status: 'Cancelled' },
];

interface Props { navigation?: any }

const AttendeesScreen: React.FC<Props> = ({ navigation }) => {
  const { colors } = useTheme();
  const [attendees] = useState<Attendee[]>(mockAttendees);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.headerBar}>
        <Text style={[styles.header, { color: colors.text }]}>Attendees</Text>
        <Text onPress={() => (navigation?.goBack ? navigation.goBack() : null)} style={[styles.backLink, { color: colors.text }]}>Back</Text>
      </View>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <View style={{ marginBottom: 12 }}>
          <RegistrationStats total={attendees.filter(a => a.status === 'Registered').length} capacity={200} />
        </View>
        <AttendeeList attendees={attendees} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerBar: { paddingHorizontal: 16, paddingTop: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  header: { fontSize: 20, fontWeight: '700', marginBottom: 8 },
  backLink: { fontSize: 14 },
});

export default AttendeesScreen;

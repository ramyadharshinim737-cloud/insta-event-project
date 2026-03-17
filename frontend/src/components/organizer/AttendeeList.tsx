import React from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView } from 'react-native';
import { useTheme } from '../../context/ThemeContext';

export interface Attendee {
  id: string;
  name: string;
  email: string;
  ticketType: 'Free' | 'Paid';
  status: 'Registered' | 'Cancelled';
}

interface Props {
  attendees: Attendee[];
}

const AttendeeList: React.FC<Props> = ({ attendees }) => {
  const { colors } = useTheme();

  return (
    <View>
      <TextInput
        placeholder="Search attendees (UI only)"
        placeholderTextColor={colors.border}
        style={{ borderWidth: 1, borderColor: colors.border, backgroundColor: colors.card, color: colors.text, borderRadius: 8, padding: 12, marginBottom: 12 }}
      />
      {attendees.length === 0 ? (
        <View style={[styles.empty, { borderColor: colors.border }]}>
          <Text style={{ color: colors.text }}>No attendees yet.</Text>
        </View>
      ) : (
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View>
            <View style={[styles.row, { backgroundColor: colors.card }]}> 
              <Text style={[styles.cellHeader, { color: colors.text }]}>Name</Text>
              <Text style={[styles.cellHeader, { color: colors.text }]}>Email</Text>
              <Text style={[styles.cellHeader, { color: colors.text }]}>Ticket</Text>
              <Text style={[styles.cellHeader, { color: colors.text }]}>Status</Text>
            </View>
            {attendees.map((a) => (
              <View key={a.id} style={[styles.row, { backgroundColor: colors.background, borderColor: colors.border }]}> 
                <Text style={[styles.cell, { color: colors.text }]}>{a.name}</Text>
                <Text style={[styles.cell, { color: colors.text }]}>{a.email}</Text>
                <Text style={[styles.cell, { color: colors.text }]}>{a.ticketType}</Text>
                <Text style={[styles.cell, { color: colors.text }]}>{a.status}</Text>
              </View>
            ))}
          </View>
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  row: { flexDirection: 'row', borderBottomWidth: 1 },
  cellHeader: { width: 140, padding: 12, fontWeight: '700' },
  cell: { width: 140, padding: 12 },
  empty: { padding: 24, borderRadius: 12, borderWidth: 1, alignItems: 'center' },
});

export default AttendeeList;

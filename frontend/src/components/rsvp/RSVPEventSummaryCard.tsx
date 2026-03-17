import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { useTheme } from '../../context/ThemeContext';

export interface RSVPEventSummaryProps {
  title: string;
  coverImageUri?: string;
  dateRange: string;
  locationSummary: string;
}

const RSVPEventSummaryCard: React.FC<RSVPEventSummaryProps> = ({ title, coverImageUri, dateRange, locationSummary }) => {
  const { colors } = useTheme();
  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
      {coverImageUri ? (
        <Image source={{ uri: coverImageUri }} style={styles.cover} />
      ) : (
        <View style={[styles.cover, { backgroundColor: colors.border }]} />
      )}
      <View style={{ padding: 12 }}>
        <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
        <Text style={{ color: colors.text }}>{dateRange}</Text>
        <Text style={{ color: colors.text, marginTop: 4 }}>{locationSummary}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: { borderWidth: 1, borderRadius: 12, overflow: 'hidden' },
  cover: { width: '100%', height: 120 },
  title: { fontWeight: '700', fontSize: 16, marginBottom: 4 },
});

export default RSVPEventSummaryCard;

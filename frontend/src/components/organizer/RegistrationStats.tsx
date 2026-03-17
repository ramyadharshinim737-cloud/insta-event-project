import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../context/ThemeContext';

interface Props {
  total: number;
  capacity: number;
}

const RegistrationStats: React.FC<Props> = ({ total, capacity }) => {
  const { colors } = useTheme();
  const pct = Math.min(100, Math.round((total / Math.max(1, capacity)) * 100));

  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <Text style={[styles.title, { color: colors.text }]}>Registrations</Text>
      <Text style={{ color: colors.text, marginBottom: 8 }}>{total} / {capacity} ({pct}%)</Text>
      <View style={[styles.bar, { backgroundColor: colors.border }]}>
        <View style={[styles.fill, { width: `${pct}%`, backgroundColor: colors.primary }]} />
      </View>
      <Text style={{ color: colors.text, marginTop: 8 }}>Remaining: {Math.max(0, capacity - total)}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  card: { borderWidth: 1, borderRadius: 12, padding: 12 },
  title: { fontWeight: '700', fontSize: 16 },
  bar: { height: 10, borderRadius: 9999, overflow: 'hidden' },
  fill: { height: 10 },
});

export default RegistrationStats;

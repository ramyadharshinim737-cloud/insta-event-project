import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../context/ThemeContext';

interface Props {
  company: string;
  role: string;
  duration: string;
  description?: string;
}

const ExperienceCard: React.FC<Props> = ({ company, role, duration, description }) => {
  const { colors } = useTheme();
  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <Text style={[styles.role, { color: colors.text }]}>{role}</Text>
      <Text style={{ color: colors.text, marginBottom: 4 }}>{company}</Text>
      <Text style={{ color: colors.text }}>{duration}</Text>
      {!!description && <Text style={{ color: colors.text, marginTop: 8 }}>{description}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  card: { borderWidth: 1, borderRadius: 12, padding: 12, marginBottom: 10 },
  role: { fontWeight: '700', fontSize: 16 },
});

export default ExperienceCard;

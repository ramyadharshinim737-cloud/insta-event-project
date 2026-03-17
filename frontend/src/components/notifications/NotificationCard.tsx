import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '../../context/ThemeContext';

type Type = 'message' | 'connection' | 'event' | 'community';

interface Props {
  type: Type;
  title: string;
  description: string;
  time: string;
  unread?: boolean;
  onPress?: () => void;
}

const typeColors: Record<Type, string> = {
  message: '#0ea5e9',
  connection: '#10b981',
  event: '#f59e0b',
  community: '#8b5cf6',
};

const NotificationCard: React.FC<Props> = ({ type, title, description, time, unread, onPress }) => {
  const { colors } = useTheme();
  return (
    <TouchableOpacity onPress={onPress} style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}> 
      <View style={[styles.dot, { backgroundColor: unread ? typeColors[type] : colors.border }]} />
      <View style={{ flex: 1 }}>
        <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>{title}</Text>
        <Text style={{ color: colors.text }} numberOfLines={2}>{description}</Text>
      </View>
      <Text style={{ color: colors.text, marginLeft: 8 }}>{time}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 12, borderRadius: 12, borderWidth: 1, marginBottom: 10 },
  dot: { width: 10, height: 10, borderRadius: 5 },
  title: { fontWeight: '700' },
});

export default NotificationCard;

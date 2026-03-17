import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '../../context/ThemeContext';

interface Props {
  name: string;
  lastMessage: string;
  time: string;
  unread?: number;
  avatar?: string;
  onPress?: () => void;
}

const ChatListItem: React.FC<Props> = ({ name, lastMessage, time, unread = 0, avatar, onPress }) => {
  const { colors } = useTheme();
  return (
    <TouchableOpacity onPress={onPress} style={[styles.row, { borderColor: colors.border }]}>
      <Image source={{ uri: avatar || 'https://i.pravatar.cc/120' }} style={styles.avatar} />
      <View style={{ flex: 1 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Text style={[styles.name, { color: colors.text }]}>{name}</Text>
          <Text style={{ color: colors.text }}>{time}</Text>
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 2 }}>
          <Text style={{ color: colors.text }} numberOfLines={1}>{lastMessage}</Text>
          {unread > 0 && (
            <View style={styles.badge}><Text style={styles.badgeText}>{unread}</Text></View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 10, paddingVertical: 10, paddingHorizontal: 12, borderBottomWidth: 1 },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#ccc' },
  name: { fontWeight: '700' },
  badge: { minWidth: 22, height: 22, borderRadius: 11, backgroundColor: '#ef4444', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 6, marginLeft: 8 },
  badgeText: { color: '#fff', fontWeight: '700', fontSize: 12 },
});

export default ChatListItem;

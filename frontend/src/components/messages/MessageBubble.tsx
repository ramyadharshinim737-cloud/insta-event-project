import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../context/ThemeContext';

interface Props {
  text: string;
  time: string;
  sent?: boolean;
}

const MessageBubble: React.FC<Props> = ({ text, time, sent }) => {
  const { colors } = useTheme();
  return (
    <View style={[styles.row, { justifyContent: sent ? 'flex-end' : 'flex-start' }]}>
      <View
        style={[
          styles.bubble,
          {
            backgroundColor: sent ? '#0A66C2' : '#FFFFFF',
          },
        ]}
      >
        <Text style={{ color: sent ? '#FFFFFF' : '#1F2937', fontSize: 15, lineHeight: 20 }}>{text}</Text>
        <Text style={[styles.time, { color: sent ? '#E0E7FF' : '#6B7280' }]}>{time}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  bubble: {
    maxWidth: '75%',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  time: {
    fontSize: 11,
    marginTop: 4,
    textAlign: 'right',
    opacity: 0.8,
  },
});

export default MessageBubble;

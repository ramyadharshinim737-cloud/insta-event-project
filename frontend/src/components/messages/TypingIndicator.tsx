import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../context/ThemeContext';

const TypingIndicator: React.FC = () => {
  const { colors } = useTheme();
  const [dots, setDots] = useState<string>('');

  useEffect(() => {
    const id = setInterval(() => {
      setDots((d) => (d.length >= 3 ? '' : d + '.'));
    }, 500);
    return () => clearInterval(id);
  }, []);

  return (
    <View style={[styles.wrap, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <Text style={{ color: colors.text }}>Typing{dots}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12, borderWidth: 1, marginBottom: 8 },
});

export default TypingIndicator;

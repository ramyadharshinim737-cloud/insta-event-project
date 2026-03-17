import React from 'react';
import { Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../../context/ThemeContext';

interface Props {
  label: string;
  endorsed?: boolean;
  onPress?: () => void;
}

const SkillTag: React.FC<Props> = ({ label, endorsed, onPress }) => {
  const { colors } = useTheme();
  return (
    <TouchableOpacity onPress={onPress} style={[styles.tag, { backgroundColor: endorsed ? colors.primary : colors.card, borderColor: colors.border }]}> 
      <Text style={{ color: endorsed ? '#fff' : colors.text, fontWeight: '600' }}>{label}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  tag: { paddingVertical: 6, paddingHorizontal: 10, borderRadius: 9999, borderWidth: 1, marginRight: 8, marginBottom: 8 },
});

export default SkillTag;

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../../context/ThemeContext';

interface Props {
  onAddGoogle?: () => void;
  onAddOutlook?: () => void;
}

const CalendarActions: React.FC<Props> = ({ onAddGoogle, onAddOutlook }) => {
  const { colors } = useTheme();

  return (
    <View style={{ flexDirection: 'row', gap: 8 }}>
      <TouchableOpacity
        onPress={onAddGoogle}
        style={[styles.btn, { backgroundColor: colors.card, borderColor: colors.border }]}
      >
        <Text style={{ color: colors.text }}>➕ Add to Google</Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={onAddOutlook}
        style={[styles.btn, { backgroundColor: colors.card, borderColor: colors.border }]}
      >
        <Text style={{ color: colors.text }}>➕ Add to Outlook</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  btn: { paddingVertical: 10, paddingHorizontal: 12, borderRadius: 8, borderWidth: 1, alignItems: 'center' },
});

export default CalendarActions;

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import { useTheme } from '../../context/ThemeContext';

interface Props {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const CancelEventModal: React.FC<Props> = ({ visible, onClose, onConfirm }) => {
  const { colors } = useTheme();
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.backdrop}>
        <View style={[styles.container, { backgroundColor: colors.background, borderColor: colors.border }]}>
          <Text style={[styles.title, { color: colors.text }]}>Cancel this event?</Text>
          <Text style={{ color: colors.text, marginBottom: 16 }}>Attendees will be notified (UI only).</Text>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <TouchableOpacity onPress={onClose} style={[styles.button, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={{ color: colors.text }}>Keep</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={onConfirm} style={[styles.button, { backgroundColor: colors.primary, borderColor: colors.border }]}>
              <Text style={{ color: '#fff' }}>Cancel Event</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', alignItems: 'center', justifyContent: 'center' },
  container: { padding: 16, borderRadius: 12, borderWidth: 1, width: '88%' },
  title: { fontWeight: '700', fontSize: 18, marginBottom: 8 },
  button: { paddingVertical: 12, paddingHorizontal: 16, borderRadius: 8, borderWidth: 1, flex: 1, alignItems: 'center' },
});

export default CancelEventModal;

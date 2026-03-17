import React, { useState } from 'react';
import { View, Image, StyleSheet, Modal, TouchableOpacity } from 'react-native';
import { useTheme } from '../../context/ThemeContext';

interface MediaItem { id: string; uri: string; type: 'image' | 'video'; }
interface Props { items: MediaItem[] }

const MediaGrid: React.FC<Props> = ({ items }) => {
  const { colors } = useTheme();
  const [preview, setPreview] = useState<MediaItem | null>(null);
  return (
    <View style={styles.grid}>
      {items.map((m) => (
        <TouchableOpacity key={m.id} onPress={() => setPreview(m)}>
          <Image source={{ uri: m.uri }} style={[styles.item, { borderColor: colors.border }]} />
        </TouchableOpacity>
      ))}

      <Modal transparent visible={!!preview} onRequestClose={() => setPreview(null)}>
        <View style={styles.backdrop}>
          <TouchableOpacity style={styles.close} onPress={() => setPreview(null)} />
          {preview && (
            <Image source={{ uri: preview.uri }} style={styles.preview} />
          )}
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  item: { width: 110, height: 110, borderRadius: 8, borderWidth: 1 },
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', alignItems: 'center', justifyContent: 'center' },
  preview: { width: '88%', height: '60%', resizeMode: 'contain' },
  close: { position: 'absolute', top: 0, bottom: 0, left: 0, right: 0 },
});

export default MediaGrid;

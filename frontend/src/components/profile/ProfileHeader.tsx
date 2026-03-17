import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '../../context/ThemeContext';

interface Props {
  name: string;
  headline: string;
  location?: string;
  photoUrl?: string;
  relation?: 'Connect' | 'Requested' | 'Connected' | 'Follow';
  onActionPress?: () => void;
}

const ProfileHeader: React.FC<Props> = ({ name, headline, location, photoUrl, relation = 'Connect', onActionPress }) => {
  const { colors } = useTheme();

  const btnLabel = relation;
  const disabled = relation === 'Requested' || relation === 'Connected';

  return (
    <View style={[styles.container, { backgroundColor: colors.card, borderColor: colors.border }]}>
      {photoUrl ? (
        <Image source={{ uri: photoUrl }} style={styles.avatar} />
      ) : (
        <View style={[styles.avatar, { backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center' }]}>
          <Text style={{ color: '#fff', fontSize: 24, fontWeight: 'bold' }}>
            {name?.charAt(0).toUpperCase() || 'U'}
          </Text>
        </View>
      )}
      <View style={{ flex: 1 }}>
        <Text style={[styles.name, { color: colors.text }]}>{name}</Text>
        <Text style={{ color: colors.text }}>{headline}</Text>
        {!!location && <Text style={{ color: colors.text, marginTop: 4 }}>{location}</Text>}
      </View>
      <TouchableOpacity disabled={disabled} onPress={onActionPress} style={[styles.btn, { backgroundColor: disabled ? colors.card : colors.primary, borderColor: colors.border }]}>
        <Text style={{ color: disabled ? colors.text : '#fff', fontWeight: '600' }}>{btnLabel}</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, borderRadius: 12, borderWidth: 1 },
  avatar: { width: 64, height: 64, borderRadius: 32, marginRight: 12, backgroundColor: '#ccc' },
  name: { fontSize: 18, fontWeight: '700' },
  btn: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8, borderWidth: 1 },
});

export default ProfileHeader;

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface FilterChipProps {
  label: string;
  isActive: boolean;
  onPress: () => void;
  icon?: string;
}

const FilterChip: React.FC<FilterChipProps> = ({ label, isActive, onPress, icon }) => {
  return (
    <TouchableOpacity
      style={[styles.chip, isActive && styles.activeChip]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {icon && (
        <Ionicons
          name={icon as any}
          size={16}
          color={isActive ? '#fff' : '#262626'}
          style={styles.icon}
        />
      )}
      <Text style={[styles.label, isActive && styles.activeLabel]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  activeChip: {
    backgroundColor: '#0a66c2',
    borderColor: '#0a66c2',
  },
  icon: {
    marginRight: 4,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#262626',
  },
  activeLabel: {
    color: '#fff',
  },
});

export default FilterChip;

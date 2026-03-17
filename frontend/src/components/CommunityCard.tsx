// CommunityCard Component - Displays community information

import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Community } from '../types/network.types';

interface CommunityCardProps {
  community: Community;
  onJoin: (communityId: string) => Promise<any>;
  onLeave: (communityId: string) => Promise<any>;
}

export const CommunityCard: React.FC<CommunityCardProps> = ({
  community,
  onJoin,
  onLeave,
}) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleAction = async () => {
    setIsLoading(true);
    try {
      if (community.isJoined) {
        await onLeave(community.id);
      } else {
        await onJoin(community.id);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* Community Icon */}
        <View style={styles.icon}>
          <Ionicons name="people" size={28} color="#7c3aed" />
        </View>

        {/* Community Info */}
        <View style={styles.info}>
          <Text style={styles.name}>{community.name}</Text>
          <Text style={styles.category}>{community.category}</Text>
          <View style={styles.memberRow}>
            <Ionicons name="people-outline" size={14} color="#6b7280" />
            <Text style={styles.memberCount}>
              {community.memberCount.toLocaleString()} members
            </Text>
          </View>
          {community.description && (
            <Text style={styles.description} numberOfLines={2}>
              {community.description}
            </Text>
          )}
        </View>

        {/* Join/Leave Button */}
        <TouchableOpacity
          onPress={handleAction}
          disabled={isLoading}
          style={[styles.button, community.isJoined ? styles.joinedButton : styles.joinButton]}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color={community.isJoined ? '#374151' : '#fff'} />
          ) : (
            <Text style={[styles.buttonText, community.isJoined ? styles.joinedButtonText : styles.joinButtonText]}>
              {community.isJoined ? 'Joined' : 'Join'}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  icon: {
    width: 56,
    height: 56,
    borderRadius: 8,
    backgroundColor: '#f3e8ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  category: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 2,
  },
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  memberCount: {
    fontSize: 12,
    color: '#6b7280',
    marginLeft: 4,
  },
  description: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 8,
  },
  button: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  joinButton: {
    backgroundColor: '#7c3aed',
  },
  joinedButton: {
    backgroundColor: '#e5e7eb',
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  joinButtonText: {
    color: '#fff',
  },
  joinedButtonText: {
    color: '#374151',
  },
});

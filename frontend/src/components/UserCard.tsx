// UserCard Component - Displays user information with connection button

import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, StyleSheet, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NetworkUser } from '../types/network.types';

interface UserCardProps {
  user: NetworkUser;
  onConnect: (userId: string) => Promise<void>;
  onViewProfile: (user: NetworkUser) => void;
}

export const UserCard: React.FC<UserCardProps> = ({ user, onConnect, onViewProfile }) => {
  const [isConnecting, setIsConnecting] = useState(false);

  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      await onConnect(user.id);
    } finally {
      setIsConnecting(false);
    }
  };

  const getConnectionButton = () => {
    if (user.connectionStatus === 'connected') {
      return (
        <View style={styles.connectedButton}>
          <Text style={styles.connectedButtonText}>Connected</Text>
        </View>
      );
    }

    if (user.connectionStatus === 'requested') {
      return (
        <View style={styles.pendingButton}>
          <Text style={styles.pendingButtonText}>Pending</Text>
        </View>
      );
    }

    return (
      <TouchableOpacity
        onPress={handleConnect}
        disabled={isConnecting}
        style={styles.connectButton}
      >
        {isConnecting ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <Text style={styles.connectButtonText}>Connect</Text>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <TouchableOpacity
      onPress={() => onViewProfile(user)}
      style={styles.container}
    >
      <View style={styles.content}>
        {/* Avatar */}
        <View style={styles.avatar}>
          {user.avatarUrl ? (
            <Image 
              source={{ uri: user.avatarUrl }} 
              style={styles.profileImage}
            />
          ) : (
            <Ionicons name="person" size={28} color="#0a66c2" />
          )}
        </View>

        {/* User Info */}
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{user.name}</Text>
          <Text style={styles.userRole}>{user.role}</Text>
          <Text style={styles.userOrg}>{user.organization}</Text>
          
          {/* Skills */}
          {user.skills.length > 0 && (
            <View style={styles.skillsContainer}>
              {user.skills.slice(0, 3).map((skill, index) => (
                <View key={index} style={styles.skillTag}>
                  <Text style={styles.skillText}>{skill}</Text>
                </View>
              ))}
              {user.skills.length > 3 && (
                <View style={styles.moreSkills}>
                  <Text style={styles.moreSkillsText}>+{user.skills.length - 3}</Text>
                </View>
              )}
            </View>
          )}
        </View>

        {/* Connection Button */}
        <View style={styles.buttonContainer}>
          {getConnectionButton()}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    padding: 14,
    marginBottom: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#dbeafe',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    overflow: 'hidden',
  },
  profileImage: {
    width: 52,
    height: 52,
    borderRadius: 26,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
  },
  userRole: {
    fontSize: 13,
    color: '#6b7280',
    marginTop: 1,
  },
  userOrg: {
    fontSize: 14,
    color: '#9ca3af',
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
    gap: 4,
  },
  skillTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: '#f3f4f6',
    borderRadius: 4,
  },
  skillText: {
    fontSize: 12,
    color: '#374151',
  },
  moreSkills: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  moreSkillsText: {
    fontSize: 12,
    color: '#6b7280',
  },
  buttonContainer: {
    marginLeft: 8,
  },
  connectedButton: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    backgroundColor: '#e5e7eb',
    borderRadius: 20,
  },
  connectedButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  pendingButton: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    backgroundColor: '#dbeafe',
    borderRadius: 20,
  },
  pendingButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2563eb',
  },
  connectButton: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    backgroundColor: '#2563eb',
    borderRadius: 20,
  },
  connectButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
});

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NetworkUser, NetworkStats } from '../../types/network.types';
import { useNetwork } from '../../hooks/useNetwork';

interface UserProfileDetailScreenProps {
  route: {
    params: {
      user: NetworkUser;
    };
  };
  navigation: any;
}

export const UserProfileDetailScreen: React.FC<UserProfileDetailScreenProps> = ({
  route,
  navigation,
}) => {
  const { user } = route.params;
  const {
    followUser,
    unfollowUser,
    sendConnectionRequest,
    getUserStats,
    removeConnection,
    blockUser,
  } = useNetwork();

  const [profileUser, setProfileUser] = useState<NetworkUser>(user);
  const [stats, setStats] = useState<NetworkStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(false);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const loadStats = async () => {
      try {
        setLoadingStats(true);
        const result = await getUserStats(profileUser.id);
        if (isMounted && result) {
          setStats(result);
        }
      } finally {
        if (isMounted) {
          setLoadingStats(false);
        }
      }
    };

    loadStats();
    return () => {
      isMounted = false;
    };
  }, [getUserStats, profileUser.id]);

  const handleConnectPress = async () => {
    if (profileUser.connectionStatus === 'connected' || profileUser.connectionStatus === 'requested') {
      return;
    }
    try {
      setUpdating(true);
      const result = await sendConnectionRequest(profileUser.id);
      if (result?.success) {
        setProfileUser(prev => ({ ...prev, connectionStatus: 'requested' }));
      }
    } finally {
      setUpdating(false);
    }
  };

  const handleFollowPress = async () => {
    try {
      setUpdating(true);
      const currentStatus = profileUser.followStatus || 'not_following';
      if (currentStatus === 'following' || currentStatus === 'mutual') {
        await unfollowUser(profileUser.id);
        setProfileUser(prev => ({
          ...prev,
          followStatus: currentStatus === 'mutual' ? 'followed_by' : 'not_following',
        }));
      } else {
        await followUser(profileUser.id);
        setProfileUser(prev => ({
          ...prev,
          followStatus: currentStatus === 'followed_by' ? 'mutual' : 'following',
        }));
      }
    } finally {
      setUpdating(false);
    }
  };

  const handleRemoveConnection = () => {
    if (profileUser.connectionStatus !== 'connected') return;
    Alert.alert(
      'Remove connection',
      `Are you sure you want to remove your connection with ${profileUser.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              setUpdating(true);
              const response = await removeConnection(profileUser.id);
              if (response?.success) {
                setProfileUser(prev => ({ ...prev, connectionStatus: 'none' }));
              }
            } finally {
              setUpdating(false);
            }
          },
        },
      ],
    );
  };

  const handleBlockUser = () => {
    Alert.alert(
      'Block user',
      `You will no longer see updates from ${profileUser.name}, and they will not be able to interact with you.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Block',
          style: 'destructive',
          onPress: async () => {
            try {
              setUpdating(true);
              const response = await blockUser(profileUser.id);
              if (response?.success) {
                navigation.goBack();
              }
            } finally {
              setUpdating(false);
            }
          },
        },
      ],
    );
  };

  const handleMorePress = () => {
    const isConnected = profileUser.connectionStatus === 'connected';
    const buttons: { text: string; onPress?: () => void; style?: 'default' | 'cancel' | 'destructive' }[] = [];
    if (isConnected) {
      buttons.push({ text: 'Remove connection', onPress: handleRemoveConnection });
    }
    buttons.push({ text: 'Block user', style: 'destructive', onPress: handleBlockUser });
    buttons.push({ text: 'Cancel', style: 'cancel' });

    Alert.alert('More options', '', buttons);
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="arrow-back" size={24} color="#111827" />
      </TouchableOpacity>
      <TouchableOpacity style={styles.moreButton} onPress={handleMorePress}>
        <Ionicons name="ellipsis-horizontal" size={24} color="#111827" />
      </TouchableOpacity>
    </View>
  );

  const renderProfileHeader = () => (
    <View style={styles.profileHeader}>
      <View style={styles.avatarContainer}>
        {profileUser.avatarUrl ? (
          <Image source={{ uri: profileUser.avatarUrl }} style={styles.avatar} />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Ionicons name="person" size={48} color="#fff" />
          </View>
        )}
      </View>
      <Text style={styles.name}>{profileUser.name}</Text>
      <Text style={styles.role}>{profileUser.role}</Text>
      <Text style={styles.organization}>{profileUser.organization}</Text>
      {profileUser.location && (
        <View style={styles.locationContainer}>
          <Ionicons name="location-outline" size={16} color="#6b7280" />
          <Text style={styles.location}>{profileUser.location}</Text>
        </View>
      )}
    </View>
  );

  const renderConnectionStatus = () => {
    let statusText = '';
    let statusColor = '#6b7280';
    let statusBg = '#f3f4f6';

    switch (profileUser.connectionStatus) {
      case 'connected':
        statusText = 'Connected';
        statusColor = '#059669';
        statusBg = '#d1fae5';
        break;
      case 'requested':
        statusText = 'Request Sent';
        statusColor = '#d97706';
        statusBg = '#fef3c7';
        break;
      case 'pending':
        statusText = 'Pending Your Response';
        statusColor = '#d97706';
        statusBg = '#fef3c7';
        break;
      default:
        return null;
    }

    return (
      <View style={[styles.statusBadge, { backgroundColor: statusBg }]}>
        <Text style={[styles.statusText, { color: statusColor }]}>
          {statusText}
        </Text>
      </View>
    );
  };

  const renderStats = () => (
    <View style={styles.statsContainer}>
      <View style={styles.statItem}>
        <Text style={styles.statValue}>234</Text>
        <Text style={styles.statLabel}>Connections</Text>
      </View>
      <View style={styles.statDivider} />
      <View style={styles.statItem}>
        <Text style={styles.statValue}>567</Text>
        <Text style={styles.statLabel}>Followers</Text>
      </View>
      <View style={styles.statDivider} />
      <View style={styles.statItem}>
        <Text style={styles.statValue}>123</Text>
        <Text style={styles.statLabel}>Following</Text>
      </View>
    </View>
  );

  const renderActionButtons = () => (
    <View style={styles.actionButtons}>
      {profileUser.connectionStatus === 'connected' ? (
        <>
          <TouchableOpacity style={styles.primaryButton} disabled={updating}>
            <Ionicons name="chatbubble-outline" size={20} color="#fff" />
            <Text style={styles.primaryButtonText}>Message</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.secondaryButton} disabled={updating}>
            <Ionicons name="call-outline" size={20} color="#0A66C2" />
          </TouchableOpacity>
        </>
      ) : profileUser.connectionStatus === 'pending' || profileUser.connectionStatus === 'requested' ? (
        <TouchableOpacity style={styles.disabledButton} disabled>
          <Text style={styles.disabledButtonText}>Request Pending</Text>
        </TouchableOpacity>
      ) : (
        <>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={handleConnectPress}
            disabled={updating}
          >
            <Ionicons name="person-add-outline" size={20} color="#fff" />
            <Text style={styles.primaryButtonText}>Connect</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={handleFollowPress}
            disabled={updating}
          >
            <Ionicons name="add-outline" size={20} color="#0A66C2" />
            <Text style={styles.secondaryButtonText}>
              {profileUser.followStatus === 'mutual'
                ? 'Mutual'
                : profileUser.followStatus === 'following'
                ? 'Following'
                : profileUser.followStatus === 'followed_by'
                ? 'Follow back'
                : 'Follow'}
            </Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );

  const renderAbout = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>About</Text>
      {user.bio ? (
        <Text style={styles.bioText}>{user.bio}</Text>
      ) : (
        <Text style={styles.emptyText}>No bio available</Text>
      )}
    </View>
  );

  const renderSkills = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Skills</Text>
      <View style={styles.skillsContainer}>
        {user.skills.map((skill, index) => (
          <View key={index} style={styles.skillChip}>
            <Text style={styles.skillText}>{skill}</Text>
          </View>
        ))}
      </View>
    </View>
  );

  const renderActivity = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Activity</Text>
      </View>
      <Text style={styles.emptyText}>No recent public activity</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {renderHeader()}
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {renderProfileHeader()}
        {renderConnectionStatus()}
        {renderStats()}
        {renderActionButtons()}
        {renderAbout()}
        {renderSkills()}
        {renderActivity()}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 48,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  backButton: {
    padding: 8,
  },
  moreButton: {
    padding: 8,
  },
  scrollView: {
    flex: 1,
  },
  profileHeader: {
    alignItems: 'center',
    paddingTop: 24,
    paddingHorizontal: 20,
  },
  avatarContainer: {
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#0A66C2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  name: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  role: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 2,
    textTransform: 'capitalize',
  },
  organization: {
    fontSize: 14,
    color: '#9ca3af',
    marginBottom: 8,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  location: {
    fontSize: 14,
    color: '#6b7280',
    marginLeft: 4,
  },
  statusBadge: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    marginTop: 12,
    alignSelf: 'center',
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 20,
    marginTop: 20,
    marginHorizontal: 20,
    backgroundColor: '#f9fafb',
    borderRadius: 12,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
  },
  statDivider: {
    width: 1,
    backgroundColor: '#e5e7eb',
  },
  actionButtons: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginTop: 20,
    gap: 12,
  },
  primaryButton: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#0A66C2',
    paddingVertical: 12,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#0A66C2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#0A66C2',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
  disabledButton: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    paddingVertical: 12,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabledButtonText: {
    color: '#9ca3af',
    fontSize: 16,
    fontWeight: '600',
  },
  section: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
  },
  seeAllText: {
    fontSize: 14,
    color: '#0A66C2',
    fontWeight: '600',
  },
  bioText: {
    fontSize: 15,
    color: '#374151',
    lineHeight: 22,
  },
  emptyText: {
    fontSize: 14,
    color: '#9ca3af',
    fontStyle: 'italic',
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  skillChip: {
    backgroundColor: '#eff6ff',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#bfdbfe',
  },
  skillText: {
    fontSize: 14,
    color: '#1e40af',
    fontWeight: '500',
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  activityContent: {
    marginLeft: 12,
    flex: 1,
  },
  activityTitle: {
    fontSize: 15,
    color: '#111827',
    marginBottom: 2,
  },
  activityTime: {
    fontSize: 13,
    color: '#9ca3af',
  },
});

import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { useNetwork } from '../../hooks/useNetwork';

interface CommunityDetailScreenProps {
  navigation?: any;
  route?: { params?: { community: any } };
}

const CommunityDetailScreen: React.FC<CommunityDetailScreenProps> = ({ navigation, route }) => {
  const { colors } = useTheme();
  const { joinCommunity, leaveCommunity } = useNetwork();
  const community = route?.params?.community;

  const [isJoined, setIsJoined] = useState<boolean>(!!community?.isJoined);
  const [memberCount, setMemberCount] = useState<number>(community?.memberCount || 0);
  const [updating, setUpdating] = useState(false);

  if (!community) {
    return null;
  }

  const handleToggleJoin = async () => {
    try {
      setUpdating(true);
      if (isJoined) {
        await leaveCommunity(community.id);
        setIsJoined(false);
        setMemberCount(prev => Math.max(0, prev - 1));
      } else {
        await joinCommunity(community.id);
        setIsJoined(true);
        setMemberCount(prev => prev + 1);
      }
    } finally {
      setUpdating(false);
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]} edges={['top', 'left', 'right']}>
      <View style={styles.headerBar}>
        <TouchableOpacity
          onPress={() => navigation?.goBack?.()}
          style={styles.backButton}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </TouchableOpacity>

        <Text style={[styles.headerTitle, { color: colors.text }]} numberOfLines={1}>
          {community.name}
        </Text>

        <View style={styles.headerRightSpacer} />
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}> 
          <Text style={[styles.communityName, { color: colors.text }]}>{community.name}</Text>
          {!!community.category && (
            <Text style={[styles.category, { color: colors.textSecondary }]}>{community.category}</Text>
          )}
          <Text style={[styles.members, { color: colors.textSecondary }]}>
            {memberCount} members
          </Text>
        </View>

        <View style={[styles.section, { backgroundColor: colors.surface }]}> 
          <Text style={[styles.sectionTitle, { color: colors.text }]}>About</Text>
          <Text style={[styles.sectionBody, { color: colors.textSecondary }]}>
            {community.description || 'No description provided for this community yet.'}
          </Text>
        </View>

        <View style={styles.joinContainer}>
          <TouchableOpacity
            style={[styles.joinButton, { backgroundColor: isJoined ? '#e5e7eb' : colors.primary }]}
            onPress={handleToggleJoin}
            disabled={updating}
          >
            <Text style={[styles.joinButtonText, { color: isJoined ? colors.text : '#ffffff' }]}>
              {isJoined ? 'Leave community' : 'Join community'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  backButton: {
    padding: 4,
    marginRight: 8,
  },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: '700',
  },
  headerRightSpacer: {
    width: 26,
  },
  content: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 24,
  },
  card: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
  },
  communityName: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  category: {
    fontSize: 14,
    marginBottom: 4,
    textTransform: 'capitalize',
  },
  members: {
    fontSize: 14,
  },
  section: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  sectionBody: {
    fontSize: 14,
    lineHeight: 20,
  },
  joinContainer: {
    marginTop: 24,
  },
  joinButton: {
    paddingVertical: 12,
    borderRadius: 24,
    alignItems: 'center',
  },
  joinButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default CommunityDetailScreen;

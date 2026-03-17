import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { useNetwork } from '../../hooks/useNetwork';
import { UserCard } from '../../components/UserCard';
import { NetworkUser } from '../../types/network.types';

interface Props { navigation?: any; route?: { params?: { initialTab?: 'followers' | 'following' | 'connections' } } }

type Tab = 'followers' | 'following' | 'connections';

const ConnectionsScreen: React.FC<Props> = ({ navigation, route }) => {
  const { colors } = useTheme();
  const {
    followers,
    following,
    connections,
  } = useNetwork();

  const initialTab: Tab = route?.params?.initialTab || 'connections';
  const [activeTab, setActiveTab] = useState<Tab>(initialTab);

  const dataForTab = useMemo<NetworkUser[]>(() => {
    switch (activeTab) {
      case 'followers':
        return followers;
      case 'following':
        return following;
      case 'connections':
      default:
        return connections;
    }
  }, [activeTab, followers, following, connections]);

  const titleForTab = (tab: Tab) => {
    if (tab === 'followers') return 'Followers';
    if (tab === 'following') return 'Following';
    return 'Connections';
  };

  const handleViewProfile = (user: NetworkUser) => {
    navigation?.navigate?.('UserProfileDetail', { user });
  };

  const handleConnect = async () => {
    // Actual connect/follow logic is handled via other screens (NetworkScreen, profile, etc.)
    return;
  };

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: colors.background }]}
      edges={['top', 'left', 'right']}
    >
      <View style={styles.headerBar}>
        <TouchableOpacity
          onPress={() => navigation?.goBack?.()}
          style={styles.backButton}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </TouchableOpacity>

        <Text style={[styles.headerTitle, { color: colors.text }]}>
          {titleForTab(activeTab)}
        </Text>

        {/* spacer to balance the back button for centered title */}
        <View style={styles.headerRightSpacer} />
      </View>

      <View style={styles.tabsRow}>
        {(['followers', 'following', 'connections'] as Tab[]).map(tab => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.activeTab]}
            onPress={() => setActiveTab(tab)}
          >
            <Text
              style={[styles.tabText, activeTab === tab && styles.activeTabText]}
            >
              {titleForTab(tab)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView
        style={styles.list}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      >
        {dataForTab.length === 0 ? (
          <Text style={{ color: colors.text }}>
            {`No ${titleForTab(activeTab).toLowerCase()} yet.`}
          </Text>
        ) : (
          dataForTab.map(u => (
            <UserCard
              key={u.id}
              user={u}
              onConnect={handleConnect}
              onViewProfile={handleViewProfile}
            />
          ))
        )}
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
  tabsRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 8,
    backgroundColor: '#ffffff',
    gap: 8,
  },
  tab: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  activeTab: {
    backgroundColor: '#0A66C2',
    borderColor: '#0A66C2',
  },
  tabText: {
    fontSize: 14,
    color: '#4b5563',
  },
  activeTabText: {
    color: '#fff',
    fontWeight: '600',
  },
  list: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 24,
  },
});

export default ConnectionsScreen;

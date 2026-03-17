import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import UserCard from '../../components/network/UserCard';
import BottomNavigation from '../../components/BottomNavigation';

interface Props { navigation?: any }

const NetworkScreen: React.FC<Props> = ({ navigation }) => {
  const { colors } = useTheme();
  const [activeTab, setActiveTab] = useState<'suggestions' | 'connections'>('suggestions');
  
  // Mock stats - replace with real data from API
  const connectionStats = {
    connections: 145,
    followers: 892,
    following: 234,
  };

  const users = [
    { id: 'u1', name: 'Priya Sharma', headline: 'Product Manager @ Acme', mutualConnections: 12, isOnline: true },
    { id: 'u2', name: 'Rahul Singh', headline: 'Backend Engineer @ FooCorp', mutualConnections: 8, isOnline: false },
    { id: 'u3', name: 'Ananya Rao', headline: 'Designer @ BarStudio', mutualConnections: 5, isOnline: true },
    { id: 'u4', name: 'Vikram Patel', headline: 'Data Scientist @ TechCo', mutualConnections: 15, isOnline: false },
    { id: 'u5', name: 'Sneha Reddy', headline: 'Marketing Lead @ StartupX', mutualConnections: 3, isOnline: true },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right', 'bottom']}>
      <StatusBar barStyle="light-content" backgroundColor="#0A66C2" translucent={false} />

      {/* Enhanced Header with Gradient */}
      <LinearGradient
        colors={['#0A66C2', '#378FE9']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.headerGradient}
      >
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Ionicons name="people-circle" size={32} color="#FFFFFF" />
            <Text style={styles.headerTitle} numberOfLines={1}>My Network</Text>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity style={styles.iconButton} activeOpacity={0.7}>
              <Ionicons name="search" size={24} color="#FFFFFF" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton} activeOpacity={0.7}>
              <Ionicons name="options" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'suggestions' && styles.activeTab]}
          onPress={() => setActiveTab('suggestions')}
          activeOpacity={0.7}
        >
          <Text style={[styles.tabText, activeTab === 'suggestions' && styles.activeTabText]}>
            Suggestions
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'connections' && styles.activeTab]}
          onPress={() => setActiveTab('connections')}
          activeOpacity={0.7}
        >
          <Text style={[styles.tabText, activeTab === 'connections' && styles.activeTabText]}>
            Connections
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Connection Stats */}
        <View style={styles.statsCard}>
          <TouchableOpacity style={styles.statItem} activeOpacity={0.7}>
            <Text style={styles.statNumber}>{connectionStats.connections}</Text>
            <Text style={styles.statLabel}>Connections</Text>
          </TouchableOpacity>
          
          <View style={styles.statDivider} />
          
          <TouchableOpacity style={styles.statItem} activeOpacity={0.7}>
            <Text style={styles.statNumber}>{connectionStats.followers}</Text>
            <Text style={styles.statLabel}>Followers</Text>
          </TouchableOpacity>
          
          <View style={styles.statDivider} />
          
          <TouchableOpacity style={styles.statItem} activeOpacity={0.7}>
            <Text style={styles.statNumber}>{connectionStats.following}</Text>
            <Text style={styles.statLabel}>Following</Text>
          </TouchableOpacity>
        </View>

        {activeTab === 'suggestions' ? (
          <>
            {/* Info Card */}
            <View style={styles.infoCard}>
              <View style={styles.infoIconContainer}>
                <Ionicons name="people" size={24} color="#0A66C2" />
              </View>
              <View style={styles.infoTextContainer}>
                <Text style={styles.infoTitle}>Grow your network</Text>
                <Text style={styles.infoSubtitle}>
                  Connect with people to expand your professional circle
                </Text>
              </View>
            </View>

            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                People you may know
              </Text>
              <Text style={[styles.sectionSubtitle, { color: colors.textSecondary }]}>
                {users.length} suggestions based on your profile
              </Text>
            </View>

            {users.map(u => (
              <UserCard 
                key={u.id} 
                name={u.name} 
                headline={u.headline} 
                userId={u.id}
                navigation={navigation}
                mutualConnections={u.mutualConnections}
                isOnline={u.isOnline}
              />
            ))}
          </>
        ) : (
          <View style={styles.emptyState}>
            <View style={styles.emptyIconContainer}>
              <Ionicons name="people-outline" size={64} color="#CBD5E1" />
            </View>
            <Text style={styles.emptyTitle}>No connections yet</Text>
            <Text style={styles.emptySubtitle}>
              Start connecting with people to build your network
            </Text>
          </View>
        )}

        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* Bottom Navigation */}
      <BottomNavigation activeTab="Network" navigation={navigation} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F6F8',
  },
  headerGradient: {
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.12,
        shadowRadius: 6,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  iconButton: {
    padding: 6,
    marginLeft: 8,
    borderRadius: 20,
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  tab: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#0A66C2',
  },
  tabText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#666666',
  },
  activeTabText: {
    color: '#0A66C2',
    fontWeight: '700',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 0,
    paddingBottom: 16,
  },
  statsCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 12,
    paddingVertical: 18,
    paddingHorizontal: 8,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'space-around',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 4,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 13,
    color: '#666666',
    fontWeight: '500',
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#E5E7EB',
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 4,
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  infoIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E8F4FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  infoTextContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  infoSubtitle: {
    fontSize: 13,
    color: '#666666',
    lineHeight: 18,
  },
  section: {
    paddingHorizontal: 16,
    marginBottom: 14,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 5,
    letterSpacing: 0.2,
  },
  sectionSubtitle: {
    fontSize: 13,
    lineHeight: 18,
    opacity: 0.75,
  },
  bottomPadding: {
    height: 100,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    paddingHorizontal: 40,
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 15,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 22,
  },
});

export default NetworkScreen;


// NetworkScreen - Main networking interface

import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  StyleSheet,
  Platform,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNetwork } from '../hooks/useNetwork';
import { useMessages } from '../context/MessageContext';
import { UserCard } from '../components/UserCard';
import { CommunityCard } from '../components/CommunityCard';
import { JobCard } from '../components/JobCard';
import { NetworkUser, SearchFilters } from '../types/network.types';
import { jobsApi, Job } from '../services/jobs.api';
import BottomNavigation from '../components/BottomNavigation';
import CreateContentModal from '../components/CreateContentModal';

type TabType = 'suggestions' | 'requests' | 'jobs' | 'communities';

interface NetworkScreenProps {
  navigation?: any;
}

export const NetworkScreen: React.FC<NetworkScreenProps> = ({ navigation }) => {
  const {
    suggestions,
    searchResults,
    communities,
    requests,
    stats,
    loading,
    error,
    searchUsers,
    sendConnectionRequest,
    acceptRequest,
    rejectRequest,
    joinCommunity,
    leaveCommunity,
    loadCommunities,
    checkMessagingPermission,
    connections,
  } = useNetwork();

  const { openConversationWithUser } = useMessages();

  const [activeTab, setActiveTab] = useState<TabType>('suggestions');
  const [communityTab, setCommunityTab] = useState<'explore' | 'my'>('explore');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({});
  const [showFirstVisitBanner, setShowFirstVisitBanner] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [savedJobs, setSavedJobs] = useState<string[]>([]);
  const [jobsLoading, setJobsLoading] = useState(false);
  const [jobsError, setJobsError] = useState<string | null>(null);

  // Load jobs from API
  const loadJobs = async () => {
    setJobsLoading(true);
    setJobsError(null);
    try {
      const result = await jobsApi.getJobs(1, 20);
      setJobs(result.jobs);
    } catch (error: any) {
      console.error('Failed to load jobs:', error);
      setJobsError(error.message || 'Failed to load jobs');
    } finally {
      setJobsLoading(false);
    }
  };

  // Load jobs when jobs tab is active
  React.useEffect(() => {
    if (activeTab === 'jobs' && jobs.length === 0 && !jobsLoading) {
      loadJobs();
    }
  }, [activeTab]);

  // Load communities when communities tab is active
  React.useEffect(() => {
    if (activeTab === 'communities') {
      loadCommunities();
    }
  }, [activeTab]);

  const handleSearch = () => {
    if (searchQuery.trim()) {
      searchUsers(searchQuery, filters);
    }
  };

  const handleConnect = async (userId: string) => {
    try {
      await sendConnectionRequest(userId);
      Alert.alert('Success', 'Connection request sent!');
    } catch (err) {
      Alert.alert('Error', 'Failed to send connection request');
    }
  };

  const handleViewProfile = (user: NetworkUser) => {
    navigation?.navigate('UserProfile', { userId: user.id, user });
  };

  const handleApplyJob = async (jobId: string) => {
    try {
      await jobsApi.applyForJob(jobId);
      Alert.alert(
        'Success',
        'Your application has been submitted successfully!',
        [{ text: 'OK' }]
      );
    } catch (error: any) {
      Alert.alert(
        'Error',
        error.message || 'Failed to submit application',
        [{ text: 'OK' }]
      );
    }
  };

  const handleSaveJob = (jobId: string) => {
    if (savedJobs.includes(jobId)) {
      setSavedJobs(savedJobs.filter(id => id !== jobId));
      Alert.alert('Job Removed', 'Job removed from saved jobs');
    } else {
      setSavedJobs([...savedJobs, jobId]);
      Alert.alert('Job Saved', 'Job added to saved jobs');
    }
  };

  const handleJobPress = (job: Job) => {
    navigation?.navigate('JobDetail', { job });
  };

  const handleMessage = async (userId: string, name: string) => {
    try {
      const conversationId = await openConversationWithUser(userId, name);
      if (navigation) {
        navigation.navigate('Chat', { conversationId });
      }
    } catch (err) {
      Alert.alert('Error', 'Failed to open chat');
    }
  };

  const handleAcceptRequest = async (requestId: string) => {
    try {
      await acceptRequest(requestId);
      Alert.alert('Success', 'Connection request accepted!');
    } catch (err) {
      Alert.alert('Error', 'Failed to accept request');
    }
  };

  const handleRejectRequest = async (requestId: string) => {
    try {
      await rejectRequest(requestId);
      Alert.alert('Success', 'Connection request rejected');
    } catch (err) {
      Alert.alert('Error', 'Failed to reject request');
    }
  };

  const handleCreatePress = () => {
    setShowCreateModal(true);
  };

  const handleCreateStory = () => {
    if (navigation) {
      navigation.navigate('CreateStory');
    }
  };

  const handleCreatePost = () => {
    if (navigation) {
      navigation.navigate('CreateArticle');
    }
  };

  const handleCreateEvent = () => {
    if (navigation) {
      navigation.navigate('CreateEvent');
    }
  };

  const handleCreateReel = () => {
    if (navigation) {
      navigation.navigate('CreateReel');
    }
  };

  const renderTabContent = () => {
    if (loading && !suggestions.length) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0a66c2" />
        </View>
      );
    }

    switch (activeTab) {
      case 'suggestions':
        return (
          <View>
            {suggestions.map(user => (
              <UserCard
                key={user.id}
                user={user}
                onConnect={handleConnect}
                onViewProfile={handleViewProfile}
              />
            ))}
            {suggestions.length === 0 && (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No suggestions available</Text>
              </View>
            )}
          </View>
        );

      case 'requests':
        return (
          <View>
            {requests.map(request => (
              <View key={request.id} style={styles.requestCard}>
                <UserCard
                  user={request.user}
                  onConnect={handleConnect}
                  onViewProfile={handleViewProfile}
                />
                {request.message && (
                  <Text style={styles.requestMessage}>"{request.message}"</Text>
                )}
                <View style={styles.requestActions}>
                  <TouchableOpacity
                    onPress={() => handleAcceptRequest(request.id)}
                    style={[styles.requestButton, styles.acceptButton]}
                  >
                    <Text style={styles.acceptButtonText}>Accept</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => handleRejectRequest(request.id)}
                    style={[styles.requestButton, styles.rejectButton]}
                  >
                    <Text style={styles.rejectButtonText}>Reject</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
            {requests.length === 0 && (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No pending requests</Text>
              </View>
            )}
          </View>
        );

      case 'jobs':
        return (
          <View>
            {jobs.length > 0 ? (
              jobs.map(job => (
                <JobCard
                  key={(job as any)._id || job.id}
                  job={job}
                  onApply={handleApplyJob}
                  onPress={handleJobPress}
                />
              ))
            ) : (
              <View style={styles.emptyContainer}>
                <Ionicons name="briefcase-outline" size={64} color="#d1d5db" />
                <Text style={styles.emptyText}>No jobs available</Text>
                <Text style={styles.emptySubtext}>Check back later for new opportunities</Text>
              </View>
            )}
          </View>
        );

      case 'communities':
        const filteredCommunities = communities.filter(community => {
          // Filter by tab (Explore or My Communities)
          const matchesTab = communityTab === 'explore' ? !community.isJoined : community.isJoined;
          
          // Filter by search query
          const matchesSearch = searchQuery.trim() === '' || 
            community.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            community.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            community.category.toLowerCase().includes(searchQuery.toLowerCase());
          
          return matchesTab && matchesSearch;
        });

        return (
          <View>
            {loading && communities.length === 0 ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#0A66C2" />
                <Text style={styles.loadingText}>Loading communities...</Text>
              </View>
            ) : (
              <View>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>{filteredCommunities.length} Communities</Text>
                  <TouchableOpacity
                    onPress={() => navigation?.navigate('CreateCommunity')}
                    style={styles.createButton}
                  >
                    <Ionicons name="add-circle" size={20} color="#0A66C2" />
                    <Text style={styles.createButtonText}>Create</Text>
                  </TouchableOpacity>
                </View>
                {filteredCommunities.length > 0 ? (
                  filteredCommunities.map(community => (
                  <TouchableOpacity
                    key={community.id}
                    style={styles.communityItem}
                    onPress={() => navigation?.navigate('CommunityDetail', { community })}
                    activeOpacity={0.7}
                  >
                    <View style={styles.communityCard}>
                      <View style={styles.communityHeader}>
                        {community.imageUrl ? (
                          <View style={styles.communityAvatarContainer}>
                            <Text style={styles.communityAvatar}>{community.name.charAt(0).toUpperCase()}</Text>
                          </View>
                        ) : (
                          <View style={styles.communityAvatarPlaceholder}>
                            <Ionicons name="people" size={24} color="#9ca3af" />
                          </View>
                        )}
                        <View style={styles.communityInfo}>
                          <View style={styles.communityTitleRow}>
                            <Text style={styles.communityName} numberOfLines={1}>
                              {community.name}
                            </Text>
                            <View
                              style={[
                                styles.visibilityBadge,
                                {
                                  backgroundColor:
                                    community.visibility === 'private' ? '#fef3c7' : '#dbeafe',
                                },
                              ]}
                            >
                              <Ionicons
                                name={community.visibility === 'private' ? 'lock-closed-outline' : 'globe-outline'}
                                size={20}
                                color={community.visibility === 'private' ? '#92400e' : '#1e40af'}
                              />
                            </View>
                          </View>
                          <Text style={styles.memberCount}>
                            {community.memberCount} {community.memberCount === 1 ? 'member' : 'members'} · {community.category}
                          </Text>
                          {community.tags && community.tags.length > 0 && (
                            <View style={styles.tagsRow}>
                              {community.tags.slice(0, 2).map((tag, index) => (
                                <View key={index} style={styles.tag}>
                                  <Text style={styles.tagText}>{tag}</Text>
                                </View>
                              ))}
                              {community.tags.length > 2 && (
                                <Text style={styles.moreTagsText}>+{community.tags.length - 2}</Text>
                              )}
                            </View>
                          )}
                        </View>
                      </View>
                    </View>
                    <TouchableOpacity
                      style={[
                        styles.joinButton,
                        {
                          backgroundColor: community.isJoined ? '#fff' : '#0A66C2',
                          borderColor: community.isJoined ? '#0A66C2' : 'transparent',
                          borderWidth: community.isJoined ? 1 : 0,
                        },
                      ]}
                      onPress={async (e) => {
                        e.stopPropagation();
                        try {
                          if (community.isJoined) {
                            await leaveCommunity(community.id);
                            Alert.alert('Success', 'Left community');
                          } else {
                            const result = await joinCommunity(community.id);
                            if (result.requiresApproval) {
                              Alert.alert('Request Sent', result.message);
                            } else {
                              Alert.alert('Success', result.message || 'Joined community');
                            }
                          }
                        } catch (error: any) {
                          Alert.alert('Error', error.message || 'Action failed');
                        }
                      }}
                      disabled={loading}
                    >
                      <Text
                        style={[
                          styles.joinButtonText,
                          { color: community.isJoined ? '#0A66C2' : '#fff' },
                        ]}
                      >
                        {loading ? '...' : community.isJoined ? 'Joined' : 'Join'}
                      </Text>
                    </TouchableOpacity>
                  </TouchableOpacity>
                  ))
                ) : (
                  <View style={styles.emptyContainer}>
                    <Ionicons name="people-outline" size={64} color="#d1d5db" />
                    <Text style={styles.emptyText}>
                      {communityTab === 'my' 
                        ? "You haven't joined any communities yet" 
                        : searchQuery.trim() 
                          ? 'No communities found' 
                          : 'No communities available'}
                    </Text>
                    <Text style={styles.emptySubtext}>
                      {communityTab === 'my' 
                        ? 'Switch to Explore to find communities!' 
                        : searchQuery.trim() 
                          ? 'Try a different search term' 
                          : 'Be the first to create one!'}
                    </Text>
                    {communityTab === 'explore' && !searchQuery.trim() && (
                      <TouchableOpacity
                        style={styles.emptyActionButton}
                        onPress={() => navigation?.navigate('CreateCommunity')}
                      >
                        <Ionicons name="add-circle-outline" size={20} color="#0A66C2" />
                        <Text style={styles.emptyActionButtonText}>Create Community</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                )}
              </View>
            )}
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="light-content" backgroundColor="#0A66C2" />
      
      {/* Enhanced Header with Gradient */}
      <LinearGradient
        colors={['#0A66C2', '#378FE9', '#5B93D6']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.headerGradient}
      >
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.networkIconContainer}>
              <Ionicons name="people" size={26} color="#FFFFFF" />
            </View>
            <View>
              <Text style={styles.headerTitle}>My Network</Text>
              <Text style={styles.headerSubtitle}>Build your connections</Text>
            </View>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity style={styles.headerIconButton}>
              <Ionicons name="search" size={24} color="#FFFFFF" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.headerIconButton}>
              <Ionicons name="notifications-outline" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>

      {/* Enhanced Info Banner */}
      {showFirstVisitBanner && (
        <View style={styles.banner}>
          <LinearGradient
            colors={['#EFF6FF', '#DBEAFE']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.bannerGradient}
          >
            <View style={styles.bannerIconContainer}>
              <Ionicons name="information-circle" size={22} color="#0A66C2" />
            </View>
            <View style={styles.bannerContent}>
              <View style={styles.bannerTextContainer}>
                <Text style={styles.bannerTitle}>
                  💙 Follow = see public updates
                </Text>
                <Text style={styles.bannerSubtitle}>
                  🤝 Connect = professional relationship (mutual)
                </Text>
              </View>
              <TouchableOpacity 
                onPress={() => setShowFirstVisitBanner(false)} 
                style={styles.bannerClose}
                activeOpacity={0.7}
              >
                <View style={styles.closeButton}>
                  <Ionicons name="close" size={18} color="#0A66C2" />
                </View>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </View>
      )}

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabsScroll}>
          {(['suggestions', 'jobs', 'communities', 'requests'] as TabType[]).map(tab => (
            <TouchableOpacity
              key={tab}
              onPress={() => setActiveTab(tab)}
              style={[styles.tab, activeTab === tab && styles.activeTab]}
            >
              <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color="#6b7280" />
          <TextInput
            style={styles.searchInput}
            placeholder={
              activeTab === 'suggestions' ? 'Search suggestions...' :
              activeTab === 'jobs' ? 'Search jobs...' :
              activeTab === 'communities' ? 'Search communities...' :
              activeTab === 'requests' ? 'Search requests...' :
              'Search...'
            }
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color="#6b7280" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Community Sub-Tabs */}
      {activeTab === 'communities' && (
        <View style={styles.communityTabsContainer}>
          <TouchableOpacity
            onPress={() => {
              setCommunityTab('explore');
              setSearchQuery('');
            }}
            style={[
              styles.communityTab,
              communityTab === 'explore' && styles.activeCommunityTab
            ]}
            activeOpacity={0.7}
          >
            <Text style={[
              styles.communityTabText,
              communityTab === 'explore' && styles.activeCommunityTabText
            ]}>
              Explore
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              setCommunityTab('my');
              setSearchQuery('');
            }}
            style={[
              styles.communityTab,
              communityTab === 'my' && styles.activeCommunityTab
            ]}
            activeOpacity={0.7}
          >
            <Text style={[
              styles.communityTabText,
              communityTab === 'my' && styles.activeCommunityTabText
            ]}>
              My Communities
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Content */}
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
      >
        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {searchQuery && searchResults.length > 0 ? (
          <View>
            <Text style={styles.searchResultsTitle}>
              Search Results ({searchResults.length})
            </Text>
            {searchResults.map(user => (
              <UserCard
                key={user.id}
                user={user}
                onConnect={handleConnect}
                onViewProfile={handleViewProfile}
              />
            ))}
          </View>
        ) : (
          renderTabContent()
        )}
      </ScrollView>



      {/* Bottom Navigation */}
      <BottomNavigation 
        activeTab="Network" 
        navigation={navigation} 
        onCreatePress={handleCreatePress}
      />

      {/* Create Content Modal */}
      <CreateContentModal
        visible={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreateStory={handleCreateStory}
        onCreatePost={handleCreatePost}
        onCreateEvent={handleCreateEvent}
        onCreateReel={handleCreateReel}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F6F8',
  },
  headerGradient: {
    ...Platform.select({
      ios: {
        shadowColor: '#0A66C2',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  networkIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  headerSubtitle: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: 2,
    fontWeight: '500',
  },
  headerRight: {
    flexDirection: 'row',
    gap: 8,
  },
  headerIconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  badge: {
    backgroundColor: '#ef4444',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#fff',
  },
  banner: {
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 12,
    borderRadius: 12,
    overflow: 'hidden',
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
  bannerGradient: {
    padding: 12,
  },
  bannerIconContainer: {
    marginBottom: 8,
  },
  bannerContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  bannerTextContainer: {
    flex: 1,
    paddingRight: 12,
  },
  bannerTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0A66C2',
    marginBottom: 4,
    letterSpacing: 0.2,
  },
  bannerSubtitle: {
    fontSize: 13,
    color: '#1D4ED8',
    lineHeight: 18,
    fontWeight: '500',
  },
  bannerClose: {
    marginTop: -4,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(10, 102, 194, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statsCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 8,
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 12,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  statsContainer: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 2,
    gap: 4,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
    paddingVertical: 4,
  },
  statIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1A1A1A',
    marginTop: 2,
    marginBottom: 1,
  },
  statValueZero: {
    opacity: 0.5,
  },
  statLabel: {
    fontSize: 10,
    color: '#9CA3AF',
    marginTop: 2,
    fontWeight: '500',
    letterSpacing: 0.3,
    textTransform: 'capitalize',
  },
  statDivider: {
    width: 1,
    height: 50,
    backgroundColor: '#F3F4F6',
    marginHorizontal: 4,
  },
  tabsContainer: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  tabsScroll: {
    paddingHorizontal: 16,
  },
  tab: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginRight: 8,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#2563eb',
  },
  tabText: {
    fontWeight: '600',
    color: '#6b7280',
  },
  activeTabText: {
    color: '#2563eb',
  },
  searchContainer: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: '#111827',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingBottom: 90,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyContainer: {
    paddingVertical: 48,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6b7280',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9ca3af',
    marginTop: 8,
    textAlign: 'center',
    paddingHorizontal: 32,
  },
  errorContainer: {
    backgroundColor: '#fef2f2',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    color: '#b91c1c',
  },
  searchResultsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  requestCard: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  requestMessage: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 8,
    fontStyle: 'italic',
  },
  requestActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  requestButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  acceptButton: {
    backgroundColor: '#2563eb',
  },
  rejectButton: {
    backgroundColor: '#e5e7eb',
  },
  acceptButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  rejectButtonText: {
    color: '#374151',
    fontWeight: '600',
  },
  communitiesSection: {
    marginTop: 24,
  },
  communitiesTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#f9fafb',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#e0f2fe',
  },
  createButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0A66C2',
  },
  communityItem: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  communityCard: {
    padding: 16,
  },
  communityHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  communityAvatarContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#0A66C2',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  communityAvatar: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
  },
  communityAvatarPlaceholder: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#e5e7eb',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  communityInfo: {
    flex: 1,
  },
  communityTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  communityName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    flex: 1,
  },
  visibilityBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  memberCount: {
    fontSize: 13,
    color: '#6b7280',
    marginBottom: 8,
  },
  tagsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  tag: {
    backgroundColor: '#e0f2fe',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  tagText: {
    color: '#0369a1',
    fontSize: 11,
    fontWeight: '500',
  },
  moreTagsText: {
    fontSize: 11,
    color: '#9ca3af',
    fontWeight: '500',
  },
  joinButton: {
    marginHorizontal: 16,
    marginBottom: 12,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  joinButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  loadingContainer: {
    paddingVertical: 48,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 15,
    color: '#6b7280',
    fontWeight: '500',
  },
  emptyActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 16,
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#e0f2fe',
    borderRadius: 8,
  },
  emptyActionButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0A66C2',
  },
  communityTabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  communityTab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeCommunityTab: {
    borderBottomColor: '#0A66C2',
  },
  communityTabText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#6b7280',
  },
  activeCommunityTabText: {
    color: '#0A66C2',
    fontWeight: '600',
  },
});

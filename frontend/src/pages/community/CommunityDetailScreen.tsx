import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  RefreshControl,
  Alert,
  Modal,
  Pressable,
  FlatList,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../context/ThemeContext';
import { networkAPI } from '../../services/network.http';
import { Community, CommunityMember } from '../../types/network.types';
import { postsApi, Post } from '../../services/posts.api';
import PostCard from '../../components/PostCard';
import BottomNavigation from '../../components/BottomNavigation';

interface Props {
  navigation: any;
  route: {
    params: {
      communityId?: string;
      community?: Community;
    };
  };
}

type Tab = 'posts' | 'members' | 'about' | 'settings';

const CommunityDetailScreen: React.FC<Props> = ({ navigation, route }) => {
  const { colors } = useTheme();
  const [community, setCommunity] = useState<Community | null>(route.params?.community || null);
  const [activeTab, setActiveTab] = useState<Tab>('posts');
  const [loading, setLoading] = useState(!community);
  const [refreshing, setRefreshing] = useState(false);
  const [members, setMembers] = useState<CommunityMember[]>([]);
  const [pendingMembers, setPendingMembers] = useState<CommunityMember[]>([]);
  const [actionLoading, setActionLoading] = useState(false);
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [showRulesModal, setShowRulesModal] = useState(false);
  const [rulesExpanded, setRulesExpanded] = useState(false);
  const [isFirstJoin, setIsFirstJoin] = useState(false);
  const [showMemberOptions, setShowMemberOptions] = useState<string | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [postsLoading, setPostsLoading] = useState(false);
  const [loadingStates, setLoadingStates] = useState({
    info: false,
    members: false,
    posts: false,
  });

  const communityId = route.params?.communityId || community?.id;

  useEffect(() => {
    if (communityId) {
      loadCommunity();
    }
  }, [communityId]);

  useEffect(() => {
    if (activeTab === 'members' && community) {
      loadMembers();
    } else if (activeTab === 'posts' && community) {
      loadPosts();
    }
  }, [activeTab, community]);

  const loadCommunity = async () => {
    try {
      setLoading(true);
      const response = await networkAPI.getCommunityDetail(communityId!);
      setCommunity(response.community);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to load community');
    } finally {
      setLoading(false);
    }
  };

  const loadMembers = async () => {
    try {
      const [activeRes, pendingRes] = await Promise.all([
        networkAPI.getCommunityMembers(communityId!, 'active'),
        networkAPI.getCommunityMembers(communityId!, 'pending'),
      ]);
      setMembers(activeRes.members);
      setPendingMembers(pendingRes.members);
    } catch (error) {
      console.error('Failed to load members:', error);
    }
  };

  const loadPosts = async () => {
    if (!communityId) return;
    
    try {
      setPostsLoading(true);
      const fetchedPosts = await postsApi.getCommunityPosts(communityId);
      setPosts(fetchedPosts);
    } catch (error: any) {
      console.error('Failed to load community posts:', error);
      Alert.alert('Error', error.message || 'Failed to load posts');
    } finally {
      setPostsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadCommunity();
    if (activeTab === 'members') {
      await loadMembers();
    } else if (activeTab === 'posts') {
      await loadPosts();
    }
    setRefreshing(false);
  };

  const handleJoinLeave = async () => {
    if (!community) return;

    if (community.isJoined) {
      // Show confirmation modal for leaving
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      setShowLeaveModal(true);
      return;
    }

    // Handle join
    setActionLoading(true);
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      const response = await networkAPI.joinCommunity(community.id);
      
      if (response.requiresApproval) {
        Alert.alert(
          '⏳ Request Sent',
          response.message || 'Your request is pending admin approval.',
          [{ text: 'OK', onPress: () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success) }]
        );
        setCommunity({ ...community, memberStatus: 'pending' });
      } else {
        setIsFirstJoin(true);
        Alert.alert(
          '🎉 Welcome!',
          response.message || 'You have successfully joined the community.',
          [
            { 
              text: 'View Rules', 
              onPress: () => {
                setShowRulesModal(true);
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              }
            },
            { 
              text: 'OK',
              onPress: () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
            }
          ]
        );
        setCommunity({ 
          ...community, 
          isJoined: true, 
          memberCount: community.memberCount + 1,
          userRole: 'member'
        });
      }
    } catch (error: any) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Error', error.message || 'Failed to join community');
    } finally {
      setActionLoading(false);
    }
  };

  const confirmLeave = async () => {
    if (!community) return;

    setShowLeaveModal(false);
    setActionLoading(true);
    
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      const response = await networkAPI.leaveCommunity(community.id);
      
      Alert.alert('✓ Left Community', response.message, [
        { text: 'OK', onPress: () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success) }
      ]);
      
      setCommunity({ 
        ...community, 
        isJoined: false, 
        memberCount: community.memberCount - 1,
        userRole: undefined
      });
    } catch (error: any) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Error', error.message || 'Failed to leave community');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRemoveMember = async (memberId: string, memberName: string) => {
    Alert.alert(
      'Remove Member',
      `Are you sure you want to remove ${memberName} from this community?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
              const response = await networkAPI.removeMember(communityId!, memberId);
              Alert.alert('Success', response.message);
              loadMembers();
            } catch (error: any) {
              Alert.alert('Error', error.message);
            }
          }
        }
      ]
    );
  };

  const handleChangeRole = async (memberId: string, memberName: string, currentRole: string) => {
    const roles = ['member', 'moderator', 'admin'];
    const roleOptions = roles
      .filter(role => role !== currentRole)
      .map(role => ({
        text: `Make ${role.charAt(0).toUpperCase() + role.slice(1)}`,
        onPress: async () => {
          try {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            const response = await networkAPI.updateMemberRole(communityId!, memberId, role);
            Alert.alert('Success', response.message);
            loadMembers();
          } catch (error: any) {
            Alert.alert('Error', error.message);
          }
        }
      }));

    Alert.alert(
      `Change Role for ${memberName}`,
      `Current role: ${currentRole}`,
      [...roleOptions, { text: 'Cancel', style: 'cancel' }]
    );
  };

  const handleApprove = async (memberId: string) => {
    try {
      const response = await networkAPI.approveJoinRequest(communityId!, memberId);
      Alert.alert('Success', response.message);
      loadMembers();
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  };

  const handleReject = async (memberId: string) => {
    try {
      const response = await networkAPI.rejectJoinRequest(communityId!, memberId);
      Alert.alert('Success', response.message);
      loadMembers();
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  };

  const renderHeader = () => (
    <View>
      {/* Cover Image */}
      <View style={styles.coverContainer}>
        {community?.coverImageUrl ? (
          <Image source={{ uri: community.coverImageUrl }} style={styles.coverImage} />
        ) : (
          <View style={[styles.coverPlaceholder, { backgroundColor: '#0A66C2' }]}>
            <Ionicons name="people" size={60} color="rgba(255,255,255,0.5)" />
          </View>
        )}
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            navigation.goBack();
          }}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        
        {/* Role Badge (Top Right) */}
        {community?.userRole && ['admin', 'moderator'].includes(community.userRole) && (
          <View style={[styles.topRoleBadge, { 
            backgroundColor: community.userRole === 'admin' ? '#dc2626' : '#f59e0b' 
          }]}>
            <Ionicons 
              name={community.userRole === 'admin' ? 'shield-checkmark' : 'shield-half'} 
              size={14} 
              color="#fff" 
            />
            <Text style={styles.topRoleText}>
              {community.userRole === 'admin' ? 'Admin' : 'Moderator'}
            </Text>
          </View>
        )}
      </View>

      {/* Community Info */}
      <View style={styles.infoSection}>
        <View style={styles.avatarContainer}>
          {community?.imageUrl ? (
            <Image source={{ uri: community.imageUrl }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatarPlaceholder, { backgroundColor: '#e5e7eb' }]}>
              <Ionicons name="people" size={40} color="#9ca3af" />
            </View>
          )}
        </View>

        <View style={styles.titleRow}>
          <View style={styles.titleContainer}>
            <Text style={[styles.communityName, { color: colors.text }]}>{community?.name}</Text>
            <View style={styles.metaRow}>
              {community?.category && (
                <View style={styles.categoryBadge}>
                  <Ionicons name="pricetag" size={12} color="#6b7280" />
                  <Text style={styles.category}>{community.category}</Text>
                </View>
              )}
              <View
                style={[
                  styles.visibilityBadge,
                  { backgroundColor: community?.visibility === 'private' ? '#fef3c7' : '#dbeafe' },
                ]}
              >
                <Ionicons
                  name={community?.visibility === 'private' ? 'lock-closed' : 'globe'}
                  size={12}
                  color={community?.visibility === 'private' ? '#92400e' : '#1e40af'}
                />
                <Text
                  style={[
                    styles.visibilityText,
                    { color: community?.visibility === 'private' ? '#92400e' : '#1e40af' },
                  ]}
                >
                  {community?.visibility === 'private' ? 'Private' : 'Public'}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Member Count with Icon */}
        <TouchableOpacity 
          style={styles.memberCountRow}
          onPress={() => setActiveTab('members')}
        >
          <Ionicons name="people" size={16} color="#6b7280" />
          <Text style={styles.memberCount}>
            {community?.memberCount || 0} {(community?.memberCount || 0) === 1 ? 'member' : 'members'}
          </Text>
          {community?.isJoined && (
            <Ionicons name="chevron-forward" size={16} color="#9ca3af" />
          )}
        </TouchableOpacity>

        {/* Action Button - Sticky Feel */}
        {renderActionButton()}

        {/* Tags */}
        {community?.tags && community.tags.length > 0 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.tagsScroll}
            contentContainerStyle={styles.tagsContent}
          >
            {community.tags.slice(0, 5).map((tag, index) => (
              <View key={index} style={styles.tag}>
                <Text style={styles.tagText}>#{tag}</Text>
              </View>
            ))}
          </ScrollView>
        )}
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'posts' && styles.activeTab]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            setActiveTab('posts');
          }}
        >
          <Ionicons 
            name={activeTab === 'posts' ? 'document-text' : 'document-text-outline'} 
            size={18} 
            color={activeTab === 'posts' ? '#0A66C2' : '#6b7280'} 
          />
          <Text style={[styles.tabText, activeTab === 'posts' && styles.activeTabText]}>
            Posts
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'members' && styles.activeTab]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            setActiveTab('members');
          }}
        >
          <Ionicons 
            name={activeTab === 'members' ? 'people' : 'people-outline'} 
            size={18} 
            color={activeTab === 'members' ? '#0A66C2' : '#6b7280'} 
          />
          <Text style={[styles.tabText, activeTab === 'members' && styles.activeTabText]}>
            Members
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'about' && styles.activeTab]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            setActiveTab('about');
          }}
        >
          <Ionicons 
            name={activeTab === 'about' ? 'information-circle' : 'information-circle-outline'} 
            size={18} 
            color={activeTab === 'about' ? '#0A66C2' : '#6b7280'} 
          />
          <Text style={[styles.tabText, activeTab === 'about' && styles.activeTabText]}>
            About
          </Text>
        </TouchableOpacity>
        {community?.userRole && ['admin', 'moderator'].includes(community.userRole) && (
          <TouchableOpacity
            style={[styles.tab, activeTab === 'settings' && styles.activeTab]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setActiveTab('settings');
            }}
          >
            <Ionicons 
              name={activeTab === 'settings' ? 'settings' : 'settings-outline'} 
              size={18} 
              color={activeTab === 'settings' ? '#0A66C2' : '#6b7280'} 
            />
            <Text style={[styles.tabText, activeTab === 'settings' && styles.activeTabText]}>
              Settings
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  const renderActionButton = () => {
    const isPending = community?.memberStatus === 'pending';
    const isJoined = community?.isJoined;
    const isPrivate = community?.visibility === 'private';

    let buttonText = 'Join Community';
    let buttonColor = '#0A66C2';
    let textColor = '#fff';
    let borderColor = 'transparent';
    let disabled = false;
    let icon: any = 'add-circle';

    if (isPending) {
      buttonText = '⏳ Request Pending';
      buttonColor = '#fff';
      textColor = '#f59e0b';
      borderColor = '#f59e0b';
      disabled = true;
      icon = 'time';
    } else if (isJoined) {
      buttonText = 'Leave Community';
      buttonColor = '#fff';
      textColor = '#dc2626';
      borderColor = '#dc2626';
      icon = 'exit';
    } else if (isPrivate) {
      buttonText = 'Request to Join';
      icon = 'lock-closed';
    }

    return (
      <TouchableOpacity
        style={[
          styles.actionButton,
          {
            backgroundColor: buttonColor,
            borderColor: borderColor,
            borderWidth: borderColor !== 'transparent' ? 1.5 : 0,
            opacity: disabled ? 0.6 : 1,
          },
        ]}
        onPress={handleJoinLeave}
        disabled={actionLoading || disabled}
        activeOpacity={0.8}
      >
        {actionLoading ? (
          <ActivityIndicator color={textColor} />
        ) : (
          <View style={styles.actionButtonContent}>
            <Ionicons name={icon} size={20} color={textColor} />
            <Text style={[styles.actionButtonText, { color: textColor }]}>
              {buttonText}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const renderAboutTab = () => (
    <View style={styles.tabContent}>
      {/* Description */}
      {community?.description ? (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="document-text" size={20} color="#0A66C2" />
            <Text style={[styles.sectionTitle, { color: colors.text }]}>About</Text>
          </View>
          <Text style={[styles.descriptionText, { color: colors.text }]}>
            {community.description}
          </Text>
        </View>
      ) : (
        <View style={styles.emptySection}>
          <Ionicons name="document-text-outline" size={32} color="#d1d5db" />
          <Text style={styles.emptyText}>No description available</Text>
        </View>
      )}

      {/* Community Rules - Collapsible */}
      {community?.rules && (
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.collapsibleHeader}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setRulesExpanded(!rulesExpanded);
            }}
            activeOpacity={0.7}
          >
            <View style={styles.sectionHeader}>
              <Ionicons name="shield-checkmark" size={20} color="#dc2626" />
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Community Rules</Text>
            </View>
            <Ionicons 
              name={rulesExpanded ? "chevron-up" : "chevron-down"} 
              size={20} 
              color="#6b7280" 
            />
          </TouchableOpacity>
          
          {rulesExpanded && (
            <View style={styles.rulesContainer}>
              <Text style={[styles.rulesText, { color: colors.text }]}>{community.rules}</Text>
              {isFirstJoin && (
                <View style={styles.highlightBanner}>
                  <Ionicons name="information-circle" size={16} color="#f59e0b" />
                  <Text style={styles.highlightText}>
                    Please read and follow these rules
                  </Text>
                </View>
              )}
            </View>
          )}
        </View>
      )}

      {/* Details */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="information-circle" size={20} color="#6b7280" />
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Details</Text>
        </View>
        
        <View style={styles.detailCard}>
          <View style={styles.detailRow}>
            <Ionicons name="calendar-outline" size={18} color="#6b7280" />
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Created</Text>
              <Text style={styles.detailText}>
                {new Date(community?.createdAt || '').toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </Text>
            </View>
          </View>

          <View style={styles.detailDivider} />

          <View style={styles.detailRow}>
            <Ionicons
              name={community?.visibility === 'private' ? 'lock-closed' : 'globe'}
              size={18}
              color="#6b7280"
            />
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Access</Text>
              <Text style={styles.detailText}>
                {community?.visibility === 'private'
                  ? 'Private - Requires approval to join'
                  : 'Public - Anyone can join'}
              </Text>
            </View>
          </View>

          {community?.category && (
            <>
              <View style={styles.detailDivider} />
              <View style={styles.detailRow}>
                <Ionicons name="pricetag" size={18} color="#6b7280" />
                <View style={styles.detailContent}>
                  <Text style={styles.detailLabel}>Category</Text>
                  <Text style={styles.detailText}>{community.category}</Text>
                </View>
              </View>
            </>
          )}
        </View>
      </View>
    </View>
  );

  const renderMembersTab = () => {
    const isAdminOrMod = community?.userRole && ['admin', 'moderator'].includes(community.userRole);
    const canManageMembers = isAdminOrMod;

    return (
      <View style={styles.tabContent}>
        {loadingStates.members ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#0A66C2" />
            <Text style={styles.loadingText}>Loading members...</Text>
          </View>
        ) : (
          <>
            {/* Pending Requests (Admin/Mod only) */}
            {pendingMembers.length > 0 && canManageMembers && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Ionicons name="time" size={20} color="#f59e0b" />
                  <Text style={[styles.sectionTitle, { color: colors.text }]}>
                    Pending Requests ({pendingMembers.length})
                  </Text>
                </View>
                {pendingMembers.map(member => (
                  <View key={member.id} style={styles.memberCard}>
                    <View style={styles.memberInfo}>
                      {member.userImageUrl ? (
                        <Image source={{ uri: member.userImageUrl }} style={styles.memberAvatarImg} />
                      ) : (
                        <View style={styles.memberAvatar}>
                          <Ionicons name="person" size={20} color="#9ca3af" />
                        </View>
                      )}
                      <View style={styles.memberDetails}>
                        <Text style={[styles.memberName, { color: colors.text }]}>
                          {member.userName}
                        </Text>
                        <Text style={styles.memberEmail}>{member.userEmail}</Text>
                        <Text style={styles.memberDate}>
                          Requested {new Date(member.joinedAt).toLocaleDateString()}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.memberActions}>
                      <TouchableOpacity
                        style={styles.approveButton}
                        onPress={() => {
                          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                          handleApprove(member.userId);
                        }}
                      >
                        <Ionicons name="checkmark" size={18} color="#fff" />
                        <Text style={styles.approveButtonText}>Approve</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.rejectButton}
                        onPress={() => {
                          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                          handleReject(member.userId);
                        }}
                      >
                        <Ionicons name="close" size={18} color="#fff" />
                        <Text style={styles.rejectButtonText}>Reject</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </View>
            )}

            {/* Active Members */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Ionicons name="people" size={20} color="#0A66C2" />
                <Text style={[styles.sectionTitle, { color: colors.text }]}>
                  Members ({members.length})
                </Text>
              </View>
              
              {members.length > 0 ? (
                <FlatList
                  data={members}
                  keyExtractor={item => item.id}
                  scrollEnabled={false}
                  renderItem={({ item: member }) => (
                    <TouchableOpacity
                      style={styles.memberCard}
                      onLongPress={() => {
                        if (canManageMembers && member.role !== 'creator') {
                          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                          setShowMemberOptions(member.id);
                        }
                      }}
                      activeOpacity={canManageMembers ? 0.7 : 1}
                    >
                      <View style={styles.memberInfo}>
                        {member.userImageUrl ? (
                          <Image source={{ uri: member.userImageUrl }} style={styles.memberAvatarImg} />
                        ) : (
                          <View style={styles.memberAvatar}>
                            <Ionicons name="person" size={20} color="#9ca3af" />
                          </View>
                        )}
                        <View style={styles.memberDetails}>
                          <View style={styles.memberNameRow}>
                            <Text style={[styles.memberName, { color: colors.text }]}>
                              {member.userName}
                            </Text>
                            {member.role === 'creator' && (
                              <Ionicons name="star" size={14} color="#f59e0b" />
                            )}
                          </View>
                          <Text style={styles.memberEmail}>{member.userEmail}</Text>
                          <Text style={styles.memberDate}>
                            Joined {new Date(member.joinedAt).toLocaleDateString()}
                          </Text>
                        </View>
                      </View>
                      
                      <View style={styles.memberRightSection}>
                        <View style={[
                          styles.roleBadge, 
                          { backgroundColor: getRoleColor(member.role) }
                        ]}>
                          <Ionicons 
                            name={getRoleIcon(member.role)} 
                            size={12} 
                            color={getRoleTextColor(member.role)} 
                          />
                          <Text style={[
                            styles.roleText,
                            { color: getRoleTextColor(member.role) }
                          ]}>
                            {member.role}
                          </Text>
                        </View>
                        
                        {canManageMembers && member.role !== 'creator' && (
                          <TouchableOpacity
                            style={styles.memberOptionsButton}
                            onPress={() => {
                              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                              Alert.alert(
                                `Manage ${member.userName}`,
                                'Choose an action',
                                [
                                  {
                                    text: 'Change Role',
                                    onPress: () => handleChangeRole(member.userId, member.userName, member.role)
                                  },
                                  {
                                    text: 'Remove from Community',
                                    style: 'destructive',
                                    onPress: () => handleRemoveMember(member.userId, member.userName)
                                  },
                                  { text: 'Cancel', style: 'cancel' }
                                ]
                              );
                            }}
                          >
                            <Ionicons name="ellipsis-vertical" size={18} color="#9ca3af" />
                          </TouchableOpacity>
                        )}
                      </View>
                    </TouchableOpacity>
                  )}
                />
              ) : (
                <View style={styles.emptyState}>
                  <Ionicons name="people-outline" size={48} color="#d1d5db" />
                  <Text style={styles.emptyText}>No members yet</Text>
                </View>
              )}
            </View>
          </>
        )}
      </View>
    );
  };

  const renderPostsTab = () => {
    const canPost = community?.isJoined;

    return (
      <View style={styles.tabContent}>
        {/* Create Post Button (Members Only) */}
        {canPost && (
          <TouchableOpacity
            style={styles.createPostButton}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              navigation.navigate('CreatePost', { 
                communityId: communityId,
                onPostCreated: loadPosts 
              });
            }}
          >
            <Ionicons name="add-circle" size={24} color="#0A66C2" />
            <Text style={styles.createPostText}>Create a post</Text>
          </TouchableOpacity>
        )}

        {/* Loading State */}
        {postsLoading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#0A66C2" />
          </View>
        )}

        {/* Posts List */}
        {!postsLoading && posts.length > 0 && (
          <View style={{ marginTop: 12 }}>
            {posts.map((post) => (
              <PostCard
                key={post._id}
                post={post}
                onLike={async () => {
                  try {
                    if (post.userLiked) {
                      await postsApi.unlikePost(post._id);
                    } else {
                      await postsApi.likePost(post._id);
                    }
                    await loadPosts(); // Refresh posts
                  } catch (error) {
                    console.error('Error toggling like:', error);
                  }
                }}
                onComment={() => {
                  navigation.navigate('PostDetail', { postId: post._id });
                }}
                onShare={() => {
                  Alert.alert('Share', 'Share functionality coming soon!');
                }}
                onPress={() => {
                  navigation.navigate('PostDetail', { postId: post._id });
                }}
              />
            ))}
          </View>
        )}

        {/* Empty State */}
        {!postsLoading && posts.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="document-text-outline" size={64} color="#d1d5db" />
            <Text style={styles.emptyText}>No posts yet</Text>
            <Text style={styles.emptySubtext}>
              {canPost
                ? 'Be the first to post in this community'
                : 'Join the community to see and create posts'}
            </Text>
          </View>
        )}
      </View>
    );
  };

  const renderSettingsTab = () => (
    <View style={styles.tabContent}>
      <TouchableOpacity
        style={styles.settingItem}
        onPress={() =>
          navigation.navigate('CommunitySettings', { community })
        }
      >
        <Ionicons name="settings-outline" size={24} color={colors.text} />
        <Text style={[styles.settingText, { color: colors.text }]}>Edit Community</Text>
        <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color="#0A66C2" />
        <Text style={[styles.loadingText, { color: colors.text, marginTop: 12 }]}>
          Loading community...
        </Text>
      </View>
    );
  }

  if (!community) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: colors.background }]}>
        <Ionicons name="alert-circle-outline" size={64} color="#d1d5db" />
        <Text style={[styles.emptyText, { color: colors.text, marginTop: 12 }]}>
          Community not found
        </Text>
        <TouchableOpacity
          style={styles.backToListButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backToListText}>Back to Communities</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <>
      <StatusBar barStyle="light-content" />
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
        <ScrollView
          refreshControl={
            <RefreshControl 
              refreshing={refreshing} 
              onRefresh={handleRefresh}
              tintColor="#0A66C2"
            />
          }
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 20 }}
        >
          {renderHeader()}
          {activeTab === 'posts' && renderPostsTab()}
          {activeTab === 'members' && renderMembersTab()}
          {activeTab === 'about' && renderAboutTab()}
          {activeTab === 'settings' && renderSettingsTab()}
        </ScrollView>
      </SafeAreaView>

      {/* Leave Community Confirmation Modal */}
      <Modal
        visible={showLeaveModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowLeaveModal(false)}
      >
        <Pressable 
          style={styles.modalOverlay}
          onPress={() => setShowLeaveModal(false)}
        >
          <Pressable style={styles.modalContent} onPress={(e) => e.stopPropagation()}>
            <View style={styles.modalHeader}>
              <Ionicons name="exit-outline" size={48} color="#dc2626" />
              <Text style={styles.modalTitle}>Leave Community?</Text>
              <Text style={styles.modalMessage}>
                Are you sure you want to leave {community?.name}? You'll need to request to join again if it's a private community.
              </Text>
            </View>
            
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setShowLeaveModal(false);
                }}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.modalConfirmButton}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                  confirmLeave();
                }}
              >
                <Text style={styles.modalConfirmText}>Leave</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Community Rules Modal */}
      <Modal
        visible={showRulesModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowRulesModal(false)}
      >
        <Pressable 
          style={styles.modalOverlay}
          onPress={() => setShowRulesModal(false)}
        >
          <Pressable style={styles.rulesModalContent} onPress={(e) => e.stopPropagation()}>
            <View style={styles.rulesModalHeader}>
              <Text style={styles.rulesModalTitle}>Community Rules</Text>
              <TouchableOpacity
                onPress={() => setShowRulesModal(false)}
                style={styles.rulesCloseButton}
              >
                <Ionicons name="close" size={24} color="#374151" />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.rulesModalScroll}>
              <Text style={styles.rulesModalText}>{community?.rules}</Text>
            </ScrollView>
            
            <TouchableOpacity
              style={styles.rulesAcknowledgeButton}
              onPress={() => {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                setShowRulesModal(false);
                setIsFirstJoin(false);
              }}
            >
              <Text style={styles.rulesAcknowledgeText}>I Understand</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Bottom Navigation */}
      <BottomNavigation 
        navigation={navigation}
        onCreatePress={() => {
          if (community) {
            navigation.navigate('CreatePost', { communityId: community._id });
          }
        }}
      />
    </>
  );
};

const getRoleColor = (role: string) => {
  switch (role) {
    case 'creator':
      return '#fef3c7';
    case 'admin':
      return '#fee2e2';
    case 'moderator':
      return '#dbeafe';
    default:
      return '#f3f4f6';
  }
};

const getRoleTextColor = (role: string) => {
  switch (role) {
    case 'creator':
      return '#92400e';
    case 'admin':
      return '#991b1b';
    case 'moderator':
      return '#1e40af';
    default:
      return '#374151';
  }
};

const getRoleIcon = (role: string) => {
  switch (role) {
    case 'creator':
      return 'star';
    case 'admin':
      return 'shield-checkmark';
    case 'moderator':
      return 'shield-half';
    default:
      return 'person';
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  coverContainer: {
    height: 180,
    position: 'relative',
  },
  coverImage: {
    width: '100%',
    height: '100%',
  },
  coverPlaceholder: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButton: {
    position: 'absolute',
    top: 16,
    left: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  topRoleBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
  },
  topRoleText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  infoSection: {
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  avatarContainer: {
    marginTop: -50,
    marginBottom: 12,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
    borderColor: '#fff',
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
    borderColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  titleContainer: {
    flex: 1,
  },
  communityName: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  category: {
    fontSize: 13,
    color: '#6b7280',
    fontWeight: '500',
  },
  visibilityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  visibilityText: {
    fontSize: 12,
    fontWeight: '600',
  },
  memberCountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
  },
  memberCount: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  actionButton: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionButtonText: {
    fontSize: 15,
    fontWeight: '700',
  },
  tagsScroll: {
    marginTop: 12,
  },
  tagsContent: {
    gap: 8,
  },
  tag: {
    backgroundColor: '#e0f2fe',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  tagText: {
    color: '#0369a1',
    fontSize: 13,
    fontWeight: '500',
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    paddingHorizontal: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
  },
  activeTab: {
    borderBottomColor: '#0A66C2',
  },
  tabText: {
    fontSize: 15,
    color: '#6b7280',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#0A66C2',
    fontWeight: '600',
  },
  tabContent: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
  },
  descriptionText: {
    fontSize: 15,
    lineHeight: 22,
    color: '#374151',
  },
  rulesText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#4b5563',
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
  },
  detailText: {
    fontSize: 14,
    color: '#6b7280',
  },
  memberCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    marginBottom: 8,
  },
  memberInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  memberAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#e5e7eb',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  memberDetails: {
    flex: 1,
  },
  memberName: {
    fontSize: 15,
    fontWeight: '600',
  },
  memberEmail: {
    fontSize: 13,
    color: '#6b7280',
    marginTop: 2,
  },
  memberActions: {
    flexDirection: 'row',
    gap: 8,
  },
  approveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#10b981',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  approveButtonText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
  },
  rejectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#ef4444',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  rejectButtonText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  roleText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
    color: '#374151',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyText: {
    fontSize: 16,
    color: '#9ca3af',
    marginTop: 12,
    fontWeight: '600',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#d1d5db',
    marginTop: 4,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    marginBottom: 8,
  },
  settingText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
    marginLeft: 12,
  },
  // New Enhanced Styles
  loadingContainer: {
    paddingVertical: 48,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 14,
    color: '#9ca3af',
    marginTop: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  emptySection: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  collapsibleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rulesContainer: {
    marginTop: 8,
    padding: 12,
    backgroundColor: '#fef3c7',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#f59e0b',
  },
  highlightBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
    padding: 12,
    backgroundColor: '#fffbeb',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#fde047',
  },
  highlightText: {
    fontSize: 13,
    color: '#92400e',
    fontWeight: '600',
  },
  detailCard: {
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  detailContent: {
    flex: 1,
    marginLeft: 12,
  },
  detailLabel: {
    fontSize: 12,
    color: '#9ca3af',
    fontWeight: '600',
    marginBottom: 2,
  },
  detailDivider: {
    height: 1,
    backgroundColor: '#e5e7eb',
    marginVertical: 12,
  },
  memberAvatarImg: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  memberNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  memberDate: {
    fontSize: 11,
    color: '#9ca3af',
    marginTop: 2,
  },
  memberRightSection: {
    alignItems: 'flex-end',
    gap: 8,
  },
  memberOptionsButton: {
    padding: 4,
  },
  createPostButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    borderStyle: 'dashed',
    marginBottom: 16,
  },
  createPostText: {
    fontSize: 15,
    color: '#0A66C2',
    fontWeight: '600',
  },
  backToListButton: {
    marginTop: 20,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#0A66C2',
    borderRadius: 24,
  },
  backToListText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 400,
  },
  modalHeader: {
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginTop: 16,
    marginBottom: 8,
    color: '#111827',
  },
  modalMessage: {
    fontSize: 15,
    lineHeight: 22,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  modalCancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
  },
  modalCancelText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#374151',
  },
  modalConfirmButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#dc2626',
    alignItems: 'center',
  },
  modalConfirmText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
  },
  rulesModalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: '80%',
    marginTop: 'auto',
    width: '100%',
  },
  rulesModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  rulesModalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  rulesCloseButton: {
    padding: 4,
  },
  rulesModalScroll: {
    maxHeight: 400,
    marginBottom: 16,
  },
  rulesModalText: {
    fontSize: 15,
    lineHeight: 24,
    color: '#374151',
  },
  rulesAcknowledgeButton: {
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#0A66C2',
    alignItems: 'center',
  },
  rulesAcknowledgeText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#fff',
  },
});

export default CommunityDetailScreen;

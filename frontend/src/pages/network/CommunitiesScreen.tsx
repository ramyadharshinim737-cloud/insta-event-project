import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Image, RefreshControl, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import CommunityCard from '../../components/network/CommunityCard';
import { useNetwork } from '../../hooks/useNetwork';

interface Props { navigation?: any }

const CATEGORIES = [
  'All',
  'Technology',
  'Business',
  'Healthcare',
  'Education',
  'Finance',
  'Marketing',
  'Design',
  'Engineering',
  'Sales',
  'Other',
];

const CommunitiesScreen: React.FC<Props> = ({ navigation }) => {
  const { colors } = useTheme();
  const { communities, joinCommunity, leaveCommunity, loadCommunities, loading } = useNetwork();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [refreshing, setRefreshing] = useState(false);

  // Load communities on mount
  useEffect(() => {
    loadCommunities();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadCommunities();
    setRefreshing(false);
  };

  const normalizedQuery = searchQuery.trim().toLowerCase();
  
  let filteredCommunities = communities;
  
  // Filter by search query (name or tags)
  if (normalizedQuery) {
    filteredCommunities = filteredCommunities.filter(c => {
      const nameMatch = c.name.toLowerCase().includes(normalizedQuery);
      const tagMatch = c.tags?.some(tag => tag.toLowerCase().includes(normalizedQuery));
      return nameMatch || tagMatch;
    });
  }
  
  // Filter by category
  if (selectedCategory !== 'All') {
    filteredCommunities = filteredCommunities.filter(c => c.category === selectedCategory);
  }

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

        <Text style={[styles.headerTitle, { color: colors.text }]}>Communities</Text>

        <TouchableOpacity
          style={styles.createButton}
          onPress={() => navigation?.navigate?.('CreateCommunity')}
        >
          <Ionicons name="add-circle" size={28} color="#0A66C2" />
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={18} color="#6b7280" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by name or tags..."
            placeholderTextColor="#9ca3af"
            value={searchQuery}
            onChangeText={setSearchQuery}
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={18} color="#9ca3af" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Category Filter */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoryScroll}
        contentContainerStyle={styles.categoryContent}
      >
        {CATEGORIES.map(category => (
          <TouchableOpacity
            key={category}
            style={[
              styles.categoryChip,
              selectedCategory === category && styles.categoryChipActive,
            ]}
            onPress={() => setSelectedCategory(category)}
          >
            <Text
              style={[
                styles.categoryText,
                selectedCategory === category && styles.categoryTextActive,
              ]}
            >
              {category}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView
        style={styles.list}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={['#0A66C2']} />
        }
      >
        {loading && communities.length === 0 ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#0A66C2" />
            <Text style={[styles.loadingText, { color: colors.text }]}>Loading communities...</Text>
          </View>
        ) : filteredCommunities.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="people-outline" size={64} color="#d1d5db" />
            <Text style={[styles.emptyTitle, { color: colors.text }]}>No communities found</Text>
            <Text style={[styles.emptySubtitle, { color: colors.text }]}>
              {communities.length === 0
                ? 'Communities you are recommended to join will appear here.'
                : 'Try a different name, tag, or category.'}
            </Text>
          </View>
        ) : (
          filteredCommunities.map(c => (
            <View key={c.id} style={styles.communityItem}>
              <TouchableOpacity
                style={styles.communityCard}
                onPress={() => navigation?.navigate?.('CommunityDetail', { community: c })}
                activeOpacity={0.7}
              >
                <View style={styles.communityHeader}>
                  {c.imageUrl ? (
                    <Image source={{ uri: c.imageUrl }} style={styles.communityAvatar} />
                  ) : (
                    <View style={styles.communityAvatarPlaceholder}>
                      <Ionicons name="people" size={24} color="#9ca3af" />
                    </View>
                  )}
                  <View style={styles.communityInfo}>
                    <View style={styles.communityTitleRow}>
                      <Text style={[styles.communityName, { color: colors.text }]} numberOfLines={1}>
                        {c.name}
                      </Text>
                      <View
                        style={[
                          styles.visibilityBadge,
                          {
                            backgroundColor:
                              c.visibility === 'private' ? '#fef3c7' : '#dbeafe',
                          },
                        ]}
                      >
                        <Ionicons
                          name={c.visibility === 'private' ? 'lock-closed' : 'globe'}
                          size={10}
                          color={c.visibility === 'private' ? '#92400e' : '#1e40af'}
                        />
                      </View>
                    </View>
                    <Text style={styles.memberCount}>
                      {c.memberCount} {c.memberCount === 1 ? 'member' : 'members'} · {c.category}
                    </Text>
                    {c.tags && c.tags.length > 0 && (
                      <View style={styles.tagsRow}>
                        {c.tags.slice(0, 3).map((tag, index) => (
                          <View key={index} style={styles.tag}>
                            <Text style={styles.tagText}>{tag}</Text>
                          </View>
                        ))}
                        {c.tags.length > 3 && (
                          <Text style={styles.moreTagsText}>+{c.tags.length - 3}</Text>
                        )}
                      </View>
                    )}
                  </View>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.joinButton,
                  {
                    backgroundColor: c.isJoined ? '#fff' : '#0A66C2',
                    borderColor: c.isJoined ? '#0A66C2' : 'transparent',
                    borderWidth: c.isJoined ? 1 : 0,
                  },
                ]}
                onPress={() => (c.isJoined ? leaveCommunity(c.id) : joinCommunity(c.id))}
              >
                <Text
                  style={[
                    styles.joinButtonText,
                    { color: c.isJoined ? '#0A66C2' : '#fff' },
                  ]}
                >
                  {c.isJoined ? 'Joined' : 'Join'}
                </Text>
              </TouchableOpacity>
            </View>
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
  createButton: {
    padding: 4,
  },
  searchContainer: {
    backgroundColor: '#ffffff',
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
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 15,
    color: '#111827',
  },
  categoryScroll: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  categoryContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  categoryChipActive: {
    backgroundColor: '#e0f2fe',
    borderColor: '#0A66C2',
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6b7280',
  },
  categoryTextActive: {
    color: '#0A66C2',
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
  communityItem: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  communityCard: {
    padding: 16,
  },
  communityHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  communityAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    marginRight: 12,
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
  emptyContainer: {
    paddingVertical: 48,
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  emptyTitle: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: '600',
  },
  emptySubtitle: {
    marginTop: 8,
    fontSize: 14,
    textAlign: 'center',
    color: '#6b7280',
  },
  loadingContainer: {
    paddingVertical: 48,
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 15,
    fontWeight: '500',
  },
});

export default CommunitiesScreen;

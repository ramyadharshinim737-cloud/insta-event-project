// Network Hook - All async logic centralized here
// UI components should use this hook, not call API directly

import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { networkAPI } from '../services/network.http';
import {
  NetworkUser,
  Community,
  ConnectionRequest,
  NetworkStats,
  SearchFilters,
} from '../types/network.types';

const STORAGE_KEYS = {
  SUGGESTIONS: '@network_suggestions',
  REQUESTS: '@network_requests',
  COMMUNITIES: '@network_communities',
  STATS: '@network_stats',
};

export const useNetwork = () => {
  const [suggestions, setSuggestions] = useState<NetworkUser[]>([]);
  const [searchResults, setSearchResults] = useState<NetworkUser[]>([]);
  const [communities, setCommunities] = useState<Community[]>([]);
  const [requests, setRequests] = useState<ConnectionRequest[]>([]);
  const [connections, setConnections] = useState<NetworkUser[]>([]);
  const [followers, setFollowers] = useState<NetworkUser[]>([]);
  const [following, setFollowing] = useState<NetworkUser[]>([]);
  const [stats, setStats] = useState<NetworkStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [initialized, setInitialized] = useState(false);

  // Persistence helpers
  const saveSuggestions = async (data: NetworkUser[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.SUGGESTIONS, JSON.stringify(data));
    } catch (err) {
      console.error('Failed to save suggestions:', err);
    }
  };

  const saveRequests = async (data: ConnectionRequest[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.REQUESTS, JSON.stringify(data));
    } catch (err) {
      console.error('Failed to save requests:', err);
    }
  };

  const saveCommunities = async (data: Community[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.COMMUNITIES, JSON.stringify(data));
    } catch (err) {
      console.error('Failed to save communities:', err);
    }
  };

  const saveStats = async (data: NetworkStats) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.STATS, JSON.stringify(data));
    } catch (err) {
      console.error('Failed to save stats:', err);
    }
  };

  // Load persisted data on mount
  useEffect(() => {
    const loadPersistedData = async () => {
      try {
        const [savedSuggestions, savedRequests, savedCommunities, savedStats] = await Promise.all([
          AsyncStorage.getItem(STORAGE_KEYS.SUGGESTIONS),
          AsyncStorage.getItem(STORAGE_KEYS.REQUESTS),
          AsyncStorage.getItem(STORAGE_KEYS.COMMUNITIES),
          AsyncStorage.getItem(STORAGE_KEYS.STATS),
        ]);

        if (savedSuggestions) setSuggestions(JSON.parse(savedSuggestions));
        if (savedRequests) setRequests(JSON.parse(savedRequests));
        if (savedCommunities) setCommunities(JSON.parse(savedCommunities));
        if (savedStats) setStats(JSON.parse(savedStats));
        
        setInitialized(true);
      } catch (err) {
        console.error('Failed to load persisted data:', err);
        setInitialized(true);
      }
    };

    loadPersistedData();
  }, []);

  // Load connections list
  const loadConnections = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await networkAPI.getConnections();
      setConnections(response.users);
    } catch (err) {
      setError('Failed to load connections');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load followers list
  const loadFollowers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await networkAPI.getFollowers();
      setFollowers(response.users);
    } catch (err) {
      setError('Failed to load followers');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load following list
  const loadFollowing = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await networkAPI.getFollowing();
      setFollowing(response.users);
    } catch (err) {
      setError('Failed to load following');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load suggestions
  const loadSuggestions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await networkAPI.getSuggestions();
      setSuggestions(response.users);
      await saveSuggestions(response.users);
    } catch (err) {
      setError('Failed to load suggestions');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Search users
  const searchUsers = useCallback(async (query: string, filters?: SearchFilters) => {
    try {
      setLoading(true);
      setError(null);
      const response = await networkAPI.searchUsers(query, filters);
      setSearchResults(response.users);
    } catch (err) {
      setError('Search failed');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Send connection request
  const sendConnectionRequest = useCallback(async (userId: string, message?: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await networkAPI.sendConnectionRequest({ userId, message });
      
      if (response.success) {
        // Update local state: outgoing request from current user
        setSuggestions(prev =>
          prev.map(u => (u.id === userId ? { ...u, connectionStatus: 'requested' } : u))
        );
        setSearchResults(prev =>
          prev.map(u => (u.id === userId ? { ...u, connectionStatus: 'requested' } : u))
        );
      }
      
      return response;
    } catch (err) {
      setError('Failed to send connection request');
      console.error(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Accept connection request
  const acceptRequest = useCallback(async (requestId: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await networkAPI.respondToRequest({ requestId, action: 'accept' });
      
      if (response.success) {
        // Find the request to get the user
        const request = requests.find(r => r.id === requestId);
        
        // Remove from requests
        const updatedRequests = requests.filter(r => r.id !== requestId);
        setRequests(updatedRequests);
        await saveRequests(updatedRequests);
        
        // Update or add the user to suggestions with connected status
        if (request) {
          setSuggestions(prev => {
            const existingUserIndex = prev.findIndex(u => u.id === request.user.id);
            let updatedSuggestions: NetworkUser[];
            if (existingUserIndex >= 0) {
              // User exists, update their status
              updatedSuggestions = prev.map(u => 
                u.id === request.user.id ? { ...u, connectionStatus: 'connected' as const } : u
              );
            } else {
              // User doesn't exist, add them with connected status
              updatedSuggestions = [...prev, { ...request.user, connectionStatus: 'connected' as const }];
            }
            saveSuggestions(updatedSuggestions);
            return updatedSuggestions;
          });
          
          setSearchResults(prev => {
            const existingUserIndex = prev.findIndex(u => u.id === request.user.id);
            if (existingUserIndex >= 0) {
              return prev.map(u => 
                u.id === request.user.id ? { ...u, connectionStatus: 'connected' } : u
              );
            } else {
              return [...prev, { ...request.user, connectionStatus: 'connected' }];
            }
          });
        }
        
        // Reload stats to update connection count
        const statsResponse = await networkAPI.getNetworkStats();
        setStats(statsResponse);
        await saveStats(statsResponse);

        // Refresh connections list to include the new connection
        await loadConnections();
      }
      
      return response;
    } catch (err) {
      setError('Failed to accept request');
      console.error(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [requests, loadConnections]);

  // Reject connection request
  const rejectRequest = useCallback(async (requestId: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await networkAPI.respondToRequest({ requestId, action: 'reject' });
      
      if (response.success) {
        const updatedRequests = requests.filter(r => r.id !== requestId);
        setRequests(updatedRequests);
        await saveRequests(updatedRequests);
        
        // Update stats to reflect decreased pending count
        const statsResponse = await networkAPI.getNetworkStats();
        setStats(statsResponse);
        await saveStats(statsResponse);
      }
      
      return response;
    } catch (err) {
      setError('Failed to reject request');
      console.error(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [requests]);

  // Remove connection
  const removeConnection = useCallback(async (userId: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await networkAPI.removeConnection(userId);
      
      if (response.success) {
        setSuggestions(prev =>
          prev.map(u => (u.id === userId ? { ...u, connectionStatus: 'none' } : u))
        );
        setSearchResults(prev =>
          prev.map(u => (u.id === userId ? { ...u, connectionStatus: 'none' } : u))
        );
        await loadConnections();
        loadNetworkStats();
      }
      
      return response;
    } catch (err) {
      setError('Failed to remove connection');
      console.error(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Load communities
  const loadCommunities = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await networkAPI.getCommunities();
      setCommunities(response.communities);
      await saveCommunities(response.communities);
    } catch (err) {
      setError('Failed to load communities');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Join community
  const joinCommunity = useCallback(async (communityId: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await networkAPI.joinCommunity(communityId);
      
      // Reload communities from backend to get accurate isJoined status
      await loadCommunities();
      
      return response;
    } catch (err) {
      setError('Failed to join community');
      console.error(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Leave community
  const leaveCommunity = useCallback(async (communityId: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await networkAPI.leaveCommunity(communityId);
      
      // Reload communities from backend to get accurate isJoined status
      await loadCommunities();
      
      return response;
    } catch (err) {
      setError('Failed to leave community');
      console.error(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Check messaging permission
  const checkMessagingPermission = useCallback(async (userId: string) => {
    try {
      const response = await networkAPI.checkMessagingPermission(userId);
      return response;
    } catch (err) {
      console.error(err);
      return { canMessage: false, reason: 'Permission check failed' };
    }
  }, []);

  // Get network stats for a specific user
  const getUserStats = useCallback(async (userId: string) => {
    try {
      const response = await networkAPI.getUserStats(userId);
      return response;
    } catch (err) {
      console.error('Failed to load user stats', err);
      return null;
    }
  }, []);

  // Load connection requests
  const loadConnectionRequests = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await networkAPI.getConnectionRequests();
      setRequests(response.requests);
    } catch (err) {
      setError('Failed to load requests');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Follow user
  const followUser = useCallback(async (userId: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await networkAPI.followUser(userId);
      
      if (response.success) {
        // Update local state
        setSuggestions(prev =>
          prev.map(u => {
            if (u.id === userId) {
              const newFollowStatus = u.followStatus === 'followed_by' ? 'mutual' : 'following';
              return { ...u, followStatus: newFollowStatus };
            }
            return u;
          })
        );
        setSearchResults(prev =>
          prev.map(u => {
            if (u.id === userId) {
              const newFollowStatus = u.followStatus === 'followed_by' ? 'mutual' : 'following';
              return { ...u, followStatus: newFollowStatus };
            }
            return u;
          })
        );
        
        // Reload stats
        const statsResponse = await networkAPI.getNetworkStats();
        setStats(statsResponse);

        // Refresh followers/following lists
        await loadFollowers();
        await loadFollowing();
      }
      
      return response;
    } catch (err) {
      setError('Failed to follow user');
      console.error(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Unfollow user
  const unfollowUser = useCallback(async (userId: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await networkAPI.unfollowUser(userId);
      
      if (response.success) {
        // Update local state
        setSuggestions(prev =>
          prev.map(u => {
            if (u.id === userId) {
              const newFollowStatus = u.followStatus === 'mutual' ? 'followed_by' : 'not_following';
              return { ...u, followStatus: newFollowStatus };
            }
            return u;
          })
        );
        setSearchResults(prev =>
          prev.map(u => {
            if (u.id === userId) {
              const newFollowStatus = u.followStatus === 'mutual' ? 'followed_by' : 'not_following';
              return { ...u, followStatus: newFollowStatus };
            }
            return u;
          })
        );
        
        // Reload stats
        const statsResponse = await networkAPI.getNetworkStats();
        setStats(statsResponse);
      }
      
      return response;
    } catch (err) {
      setError('Failed to unfollow user');
      console.error(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Block user
  const blockUser = useCallback(
    async (userId: string) => {
      try {
        setLoading(true);
        setError(null);
        const response = await networkAPI.blockUser(userId);

        if (response.success) {
          // Remove from suggestions and search results immediately
          setSuggestions(prev => prev.filter(u => u.id !== userId));
          setSearchResults(prev => prev.filter(u => u.id !== userId));

          // Refresh connections/followers/following and stats to reflect the block
          await loadConnections();
          await loadFollowers();
          await loadFollowing();
          const statsResponse = await networkAPI.getNetworkStats();
          setStats(statsResponse);
        }

        return response;
      } catch (err) {
        setError('Failed to block user');
        console.error(err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [loadConnections, loadFollowers, loadFollowing]
  );

  // Unblock user
  const unblockUser = useCallback(async (userId: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await networkAPI.unblockUser(userId);
      
      if (response.success) {
        // Reload suggestions to show unblocked user
        await loadSuggestions();
      }
      
      return response;
    } catch (err) {
      setError('Failed to unblock user');
      console.error(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [loadSuggestions]);

  // Load network stats
  const loadNetworkStats = useCallback(async () => {
    try {
      const response = await networkAPI.getNetworkStats();
      setStats(response);
    } catch (err) {
      console.error(err);
    }
  }, []);

  // Initial load
  useEffect(() => {
    loadSuggestions();
    loadCommunities();
    loadConnectionRequests();
    loadNetworkStats();
    loadConnections();
    loadFollowers();
    loadFollowing();
  }, [
    loadSuggestions,
    loadCommunities,
    loadConnectionRequests,
    loadNetworkStats,
    loadConnections,
    loadFollowers,
    loadFollowing,
  ]);

  return {
    // State
    suggestions,
    searchResults,
    communities,
    requests,
    connections,
    followers,
    following,
    stats,
    loading,
    error,
    
    // Actions
    searchUsers,
    sendConnectionRequest,
    acceptRequest,
    rejectRequest,
    removeConnection,
    followUser,
    unfollowUser,
    blockUser,
    unblockUser,
    joinCommunity,
    leaveCommunity,
    checkMessagingPermission,
    getUserStats,
    loadSuggestions,
    loadCommunities,
    loadConnectionRequests,
    loadConnections,
    loadFollowers,
    loadFollowing,
  };
};

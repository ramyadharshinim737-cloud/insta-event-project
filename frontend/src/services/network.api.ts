// API Contract Definitions
// Backend developers should implement these endpoints

import {
  SuggestionsResponse,
  SearchResponse,
  ConnectResponse,
  ConnectionActionResponse,
  CommunitiesResponse,
  CommunityActionResponse,
  PermissionsResponse,
  FollowResponse,
  BlockResponse,
  SearchFilters,
  ConnectRequest,
  ConnectionResponse,
  NetworkStats,
} from '../types/network.types';

/**
 * Network API Interface
 * All methods return Promises to support async operations
 * Backend should implement these exact signatures
 */
export interface NetworkAPI {
  /**
   * GET /network/suggestions
   * Returns suggested users for networking
   */
  getSuggestions(): Promise<SuggestionsResponse>;

  /**
   * GET /network/connections
   * Get all connections for current user
   */
  getConnections(): Promise<SuggestionsResponse>;

  /**
   * GET /network/followers
   * Get all followers of current user
   */
  getFollowers(): Promise<SuggestionsResponse>;

  /**
   * GET /network/following
   * Get all users the current user is following
   */
  getFollowing(): Promise<SuggestionsResponse>;

  /**
   * GET /network/search?query={query}&filters={filters}
   * Search users by name, organization, or skills
   */
  searchUsers(query: string, filters?: SearchFilters): Promise<SearchResponse>;

  /**
   * POST /network/connect
   * Send connection request to a user
   */
  sendConnectionRequest(request: ConnectRequest): Promise<ConnectResponse>;

  /**
   * POST /network/respond
   * Accept or reject a connection request
   */
  respondToRequest(response: ConnectionResponse): Promise<ConnectionActionResponse>;

  /**
   * DELETE /network/connection/{userId}
   * Remove an existing connection
   */
  removeConnection(userId: string): Promise<ConnectionActionResponse>;

  /**
   * GET /network/communities
   * Get list of communities
   */
  getCommunities(): Promise<CommunitiesResponse>;

  /**
   * POST /network/community
   * Create a new community
   */
  createCommunity(data: any): Promise<CommunityActionResponse>;

  /**
   * GET /network/community/:id
   * Get community details
   */
  getCommunityDetail(communityId: string): Promise<{ community: any }>;

  /**
   * PUT /network/community/:id
   * Update community (admin only)
   */
  updateCommunity(communityId: string, data: any): Promise<CommunityActionResponse>;

  /**
   * DELETE /network/community/:id
   * Delete community (creator only)
   */
  deleteCommunity(communityId: string): Promise<CommunityActionResponse>;

  /**
   * POST /network/community/join
   * Join a community
   */
  joinCommunity(communityId: string): Promise<CommunityActionResponse>;

  /**
   * POST /network/community/leave
   * Leave a community
   */
  leaveCommunity(communityId: string): Promise<CommunityActionResponse>;

  /**
   * GET /network/community/:id/members
   * Get community members
   */
  getCommunityMembers(communityId: string, status?: string): Promise<{ members: any[] }>;

  /**
   * PUT /network/community/:id/member/:memberId/role
   * Update member role (admin only)
   */
  updateMemberRole(communityId: string, memberId: string, role: string): Promise<CommunityActionResponse>;

  /**
   * DELETE /network/community/:id/member/:memberId
   * Remove member from community (admin/moderator)
   */
  removeMember(communityId: string, memberId: string): Promise<CommunityActionResponse>;

  /**
   * POST /network/community/:id/approve/:memberId
   * Approve join request (admin/moderator)
   */
  approveJoinRequest(communityId: string, memberId: string): Promise<CommunityActionResponse>;

  /**
   * POST /network/community/:id/reject/:memberId
   * Reject join request (admin/moderator)
   */
  rejectJoinRequest(communityId: string, memberId: string): Promise<CommunityActionResponse>;

  /**
   * GET /network/permissions/{userId}
   * Check if current user can message another user
   */
  checkMessagingPermission(userId: string): Promise<PermissionsResponse>;

  /**
   * GET /network/requests
   * Get pending connection requests
   */
  getConnectionRequests(): Promise<{ requests: any[] }>;

  /**
   * POST /follows/{userId}
   * Follow a user (one-way relationship)
   */
  followUser(userId: string): Promise<FollowResponse>;

  /**
   * DELETE /follows/{userId}
   * Unfollow a user
   */
  unfollowUser(userId: string): Promise<FollowResponse>;

  /**
   * POST /connections/block
   * Block a user (prevents all interactions)
   */
  blockUser(userId: string): Promise<BlockResponse>;

  /**
   * DELETE /connections/block/{userId}
   * Unblock a user
   */
  unblockUser(userId: string): Promise<BlockResponse>;

  /**
   * GET /network/stats
   * Get user's network statistics
   */
  getNetworkStats(): Promise<NetworkStats>;

  /**
   * GET /network/stats/{userId}
   * Get network statistics for a specific user
   */
  getUserStats(userId: string): Promise<NetworkStats>;
}

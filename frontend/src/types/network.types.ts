// Shared types for the Network feature

export type ConnectionStatus =
  | 'none'
  | 'requested'
  | 'pending'
  | 'connected'
  | 'blocked';

export type FollowStatus =
  | 'not_following'
  | 'following'
  | 'followed_by'
  | 'mutual';

export interface NetworkUser {
  id: string;
  name: string;
  role: string;
  organization: string;
  skills: string[];
  avatarUrl?: string;
  location?: string;
  bio?: string;
  connectionStatus: ConnectionStatus | 'none';
  followStatus?: FollowStatus;
}

export interface Community {
  id: string;
  name: string;
  category?: string;
  description?: string;
  visibility: 'public' | 'private';
  tags: string[];
  rules?: string;
  imageUrl?: string;
  coverImageUrl?: string;
  memberCount: number;
  isJoined: boolean;
  userRole?: 'member' | 'moderator' | 'admin';
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface CommunityMember {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  userAvatarUrl?: string;
  role: 'member' | 'moderator' | 'admin';
  status: 'active' | 'pending' | 'banned';
  joinedAt: string;
}

export interface CreateCommunityData {
  name: string;
  description?: string;
  category?: string;
  visibility?: 'public' | 'private';
  tags?: string[];
  rules?: string;
  imageUrl?: string;
  coverImageUrl?: string;
}

export interface UpdateCommunityData {
  name?: string;
  description?: string;
  category?: string;
  visibility?: 'public' | 'private';
  tags?: string[];
  rules?: string;
  imageUrl?: string;
  coverImageUrl?: string;
}

export interface ConnectionRequest {
  id: string;
  user: NetworkUser;
  timestamp: string;
  message?: string;
}

export interface NetworkStats {
  connectionsCount: number;
  followersCount: number;
  followingCount: number;
  pendingRequestsCount: number;
}

export interface SuggestionsResponse {
  users: NetworkUser[];
  total: number;
}

export interface SearchResponse {
  users: NetworkUser[];
  total: number;
}

export interface ConnectResponse {
  success: boolean;
  requestId?: string;
  message: string;
}

export interface ConnectionActionResponse {
  success: boolean;
  message: string;
}

export interface CommunitiesResponse {
  communities: Community[];
  total: number;
}

export interface CommunityActionResponse {
  success: boolean;
  message: string;
  requiresApproval?: boolean;
  community?: Community;
}

export interface PermissionsResponse {
  canMessage: boolean;
  reason?: string;
}

export interface FollowResponse {
  success: boolean;
  message: string;
}

export interface BlockResponse {
  success: boolean;
  message: string;
}

export interface SearchFilters {
  role?: string;
  location?: string;
  skills?: string[];
}

export interface ConnectRequest {
  userId: string;
  message?: string;
}

export interface ConnectionResponse {
  requestId: string;
  action: 'accept' | 'reject';
}

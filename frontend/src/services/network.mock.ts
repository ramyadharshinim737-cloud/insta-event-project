// Mock Implementation of Network API
// This allows frontend to work standalone without backend

import {
  NetworkAPI,
} from './network.api';
import {
  NetworkUser,
  Community,
  ConnectionRequest,
  NetworkStats,
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
  ConnectRequest as ConnectReq,
  ConnectionResponse as ConnResp,
} from '../types/network.types';

// Mock Data Store
let mockUsers: NetworkUser[] = [
  {
    id: '1',
    name: 'Sarah Johnson',
    role: 'faculty',
    organization: 'MIT',
    skills: ['Machine Learning', 'Data Science', 'Python'],
    avatarUrl: undefined,
    connectionStatus: 'none',
    location: 'Boston, MA',
    bio: 'Professor of Computer Science',
  },
  {
    id: '2',
    name: 'Michael Chen',
    role: 'student',
    organization: 'Stanford University',
    skills: ['Web Development', 'React', 'TypeScript'],
    avatarUrl: undefined,
    connectionStatus: 'connected',
    location: 'Palo Alto, CA',
    bio: 'CS Graduate Student',
  },
  {
    id: '3',
    name: 'Emily Rodriguez',
    role: 'organizer',
    organization: 'TechConf',
    skills: ['Event Planning', 'Marketing', 'Community Building'],
    avatarUrl: undefined,
    connectionStatus: 'pending',
    location: 'San Francisco, CA',
    bio: 'Tech Event Organizer',
  },
  {
    id: '4',
    name: 'David Kim',
    role: 'faculty',
    organization: 'Harvard University',
    skills: ['AI Research', 'Neural Networks', 'TensorFlow'],
    avatarUrl: undefined,
    connectionStatus: 'none',
    location: 'Cambridge, MA',
    bio: 'AI Research Professor',
  },
  {
    id: '5',
    name: 'Lisa Wang',
    role: 'student',
    organization: 'UC Berkeley',
    skills: ['Mobile Development', 'React Native', 'Swift'],
    avatarUrl: undefined,
    connectionStatus: 'none',
    location: 'Berkeley, CA',
    bio: 'Mobile App Developer',
  },
];

let mockCommunities: Community[] = [
  {
    id: 'c1',
    name: 'AI Researchers',
    category: 'Research',
    memberCount: 1250,
    isJoined: false,
    description: 'Community for AI and ML researchers',
  },
  {
    id: 'c2',
    name: 'Web Developers',
    category: 'Technology',
    memberCount: 3400,
    isJoined: true,
    description: 'Frontend and backend web development',
  },
  {
    id: 'c3',
    name: 'Event Organizers',
    category: 'Professional',
    memberCount: 890,
    isJoined: false,
    description: 'Tech event planning and networking',
  },
  {
    id: 'c4',
    name: 'Alumni Network',
    category: 'Alumni',
    memberCount: 5600,
    isJoined: true,
    description: 'Connect with fellow alumni',
  },
];

let mockRequests: ConnectionRequest[] = [
  {
    id: 'r1',
    user: {
      id: '101',
      name: 'Priya Sharma',
      role: 'student',
      organization: 'IIT Bombay',
      skills: ['React', 'Node.js', 'MongoDB'],
      connectionStatus: 'none',
      location: 'Mumbai, India',
      bio: 'Full Stack Developer',
    },
    timestamp: '2024-01-15T10:30:00Z',
    message: 'Hi! I saw your profile and would love to connect!',
  },
  {
    id: 'r2',
    user: {
      id: '102',
      name: 'Rahul Singh',
      role: 'faculty',
      organization: 'IIT Delhi',
      skills: ['AI', 'Machine Learning', 'Python'],
      connectionStatus: 'none',
      location: 'Delhi, India',
      bio: 'AI Research Professor',
    },
    timestamp: '2024-01-14T15:20:00Z',
    message: 'Looking forward to connecting with you!',
  },
  {
    id: 'r3',
    user: {
      id: '103',
      name: 'Ananya Patel',
      role: 'organizer',
      organization: 'TechSummit India',
      skills: ['Event Management', 'Marketing', 'Networking'],
      connectionStatus: 'none',
      location: 'Bangalore, India',
      bio: 'Tech Event Organizer',
    },
    timestamp: '2024-01-14T09:45:00Z',
    message: 'Would love to collaborate on upcoming tech events!',
  },
  {
    id: 'r4',
    user: {
      id: '104',
      name: 'Vikram Mehta',
      role: 'student',
      organization: 'BITS Pilani',
      skills: ['Flutter', 'Dart', 'Firebase'],
      connectionStatus: 'none',
      location: 'Pilani, India',
      bio: 'Mobile App Developer',
    },
    timestamp: '2024-01-13T18:10:00Z',
    message: 'Hey! Let\'s connect and share knowledge!',
  },
  {
    id: 'r5',
    user: {
      id: '105',
      name: 'Sneha Reddy',
      role: 'faculty',
      organization: 'NIT Trichy',
      skills: ['Data Science', 'Analytics', 'R'],
      connectionStatus: 'none',
      location: 'Trichy, India',
      bio: 'Data Science Professor',
    },
    timestamp: '2024-01-13T12:30:00Z',
    message: 'Interested in your work. Let\'s connect!',
  },
];

// Track followers count separately
let followersCount = 0;

// Track sent connection requests (userId -> targetUserId[])
// This tracks who the current user has sent requests to
let sentRequests: Set<string> = new Set();

// Track accepted connections from current user's side (userId -> Set of userIds)
// When user accepts someone's request, add them here
let acceptedFromMe: Set<string> = new Set();

// Track mutual connections (both users accepted each other)
let mutualConnections: Set<string> = new Set();

// Simulate network delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export class MockNetworkAPI implements NetworkAPI {
  async getSuggestions(): Promise<SuggestionsResponse> {
    await delay(500);
    return {
      users: mockUsers.filter(u => u.connectionStatus === 'none'),
      total: mockUsers.filter(u => u.connectionStatus === 'none').length,
    };
  }

  async searchUsers(query: string, filters?: SearchFilters): Promise<SearchResponse> {
    await delay(300);
    
    let results = [...mockUsers];
    
    // Filter by query
    if (query) {
      const lowerQuery = query.toLowerCase();
      results = results.filter(
        u =>
          u.name.toLowerCase().includes(lowerQuery) ||
          u.organization.toLowerCase().includes(lowerQuery) ||
          u.skills.some(s => s.toLowerCase().includes(lowerQuery))
      );
    }
    
    // Apply filters
    if (filters?.role) {
      results = results.filter(u => u.role === filters.role);
    }
    
    if (filters?.location) {
      results = results.filter(u => u.location?.includes(filters.location!));
    }
    
    if (filters?.skills && filters.skills.length > 0) {
      results = results.filter(u =>
        filters.skills!.some(skill => u.skills.includes(skill))
      );
    }
    
    return {
      users: results,
      total: results.length,
    };
  }

  async sendConnectionRequest(request: ConnectReq): Promise<ConnectResponse> {
    await delay(400);
    
    const user = mockUsers.find(u => u.id === request.userId);
    if (user) {
      user.connectionStatus = 'pending';
      // Track that we sent a request to this user
      sentRequests.add(request.userId);
    }
    
    return {
      success: true,
      requestId: `req_${Date.now()}`,
      message: 'Connection request sent successfully',
    };
  }

  async respondToRequest(response: ConnResp): Promise<ConnectionActionResponse> {
    await delay(400);
    
    if (response.action === 'accept') {
      const request = mockRequests.find(r => r.id === response.requestId);
      if (request) {
        const requesterId = request.user.id;
        
        // Mark that we accepted this user's request
        acceptedFromMe.add(requesterId);
        
        // Check if this is a mutual connection
        // Mutual = They sent us a request (which we're accepting) AND we also sent them a request
        const isMutual = sentRequests.has(requesterId);
        
        if (isMutual) {
          // Both users accepted each other - this is a mutual connection
          request.user.connectionStatus = 'connected';
          mutualConnections.add(requesterId);
        } else {
          // Only one-way acceptance - they become a follower but not a connection
          request.user.connectionStatus = 'none'; // Keep as none until mutual
        }
        
        // Add to mockUsers if not already there
        const existingUser = mockUsers.find(u => u.id === requesterId);
        if (!existingUser) {
          mockUsers.push({ 
            ...request.user, 
            connectionStatus: isMutual ? 'connected' : 'none' 
          });
        } else {
          existingUser.connectionStatus = isMutual ? 'connected' : 'none';
        }
        
        // Increment followers count when accepting a request
        followersCount++;
        
        // Remove from requests
        mockRequests = mockRequests.filter(r => r.id !== response.requestId);
      }
      return {
        success: true,
        message: 'Connection request accepted',
      };
    } else {
      mockRequests = mockRequests.filter(r => r.id !== response.requestId);
      return {
        success: true,
        message: 'Connection request rejected',
      };
    }
  }

  async removeConnection(userId: string): Promise<ConnectionActionResponse> {
    await delay(400);
    
    const user = mockUsers.find(u => u.id === userId);
    if (user) {
      user.connectionStatus = 'none';
      
      // Remove from mutual connections if exists
      mutualConnections.delete(userId);
      
      // Remove from tracking sets
      acceptedFromMe.delete(userId);
      sentRequests.delete(userId);
      
      // Decrement followers count when removing a connection
      if (followersCount > 0) {
        followersCount--;
      }
    }
    
    return {
      success: true,
      message: 'Connection removed successfully',
    };
  }

  async getCommunities(): Promise<CommunitiesResponse> {
    await delay(500);
    return {
      communities: mockCommunities,
      total: mockCommunities.length,
    };
  }

  async joinCommunity(communityId: string): Promise<CommunityActionResponse> {
    await delay(400);
    
    const community = mockCommunities.find(c => c.id === communityId);
    if (community) {
      community.isJoined = true;
      community.memberCount += 1;
    }
    
    return {
      success: true,
      message: 'Successfully joined community',
    };
  }

  async leaveCommunity(communityId: string): Promise<CommunityActionResponse> {
    await delay(400);
    
    const community = mockCommunities.find(c => c.id === communityId);
    if (community) {
      community.isJoined = false;
      community.memberCount -= 1;
    }
    
    return {
      success: true,
      message: 'Successfully left community',
    };
  }

  async checkMessagingPermission(userId: string): Promise<PermissionsResponse> {
    await delay(200);
    
    const user = mockUsers.find(u => u.id === userId);
    if (!user) {
      return {
        canMessage: false,
        reason: 'User not found',
      };
    }
    
    if (user.connectionStatus !== 'connected') {
      return {
        canMessage: false,
        reason: 'You must be connected to message this user',
      };
    }
    
    return {
      canMessage: true,
    };
  }

  async getConnectionRequests() {
    await delay(300);
    return {
      requests: mockRequests,
    };
  }

  async followUser(userId: string): Promise<FollowResponse> {
    await delay(400);
    
    const user = mockUsers.find(u => u.id === userId);
    if (user) {
      // Update follow status
      if (user.followStatus === 'followed_by') {
        user.followStatus = 'mutual';
      } else {
        user.followStatus = 'following';
      }
    }
    
    return {
      success: true,
      message: 'User followed successfully',
    };
  }

  async unfollowUser(userId: string): Promise<FollowResponse> {
    await delay(400);
    
    const user = mockUsers.find(u => u.id === userId);
    if (user) {
      // Update follow status
      if (user.followStatus === 'mutual') {
        user.followStatus = 'followed_by';
      } else {
        user.followStatus = 'not_following';
      }
    }
    
    return {
      success: true,
      message: 'User unfollowed successfully',
    };
  }

  async blockUser(userId: string): Promise<BlockResponse> {
    await delay(400);
    
    const user = mockUsers.find(u => u.id === userId);
    if (user) {
      user.connectionStatus = 'blocked';
      user.followStatus = 'not_following';
    }
    
    return {
      success: true,
      message: 'User blocked successfully',
    };
  }

  async unblockUser(userId: string): Promise<BlockResponse> {
    await delay(400);
    
    const user = mockUsers.find(u => u.id === userId);
    if (user) {
      user.connectionStatus = 'none';
    }
    
    return {
      success: true,
      message: 'User unblocked successfully',
    };
  }

  async getNetworkStats() {
    await delay(300);
    
    // Calculate real counts from data
    // Connections = only mutual connections (both users accepted each other)
    const connectionsCount = mutualConnections.size;
    const pendingRequestsCount = mockRequests.length;
    
    return {
      connectionsCount,
      followersCount, // Use the tracked followers count
      followingCount: 123, // Keep this static for now
      pendingRequestsCount,
    };
  }
}

// Export singleton instance
export const networkAPI = new MockNetworkAPI();

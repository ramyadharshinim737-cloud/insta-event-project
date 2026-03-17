// Network service - business logic for connections, follows, communities
import { Types } from "mongoose";
import { User } from "../users/user.model";
import { UserProfile } from "../users/profile.model";
import { Connection } from "./connection.model";
import { ConnectionRequest } from "./connection-request.model";
import { Follow } from "./follow.model";
import { Block } from "./block.model";
import { Community } from "./community.model";
import { CommunityMember } from "./community-member.model";

// DTOs returned to frontend
export type ConnectionStatus =
  | "none"
  | "requested"
  | "pending"
  | "connected"
  | "blocked";

export type FollowStatus =
  | "not_following"
  | "following"
  | "followed_by"
  | "mutual";

export interface NetworkUserDTO {
  id: string;
  name: string;
  role: string;
  organization: string;
  skills: string[];
  avatarUrl?: string;
  location?: string;
  bio?: string;
  connectionStatus: ConnectionStatus;
  followStatus: FollowStatus;
}

export interface CommunityDTO {
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

export interface CommunityMemberDTO {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  userAvatarUrl?: string;
  role: 'member' | 'moderator' | 'admin';
  status: 'active' | 'pending' | 'banned';
  joinedAt: string;
}

export interface ConnectionRequestDTO {
  id: string;
  user: NetworkUserDTO;
  timestamp: string;
  message?: string;
}

export interface NetworkStatsDTO {
  connectionsCount: number;
  followersCount: number;
  followingCount: number;
  pendingRequestsCount: number;
}

export class NetworkService {
  // Helper: compute connection + follow status between current user and target
  private static async getRelationshipStatus(
    currentUserId: Types.ObjectId,
    targetUserId: Types.ObjectId
  ): Promise<{ connectionStatus: ConnectionStatus; followStatus: FollowStatus }> {
    // Block check
    const block = await Block.findOne({
      userId: currentUserId,
      blockedUserId: targetUserId,
    });
    if (block) {
      return { connectionStatus: "blocked", followStatus: "not_following" };
    }

    // Connections
    const connection = await Connection.findOne({
      $or: [
        { user1Id: currentUserId, user2Id: targetUserId },
        { user1Id: targetUserId, user2Id: currentUserId },
      ],
    });

    // Pending requests
    const outgoingReq = await ConnectionRequest.findOne({
      fromUserId: currentUserId,
      toUserId: targetUserId,
      status: "pending",
    });

    const incomingReq = await ConnectionRequest.findOne({
      fromUserId: targetUserId,
      toUserId: currentUserId,
      status: "pending",
    });

    let connectionStatus: ConnectionStatus = "none";
    if (connection) {
      connectionStatus = "connected";
    } else if (outgoingReq) {
      connectionStatus = "requested";
    } else if (incomingReq) {
      connectionStatus = "pending";
    }

    // Follows
    const iFollow = await Follow.findOne({
      followerId: currentUserId,
      followingId: targetUserId,
    });
    const followsMe = await Follow.findOne({
      followerId: targetUserId,
      followingId: currentUserId,
    });

    let followStatus: FollowStatus = "not_following";
    if (iFollow && followsMe) {
      followStatus = "mutual";
    } else if (iFollow) {
      followStatus = "following";
    } else if (followsMe) {
      followStatus = "followed_by";
    }

    return { connectionStatus, followStatus };
  }

  // Helper: build NetworkUserDTO from User + Profile
  private static async buildNetworkUserDTO(
    currentUserId: Types.ObjectId,
    targetUserId: Types.ObjectId
  ): Promise<NetworkUserDTO | null> {
    const user = await User.findById(targetUserId);
    if (!user) return null;

    const profile = await UserProfile.findOne({ userId: targetUserId });
    const { connectionStatus, followStatus } = await this.getRelationshipStatus(
      currentUserId,
      targetUserId
    );

    // Derive basic fields from profile where possible
    const organization = profile?.university || "";
    const skills = profile?.skills || [];

    // For now, derive a simple role based on presence of university/year
    let role = "student";
    if (!profile?.university) {
      role = "member";
    }

    return {
      id: user._id.toString(),
      name: user.name,
      role,
      organization,
      skills,
      avatarUrl: profile?.profileImageUrl,
      location: undefined,
      bio: undefined,
      connectionStatus,
      followStatus,
    };
  }

  // Get suggested users (basic implementation: all other users)
  static async getSuggestions(currentUserId: string): Promise<{
    users: NetworkUserDTO[];
    total: number;
  }> {
    const currentId = new Types.ObjectId(currentUserId);

    const users = await User.find({ _id: { $ne: currentId } })
      .sort({ createdAt: -1 })
      .limit(50);

    const dtos: NetworkUserDTO[] = [];
    for (const u of users) {
      const dto = await this.buildNetworkUserDTO(currentId, u._id);
      if (dto) dtos.push(dto);
    }

    return { users: dtos, total: dtos.length };
  }

  // Search users by name/email/skills
  static async searchUsers(
    currentUserId: string,
    query: string,
    filters?: { role?: string; location?: string; skills?: string[] }
  ): Promise<{ users: NetworkUserDTO[]; total: number }> {
    const currentId = new Types.ObjectId(currentUserId);

    const regex = query ? new RegExp(query, "i") : null;

    const users = await User.find(
      regex
        ? {
            _id: { $ne: currentId },
            $or: [{ name: regex }, { email: regex }],
          }
        : { _id: { $ne: currentId } }
    ).limit(50);

    const dtos: NetworkUserDTO[] = [];
    for (const u of users) {
      const dto = await this.buildNetworkUserDTO(currentId, u._id);
      if (!dto) continue;

      // Basic skill filter using profile skills
      if (filters?.skills && filters.skills.length > 0) {
        const hasSkill = filters.skills.some((s) => dto.skills.includes(s));
        if (!hasSkill) continue;
      }

      dtos.push(dto);
    }

    return { users: dtos, total: dtos.length };
  }

  // Send connection request
  static async sendConnectionRequest(
    currentUserId: string,
    targetUserId: string,
    message?: string
  ): Promise<{ success: boolean; requestId: string; message: string }> {
    const fromId = new Types.ObjectId(currentUserId);
    const toId = new Types.ObjectId(targetUserId);

    if (fromId.equals(toId)) {
      throw new Error("Cannot connect to yourself");
    }

    // Check existing connection
    const existingConnection = await Connection.findOne({
      $or: [
        { user1Id: fromId, user2Id: toId },
        { user1Id: toId, user2Id: fromId },
      ],
    });
    if (existingConnection) {
      return {
        success: true,
        requestId: "",
        message: "Already connected",
      };
    }

    // Check existing pending request
    const existingReq = await ConnectionRequest.findOne({
      fromUserId: fromId,
      toUserId: toId,
      status: "pending",
    });
    if (existingReq) {
      return {
        success: true,
        requestId: existingReq._id.toString(),
        message: "Request already sent",
      };
    }

    const request = await ConnectionRequest.create({
      fromUserId: fromId,
      toUserId: toId,
      message,
      status: "pending",
    });

    return {
      success: true,
      requestId: request._id.toString(),
      message: "Connection request sent successfully",
    };
  }

  // Respond to connection request
  static async respondToRequest(
    currentUserId: string,
    requestId: string,
    action: "accept" | "reject"
  ): Promise<{ success: boolean; message: string }> {
    const reqDoc = await ConnectionRequest.findOne({
      _id: new Types.ObjectId(requestId),
      toUserId: new Types.ObjectId(currentUserId),
      status: "pending",
    });

    if (!reqDoc) {
      throw new Error("Request not found");
    }

    if (action === "accept") {
      reqDoc.status = "accepted";
      await reqDoc.save();

      const user1Id = reqDoc.fromUserId;
      const user2Id = reqDoc.toUserId;

      const [a, b] = [user1Id, user2Id].sort();
      await Connection.updateOne(
        { user1Id: a, user2Id: b },
        { $setOnInsert: { user1Id: a, user2Id: b, createdAt: new Date() } },
        { upsert: true }
      );

      return { success: true, message: "Connection request accepted" };
    } else {
      reqDoc.status = "rejected";
      await reqDoc.save();
      return { success: true, message: "Connection request rejected" };
    }
  }

  // Remove connection
  static async removeConnection(
    currentUserId: string,
    otherUserId: string
  ): Promise<{ success: boolean; message: string }> {
    const currentId = new Types.ObjectId(currentUserId);
    const otherId = new Types.ObjectId(otherUserId);

    await Connection.deleteOne({
      $or: [
        { user1Id: currentId, user2Id: otherId },
        { user1Id: otherId, user2Id: currentId },
      ],
    });

    return { success: true, message: "Connection removed successfully" };
  }

  // Get communities
  static async getCommunities(currentUserId: string): Promise<{
    communities: CommunityDTO[];
    total: number;
  }> {
    const currentId = new Types.ObjectId(currentUserId);

    const communities = await Community.find().sort({ name: 1 }).limit(50);

    const dtos: CommunityDTO[] = [];
    for (const c of communities) {
      const memberCount = await CommunityMember.countDocuments({
        communityId: c._id,
        status: 'active',
      });
      const membership = await CommunityMember.findOne({
        communityId: c._id,
        userId: currentId,
      });

      dtos.push({
        id: c._id.toString(),
        name: c.name,
        category: c.category,
        description: c.description,
        visibility: (c as any).visibility || 'public',
        tags: (c as any).tags || [],
        rules: (c as any).rules,
        imageUrl: (c as any).imageUrl,
        coverImageUrl: (c as any).coverImageUrl,
        memberCount,
        isJoined: !!membership && membership.status === 'active',
        userRole: membership?.role,
        createdBy: c.createdBy.toString(),
        createdAt: c.createdAt.toISOString(),
        updatedAt: (c as any).updatedAt?.toISOString() || c.createdAt.toISOString(),
      });
    }

    return { communities: dtos, total: dtos.length };
  }

  // Create a new community
  static async createCommunity(
    currentUserId: string,
    data: {
      name: string;
      description?: string;
      category?: string;
      visibility?: 'public' | 'private';
      tags?: string[];
      rules?: string;
      imageUrl?: string;
      coverImageUrl?: string;
    }
  ): Promise<CommunityDTO> {
    const currentId = new Types.ObjectId(currentUserId);

    // Create the community
    const community = await Community.create({
      name: data.name,
      description: data.description,
      category: data.category,
      visibility: data.visibility || 'public',
      tags: data.tags || [],
      rules: data.rules,
      imageUrl: data.imageUrl,
      coverImageUrl: data.coverImageUrl,
      createdBy: currentId,
    });

    // Add creator as admin
    await CommunityMember.create({
      communityId: community._id,
      userId: currentId,
      role: 'admin',
      status: 'active',
    });

    return {
      id: community._id.toString(),
      name: community.name,
      category: community.category,
      description: community.description,
      visibility: (community as any).visibility,
      tags: (community as any).tags,
      rules: (community as any).rules,
      imageUrl: (community as any).imageUrl,
      coverImageUrl: (community as any).coverImageUrl,
      memberCount: 1,
      isJoined: true,
      userRole: 'admin',
      createdBy: community.createdBy.toString(),
      createdAt: community.createdAt.toISOString(),
      updatedAt: (community as any).updatedAt?.toISOString() || community.createdAt.toISOString(),
    };
  }

  // Get community details
  static async getCommunityDetail(
    currentUserId: string,
    communityId: string
  ): Promise<CommunityDTO> {
    const currentId = new Types.ObjectId(currentUserId);
    const commId = new Types.ObjectId(communityId);

    const community = await Community.findById(commId);
    if (!community) {
      throw new Error('Community not found');
    }

    const memberCount = await CommunityMember.countDocuments({
      communityId: commId,
      status: 'active',
    });

    const membership = await CommunityMember.findOne({
      communityId: commId,
      userId: currentId,
    });

    return {
      id: community._id.toString(),
      name: community.name,
      category: community.category,
      description: community.description,
      visibility: (community as any).visibility,
      tags: (community as any).tags,
      rules: (community as any).rules,
      imageUrl: (community as any).imageUrl,
      coverImageUrl: (community as any).coverImageUrl,
      memberCount,
      isJoined: !!membership && membership.status === 'active',
      userRole: membership?.role,
      createdBy: community.createdBy.toString(),
      createdAt: community.createdAt.toISOString(),
      updatedAt: (community as any).updatedAt?.toISOString() || community.createdAt.toISOString(),
    };
  }

  // Update community
  static async updateCommunity(
    currentUserId: string,
    communityId: string,
    data: {
      name?: string;
      description?: string;
      category?: string;
      visibility?: 'public' | 'private';
      tags?: string[];
      rules?: string;
      imageUrl?: string;
      coverImageUrl?: string;
    }
  ): Promise<CommunityDTO> {
    const currentId = new Types.ObjectId(currentUserId);
    const commId = new Types.ObjectId(communityId);

    // Check if user is admin
    const membership = await CommunityMember.findOne({
      communityId: commId,
      userId: currentId,
      role: 'admin',
    });

    if (!membership) {
      throw new Error('Only admins can update community');
    }

    const community = await Community.findByIdAndUpdate(
      commId,
      { $set: { ...data, updatedAt: new Date() } },
      { new: true }
    );

    if (!community) {
      throw new Error('Community not found');
    }

    const memberCount = await CommunityMember.countDocuments({
      communityId: commId,
      status: 'active',
    });

    return {
      id: community._id.toString(),
      name: community.name,
      category: community.category,
      description: community.description,
      visibility: (community as any).visibility,
      tags: (community as any).tags,
      rules: (community as any).rules,
      imageUrl: (community as any).imageUrl,
      coverImageUrl: (community as any).coverImageUrl,
      memberCount,
      isJoined: true,
      userRole: 'admin',
      createdBy: community.createdBy.toString(),
      createdAt: community.createdAt.toISOString(),
      updatedAt: (community as any).updatedAt?.toISOString() || community.createdAt.toISOString(),
    };
  }

  // Delete community
  static async deleteCommunity(
    currentUserId: string,
    communityId: string
  ): Promise<{ success: boolean; message: string }> {
    const currentId = new Types.ObjectId(currentUserId);
    const commId = new Types.ObjectId(communityId);

    const community = await Community.findById(commId);
    if (!community) {
      throw new Error('Community not found');
    }

    // Check if user is the creator
    if (community.createdBy.toString() !== currentId.toString()) {
      throw new Error('Only the creator can delete the community');
    }

    // Delete all members
    await CommunityMember.deleteMany({ communityId: commId });

    // Delete community
    await Community.findByIdAndDelete(commId);

    return { success: true, message: 'Community deleted successfully' };
  }

  // Get community members
  static async getCommunityMembers(
    currentUserId: string,
    communityId: string,
    status?: 'active' | 'pending' | 'banned'
  ): Promise<CommunityMemberDTO[]> {
    const commId = new Types.ObjectId(communityId);

    const query: any = { communityId: commId };
    if (status) {
      query.status = status;
    }

    const members = await CommunityMember.find(query)
      .populate('userId', 'name email')
      .sort({ joinedAt: -1 });

    return members.map(m => ({
      id: m._id.toString(),
      userId: (m.userId as any)._id.toString(),
      userName: (m.userId as any).name,
      userEmail: (m.userId as any).email,
      userAvatarUrl: (m.userId as any).avatarUrl,
      role: m.role,
      status: m.status,
      joinedAt: m.joinedAt.toISOString(),
    }));
  }

  // Update member role
  static async updateMemberRole(
    currentUserId: string,
    communityId: string,
    targetUserId: string,
    role: 'member' | 'moderator' | 'admin'
  ): Promise<{ success: boolean; message: string }> {
    const currentId = new Types.ObjectId(currentUserId);
    const commId = new Types.ObjectId(communityId);
    const targetId = new Types.ObjectId(targetUserId);

    // Check if current user is admin
    const currentMembership = await CommunityMember.findOne({
      communityId: commId,
      userId: currentId,
      role: 'admin',
    });

    if (!currentMembership) {
      throw new Error('Only admins can update member roles');
    }

    // Update target member role
    const updated = await CommunityMember.findOneAndUpdate(
      { communityId: commId, userId: targetId },
      { $set: { role } },
      { new: true }
    );

    if (!updated) {
      throw new Error('Member not found');
    }

    return { success: true, message: 'Member role updated successfully' };
  }

  // Remove member from community
  static async removeMember(
    currentUserId: string,
    communityId: string,
    targetUserId: string
  ): Promise<{ success: boolean; message: string }> {
    const currentId = new Types.ObjectId(currentUserId);
    const commId = new Types.ObjectId(communityId);
    const targetId = new Types.ObjectId(targetUserId);

    // Check if current user is admin or moderator
    const currentMembership = await CommunityMember.findOne({
      communityId: commId,
      userId: currentId,
      role: { $in: ['admin', 'moderator'] },
    });

    if (!currentMembership) {
      throw new Error('Only admins and moderators can remove members');
    }

    // Remove member
    await CommunityMember.deleteOne({
      communityId: commId,
      userId: targetId,
    });

    return { success: true, message: 'Member removed successfully' };
  }

  static async joinCommunity(
    currentUserId: string,
    communityId: string
  ): Promise<{ success: boolean; message: string; requiresApproval?: boolean }> {
    const currentId = new Types.ObjectId(currentUserId);
    const commId = new Types.ObjectId(communityId);

    // Check if community exists and get its visibility
    const community = await Community.findById(commId);
    if (!community) {
      throw new Error('Community not found');
    }

    const isPrivate = (community as any).visibility === 'private';

    // Check if already a member
    const existingMember = await CommunityMember.findOne({
      communityId: commId,
      userId: currentId,
    });

    if (existingMember) {
      if (existingMember.status === 'active') {
        return { success: true, message: 'Already a member of this community' };
      }
      if (existingMember.status === 'pending') {
        return { success: true, message: 'Join request already pending', requiresApproval: true };
      }
      if (existingMember.status === 'banned') {
        throw new Error('You are banned from this community');
      }
    }

    // For private communities, create pending request
    if (isPrivate) {
      await CommunityMember.create({
        communityId: commId,
        userId: currentId,
        role: 'member',
        status: 'pending',
        requestedAt: new Date(),
      });

      return { 
        success: true, 
        message: 'Join request sent. Waiting for admin approval.',
        requiresApproval: true 
      };
    }

    // For public communities, join immediately
    await CommunityMember.create({
      communityId: commId,
      userId: currentId,
      role: 'member',
      status: 'active',
    });

    return { success: true, message: 'Successfully joined community' };
  }

  // Approve join request (admin only)
  static async approveJoinRequest(
    currentUserId: string,
    communityId: string,
    targetUserId: string
  ): Promise<{ success: boolean; message: string }> {
    const currentId = new Types.ObjectId(currentUserId);
    const commId = new Types.ObjectId(communityId);
    const targetId = new Types.ObjectId(targetUserId);

    // Check if current user is admin or moderator
    const currentMembership = await CommunityMember.findOne({
      communityId: commId,
      userId: currentId,
      role: { $in: ['admin', 'moderator'] },
      status: 'active',
    });

    if (!currentMembership) {
      throw new Error('Only admins and moderators can approve requests');
    }

    // Approve the pending request
    const updated = await CommunityMember.findOneAndUpdate(
      { communityId: commId, userId: targetId, status: 'pending' },
      {
        $set: {
          status: 'active',
          approvedAt: new Date(),
          approvedBy: currentId,
        },
      },
      { new: true }
    );

    if (!updated) {
      throw new Error('Join request not found');
    }

    return { success: true, message: 'Join request approved' };
  }

  // Reject join request (admin only)
  static async rejectJoinRequest(
    currentUserId: string,
    communityId: string,
    targetUserId: string
  ): Promise<{ success: boolean; message: string }> {
    const currentId = new Types.ObjectId(currentUserId);
    const commId = new Types.ObjectId(communityId);
    const targetId = new Types.ObjectId(targetUserId);

    // Check if current user is admin or moderator
    const currentMembership = await CommunityMember.findOne({
      communityId: commId,
      userId: currentId,
      role: { $in: ['admin', 'moderator'] },
      status: 'active',
    });

    if (!currentMembership) {
      throw new Error('Only admins and moderators can reject requests');
    }

    // Delete the pending request
    await CommunityMember.deleteOne({
      communityId: commId,
      userId: targetId,
      status: 'pending',
    });

    return { success: true, message: 'Join request rejected' };
  }

  static async leaveCommunity(
    currentUserId: string,
    communityId: string
  ): Promise<{ success: boolean; message: string }> {
    const currentId = new Types.ObjectId(currentUserId);
    const commId = new Types.ObjectId(communityId);

    await CommunityMember.deleteOne({ communityId: commId, userId: currentId });
    return { success: true, message: "Successfully left community" };
  }

  static async checkMessagingPermission(
    currentUserId: string,
    targetUserId: string
  ): Promise<{ canMessage: boolean; reason?: string }> {
    const currentId = new Types.ObjectId(currentUserId);
    const targetId = new Types.ObjectId(targetUserId);

    const block = await Block.findOne({
      userId: currentId,
      blockedUserId: targetId,
    });
    if (block) {
      return { canMessage: false, reason: "You have blocked this user" };
    }

    const connection = await Connection.findOne({
      $or: [
        { user1Id: currentId, user2Id: targetId },
        { user1Id: targetId, user2Id: currentId },
      ],
    });

    if (!connection) {
      return {
        canMessage: false,
        reason: "You must be connected to message this user",
      };
    }

    return { canMessage: true };
  }

  static async getConnectionRequests(
    currentUserId: string
  ): Promise<ConnectionRequestDTO[]> {
    const currentId = new Types.ObjectId(currentUserId);

    const requests = await ConnectionRequest.find({
      toUserId: currentId,
      status: "pending",
    }).sort({ createdAt: -1 });

    const dtos: ConnectionRequestDTO[] = [];
    for (const r of requests) {
      const userDto = await this.buildNetworkUserDTO(currentId, r.fromUserId);
      if (!userDto) continue;
      dtos.push({
        id: r._id.toString(),
        user: userDto,
        timestamp: r.createdAt.toISOString(),
        message: r.message,
      });
    }

    return dtos;
  }

  // Get all connections for the current user
  static async getConnections(
    currentUserId: string
  ): Promise<{ users: NetworkUserDTO[]; total: number }> {
    const currentId = new Types.ObjectId(currentUserId);

    const connections = await Connection.find({
      $or: [
        { user1Id: currentId },
        { user2Id: currentId },
      ],
    }).sort({ createdAt: -1 });

    // Use a map to avoid duplicates if any
    const usersMap = new Map<string, NetworkUserDTO>();

    for (const conn of connections) {
      const otherUserId = conn.user1Id.equals(currentId)
        ? conn.user2Id
        : conn.user1Id;

      const dto = await this.buildNetworkUserDTO(currentId, otherUserId);
      if (dto) {
        usersMap.set(dto.id, dto);
      }
    }

    const users = Array.from(usersMap.values());
    return { users, total: users.length };
  }

  // Get followers of the current user
  static async getFollowers(
    currentUserId: string
  ): Promise<{ users: NetworkUserDTO[]; total: number }> {
    const currentId = new Types.ObjectId(currentUserId);

    const followers = await Follow.find({
      followingId: currentId,
    }).sort({ createdAt: -1 });

    const dtos: NetworkUserDTO[] = [];
    for (const f of followers) {
      const dto = await this.buildNetworkUserDTO(currentId, f.followerId);
      if (dto) {
        dtos.push(dto);
      }
    }

    return { users: dtos, total: dtos.length };
  }

  // Get users the current user is following
  static async getFollowing(
    currentUserId: string
  ): Promise<{ users: NetworkUserDTO[]; total: number }> {
    const currentId = new Types.ObjectId(currentUserId);

    const following = await Follow.find({
      followerId: currentId,
    }).sort({ createdAt: -1 });

    const dtos: NetworkUserDTO[] = [];
    for (const f of following) {
      const dto = await this.buildNetworkUserDTO(currentId, f.followingId);
      if (dto) {
        dtos.push(dto);
      }
    }

    return { users: dtos, total: dtos.length };
  }

  static async followUser(
    currentUserId: string,
    targetUserId: string
  ): Promise<{ success: boolean; message: string }> {
    const followerId = new Types.ObjectId(currentUserId);
    const followingId = new Types.ObjectId(targetUserId);

    if (followerId.equals(followingId)) {
      throw new Error("Cannot follow yourself");
    }

    await Follow.updateOne(
      { followerId, followingId },
      { $setOnInsert: { followerId, followingId, createdAt: new Date() } },
      { upsert: true }
    );

    return { success: true, message: "User followed successfully" };
  }

  static async unfollowUser(
    currentUserId: string,
    targetUserId: string
  ): Promise<{ success: boolean; message: string }> {
    const followerId = new Types.ObjectId(currentUserId);
    const followingId = new Types.ObjectId(targetUserId);

    await Follow.deleteOne({ followerId, followingId });
    return { success: true, message: "User unfollowed successfully" };
  }

  static async blockUser(
    currentUserId: string,
    targetUserId: string
  ): Promise<{ success: boolean; message: string }> {
    const userId = new Types.ObjectId(currentUserId);
    const blockedUserId = new Types.ObjectId(targetUserId);

    await Block.updateOne(
      { userId, blockedUserId },
      { $setOnInsert: { userId, blockedUserId, createdAt: new Date() } },
      { upsert: true }
    );

    // Remove any existing connections & follows
    await Connection.deleteMany({
      $or: [
        { user1Id: userId, user2Id: blockedUserId },
        { user1Id: blockedUserId, user2Id: userId },
      ],
    });
    await Follow.deleteMany({
      $or: [
        { followerId: userId, followingId: blockedUserId },
        { followerId: blockedUserId, followingId: userId },
      ],
    });

    return { success: true, message: "User blocked successfully" };
  }

  static async unblockUser(
    currentUserId: string,
    targetUserId: string
  ): Promise<{ success: boolean; message: string }> {
    const userId = new Types.ObjectId(currentUserId);
    const blockedUserId = new Types.ObjectId(targetUserId);

    await Block.deleteOne({ userId, blockedUserId });
    return { success: true, message: "User unblocked successfully" };
  }

  static async getNetworkStats(currentUserId: string): Promise<NetworkStatsDTO> {
    const currentId = new Types.ObjectId(currentUserId);

    const [connectionsCount, followersCount, followingCount, pendingRequestsCount] =
      await Promise.all([
        Connection.countDocuments({
          $or: [
            { user1Id: currentId },
            { user2Id: currentId },
          ],
        }),
        Follow.countDocuments({ followingId: currentId }),
        Follow.countDocuments({ followerId: currentId }),
        ConnectionRequest.countDocuments({
          toUserId: currentId,
          status: "pending",
        }),
      ]);

    return {
      connectionsCount,
      followersCount,
      followingCount,
      pendingRequestsCount,
    };
  }
}

// Network controller - maps HTTP requests to service
import { Request, Response } from "express";
import { NetworkService } from "./network.service";

export class NetworkController {
  static async getSuggestions(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.userId;
      if (!userId) {
        res.status(401).json({ error: "User not authenticated" });
        return;
      }
      const data = await NetworkService.getSuggestions(userId);
      res.status(200).json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  static async getConnections(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.userId;
      if (!userId) {
        res.status(401).json({ error: "User not authenticated" });
        return;
      }

      const data = await NetworkService.getConnections(userId);
      res.status(200).json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  static async getFollowers(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.userId;
      if (!userId) {
        res.status(401).json({ error: "User not authenticated" });
        return;
      }

      const data = await NetworkService.getFollowers(userId);
      res.status(200).json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  static async getFollowing(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.userId;
      if (!userId) {
        res.status(401).json({ error: "User not authenticated" });
        return;
      }

      const data = await NetworkService.getFollowing(userId);
      res.status(200).json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  static async searchUsers(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.userId;
      if (!userId) {
        res.status(401).json({ error: "User not authenticated" });
        return;
      }

      const query = (req.query.query as string) || "";
      const filtersRaw = (req.query.filters as string) || "";
      let filters: any = {};
      if (filtersRaw) {
        try {
          filters = JSON.parse(filtersRaw);
        } catch {
          filters = {};
        }
      }

      const data = await NetworkService.searchUsers(userId, query, filters);
      res.status(200).json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  static async sendConnectionRequest(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.userId;
      if (!userId) {
        res.status(401).json({ error: "User not authenticated" });
        return;
      }
      const { userId: targetUserId, message } = req.body;
      if (!targetUserId) {
        res.status(400).json({ error: "userId is required" });
        return;
      }

      const result = await NetworkService.sendConnectionRequest(
        userId,
        targetUserId,
        message
      );
      res.status(200).json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  static async respondToRequest(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.userId;
      if (!userId) {
        res.status(401).json({ error: "User not authenticated" });
        return;
      }
      const { requestId, action } = req.body as {
        requestId?: string;
        action?: "accept" | "reject";
      };

      if (!requestId || !action) {
        res.status(400).json({ error: "requestId and action are required" });
        return;
      }

      const result = await NetworkService.respondToRequest(userId, requestId, action);
      res.status(200).json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  static async removeConnection(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.userId;
      if (!userId) {
        res.status(401).json({ error: "User not authenticated" });
        return;
      }
      const { userId: targetUserId } = req.params as { userId?: string };
      if (!targetUserId) {
        res.status(400).json({ error: "userId is required" });
        return;
      }

      const result = await NetworkService.removeConnection(userId, targetUserId);
      res.status(200).json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  static async getCommunities(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.userId;
      if (!userId) {
        res.status(401).json({ error: "User not authenticated" });
        return;
      }

      const data = await NetworkService.getCommunities(userId);
      res.status(200).json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  static async joinCommunity(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.userId;
      if (!userId) {
        res.status(401).json({ error: "User not authenticated" });
        return;
      }
      const { communityId } = req.body as { communityId?: string };
      if (!communityId) {
        res.status(400).json({ error: "communityId is required" });
        return;
      }

      const result = await NetworkService.joinCommunity(userId, communityId);
      res.status(200).json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  static async leaveCommunity(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.userId;
      if (!userId) {
        res.status(401).json({ error: "User not authenticated" });
        return;
      }
      const { communityId } = req.body as { communityId?: string };
      if (!communityId) {
        res.status(400).json({ error: "communityId is required" });
        return;
      }

      const result = await NetworkService.leaveCommunity(userId, communityId);
      res.status(200).json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  static async createCommunity(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.userId;
      if (!userId) {
        res.status(401).json({ error: "User not authenticated" });
        return;
      }

      const data = req.body;
      if (!data.name) {
        res.status(400).json({ error: "Community name is required" });
        return;
      }

      const community = await NetworkService.createCommunity(userId, data);
      res.status(201).json({ community });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  static async getCommunityDetail(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.userId;
      if (!userId) {
        res.status(401).json({ error: "User not authenticated" });
        return;
      }

      const { id } = req.params;
      if (!id) {
        res.status(400).json({ error: "Community ID is required" });
        return;
      }

      const community = await NetworkService.getCommunityDetail(userId, id);
      res.status(200).json({ community });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  static async updateCommunity(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.userId;
      if (!userId) {
        res.status(401).json({ error: "User not authenticated" });
        return;
      }

      const { id } = req.params;
      const data = req.body;

      if (!id) {
        res.status(400).json({ error: "Community ID is required" });
        return;
      }

      const community = await NetworkService.updateCommunity(userId, id, data);
      res.status(200).json({ community });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  static async deleteCommunity(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.userId;
      if (!userId) {
        res.status(401).json({ error: "User not authenticated" });
        return;
      }

      const { id } = req.params;
      if (!id) {
        res.status(400).json({ error: "Community ID is required" });
        return;
      }

      const result = await NetworkService.deleteCommunity(userId, id);
      res.status(200).json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  static async getCommunityMembers(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.userId;
      if (!userId) {
        res.status(401).json({ error: "User not authenticated" });
        return;
      }

      const { id } = req.params;
      const status = req.query.status as 'active' | 'pending' | 'banned' | undefined;

      if (!id) {
        res.status(400).json({ error: "Community ID is required" });
        return;
      }

      const members = await NetworkService.getCommunityMembers(userId, id, status);
      res.status(200).json({ members });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  static async updateMemberRole(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.userId;
      if (!userId) {
        res.status(401).json({ error: "User not authenticated" });
        return;
      }

      const { id, memberId } = req.params;
      const { role } = req.body as { role?: 'member' | 'moderator' | 'admin' };

      if (!id || !memberId) {
        res.status(400).json({ error: "Community ID and Member ID are required" });
        return;
      }

      if (!role) {
        res.status(400).json({ error: "Role is required" });
        return;
      }

      const result = await NetworkService.updateMemberRole(userId, id, memberId, role);
      res.status(200).json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  static async removeMember(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.userId;
      if (!userId) {
        res.status(401).json({ error: "User not authenticated" });
        return;
      }

      const { id, memberId } = req.params;

      if (!id || !memberId) {
        res.status(400).json({ error: "Community ID and Member ID are required" });
        return;
      }

      const result = await NetworkService.removeMember(userId, id, memberId);
      res.status(200).json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  static async approveJoinRequest(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.userId;
      if (!userId) {
        res.status(401).json({ error: "User not authenticated" });
        return;
      }

      const { id, memberId } = req.params;

      if (!id || !memberId) {
        res.status(400).json({ error: "Community ID and Member ID are required" });
        return;
      }

      const result = await NetworkService.approveJoinRequest(userId, id, memberId);
      res.status(200).json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  static async rejectJoinRequest(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.userId;
      if (!userId) {
        res.status(401).json({ error: "User not authenticated" });
        return;
      }

      const { id, memberId } = req.params;

      if (!id || !memberId) {
        res.status(400).json({ error: "Community ID and Member ID are required" });
        return;
      }

      const result = await NetworkService.rejectJoinRequest(userId, id, memberId);
      res.status(200).json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  static async checkMessagingPermission(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.userId;
      if (!userId) {
        res.status(401).json({ error: "User not authenticated" });
        return;
      }
      const { userId: targetUserId } = req.params as { userId?: string };
      if (!targetUserId) {
        res.status(400).json({ error: "userId is required" });
        return;
      }

      const result = await NetworkService.checkMessagingPermission(userId, targetUserId);
      res.status(200).json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  static async getConnectionRequests(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.userId;
      if (!userId) {
        res.status(401).json({ error: "User not authenticated" });
        return;
      }

      const requests = await NetworkService.getConnectionRequests(userId);
      res.status(200).json({ requests });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  static async followUser(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.userId;
      if (!userId) {
        res.status(401).json({ error: "User not authenticated" });
        return;
      }
      const { userId: targetUserId } = req.params as { userId?: string };
      if (!targetUserId) {
        res.status(400).json({ error: "userId is required" });
        return;
      }

      const result = await NetworkService.followUser(userId, targetUserId);
      res.status(200).json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  static async unfollowUser(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.userId;
      if (!userId) {
        res.status(401).json({ error: "User not authenticated" });
        return;
      }
      const { userId: targetUserId } = req.params as { userId?: string };
      if (!targetUserId) {
        res.status(400).json({ error: "userId is required" });
        return;
      }

      const result = await NetworkService.unfollowUser(userId, targetUserId);
      res.status(200).json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  static async blockUser(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.userId;
      if (!userId) {
        res.status(401).json({ error: "User not authenticated" });
        return;
      }
      const { userId: targetUserId } = req.body as { userId?: string };
      if (!targetUserId) {
        res.status(400).json({ error: "userId is required" });
        return;
      }

      const result = await NetworkService.blockUser(userId, targetUserId);
      res.status(200).json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  static async unblockUser(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.userId;
      if (!userId) {
        res.status(401).json({ error: "User not authenticated" });
        return;
      }
      const { userId: targetUserId } = req.params as { userId?: string };
      if (!targetUserId) {
        res.status(400).json({ error: "userId is required" });
        return;
      }

      const result = await NetworkService.unblockUser(userId, targetUserId);
      res.status(200).json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  static async getStats(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.userId;
      if (!userId) {
        res.status(401).json({ error: "User not authenticated" });
        return;
      }

      const stats = await NetworkService.getNetworkStats(userId);
      res.status(200).json(stats);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  static async getUserStats(req: Request, res: Response): Promise<void> {
    try {
      const requesterId = req.userId;
      if (!requesterId) {
        res.status(401).json({ error: "User not authenticated" });
        return;
      }

      const { userId } = req.params as { userId?: string };
      if (!userId) {
        res.status(400).json({ error: "userId is required" });
        return;
      }

      const stats = await NetworkService.getNetworkStats(userId);
      res.status(200).json(stats);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
}

// Post service - Business logic
import { Post, IPost } from "./post.model";
import { PostMedia, IPostMedia } from "./post-media.model";
import { Like, ILike } from "./like.model";
import { Comment, IComment } from "./comment.model";
import { UserProfile } from "../users/profile.model";
import { Types } from "mongoose";
import { CreatePostRequest, PostResponse, CommentResponse } from "./post.types";
import notificationService from "../notifications/notification.service";
import analyticsService from "../analytics/analytics.service";

export class PostService {
  // Create a new post with optional media
  static async createPost(
    data: CreatePostRequest,
    userId: string
  ): Promise<PostResponse> {
    // Determine post type based on media
    let postType: "text" | "image" | "video" | "link" = "text";
    if (data.media && data.media.length > 0) {
      postType = data.media[0].type === "video" ? "video" : "image";
    }

    // Create post
    const post = await Post.create({
      authorId: new Types.ObjectId(userId),
      authorRole: "user", // Default role, can be enhanced later
      type: postType,
      caption: data.caption,
      eventId: data.eventId ? new Types.ObjectId(data.eventId) : undefined,
      communityId: data.communityId ? new Types.ObjectId(data.communityId) : undefined,
    });

    // Add media if provided
    if (data.media && data.media.length > 0) {
      console.log('📸 Inserting media for post:', post._id, 'media count:', data.media.length);
      const mediaDocuments = data.media.map((m) => ({
        postId: post._id,
        mediaType: m.type,
        mediaUrl: m.url,
      }));
      console.log('📸 Media documents to insert:', JSON.stringify(mediaDocuments, null, 2));
      const insertedMedia = await PostMedia.insertMany(mediaDocuments);
      console.log('✅ Media inserted successfully:', insertedMedia.length, 'documents');
    }

    // Create notification for new post
    // TODO: In production, get actual followers from user model
    // For testing: notify all other users about the new post
    try {
      const User = (await import('../users/user.model')).User;
      const allUsers = await User.find({ _id: { $ne: new Types.ObjectId(userId) } }).limit(10);
      const followerIds = allUsers.map(u => u._id.toString());
      
      if (followerIds.length > 0) {
        const authorName = await this.getAuthorName(userId);
        const message = `${authorName} created a new post${data.caption ? ': ' + data.caption.substring(0, 50) : ''}`;
        
        // Use broadcast notification to notify multiple users
        await notificationService.createBroadcastNotification(
          userId,
          followerIds,
          'NEW_POST',
          message,
          post._id.toString()
        );
        
        console.log(`📢 Created notifications for ${followerIds.length} users about new post:`, post._id);
      }
    } catch (error) {
      console.error('Failed to create post notifications:', error);
      // Don't fail the post creation if notification fails
    }

    // Return populated post
    return this.getPostById(post._id.toString(), userId);
  }

  // Get feed with latest posts (with optional search and filters)
  static async getFeed(
    userId: string,
    limit: number = 20,
    skip: number = 0,
    search?: string,
    eventId?: string
  ): Promise<PostResponse[]> {
    // Build query object
    const query: any = {};

    // Search by caption (case-insensitive regex)
    if (search && search.trim()) {
      query.caption = { $regex: search.trim(), $options: "i" };
    }

    // Filter by event
    if (eventId && eventId.trim()) {
      query.eventId = new Types.ObjectId(eventId);
    }

    const posts = await Post.find(query)
      .populate("authorId", "name email")
      .populate("eventId", "title")
      .populate("communityId", "name")
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip);

    // Get profile data for all authors
    const { UserProfile } = await import('../users/profile.model');
    const authorIds = posts.map(p => p.authorId).filter(Boolean);
    const profiles = await UserProfile.find({ userId: { $in: authorIds } });
    const profileMap = new Map(profiles.map((p: any) => [p.userId.toString(), p]));

    // Fetch likes and comments for each post
    const postsWithCounts: PostResponse[] = await Promise.all(
      posts.map(async (post) => {
        const media = await PostMedia.find({ postId: post._id });
        console.log('🔍 Fetching media for post:', post._id, '- Found:', media.length, 'items');
        const likeCount = await Like.countDocuments({ postId: post._id });
        const commentCount = await Comment.countDocuments({ postId: post._id });
        const userLiked = await Like.findOne({ postId: post._id, userId: new Types.ObjectId(userId) });

        return {
          _id: post._id.toString(),
          authorId: post.authorId ? (typeof post.authorId === 'string' ? post.authorId : post.authorId.toString()) : '',
          eventId: post.eventId ? (typeof post.eventId === 'string' ? post.eventId : post.eventId.toString()) : undefined,
          caption: post.caption,
          media: media.map((m) => ({
            _id: m._id?.toString() || '',
            postId: m.postId?.toString() || '',
            mediaType: m.mediaType,
            mediaUrl: m.mediaUrl,
          })),
          author: post.authorId && (post.authorId as any)._id
            ? {
                _id: (post.authorId as any)._id.toString(),
                name: (post.authorId as any).name,
                email: (post.authorId as any).email,
                profileImageUrl: (profileMap.get((post.authorId as any)._id.toString()) as any)?.profileImageUrl,
              }
            : undefined,
          event: post.eventId && (post.eventId as any)._id
            ? {
                _id: (post.eventId as any)._id.toString(),
                title: (post.eventId as any).title,
              }
            : undefined,
          community: post.communityId && (post.communityId as any)._id
            ? {
                _id: (post.communityId as any)._id.toString(),
                name: (post.communityId as any).name,
              }
            : undefined,
          likeCount,
          commentCount,
          userLiked: !!userLiked,
          createdAt: post.createdAt,
          updatedAt: post.updatedAt,
        };
      })
    );

    return postsWithCounts;
  }

  // Get single post by ID
  static async getPostById(postId: string, userId?: string): Promise<PostResponse> {
    const post = await Post.findById(postId)
      .populate("authorId", "name email")
      .populate("eventId", "title");

    // Get profile data for author
    const { UserProfile } = await import('../users/profile.model');
    let authorProfile = null;
    if (post?.authorId) {
      const authorIdStr = typeof post.authorId === 'string' ? post.authorId : (post.authorId as any)._id?.toString();
      if (authorIdStr) {
        authorProfile = await UserProfile.findOne({ userId: authorIdStr });
      }
    }

    if (!post) {
      throw new Error("Post not found");
    }

    const media = await PostMedia.find({ postId: new Types.ObjectId(postId) });
    console.log('🔍 Fetching media for single post:', postId, '- Found:', media.length, 'items');
    if (media.length > 0) {
      console.log('📸 Media URLs:', media.map(m => m.mediaUrl));
    }
    const likeCount = await Like.countDocuments({ postId: new Types.ObjectId(postId) });
    const commentCount = await Comment.countDocuments({ postId: new Types.ObjectId(postId) });
    const userLiked = userId
      ? await Like.findOne({ postId: new Types.ObjectId(postId), userId: new Types.ObjectId(userId) })
      : null;

    return {
      _id: post._id?.toString() || '',
      authorId: post.authorId ? (typeof post.authorId === 'string' ? post.authorId : post.authorId.toString()) : '',
      eventId: post.eventId ? (typeof post.eventId === 'string' ? post.eventId : post.eventId.toString()) : undefined,
      caption: post.caption || '',
      media: media.map((m) => ({
        _id: m._id?.toString() || '',
        postId: m.postId?.toString() || '',
        mediaType: m.mediaType,
        mediaUrl: m.mediaUrl,
      })),
      author: post.authorId && (post.authorId as any)._id
        ? {
            _id: (post.authorId as any)._id?.toString() || '',
            name: (post.authorId as any).name || 'Unknown',
            email: (post.authorId as any).email || '',
            profileImageUrl: authorProfile?.profileImageUrl,
          }
        : undefined,
      event: post.eventId && (post.eventId as any)._id
        ? {
            _id: (post.eventId as any)._id?.toString() || '',
            title: (post.eventId as any).title || 'Unknown Event',
          }
        : undefined,
      likeCount,
      commentCount,
      userLiked: !!userLiked,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
    };
  }

  // Get posts by a specific user
  static async getUserPosts(
    targetUserId: string,
    currentUserId: string,
    limit: number = 20,
    skip: number = 0
  ): Promise<PostResponse[]> {
    try {
      const posts = await Post.find({ authorId: new Types.ObjectId(targetUserId) })
        .sort({ createdAt: -1 })
        .limit(limit)
        .skip(skip)
        .populate("authorId", "name email")
        .populate("eventId", "title");

      // Fetch likes and comments for each post
      const postsWithEngagement = await Promise.all(
        posts.map(async (post) => {
          const media = await PostMedia.find({ postId: post._id });
          const likeCount = await Like.countDocuments({ postId: post._id });
          const commentCount = await Comment.countDocuments({ postId: post._id });
          const userLiked = await Like.findOne({
            postId: post._id,
            userId: new Types.ObjectId(currentUserId),
          });

          return {
            _id: post._id?.toString() || '',
            authorId: post.authorId ? (typeof post.authorId === 'string' ? post.authorId : post.authorId.toString()) : '',
            eventId: post.eventId ? (typeof post.eventId === 'string' ? post.eventId : post.eventId.toString()) : undefined,
            caption: post.caption || '',
            media: media.map((m) => ({
              _id: m._id?.toString() || '',
              postId: m.postId?.toString() || '',
              mediaType: m.mediaType,
              mediaUrl: m.mediaUrl,
            })),
            author: post.authorId && (post.authorId as any)._id
              ? {
                  _id: (post.authorId as any)._id?.toString() || '',
                  name: (post.authorId as any).name || 'Unknown',
                  email: (post.authorId as any).email || '',
                }
              : undefined,
            event: post.eventId && (post.eventId as any)._id
              ? {
                  _id: (post.eventId as any)._id?.toString() || '',
                  title: (post.eventId as any).title || 'Unknown Event',
                }
              : undefined,
            likeCount,
            commentCount,
            userLiked: !!userLiked,
            createdAt: post.createdAt,
            updatedAt: post.updatedAt,
          };
        })
      );

      return postsWithEngagement;
    } catch (error) {
      console.error('Get user posts error:', error);
      throw error;
    }
  }

  // Like a post
  static async likePost(postId: string, userId: string): Promise<{ success: boolean; message: string }> {
    // Verify post exists
    const post = await Post.findById(postId);
    if (!post) {
      throw new Error("Post not found");
    }

    // Check if already liked
    const existingLike = await Like.findOne({
      postId: new Types.ObjectId(postId),
      userId: new Types.ObjectId(userId),
    });

    if (existingLike) {
      throw new Error("Post already liked by this user");
    }

    // Create like
    await Like.create({
      postId: new Types.ObjectId(postId),
      userId: new Types.ObjectId(userId),
    });

    // Track post like analytics asynchronously
    analyticsService.trackPostLike(postId).catch((err) => {
      console.error("Failed to track post like:", err);
    });

    // Log user activity
    analyticsService.logUserActivity(userId, "LIKE_POST", postId).catch((err) => {
      console.error("Failed to log like activity:", err);
    });

    // Notify post author (if not the liker)
    const author = post.authorId.toString();
    if (author !== userId) {
      const authorName = await this.getAuthorName(author);
      await notificationService.createNotification(
        author,
        userId,
        'LIKE',
        `${authorName} liked your post`,
        postId
      );
    }

    return { success: true, message: "Post liked successfully" };
  }

  // Unlike a post
  static async unlikePost(postId: string, userId: string): Promise<{ success: boolean; message: string }> {
    const result = await Like.deleteOne({
      postId: new Types.ObjectId(postId),
      userId: new Types.ObjectId(userId),
    });

    if (result.deletedCount === 0) {
      throw new Error("Like not found");
    }

    return { success: true, message: "Like removed successfully" };
  }

  // Add comment to post
  static async addComment(postId: string, userId: string, text: string): Promise<CommentResponse> {
    // Verify post exists
    const post = await Post.findById(postId);
    if (!post) {
      throw new Error("Post not found");
    }

    // Create comment
    const comment = await Comment.create({
      postId: new Types.ObjectId(postId),
      userId: new Types.ObjectId(userId),
      text,
    });

    // Populate user info
    const populatedComment = await comment.populate("userId", "name email");

    // Track post comment analytics asynchronously
    analyticsService.trackPostComment(postId).catch((err) => {
      console.error("Failed to track post comment:", err);
    });

    // Log user activity
    analyticsService.logUserActivity(userId, "COMMENT_POST", postId).catch((err) => {
      console.error("Failed to log comment activity:", err);
    });

    // Notify post author (if not the commenter)
    const author = post.authorId.toString();
    if (author !== userId) {
      const commenterName = (populatedComment.userId as any)?.name || "Someone";
      await notificationService.createNotification(
        author,
        userId,
        'COMMENT',
        `${commenterName} commented on your post`,
        postId
      );
    }

    return {
      _id: comment._id.toString(),
      postId: comment.postId.toString(),
      userId: comment.userId.toString(),
      text: comment.text,
      user: (populatedComment.userId as any)
        ? {
            _id: (populatedComment.userId as any)._id.toString(),
            name: (populatedComment.userId as any).name,
            email: (populatedComment.userId as any).email,
          }
        : undefined,
      createdAt: comment.createdAt,
    };
  }

  // Get all comments for a post
  static async getComments(postId: string, limit: number = 20, skip: number = 0): Promise<CommentResponse[]> {
    // Verify post exists
    const post = await Post.findById(postId);
    if (!post) {
      throw new Error("Post not found");
    }

    const comments = await Comment.find({ postId: new Types.ObjectId(postId) })
      .populate("userId", "name email")
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip);

    return comments.map((comment) => ({
      _id: comment._id.toString(),
      postId: comment.postId.toString(),
      userId: comment.userId.toString(),
      text: comment.text,
      user: (comment.userId as any)
        ? {
            _id: (comment.userId as any)._id.toString(),
            name: (comment.userId as any).name,
            email: (comment.userId as any).email,
          }
        : undefined,
      createdAt: comment.createdAt,
    }));
  }

  // Delete comment
  static async deleteComment(commentId: string, userId: string): Promise<{ success: boolean; message: string }> {
    const comment = await Comment.findById(commentId);
    if (!comment) {
      throw new Error("Comment not found");
    }

    // Verify user is comment author
    if (comment.userId.toString() !== userId) {
      throw new Error("Unauthorized: Can only delete own comments");
    }

    await Comment.deleteOne({ _id: commentId });

    return { success: true, message: "Comment deleted successfully" };
  }

  // Delete post
  static async deletePost(postId: string, userId: string): Promise<{ success: boolean; message: string }> {
    const post = await Post.findById(postId);
    if (!post) {
      throw new Error("Post not found");
    }

    // Verify user is post author
    if (post.authorId.toString() !== userId) {
      throw new Error("Unauthorized: Can only delete own posts");
    }

    // Delete post and all related data
    await Post.deleteOne({ _id: postId });
    await PostMedia.deleteMany({ postId: new Types.ObjectId(postId) });
    await Like.deleteMany({ postId: new Types.ObjectId(postId) });
    await Comment.deleteMany({ postId: new Types.ObjectId(postId) });

    return { success: true, message: "Post deleted successfully" };
  }

  // Get posts liked by a user
  static async getUserLikedPosts(userId: string, limit: number = 20, skip: number = 0) {
    try {
      const likes = await Like.find({ userId })
        .sort({ createdAt: -1 })
        .limit(limit)
        .skip(skip)
        .populate({
          path: 'postId',
          populate: {
            path: 'authorId',
            select: 'name email'
          }
        });

      const posts = likes
        .filter(like => like.postId)
        .map(like => ({
          ...((like.postId as any)._doc || like.postId),
          likedAt: like.createdAt
        }));

      return posts;
    } catch (error) {
      console.error('Get user liked posts error:', error);
      throw error;
    }
  }

  // Get comments made by a user
  static async getUserComments(userId: string, limit: number = 20, skip: number = 0) {
    try {
      const comments = await Comment.find({ userId })
        .sort({ createdAt: -1 })
        .limit(limit)
        .skip(skip)
        .populate({
          path: 'postId',
          populate: {
            path: 'authorId',
            select: 'name email'
          }
        })
        .populate('userId', 'name email');

      return comments;
    } catch (error) {
      console.error('Get user comments error:', error);
      throw error;
    }
  }

  // Helper: Get author name by user ID
  private static async getAuthorName(userId: string): Promise<string> {
    const { User } = require("../users/user.model");
    const user = await User.findById(userId).select("name");
    return user?.name || "Someone";
  }

  // Get posts for a specific community
  static async getCommunityPosts(
    communityId: string,
    userId: string,
    limit: number = 20,
    skip: number = 0
  ): Promise<PostResponse[]> {
    try {
      const posts = await Post.find({ communityId: new Types.ObjectId(communityId) })
        .sort({ createdAt: -1 })
        .limit(limit)
        .skip(skip)
        .populate("authorId", "name email")
        .populate("eventId", "name location startDate")
        .populate("communityId", "name")
        .lean();

      // Get unique author IDs
      const authorIds = [...new Set(posts.map((post: any) => post.authorId._id.toString()))];
      
      // Fetch all author profiles
      const profiles = await UserProfile.find({ userId: { $in: authorIds } }).select('userId profileImageUrl');
      const profileMap = new Map(profiles.map((p: any) => [p.userId.toString(), p.profileImageUrl]));

      const postsWithDetails = await Promise.all(
        posts.map(async (post: any) => {
          const media = await PostMedia.find({ postId: post._id }).lean();
          const likeCount = await Like.countDocuments({ postId: post._id });
          const commentCount = await Comment.countDocuments({ postId: post._id });
          const isLiked = await Like.exists({
            postId: post._id,
            userId: new Types.ObjectId(userId),
          });

          return {
            _id: post._id.toString(),
            authorId: post.authorId._id.toString(),
            communityId: communityId,
            author: {
              _id: post.authorId._id.toString(),
              name: post.authorId.name,
              email: post.authorId.email,
              profileImageUrl: profileMap.get(post.authorId._id.toString()) || null,
            },
            community: post.communityId
              ? {
                  _id: post.communityId._id.toString(),
                  name: post.communityId.name,
                }
              : undefined,
            caption: post.caption,
            media: media.map((m: any) => ({
              _id: m._id.toString(),
              postId: m.postId.toString(),
              mediaType: m.mediaType,
              mediaUrl: m.mediaUrl,
            })),
            likeCount,
            commentCount,
            userLiked: !!isLiked,
            createdAt: post.createdAt,
            updatedAt: post.updatedAt,
            event: post.eventId
              ? {
                  _id: post.eventId._id.toString(),
                  title: post.eventId.name,
                }
              : undefined,
          };
        })
      );

      return postsWithDetails;
    } catch (error) {
      console.error("Get community posts error:", error);
      throw error;
    }
  }
}

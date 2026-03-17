// Post API controllers
import { Request, Response } from "express";
import { PostService } from "./post.service";
import { CreatePostRequest, CommentRequest } from "./post.types";
import { uploadImage, uploadVideo } from "../../config/cloudinary";

export class PostController {
  // POST /api/posts/upload - Create post with media uploads
  static async createPostWithMedia(req: Request, res: Response): Promise<void> {
    try {
      const { caption, eventId } = req.body;
      const userId = req.userId;
      const files = req.files as Express.Multer.File[];

      // Validation
      if (!caption) {
        res.status(400).json({ error: "Caption is required" });
        return;
      }

      if (!userId) {
        res.status(401).json({ error: "User not authenticated" });
        return;
      }

      // Upload media files to Cloudinary
      const media: { url: string; type: "image" | "video" }[] = [];
      
      console.log('📁 Files received:', files?.length || 0);
      
      if (files && files.length > 0) {
        for (const file of files) {
          try {
            console.log('📤 Uploading file:', file.originalname, 'type:', file.mimetype);
            // Convert buffer to base64 data URI
            const b64 = Buffer.from(file.buffer).toString('base64');
            const dataURI = `data:${file.mimetype};base64,${b64}`;

            let url: string;
            if (file.mimetype.startsWith('image/')) {
              url = await uploadImage(dataURI);
              console.log('✅ Image uploaded to Cloudinary:', url);
              media.push({ url, type: 'image' });
            } else if (file.mimetype.startsWith('video/')) {
              url = await uploadVideo(dataURI);
              console.log('✅ Video uploaded to Cloudinary:', url);
              media.push({ url, type: 'video' });
            }
          } catch (uploadError) {
            console.error('❌ Media upload failed:', uploadError);
            // Continue with other files
          }
        }
      }

      console.log('📸 Total media uploaded:', media.length);
      console.log('📸 Media array:', JSON.stringify(media, null, 2));

      const post = await PostService.createPost({ caption, eventId, media }, userId);
      res.status(201).json(post);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  // POST /api/posts - Create post (without file upload, media URLs provided)
  static async createPost(req: Request, res: Response): Promise<void> {
    try {
      const { caption, eventId, media } = req.body as CreatePostRequest;
      const userId = req.userId;

      // Validation
      if (!caption) {
        res.status(400).json({ error: "Caption is required" });
        return;
      }

      if (!userId) {
        res.status(401).json({ error: "User not authenticated" });
        return;
      }

      const post = await PostService.createPost({ caption, eventId, media }, userId);
      res.status(201).json(post);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  // GET /api/posts - Get feed with optional search & filters
  static async getFeed(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.userId;
      const limit = Math.min(Number(req.query.limit) || 20, 100);
      const skip = Number(req.query.skip) || 0;
      const search = req.query.search as string | undefined;
      const eventId = req.query.eventId as string | undefined;

      if (!userId) {
        res.status(401).json({ error: "User not authenticated" });
        return;
      }

      const posts = await PostService.getFeed(userId, limit, skip, search, eventId);
      res.status(200).json(posts);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  // GET /api/posts/user/:userId - Get posts by specific user
  static async getUserPosts(req: Request, res: Response): Promise<void> {
    try {
      const { userId: targetUserId } = req.params;
      const currentUserId = req.userId;
      const limit = Math.min(Number(req.query.limit) || 20, 100);
      const skip = Number(req.query.skip) || 0;

      if (!currentUserId) {
        res.status(401).json({ error: "User not authenticated" });
        return;
      }

      const posts = await PostService.getUserPosts(targetUserId, currentUserId, limit, skip);
      res.status(200).json(posts);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  // GET /api/posts/:id - Get single post
  static async getPost(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.userId;

      const post = await PostService.getPostById(id, userId);
      res.status(200).json(post);
    } catch (error: any) {
      res.status(404).json({ error: error.message });
    }
  }

  // DELETE /api/posts/:id - Delete post
  static async deletePost(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.userId;

      if (!userId) {
        res.status(401).json({ error: "User not authenticated" });
        return;
      }

      const result = await PostService.deletePost(id, userId);
      res.status(200).json(result);
    } catch (error: any) {
      if (error.message.includes("Unauthorized")) {
        res.status(403).json({ error: error.message });
      } else if (error.message.includes("not found")) {
        res.status(404).json({ error: error.message });
      } else {
        res.status(500).json({ error: error.message });
      }
    }
  }

  // POST /api/posts/:id/like - Like a post
  static async likePost(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.userId;

      if (!userId) {
        res.status(401).json({ error: "User not authenticated" });
        return;
      }

      const result = await PostService.likePost(id, userId);
      res.status(201).json(result);
    } catch (error: any) {
      if (error.message.includes("already liked")) {
        res.status(409).json({ error: error.message });
      } else if (error.message.includes("not found")) {
        res.status(404).json({ error: error.message });
      } else {
        res.status(500).json({ error: error.message });
      }
    }
  }

  // DELETE /api/posts/:id/like - Unlike a post
  static async unlikePost(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.userId;

      if (!userId) {
        res.status(401).json({ error: "User not authenticated" });
        return;
      }

      const result = await PostService.unlikePost(id, userId);
      res.status(200).json(result);
    } catch (error: any) {
      res.status(404).json({ error: error.message });
    }
  }

  // POST /api/posts/:id/comment - Add comment
  static async addComment(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { text } = req.body as CommentRequest;
      const userId = req.userId;

      if (!userId) {
        res.status(401).json({ error: "User not authenticated" });
        return;
      }

      if (!text) {
        res.status(400).json({ error: "Comment text is required" });
        return;
      }

      const comment = await PostService.addComment(id, userId, text);
      res.status(201).json(comment);
    } catch (error: any) {
      if (error.message.includes("not found")) {
        res.status(404).json({ error: error.message });
      } else {
        res.status(500).json({ error: error.message });
      }
    }
  }

  // GET /api/posts/:id/comments - Get all comments
  static async getComments(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const limit = Math.min(Number(req.query.limit) || 20, 100);
      const skip = Number(req.query.skip) || 0;

      const comments = await PostService.getComments(id, limit, skip);
      res.status(200).json(comments);
    } catch (error: any) {
      res.status(404).json({ error: error.message });
    }
  }

  // DELETE /api/posts/:postId/comments/:commentId - Delete comment
  static async deleteComment(req: Request, res: Response): Promise<void> {
    try {
      const { commentId } = req.params;
      const userId = req.userId;

      if (!userId) {
        res.status(401).json({ error: "User not authenticated" });
        return;
      }

      const result = await PostService.deleteComment(commentId, userId);
      res.status(200).json(result);
    } catch (error: any) {
      if (error.message.includes("Unauthorized")) {
        res.status(403).json({ error: error.message });
      } else if (error.message.includes("not found")) {
        res.status(404).json({ error: error.message });
      } else {
        res.status(500).json({ error: error.message });
      }
    }
  }

  // GET /api/posts/user/:userId/likes - Get posts liked by user
  static async getUserLikedPosts(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      const limit = parseInt(req.query.limit as string) || 20;
      const skip = parseInt(req.query.skip as string) || 0;

      const posts = await PostService.getUserLikedPosts(userId, limit, skip);
      res.status(200).json(posts);
    } catch (error: any) {
      console.error('Get user liked posts error:', error);
      res.status(500).json({ error: error.message });
    }
  }

  // GET /api/posts/user/:userId/comments - Get comments made by user
  static async getUserComments(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      const limit = parseInt(req.query.limit as string) || 20;
      const skip = parseInt(req.query.skip as string) || 0;

      const comments = await PostService.getUserComments(userId, limit, skip);
      res.status(200).json(comments);
    } catch (error: any) {
      console.error('Get user comments error:', error);
      res.status(500).json({ error: error.message });
    }
  }

  // POST /api/posts/community/:communityId - Create a community post
  static async createCommunityPost(req: Request, res: Response): Promise<void> {
    try {
      const { caption, media } = req.body;
      const { communityId } = req.params;
      const userId = req.userId;

      if (!caption) {
        res.status(400).json({ error: "Caption is required" });
        return;
      }

      if (!userId) {
        res.status(401).json({ error: "User not authenticated" });
        return;
      }

      const post = await PostService.createPost({ caption, communityId, media }, userId);
      res.status(201).json(post);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  // GET /api/posts/community/:communityId - Get community posts
  static async getCommunityPosts(req: Request, res: Response): Promise<void> {
    try {
      const { communityId } = req.params;
      const userId = req.userId;
      const limit = Math.min(Number(req.query.limit) || 20, 100);
      const skip = Number(req.query.skip) || 0;

      if (!userId) {
        res.status(401).json({ error: "User not authenticated" });
        return;
      }

      const posts = await PostService.getCommunityPosts(communityId, userId, limit, skip);
      res.status(200).json(posts);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
}

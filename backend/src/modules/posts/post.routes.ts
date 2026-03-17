// Post routes
import { Router } from "express";
import { PostController } from "./post.controller";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { upload } from "../../middlewares/upload.middleware";
import { uploadImage, uploadVideo } from "../../config/cloudinary";

const router = Router();

// Public routes - Specific routes must come before generic /:id routes
router.get("/user/:userId", authMiddleware, PostController.getUserPosts);
router.get("/user/:userId/likes", authMiddleware, PostController.getUserLikedPosts);
router.get("/user/:userId/comments", authMiddleware, PostController.getUserComments);
router.get("/:id", PostController.getPost);
router.get("/:id/comments", PostController.getComments);

// Protected routes - Upload endpoints
router.post("/upload/image", authMiddleware, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      res.status(400).json({ error: "No image file uploaded" });
      return;
    }

    console.log('📤 Uploading image to Cloudinary...');
    const dataURI = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
    const imageUrl = await uploadImage(dataURI);
    console.log('✅ Image uploaded:', imageUrl);

    res.status(200).json({ url: imageUrl, publicId: '' });
  } catch (error) {
    console.error('❌ Image upload error:', error);
    res.status(500).json({ error: 'Failed to upload image' });
  }
});

router.post("/upload/video", authMiddleware, upload.single('video'), async (req, res) => {
  try {
    if (!req.file) {
      res.status(400).json({ error: "No video file uploaded" });
      return;
    }

    console.log('📤 Uploading video to Cloudinary...');
    const dataURI = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
    const videoUrl = await uploadVideo(dataURI);
    console.log('✅ Video uploaded:', videoUrl);

    res.status(200).json({ url: videoUrl, publicId: '' });
  } catch (error) {
    console.error('❌ Video upload error:', error);
    res.status(500).json({ error: 'Failed to upload video' });
  }
});

router.post("/upload", authMiddleware, upload.array('media', 5), PostController.createPostWithMedia);
router.post("/", authMiddleware, PostController.createPost);
router.get("/", authMiddleware, PostController.getFeed);
router.delete("/:id", authMiddleware, PostController.deletePost);

// Community post routes
router.post("/community/:communityId", authMiddleware, PostController.createCommunityPost);
router.get("/community/:communityId", authMiddleware, PostController.getCommunityPosts);

router.post("/:id/like", authMiddleware, PostController.likePost);
router.delete("/:id/like", authMiddleware, PostController.unlikePost);

router.post("/:id/comment", authMiddleware, PostController.addComment);
router.delete("/:postId/comments/:commentId", authMiddleware, PostController.deleteComment);

export default router;

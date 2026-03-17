// Story routes
import { Router } from "express";
import { StoryController } from "./story.controller";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { upload } from "../../middlewares/upload.middleware";
import { uploadImage, uploadVideo } from "../../config/cloudinary";

const router = Router();

// All routes are protected
router.post("/", authMiddleware, StoryController.createStory);
router.post("/upload", authMiddleware, upload.single('media'), async (req, res) => {
  try {
    if (!req.file) {
      res.status(400).json({ error: "No media file uploaded" });
      return;
    }

    console.log('📁 Story file received:', req.file.originalname, 'type:', req.file.mimetype);

    // Convert buffer to base64 data URI
    const b64 = Buffer.from(req.file.buffer).toString('base64');
    const dataURI = `data:${req.file.mimetype};base64,${b64}`;

    let mediaUrl: string;
    const mediaType = req.file.mimetype.startsWith('video') ? 'video' : 'image';

    // Upload to Cloudinary
    try {
      if (mediaType === 'image') {
        mediaUrl = await uploadImage(dataURI);
        console.log('✅ Story image uploaded to Cloudinary:', mediaUrl);
      } else {
        mediaUrl = await uploadVideo(dataURI);
        console.log('✅ Story video uploaded to Cloudinary:', mediaUrl);
      }
    } catch (uploadError) {
      console.error('❌ Cloudinary upload failed:', uploadError);
      res.status(500).json({ error: 'Failed to upload media to cloud storage' });
      return;
    }

    // Add to request body
    req.body.mediaUrl = mediaUrl;
    req.body.mediaType = mediaType;

    // Call controller
    await StoryController.createStory(req, res);
  } catch (error: any) {
    console.error('❌ Story upload error:', error);
    res.status(500).json({ error: error.message });
  }
});

router.get("/", authMiddleware, StoryController.getStories);
router.get("/my-stories", authMiddleware, StoryController.getMyStories);
router.post("/:id/view", authMiddleware, StoryController.viewStory);
router.delete("/:id", authMiddleware, StoryController.deleteStory);
router.get("/:id/viewers", authMiddleware, StoryController.getStoryViewers);

export default router;

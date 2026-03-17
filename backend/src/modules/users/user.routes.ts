// User routes
import { Router, Request, Response } from "express";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { upload } from "../../middlewares/upload.middleware";
import { uploadProfileImage } from "../../config/cloudinary";
import { User } from "./user.model";
import { UserProfile } from "./profile.model";
import { connectedUsers, userLastSeen } from "../../socket/socket";

const router = Router();

// GET /api/users/profile - Protected route
router.get("/profile", authMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.userId;

    // Fetch user
    const user = await User.findById(userId).select("-password");
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    // Fetch profile
    const profile = await UserProfile.findOne({ userId });

    res.status(200).json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
      },
      profile,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/users/status/:userId - Online / last-seen status
router.get("/status/:userId", authMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;

    const online = connectedUsers.has(userId);
    const lastSeen = userLastSeen.get(userId) || null;

    res.status(200).json({
      userId,
      online,
      lastSeen,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/users/profile - Update profile
router.put("/profile", authMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.userId;
    const { 
      headline, 
      bio, 
      location, 
      website, 
      university, 
      course, 
      year, 
      skills, 
      interests,
      openToWork,
      openToWorkRoles,
      experience,
      education
    } = req.body;

    // Fetch user
    const user = await User.findById(userId).select("-password");
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    // Build update object
    const updateData: any = {};
    if (headline !== undefined) updateData.headline = headline;
    if (bio !== undefined) updateData.bio = bio;
    if (location !== undefined) updateData.location = location;
    if (website !== undefined) updateData.website = website;
    if (university !== undefined) updateData.university = university;
    if (course !== undefined) updateData.course = course;
    if (year !== undefined) updateData.year = year;
    if (skills !== undefined) updateData.skills = skills || [];
    if (interests !== undefined) updateData.interests = interests || [];
    if (openToWork !== undefined) updateData.openToWork = openToWork;
    if (openToWorkRoles !== undefined) updateData.openToWorkRoles = openToWorkRoles || [];
    if (experience !== undefined) updateData.experience = experience || [];
    if (education !== undefined) updateData.education = education || [];

    // Update or create profile
    const profile = await UserProfile.findOneAndUpdate(
      { userId },
      updateData,
      { new: true, upsert: true }
    );

    res.status(200).json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
      },
      profile,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/users/profile/image - Upload profile image
router.post("/profile/image", authMiddleware, upload.single('profileImage'), async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.userId;

    console.log('📸 Profile image upload request received');
    console.log('Request body:', req.body);
    console.log('Request file:', req.file);
    console.log('Request files:', (req as any).files);

    if (!req.file) {
      console.error('❌ No file received in request');
      res.status(400).json({ error: "No image file provided" });
      return;
    }

    // Upload to Cloudinary
    const imageUrl = await uploadProfileImage(req.file.buffer);

    // Update profile with image URL
    const profile = await UserProfile.findOneAndUpdate(
      { userId },
      { profileImageUrl: imageUrl },
      { new: true, upsert: true }
    );

    // Fetch user data
    const user = await User.findById(userId).select("-password");

    res.status(200).json({
      user: {
        id: user?._id,
        name: user?.name,
        email: user?.email,
        createdAt: user?.createdAt,
      },
      profile,
    });
  } catch (error: any) {
    console.error('Profile image upload error:', error);
    res.status(500).json({ error: error.message || 'Failed to upload profile image' });
  }
});

// POST /api/users/profile/cover - Upload cover image
router.post("/profile/cover", authMiddleware, upload.single('coverImage'), async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.userId;

    if (!req.file) {
      res.status(400).json({ error: "No image file provided" });
      return;
    }

    // Upload to Cloudinary
    const imageUrl = await uploadProfileImage(req.file.buffer);

    // Update profile with cover image URL
    const profile = await UserProfile.findOneAndUpdate(
      { userId },
      { coverImageUrl: imageUrl },
      { new: true, upsert: true }
    );

    // Fetch user data
    const user = await User.findById(userId).select("-password");

    res.status(200).json({
      user: {
        id: user?._id,
        name: user?.name,
        email: user?.email,
        createdAt: user?.createdAt,
      },
      profile,
    });
  } catch (error: any) {
    console.error('Cover image upload error:', error);
    res.status(500).json({ error: error.message || 'Failed to upload cover image' });
  }
});

// GET /api/users/:userId/profile - Get public profile
router.get("/:userId/profile", authMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;

    // Fetch user
    const user = await User.findById(userId).select("-password");
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    // Fetch profile
    const profile = await UserProfile.findOne({ userId });

    res.status(200).json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
      },
      profile,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

# How to Add Video Files

To enable video playback in the reels, follow these steps:

## Step 1: Get Video Files

Download or create two video files:
- `cat.mp4` - A video of a cat
- `dog.mp4` - A video of a dog

**Free video sources:**
- [Pexels Videos](https://www.pexels.com/videos/) - Search for "cat" or "dog"
- [Pixabay Videos](https://pixabay.com/videos/)
- [Coverr](https://coverr.co/)

## Step 2: Add Files to Project

1. Place `cat.mp4` and `dog.mp4` in this directory: `c:/CubeAI/assets/videos/`
2. Make sure the files are named exactly as shown above

## Step 3: Update Mock Data

Once you have the video files in place, update `CubeAI/src/utils/mockData.ts`:

**Find the reel posts and change:**
```typescript
videoUri: undefined, // Add cat.mp4 to assets/videos/ to enable video playback
```

**To:**
```typescript
videoUri: require('../../assets/videos/cat.mp4'),
```

Do the same for the dog video.

## Video Specifications

- **Format**: MP4
- **Resolution**: 720p or 1080p recommended
- **Aspect Ratio**: 9:16 (vertical) or 16:9 (horizontal)
- **Duration**: 15-60 seconds
- **File Size**: Under 10MB for best performance

## Current Behavior

Until you add the video files, the reels will display:
- A placeholder icon (paw icon)
- A play button overlay
- All other reel features (likes, comments, views, etc.)

Once videos are added, they will play when tapped!

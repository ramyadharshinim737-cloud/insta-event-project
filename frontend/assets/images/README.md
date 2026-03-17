# Story Images

This directory contains sample images for story content.

## Adding Story Images

To add images to stories, place image files in this directory and reference them in `mockData.ts` using:

```typescript
imageUri: require('../../assets/images/story1.jpg')
```

## Recommended Image Specifications

- **Format**: JPG or PNG
- **Dimensions**: 1080x1920 (9:16 aspect ratio for vertical stories)
- **File Size**: < 2MB for optimal performance

## Sample Images

You can use free stock photos from:
- Unsplash (https://unsplash.com)
- Pexels (https://pexels.com)
- Pixabay (https://pixabay.com)

Download vertical/portrait images and save them here with descriptive names like:
- `story_tech.jpg`
- `story_event.jpg`
- `story_product.jpg`

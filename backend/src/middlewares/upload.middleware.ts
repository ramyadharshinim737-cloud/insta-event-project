// Multer middleware for file uploads
import multer from 'multer';
import path from 'path';

// Configure multer for memory storage
const storage = multer.memoryStorage();

// File filter for images and videos
const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedImageTypes = /jpeg|jpg|png|gif|webp/;
  const allowedVideoTypes = /mp4|mov|avi|wmv|flv|mkv/;
  
  const extname = path.extname(file.originalname).toLowerCase();
  const mimetype = file.mimetype;

  // Check if it's an image
  if (mimetype.startsWith('image/') && allowedImageTypes.test(extname.slice(1))) {
    cb(null, true);
  }
  // Check if it's a video
  else if (mimetype.startsWith('video/') && allowedVideoTypes.test(extname.slice(1))) {
    cb(null, true);
  }
  else {
    cb(new Error('Only image and video files are allowed'));
  }
};

// Multer upload configuration
export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  },
});

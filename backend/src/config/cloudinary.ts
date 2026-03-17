// Cloudinary configuration for media uploads
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Upload image to Cloudinary
export const uploadImage = async (file: string): Promise<string> => {
  try {
    const result = await cloudinary.uploader.upload(file, {
      folder: 'linsta/posts/images',
      resource_type: 'image',
    });
    return result.secure_url;
  } catch (error) {
    console.error('Cloudinary image upload error:', error);
    throw new Error('Failed to upload image');
  }
};

// Upload video to Cloudinary
export const uploadVideo = async (file: string): Promise<string> => {
  try {
    const result = await cloudinary.uploader.upload(file, {
      folder: 'linsta/posts/videos',
      resource_type: 'video',
    });
    return result.secure_url;
  } catch (error) {
    console.error('Cloudinary video upload error:', error);
    throw new Error('Failed to upload video');
  }
};

// Upload profile image to Cloudinary
export const uploadProfileImage = async (fileBuffer: Buffer): Promise<string> => {
  try {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'linsta/profiles',
          resource_type: 'image',
          transformation: [
            { width: 500, height: 500, crop: 'fill', gravity: 'face' },
            { quality: 'auto' }
          ]
        },
        (error, result) => {
          if (error) {
            console.error('Cloudinary profile image upload error:', error);
            reject(new Error('Failed to upload profile image'));
          } else {
            resolve(result!.secure_url);
          }
        }
      );
      uploadStream.end(fileBuffer);
    });
  } catch (error) {
    console.error('Cloudinary profile image upload error:', error);
    throw new Error('Failed to upload profile image');
  }
};

// Delete media from Cloudinary
export const deleteMedia = async (publicId: string, resourceType: 'image' | 'video' = 'image'): Promise<void> => {
  try {
    await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    throw new Error('Failed to delete media');
  }
};

export default cloudinary;

import cloudinary from "../config/cloudinary.js";

export class CloudinaryService {
  static async uploadImage(base64Image, folder = 'chat_app') {
    try {
      // Check if it's a base64 string with data URI prefix
      let imageData = base64Image;
      
      // Remove data URI prefix if present
      if (base64Image.includes('base64,')) {
        imageData = base64Image.split(',')[1];
      }

      // Validate image size (max 5MB)
      const fileSize = Buffer.from(imageData, 'base64').length;
      if (fileSize > 5 * 1024 * 1024) {
        throw new Error('File size too large. Maximum size is 5MB.');
      }

      // Validate it's a proper base64 string
      if (!imageData || imageData.trim() === '') {
        throw new Error('Invalid image data');
      }

      const uploadResponse = await cloudinary.uploader.upload(`data:image/jpeg;base64,${imageData}`, {
        folder: folder,
        resource_type: 'image',
        quality: 'auto',
        fetch_format: 'auto',
        timeout: 30000, // 30 second timeout
      });

      return {
        url: uploadResponse.secure_url,
        publicId: uploadResponse.public_id,
      };
    } catch (error) {
      console.error('Cloudinary upload error:', error);
      
      // More specific error messages
      if (error.message.includes('File size too large')) {
        throw new Error('File size too large. Maximum size is 5MB.');
      } else if (error.message.includes('Invalid image')) {
        throw new Error('Invalid image format. Please try with a different image.');
      } else if (error.message.includes('timeout')) {
        throw new Error('Image upload timed out. Please try again.');
      } else {
        throw new Error(`Image upload failed: ${error.message}`);
      }
    }
  }

  static async deleteImage(publicId) {
    try {
      await cloudinary.uploader.destroy(publicId);
    } catch (error) {
      console.error('Cloudinary delete error:', error);
      throw new Error('Image deletion failed');
    }
  }
}
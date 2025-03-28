import path from 'path';
import cloudinary from '../../config/cloudinary';

function detectResourceType(filePath: string): 'image' | 'video' | 'raw' {
  const ext = path.extname(filePath).toLowerCase();

  if (['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(ext)) return 'image';
  if (['.mp4', '.mov', '.avi', '.mp3', '.wav'].includes(ext)) return 'video';
  return 'raw';
}

export const uploadToCloudinary = async (filePath: string, folder?: string) => {
  const resourceType = detectResourceType(filePath);
  const result = await cloudinary.uploader.upload(filePath, {
    folder: folder || 'general',
    resource_type: resourceType,
  });

  return {
    url: result.secure_url,
    public_id: result.public_id,
    resource_type: result.resource_type,
  };
};

import cloudinary from '../../config/cloudinary';

export const uploadToCloudinary = async (filePath: string, folder?: string) => {
  const result = await cloudinary.uploader.upload(filePath, {
    folder: folder || 'general',
    resource_type: 'auto',
  });

  return {
    url: result.secure_url,
    public_id: result.public_id,
    resource_type: result.resource_type,
  };
};

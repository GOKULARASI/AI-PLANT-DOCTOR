import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Check if Cloudinary is configured
 */
const isCloudinaryConfigured = () => {
  return Boolean(
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
  );
};

/**
 * Upload image buffer to Cloudinary (with local Base64 fallback if API key is not configured)
 * @param {Buffer} fileBuffer - The image buffer
 * @param {string} folder - Cloudinary folder name
 * @param {string} mimeType - Image mime type
 * @returns {Promise<object>} Cloudinary upload result or base64 fallback
 */
export const uploadToCloudinary = (fileBuffer, folder = 'plantsense', mimeType = 'image/jpeg') => {
  // If Cloudinary keys are not provided, gracefully fall back to base64 Data URI
  if (!isCloudinaryConfigured()) {
    console.warn('⚠️ Cloudinary API keys not configured. Falling back to local Base64 image.');
    const base64 = fileBuffer.toString('base64');
    return Promise.resolve({
      secure_url: `data:${mimeType};base64,${base64}`,
      public_id: `local_${Date.now()}`,
    });
  }

  return new Promise((resolve) => {
    try {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: 'image',
          transformation: [
            { width: 800, height: 800, crop: 'limit' },
            { quality: 'auto', fetch_format: 'auto' },
          ],
        },
        (error, result) => {
          if (error) {
            console.warn('⚠️ Cloudinary upload failed, using local Base64 fallback:', error.message);
            const base64 = fileBuffer.toString('base64');
            resolve({
              secure_url: `data:${mimeType};base64,${base64}`,
              public_id: `local_${Date.now()}`,
            });
          } else {
            resolve(result);
          }
        }
      );
      stream.end(fileBuffer);
    } catch (err) {
      console.warn('⚠️ Cloudinary stream error, using local Base64 fallback:', err.message);
      const base64 = fileBuffer.toString('base64');
      resolve({
        secure_url: `data:${mimeType};base64,${base64}`,
        public_id: `local_${Date.now()}`,
      });
    }
  });
};

/**
 * Delete image from Cloudinary
 * @param {string} publicId - Cloudinary public ID
 */
export const deleteFromCloudinary = async (publicId) => {
  if (!publicId || publicId.startsWith('local_') || !isCloudinaryConfigured()) {
    return;
  }
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error('Cloudinary delete error:', error.message);
  }
};

export default cloudinary;

import ApiResponse from '../utils/apiResponse.js';
import { uploadToCloudinary } from '../config/cloudinary.js';

export const uploadImage = async (req, res, next) => {
  try {
    if (!req.file) {
      return ApiResponse.error(res, 'No image file provided.', 400);
    }
    const folder = req.body.folder || 'plantsense/uploads';
    const result = await uploadToCloudinary(req.file.buffer, folder);
    ApiResponse.success(res, 'Image uploaded.', {
      url: result.secure_url,
      publicId: result.public_id,
    });
  } catch (error) {
    next(error);
  }
};

export default { uploadImage };

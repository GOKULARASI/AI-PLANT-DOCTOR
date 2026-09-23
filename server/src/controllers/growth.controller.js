import GrowthRecord from '../models/GrowthRecord.js';
import ApiResponse from '../utils/apiResponse.js';
import ApiError from '../utils/apiError.js';
import { uploadToCloudinary } from '../config/cloudinary.js';

export const getGrowthRecords = async (req, res, next) => {
  try {
    const records = await GrowthRecord.find({ plant: req.params.plantId, user: req.user._id })
      .sort('recordedAt');
    ApiResponse.success(res, 'Growth records retrieved.', { records });
  } catch (error) {
    next(error);
  }
};

export const addGrowthRecord = async (req, res, next) => {
  try {
    const { plantId, height, heightUnit, leafCount, healthScore, notes } = req.body;
    const data = {
      user: req.user._id,
      plant: plantId,
      height: { value: parseFloat(height) || 0, unit: heightUnit || 'cm' },
      leafCount: parseInt(leafCount) || 0,
      healthScore: parseInt(healthScore) || 100,
      notes,
    };

    if (req.file) {
      const result = await uploadToCloudinary(req.file.buffer, 'plantsense/growth');
      data.image = { url: result.secure_url, publicId: result.public_id };
    }

    const record = await GrowthRecord.create(data);
    ApiResponse.created(res, 'Growth record added.', { record });
  } catch (error) {
    next(error);
  }
};

export const deleteGrowthRecord = async (req, res, next) => {
  try {
    await GrowthRecord.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    ApiResponse.success(res, 'Growth record deleted.');
  } catch (error) {
    next(error);
  }
};

export default { getGrowthRecords, addGrowthRecord, deleteGrowthRecord };

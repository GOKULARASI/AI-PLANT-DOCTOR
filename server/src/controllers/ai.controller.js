import Report from '../models/Report.js';
import Plant from '../models/Plant.js';
import User from '../models/User.js';
import ApiResponse from '../utils/apiResponse.js';
import ApiError from '../utils/apiError.js';
import { uploadToCloudinary } from '../config/cloudinary.js';
import { detectDisease, getTreatment, getFertilizerRecommendation, getWaterSchedule } from '../services/ai.service.js';

// ─── Detect Disease ──────────────────────────────────────────────────
export const scanDisease = async (req, res, next) => {
  try {
    if (!req.file) {
      return next(ApiError.badRequest('Please upload a plant image.'));
    }

    // Upload image to Cloudinary
    const uploadResult = await uploadToCloudinary(req.file.buffer, 'plantsense/scans');

    // AI Analysis
    const aiResult = await detectDisease(req.file.buffer, req.file.mimetype);

    // Save report
    const report = await Report.create({
      user: req.user._id,
      plant: req.body.plantId || null,
      scanImage: { url: uploadResult.secure_url, publicId: uploadResult.public_id },
      disease: aiResult.disease || {},
      symptoms: aiResult.symptoms || [],
      causes: aiResult.causes || [],
      treatments: aiResult.treatments || {},
      prevention: aiResult.prevention || [],
      healthScore: aiResult.healthScore || 100,
      recoveryTime: aiResult.recoveryTime || '',
      aiResponse: aiResult,
    });

    // Update plant if linked
    if (req.body.plantId) {
      const plant = await Plant.findOne({ _id: req.body.plantId, user: req.user._id });
      if (plant && !aiResult.isHealthy) {
        plant.status = aiResult.disease?.severity === 'critical' ? 'critical' : 'diseased';
        plant.healthScore = aiResult.healthScore || 50;
        plant.diseases.push({
          name: aiResult.disease?.name,
          severity: aiResult.disease?.severity,
        });
        await plant.save();
      }
    }

    // Increment scan count
    await User.findByIdAndUpdate(req.user._id, { $inc: { scansCount: 1 } });

    ApiResponse.success(res, 'Disease scan complete.', { report, aiResult });
  } catch (error) {
    next(error);
  }
};

// ─── Get Treatment ───────────────────────────────────────────────────
export const getAITreatment = async (req, res, next) => {
  try {
    const { disease, plantType } = req.body;
    if (!disease) return next(ApiError.badRequest('Disease name is required.'));

    const treatment = await getTreatment(disease, plantType);
    ApiResponse.success(res, 'Treatment recommendations generated.', { treatment });
  } catch (error) {
    next(error);
  }
};

// ─── Get Fertilizer Recommendation ───────────────────────────────────
export const getAIFertilizer = async (req, res, next) => {
  try {
    const { plantType, disease, age, season, soil } = req.body;
    if (!plantType) return next(ApiError.badRequest('Plant type is required.'));

    const recommendation = await getFertilizerRecommendation(plantType, disease, age, season, soil);
    ApiResponse.success(res, 'Fertilizer recommendations generated.', { recommendation });
  } catch (error) {
    next(error);
  }
};

// ─── Get Water Schedule ──────────────────────────────────────────────
export const getAIWaterSchedule = async (req, res, next) => {
  try {
    const { plantType, location, season } = req.body;
    if (!plantType) return next(ApiError.badRequest('Plant type is required.'));

    const schedule = await getWaterSchedule(plantType, location, season);
    ApiResponse.success(res, 'Water schedule generated.', { schedule });
  } catch (error) {
    next(error);
  }
};

export default { scanDisease, getAITreatment, getAIFertilizer, getAIWaterSchedule };

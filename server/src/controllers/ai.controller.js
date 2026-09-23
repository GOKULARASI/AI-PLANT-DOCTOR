import Report from '../models/Report.js';
import Plant from '../models/Plant.js';
import User from '../models/User.js';
import GrowthRecord from '../models/GrowthRecord.js';
import ApiResponse from '../utils/apiResponse.js';
import ApiError from '../utils/apiError.js';
import { uploadToCloudinary } from '../config/cloudinary.js';
import {
  detectDisease,
  getTreatment,
  getFertilizerRecommendation,
  getWaterSchedule,
  compareRecovery,
  calculateDosage,
} from '../services/ai.service.js';

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
      location: {
        city: req.body.city || '',
        latitude: req.body.latitude ? Number(req.body.latitude) : null,
        longitude: req.body.longitude ? Number(req.body.longitude) : null,
      },
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

// ─── Precision Dosimeter ─────────────────────────────────────────────
export const getAIDosimeter = async (req, res, next) => {
  try {
    const dosagePlan = calculateDosage(req.body);
    ApiResponse.success(res, 'Precision dosage calculated.', { dosagePlan });
  } catch (error) {
    next(error);
  }
};

// ─── Compare Recovery Scan ───────────────────────────────────────────
export const compareRecoveryScan = async (req, res, next) => {
  try {
    if (!req.file) {
      return next(ApiError.badRequest('Follow-up plant photo is required.'));
    }

    const { plantId, diseaseName = 'Plant Infection', daysPassed = 7 } = req.body;

    let baselineBuffer = null;
    let baselineRecord = null;

    if (plantId) {
      baselineRecord = await GrowthRecord.findOne({ plant: plantId, isFollowUp: false })
        .sort({ createdAt: -1 });
    }

    const uploadResult = await uploadToCloudinary(req.file.buffer, 'plantsense/recovery');

    let comparisonResult;
    if (baselineRecord && baselineRecord.image?.url) {
      try {
        const fetchRes = await fetch(baselineRecord.image.url);
        const arrayBuf = await fetchRes.arrayBuffer();
        baselineBuffer = Buffer.from(arrayBuf);
      } catch (err) {
        console.warn('Could not fetch baseline image buffer:', err.message);
      }
    }

    if (baselineBuffer) {
      comparisonResult = await compareRecovery(baselineBuffer, req.file.buffer, diseaseName, Number(daysPassed) || 7);
    } else {
      comparisonResult = await compareRecovery(req.file.buffer, req.file.buffer, diseaseName, Number(daysPassed) || 7);
    }

    let growthRecord = null;
    if (plantId) {
      growthRecord = await GrowthRecord.create({
        user: req.user._id,
        plant: plantId,
        image: { url: uploadResult.secure_url, publicId: uploadResult.public_id },
        healthScore: comparisonResult.currentHealthScore || 75,
        isFollowUp: true,
        baselineRecord: baselineRecord?._id || null,
        healingPercentage: comparisonResult.healingPercentage || 0,
        recoveryStage: comparisonResult.recoveryStage || '',
        lesionChange: comparisonResult.lesionChange || '',
        treatmentEfficacy: comparisonResult.treatmentEfficacy || 'effective',
        adjustedActionPlan: comparisonResult.adjustedActionPlan || [],
        notes: comparisonResult.comparisonNotes || '',
      });

      const plant = await Plant.findOne({ _id: plantId, user: req.user._id });
      if (plant) {
        plant.healthScore = comparisonResult.currentHealthScore || plant.healthScore;
        if (comparisonResult.healingPercentage >= 80) {
          plant.status = 'healthy';
        } else if (comparisonResult.healingPercentage > 0) {
          plant.status = 'recovering';
        }
        await plant.save();
      }
    }

    ApiResponse.success(res, 'Recovery analysis complete.', {
      comparison: comparisonResult,
      imageUrl: uploadResult.secure_url,
      growthRecord,
    });
  } catch (error) {
    next(error);
  }
};

export default {
  scanDisease,
  getAITreatment,
  getAIFertilizer,
  getAIWaterSchedule,
  getAIDosimeter,
  compareRecoveryScan,
};

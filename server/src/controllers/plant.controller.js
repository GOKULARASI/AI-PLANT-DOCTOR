import Plant from '../models/Plant.js';
import User from '../models/User.js';
import ApiResponse from '../utils/apiResponse.js';
import ApiError from '../utils/apiError.js';
import { uploadToCloudinary, deleteFromCloudinary } from '../config/cloudinary.js';

// ─── Get all plants for current user ─────────────────────────────────
export const getPlants = async (req, res, next) => {
  try {
    const { search, category, status, sort = '-createdAt', page = 1, limit = 12 } = req.query;
    const query = { user: req.user._id };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { type: { $regex: search, $options: 'i' } },
      ];
    }
    if (category) query.category = category;
    if (status) query.status = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Plant.countDocuments(query);
    const plants = await Plant.find(query).sort(sort).skip(skip).limit(parseInt(limit));

    ApiResponse.paginated(res, 'Plants retrieved.', plants, {
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      pages: Math.ceil(total / parseInt(limit)),
    });
  } catch (error) {
    next(error);
  }
};

// ─── Get single plant ────────────────────────────────────────────────
export const getPlant = async (req, res, next) => {
  try {
    const plant = await Plant.findOne({ _id: req.params.id, user: req.user._id });
    if (!plant) return next(ApiError.notFound('Plant not found.'));
    ApiResponse.success(res, 'Plant retrieved.', { plant });
  } catch (error) {
    next(error);
  }
};

// ─── Create plant ────────────────────────────────────────────────────
export const createPlant = async (req, res, next) => {
  try {
    const { name, category, type, age, ageUnit, location, notes } = req.body;
    const plantData = {
      user: req.user._id,
      name,
      category,
      type,
      location,
      notes,
      age: { value: parseInt(age) || 0, unit: ageUnit || 'months' },
    };

    // Upload image to Cloudinary if provided
    if (req.file) {
      const result = await uploadToCloudinary(req.file.buffer, 'plantsense/plants');
      plantData.image = { url: result.secure_url, publicId: result.public_id };
    }

    const plant = await Plant.create(plantData);

    // Update user's plant count
    await User.findByIdAndUpdate(req.user._id, { $inc: { plantsCount: 1 } });

    ApiResponse.created(res, 'Plant added successfully.', { plant });
  } catch (error) {
    next(error);
  }
};

// ─── Update plant ────────────────────────────────────────────────────
export const updatePlant = async (req, res, next) => {
  try {
    const plant = await Plant.findOne({ _id: req.params.id, user: req.user._id });
    if (!plant) return next(ApiError.notFound('Plant not found.'));

    const { name, category, type, age, ageUnit, location, notes, status, healthScore } = req.body;

    if (name) plant.name = name;
    if (category) plant.category = category;
    if (type) plant.type = type;
    if (location !== undefined) plant.location = location;
    if (notes !== undefined) plant.notes = notes;
    if (status) plant.status = status;
    if (healthScore !== undefined) plant.healthScore = parseInt(healthScore);
    if (age !== undefined) plant.age = { value: parseInt(age), unit: ageUnit || plant.age.unit };

    // Handle image update
    if (req.file) {
      if (plant.image?.publicId) {
        await deleteFromCloudinary(plant.image.publicId);
      }
      const result = await uploadToCloudinary(req.file.buffer, 'plantsense/plants');
      plant.image = { url: result.secure_url, publicId: result.public_id };
    }

    await plant.save();
    ApiResponse.success(res, 'Plant updated.', { plant });
  } catch (error) {
    next(error);
  }
};

// ─── Delete plant ────────────────────────────────────────────────────
export const deletePlant = async (req, res, next) => {
  try {
    const plant = await Plant.findOne({ _id: req.params.id, user: req.user._id });
    if (!plant) return next(ApiError.notFound('Plant not found.'));

    // Delete image from Cloudinary
    if (plant.image?.publicId) {
      await deleteFromCloudinary(plant.image.publicId);
    }

    await plant.deleteOne();
    await User.findByIdAndUpdate(req.user._id, { $inc: { plantsCount: -1 } });

    ApiResponse.success(res, 'Plant deleted.');
  } catch (error) {
    next(error);
  }
};

// ─── Get plant statistics ────────────────────────────────────────────
export const getPlantStats = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const [total, healthy, diseased, recovering, critical] = await Promise.all([
      Plant.countDocuments({ user: userId }),
      Plant.countDocuments({ user: userId, status: 'healthy' }),
      Plant.countDocuments({ user: userId, status: 'diseased' }),
      Plant.countDocuments({ user: userId, status: 'recovering' }),
      Plant.countDocuments({ user: userId, status: 'critical' }),
    ]);

    const categoryStats = await Plant.aggregate([
      { $match: { user: userId } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    ApiResponse.success(res, 'Plant statistics retrieved.', {
      total,
      healthy,
      diseased,
      recovering,
      critical,
      categories: categoryStats,
    });
  } catch (error) {
    next(error);
  }
};

// ─── Water plant ─────────────────────────────────────────────────────
export const waterPlant = async (req, res, next) => {
  try {
    const plant = await Plant.findOne({ _id: req.params.id, user: req.user._id });
    if (!plant) return next(ApiError.notFound('Plant not found.'));

    plant.lastWatered = new Date();
    await plant.save();

    ApiResponse.success(res, 'Plant watered.', { plant });
  } catch (error) {
    next(error);
  }
};

export default { getPlants, getPlant, createPlant, updatePlant, deletePlant, getPlantStats, waterPlant };

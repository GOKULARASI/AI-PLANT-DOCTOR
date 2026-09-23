import User from '../models/User.js';
import Plant from '../models/Plant.js';
import Report from '../models/Report.js';
import Disease from '../models/Disease.js';
import Notification from '../models/Notification.js';
import Feedback from '../models/Feedback.js';
import ApiResponse from '../utils/apiResponse.js';
import ApiError from '../utils/apiError.js';

// ─── Admin Dashboard Stats ──────────────────────────────────────────
export const getDashboardStats = async (req, res, next) => {
  try {
    const [totalUsers, totalPlants, totalReports, totalDiseases] = await Promise.all([
      User.countDocuments(),
      Plant.countDocuments(),
      Report.countDocuments(),
      Disease.countDocuments(),
    ]);

    // Users by month (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    const usersByMonth = await User.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo } } },
      { $group: { _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]);

    // Scans by month
    const scansByMonth = await Report.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo } } },
      { $group: { _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]);

    // Top diseases
    const topDiseases = await Report.aggregate([
      { $match: { 'disease.name': { $ne: 'Healthy' } } },
      { $group: { _id: '$disease.name', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]);

    ApiResponse.success(res, 'Admin dashboard stats.', {
      totalUsers, totalPlants, totalReports, totalDiseases,
      usersByMonth, scansByMonth, topDiseases,
    });
  } catch (error) {
    next(error);
  }
};

// ─── Manage Users ────────────────────────────────────────────────────
export const getUsers = async (req, res, next) => {
  try {
    const { search, role, page = 1, limit = 20 } = req.query;
    const query = {};
    if (search) query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
    ];
    if (role) query.role = role;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await User.countDocuments(query);
    const users = await User.find(query).sort('-createdAt').skip(skip).limit(parseInt(limit));

    ApiResponse.paginated(res, 'Users retrieved.', users, {
      total, page: parseInt(page), limit: parseInt(limit), pages: Math.ceil(total / parseInt(limit)),
    });
  } catch (error) {
    next(error);
  }
};

export const updateUser = async (req, res, next) => {
  try {
    const { role } = req.body;
    const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true });
    if (!user) return next(ApiError.notFound('User not found.'));
    ApiResponse.success(res, 'User updated.', { user });
  } catch (error) {
    next(error);
  }
};

export const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return next(ApiError.notFound('User not found.'));
    // Also delete user's plants, reports, etc.
    await Promise.all([
      Plant.deleteMany({ user: req.params.id }),
      Report.deleteMany({ user: req.params.id }),
      Notification.deleteMany({ user: req.params.id }),
    ]);
    ApiResponse.success(res, 'User and associated data deleted.');
  } catch (error) {
    next(error);
  }
};

// ─── Analytics ───────────────────────────────────────────────────────
export const getAnalytics = async (req, res, next) => {
  try {
    const plantsByCategory = await Plant.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    const plantsByStatus = await Plant.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    const recentFeedback = await Feedback.find().sort('-createdAt').limit(10).populate('user', 'name email');

    ApiResponse.success(res, 'Analytics data.', { plantsByCategory, plantsByStatus, recentFeedback });
  } catch (error) {
    next(error);
  }
};

export default { getDashboardStats, getUsers, updateUser, deleteUser, getAnalytics };

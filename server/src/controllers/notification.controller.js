import Notification from '../models/Notification.js';
import ApiResponse from '../utils/apiResponse.js';
import ApiError from '../utils/apiError.js';

export const getNotifications = async (req, res, next) => {
  try {
    const { type, unreadOnly } = req.query;
    const query = { user: req.user._id };
    if (type) query.type = type;
    if (unreadOnly === 'true') query.isRead = false;

    const notifications = await Notification.find(query).sort('-createdAt').limit(50);
    const unreadCount = await Notification.countDocuments({ user: req.user._id, isRead: false });

    ApiResponse.success(res, 'Notifications retrieved.', { notifications, unreadCount });
  } catch (error) {
    next(error);
  }
};

export const markAsRead = async (req, res, next) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { isRead: true },
      { new: true }
    );
    if (!notification) return next(ApiError.notFound('Notification not found.'));
    ApiResponse.success(res, 'Marked as read.', { notification });
  } catch (error) {
    next(error);
  }
};

export const markAllAsRead = async (req, res, next) => {
  try {
    await Notification.updateMany({ user: req.user._id, isRead: false }, { isRead: true });
    ApiResponse.success(res, 'All notifications marked as read.');
  } catch (error) {
    next(error);
  }
};

export const deleteNotification = async (req, res, next) => {
  try {
    await Notification.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    ApiResponse.success(res, 'Notification deleted.');
  } catch (error) {
    next(error);
  }
};

export default { getNotifications, markAsRead, markAllAsRead, deleteNotification };

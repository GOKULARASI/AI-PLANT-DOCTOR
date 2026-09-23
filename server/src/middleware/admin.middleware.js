import ApiError from '../utils/apiError.js';

/**
 * Admin role check middleware - must be used after auth.protect
 */
export const adminOnly = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return next(ApiError.forbidden('Admin access required.'));
  }
  next();
};

export default { adminOnly };

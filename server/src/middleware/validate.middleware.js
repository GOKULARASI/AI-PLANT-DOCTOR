import { validationResult } from 'express-validator';
import ApiError from '../utils/apiError.js';

/**
 * Middleware to check express-validator results
 */
export const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const messages = errors.array().map((e) => e.msg);
    return next(ApiError.badRequest(messages[0], errors.array()));
  }
  next();
};

export default validate;

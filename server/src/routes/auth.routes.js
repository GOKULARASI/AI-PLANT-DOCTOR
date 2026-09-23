import { Router } from 'express';
import { body } from 'express-validator';
import validate from '../middleware/validate.middleware.js';
import { protect } from '../middleware/auth.middleware.js';
import {
  register, login, googleLogin, getMe, updateProfile, changePassword,
  forgotPassword, resetPassword, verifyEmail, logout, deleteAccount,
} from '../controllers/auth.controller.js';

const router = Router();

router.post('/register', [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
], validate, register);

router.post('/login', [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
], validate, login);

router.post('/google', [
  body('email').isEmail().withMessage('Valid email is required'),
  body('name').notEmpty().withMessage('Name is required'),
  body('googleId').notEmpty().withMessage('Google ID is required'),
], validate, googleLogin);

router.post('/forgot-password', [
  body('email').isEmail().withMessage('Valid email is required'),
], validate, forgotPassword);

router.post('/reset-password/:token', [
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
], validate, resetPassword);

router.get('/verify/:token', verifyEmail);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.put('/change-password', protect, [
  body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters'),
], validate, changePassword);
router.post('/logout', logout);
router.delete('/account', protect, deleteAccount);

export default router;

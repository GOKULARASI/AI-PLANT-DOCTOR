import User from '../models/User.js';
import ApiResponse from '../utils/apiResponse.js';
import ApiError from '../utils/apiError.js';
import { sendTokenResponse, generateRandomToken } from '../utils/generateToken.js';
import { sendVerificationEmail, sendPasswordResetEmail } from '../services/email.service.js';

// ─── Register ────────────────────────────────────────────────────────
export const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    // Check if user exists
    const existing = await User.findOne({ email });
    if (existing) {
      return next(ApiError.conflict('An account with this email already exists.'));
    }

    // Create verification token
    const verificationToken = generateRandomToken();

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      verificationToken,
    });

    // Send verification email (non-blocking)
    sendVerificationEmail(email, verificationToken).catch(console.error);

    // Generate token and respond
    const data = sendTokenResponse(res, user);
    ApiResponse.created(res, 'Account created successfully. Please verify your email.', data);
  } catch (error) {
    next(error);
  }
};

// ─── Login ───────────────────────────────────────────────────────────
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Find user with password field
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return next(ApiError.unauthorized('Invalid email or password.'));
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return next(ApiError.unauthorized('Invalid email or password.'));
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    const data = sendTokenResponse(res, user);
    ApiResponse.success(res, 'Login successful.', data);
  } catch (error) {
    next(error);
  }
};

// ─── Google Login ────────────────────────────────────────────────────
export const googleLogin = async (req, res, next) => {
  try {
    const { email, name, googleId, avatar } = req.body;

    let user = await User.findOne({ $or: [{ googleId }, { email }] });

    if (user) {
      // Update Google ID if not set
      if (!user.googleId) {
        user.googleId = googleId;
        user.isVerified = true;
      }
      user.lastLogin = new Date();
      if (avatar && !user.avatar) user.avatar = avatar;
      await user.save();
    } else {
      // Create new user
      user = await User.create({
        name,
        email,
        googleId,
        avatar,
        isVerified: true,
      });
    }

    const data = sendTokenResponse(res, user);
    ApiResponse.success(res, 'Google login successful.', data);
  } catch (error) {
    next(error);
  }
};

// ─── Get Current User ────────────────────────────────────────────────
export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    ApiResponse.success(res, 'User profile retrieved.', { user });
  } catch (error) {
    next(error);
  }
};

// ─── Update Profile ──────────────────────────────────────────────────
export const updateProfile = async (req, res, next) => {
  try {
    const { name, location, phone, bio, preferences } = req.body;
    const updates = {};
    if (name) updates.name = name;
    if (location !== undefined) updates.location = location;
    if (phone !== undefined) updates.phone = phone;
    if (bio !== undefined) updates.bio = bio;
    if (preferences) updates.preferences = { ...req.user.preferences, ...preferences };

    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true, runValidators: true });
    ApiResponse.success(res, 'Profile updated.', { user });
  } catch (error) {
    next(error);
  }
};

// ─── Change Password ─────────────────────────────────────────────────
export const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id).select('+password');

    if (user.password) {
      const isMatch = await user.comparePassword(currentPassword);
      if (!isMatch) {
        return next(ApiError.badRequest('Current password is incorrect.'));
      }
    }

    user.password = newPassword;
    await user.save();
    ApiResponse.success(res, 'Password changed successfully.');
  } catch (error) {
    next(error);
  }
};

// ─── Forgot Password ─────────────────────────────────────────────────
export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      // Don't reveal if user exists
      return ApiResponse.success(res, 'If an account exists, a reset link has been sent.');
    }

    const resetToken = generateRandomToken();
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    await user.save();

    sendPasswordResetEmail(email, resetToken).catch(console.error);
    ApiResponse.success(res, 'If an account exists, a reset link has been sent.');
  } catch (error) {
    next(error);
  }
};

// ─── Reset Password ──────────────────────────────────────────────────
export const resetPassword = async (req, res, next) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: new Date() },
    });

    if (!user) {
      return next(ApiError.badRequest('Invalid or expired reset token.'));
    }

    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    ApiResponse.success(res, 'Password reset successful. You can now login.');
  } catch (error) {
    next(error);
  }
};

// ─── Verify Email ────────────────────────────────────────────────────
export const verifyEmail = async (req, res, next) => {
  try {
    const { token } = req.params;
    const user = await User.findOne({ verificationToken: token });

    if (!user) {
      return next(ApiError.badRequest('Invalid verification token.'));
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    await user.save();

    ApiResponse.success(res, 'Email verified successfully.');
  } catch (error) {
    next(error);
  }
};

// ─── Logout ──────────────────────────────────────────────────────────
export const logout = async (req, res, next) => {
  try {
    res.cookie('token', '', { httpOnly: true, expires: new Date(0) });
    ApiResponse.success(res, 'Logged out successfully.');
  } catch (error) {
    next(error);
  }
};

// ─── Delete Account ──────────────────────────────────────────────────
export const deleteAccount = async (req, res, next) => {
  try {
    await User.findByIdAndDelete(req.user._id);
    res.cookie('token', '', { httpOnly: true, expires: new Date(0) });
    ApiResponse.success(res, 'Account deleted successfully.');
  } catch (error) {
    next(error);
  }
};

export default {
  register, login, googleLogin, getMe, updateProfile, changePassword,
  forgotPassword, resetPassword, verifyEmail, logout, deleteAccount,
};

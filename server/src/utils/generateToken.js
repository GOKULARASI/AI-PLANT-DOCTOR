import jwt from 'jsonwebtoken';

/**
 * Generate JWT token
 * @param {string} userId - User ID
 * @returns {string} JWT token
 */
export const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d',
  });
};

/**
 * Generate JWT and set it as an HTTP-only cookie
 * @param {object} res - Express response object
 * @param {string} userId - User ID
 * @returns {string} The generated token
 */
export const sendTokenResponse = (res, user) => {
  const token = generateToken(user._id);

  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  };

  // Remove password from output
  const userObj = user.toObject();
  delete userObj.password;
  delete userObj.verificationToken;
  delete userObj.resetPasswordToken;
  delete userObj.resetPasswordExpires;

  res.cookie('token', token, cookieOptions);

  return { token, user: userObj };
};

/**
 * Generate a random token for email verification / password reset
 */
export const generateRandomToken = () => {
  return [...Array(40)].map(() => Math.random().toString(36)[2]).join('');
};

export default { generateToken, sendTokenResponse, generateRandomToken };

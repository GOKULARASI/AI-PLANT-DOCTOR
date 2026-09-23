import { getTransporter } from '../config/email.js';

const APP_NAME = 'PlantSense AI';
const FROM_EMAIL = `"${APP_NAME}" <${process.env.SMTP_USER || 'noreply@plantsense.ai'}>`;

/**
 * Send email helper
 */
const sendEmail = async (to, subject, html) => {
  const transporter = getTransporter();
  if (!transporter) {
    console.warn('📧 Email not sent (SMTP not configured):', subject);
    return false;
  }

  try {
    await transporter.sendMail({ from: FROM_EMAIL, to, subject, html });
    console.log(`📧 Email sent to ${to}: ${subject}`);
    return true;
  } catch (error) {
    console.error('Email send error:', error.message);
    return false;
  }
};

/**
 * Send verification email
 */
export const sendVerificationEmail = async (email, token) => {
  const verifyUrl = `${process.env.CLIENT_URL}/verify-email/${token}`;
  const html = `
    <div style="font-family: 'Inter', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #059669; font-size: 28px; margin: 0;">🌿 ${APP_NAME}</h1>
      </div>
      <div style="background: #f0fdf4; border-radius: 16px; padding: 32px; border: 1px solid #bbf7d0;">
        <h2 style="color: #064e3b; margin-top: 0;">Verify Your Email</h2>
        <p style="color: #374151; line-height: 1.6;">Welcome to PlantSense AI! Click the button below to verify your email address.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${verifyUrl}" style="background: linear-gradient(135deg, #059669, #10b981); color: white; padding: 14px 32px; border-radius: 12px; text-decoration: none; font-weight: 600; font-size: 16px; display: inline-block;">
            Verify Email
          </a>
        </div>
        <p style="color: #6b7280; font-size: 14px;">If the button doesn't work, copy this link:<br>${verifyUrl}</p>
        <p style="color: #9ca3af; font-size: 12px; margin-bottom: 0;">This link expires in 24 hours.</p>
      </div>
    </div>`;
  return sendEmail(email, `Verify your ${APP_NAME} account`, html);
};

/**
 * Send password reset email
 */
export const sendPasswordResetEmail = async (email, token) => {
  const resetUrl = `${process.env.CLIENT_URL}/reset-password/${token}`;
  const html = `
    <div style="font-family: 'Inter', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #059669; font-size: 28px; margin: 0;">🌿 ${APP_NAME}</h1>
      </div>
      <div style="background: #f0fdf4; border-radius: 16px; padding: 32px; border: 1px solid #bbf7d0;">
        <h2 style="color: #064e3b; margin-top: 0;">Reset Your Password</h2>
        <p style="color: #374151; line-height: 1.6;">You requested a password reset. Click the button below to set a new password.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" style="background: linear-gradient(135deg, #059669, #10b981); color: white; padding: 14px 32px; border-radius: 12px; text-decoration: none; font-weight: 600; font-size: 16px; display: inline-block;">
            Reset Password
          </a>
        </div>
        <p style="color: #6b7280; font-size: 14px;">If you didn't request this, you can safely ignore this email.</p>
        <p style="color: #9ca3af; font-size: 12px; margin-bottom: 0;">This link expires in 1 hour.</p>
      </div>
    </div>`;
  return sendEmail(email, `Reset your ${APP_NAME} password`, html);
};

/**
 * Send notification email
 */
export const sendNotificationEmail = async (email, title, message) => {
  const html = `
    <div style="font-family: 'Inter', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #059669; font-size: 28px; margin: 0;">🌿 ${APP_NAME}</h1>
      </div>
      <div style="background: #f0fdf4; border-radius: 16px; padding: 32px; border: 1px solid #bbf7d0;">
        <h2 style="color: #064e3b; margin-top: 0;">${title}</h2>
        <p style="color: #374151; line-height: 1.6;">${message}</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.CLIENT_URL}/dashboard" style="background: linear-gradient(135deg, #059669, #10b981); color: white; padding: 14px 32px; border-radius: 12px; text-decoration: none; font-weight: 600;">
            Open Dashboard
          </a>
        </div>
      </div>
    </div>`;
  return sendEmail(email, `${APP_NAME} — ${title}`, html);
};

export default { sendVerificationEmail, sendPasswordResetEmail, sendNotificationEmail };

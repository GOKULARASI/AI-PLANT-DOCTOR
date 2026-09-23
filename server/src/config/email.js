import nodemailer from 'nodemailer';

let transporter = null;

/**
 * Initialize email transporter
 */
export const initEmail = () => {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.warn('⚠️ SMTP credentials not set. Email features will be disabled.');
    return null;
  }

  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT) || 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  console.log('✅ Email transporter initialized');
  return transporter;
};

/**
 * Get transporter instance
 */
export const getTransporter = () => {
  if (!transporter) {
    initEmail();
  }
  return transporter;
};

export default { initEmail, getTransporter };

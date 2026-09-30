require('dotenv').config();

module.exports = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: process.env.PORT || 5000,
  MONGO_URI: process.env.MONGO_URI,
  REDIS_URL: process.env.REDIS_URL,
  JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET,
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET,
  JWT_ACCESS_EXPIRES: process.env.JWT_ACCESS_EXPIRES || '15m',
  JWT_REFRESH_EXPIRES: process.env.JWT_REFRESH_EXPIRES || '7d',
  ENCRYPTION_KEY: process.env.ENCRYPTION_KEY,
  CORS_WHITELIST: (process.env.CORS_WHITELIST || '').split(',').filter(Boolean),
  SLOT_HOLD_TTL_SECONDS: parseInt(process.env.SLOT_HOLD_TTL_SECONDS || '600', 10),
  DEFAULT_OTP: process.env.DEFAULT_OTP, // fixed OTP for testing; leave unset in production
  OTP_TTL_SECONDS: parseInt(process.env.OTP_TTL_SECONDS || '300', 10),
  EMAIL_HOST: process.env.EMAIL_HOST,
  EMAIL_PORT: parseInt(process.env.EMAIL_PORT || '587', 10),
  EMAIL_SECURE: process.env.EMAIL_SECURE === 'true',
  EMAIL_USER: process.env.EMAIL_USER,
  EMAIL_PASS: process.env.EMAIL_PASS,
  EMAIL_FROM_NAME: process.env.EMAIL_FROM_NAME || 'Clinic System',
  EMAIL_FROM_ADDRESS: process.env.EMAIL_FROM_ADDRESS || 'no-reply@clinic.example.com',
  FAST2SMS_API_KEY: process.env.FAST2SMS_API_KEY,
  FAST2SMS_SENDER_ID: process.env.FAST2SMS_SENDER_ID || 'FSTSMS',
  FAST2SMS_ROUTE: process.env.FAST2SMS_ROUTE || 'q',
  ADMIN_NOTIFY_EMAIL: process.env.ADMIN_NOTIFY_EMAIL,
  FRONTEND_BASE_URL: process.env.FRONTEND_BASE_URL || 'http://localhost:3000',
  API_PUBLIC_URL: process.env.API_PUBLIC_URL,
  // raw JSON or base64 of a Firebase service account; empty disables push
  FIREBASE_SERVICE_ACCOUNT: process.env.FIREBASE_SERVICE_ACCOUNT, // e.g. https://api.clinic.com — used to build upload URLs
  PASSWORD_RESET_TTL_MINUTES: parseInt(process.env.PASSWORD_RESET_TTL_MINUTES || '30', 10),
  REMINDER_HOURS_BEFORE: parseInt(process.env.REMINDER_HOURS_BEFORE || '24', 10),
};

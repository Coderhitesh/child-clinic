const redisClient = require('../config/redis');
const env = require('../config/env');

// DEFAULT_OTP (in .env) forces a fixed OTP for testing. Remove it from .env to go back to random OTPs.
const genOtp = () => env.DEFAULT_OTP || String(Math.floor(100000 + Math.random() * 900000));

const otpKey = (identifier) => `otp:${identifier}`;

const setOtp = async (identifier) => {
  const otp = genOtp();
  await redisClient.set(otpKey(identifier), otp, 'EX', env.OTP_TTL_SECONDS);
  return otp;
};

const verifyOtp = async (identifier, otp) => {
  const stored = await redisClient.get(otpKey(identifier));
  if (!stored) return false;
  const ok = stored === String(otp);
  if (ok) await redisClient.del(otpKey(identifier));
  return ok;
};

module.exports = { setOtp, verifyOtp };

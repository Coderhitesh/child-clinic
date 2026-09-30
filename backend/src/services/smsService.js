const axios = require('axios');
const env = require('../config/env');

const FAST2SMS_URL = 'https://www.fast2sms.com/dev/bulkV2';

// Fast2SMS quick SMS route ('q'). For numeric-only OTP delivery via their dedicated
// OTP route, switch FAST2SMS_ROUTE=otp and pass variables_values instead of message.
const sendSms = async ({ to, message }) => {
  if (!env.FAST2SMS_API_KEY) {
    console.warn('[SMS] FAST2SMS_API_KEY not configured — skipping send');
    return { sent: false, reason: 'sms_not_configured' };
  }
  if (!to) return { sent: false, reason: 'no_recipient' };

  const numbers = String(to).replace(/^\+?91/, ''); // Fast2SMS expects 10-digit Indian numbers

  const payload = {
    route: env.FAST2SMS_ROUTE,
    sender_id: env.FAST2SMS_SENDER_ID,
    message,
    language: 'english',
    flash: 0,
    numbers,
  };

  const { data } = await axios.post(FAST2SMS_URL, payload, {
    headers: {
      authorization: env.FAST2SMS_API_KEY,
      'Content-Type': 'application/json',
    },
    timeout: 10000,
  });

  return { sent: data.return === true, providerResponse: data };
};

// dedicated OTP send using Fast2SMS OTP route (numeric OTP only, templated by Fast2SMS)
const sendOtpSms = async ({ to, otp }) => {
  console.log("otp",otp)
  if (!env.FAST2SMS_API_KEY) {
    console.warn('[SMS] FAST2SMS_API_KEY not configured — skipping OTP send');
    return { sent: false, reason: 'sms_not_configured' };
  }
  const numbers = String(to).replace(/^\+?91/, '');
  const { data } = await axios.post(
    FAST2SMS_URL,
    { route: 'otp', variables_values: otp, numbers },
    { headers: { authorization: env.FAST2SMS_API_KEY, 'Content-Type': 'application/json' }, timeout: 10000 }
  );
  return { sent: data.return === true, providerResponse: data };
};

module.exports = { sendSms, sendOtpSms };

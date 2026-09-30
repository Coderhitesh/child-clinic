const Queue = require('bull');
const conn = require('./connection');
const { sendOtpSms, sendSms } = require('../services/smsService');
const { sendEmail } = require('../services/emailService');

const otpQueue = new Queue('otp-delivery', conn.redis);

const enqueueOtpDelivery = (payload) =>
  otpQueue.add(payload, { attempts: 3, backoff: { type: 'fixed', delay: 3000 }, removeOnComplete: true });

otpQueue.process(async (job) => {
  const { phone, email, otp } = job.data;
  const results = {};

  if (phone) {
    try {
      // dedicated Fast2SMS OTP route first; falls back to quick-SMS text if OTP route not configured
      results.sms = await sendOtpSms({ to: phone, otp });
      if (!results.sms.sent) {
        results.sms = await sendSms({ to: phone, message: `Your OTP is ${otp}. Valid for 5 minutes.` });
      }
    } catch (err) {
      results.sms = { sent: false, error: err.message };
    }
  }

  if (email) {
    try {
      results.email = await sendEmail({
        to: email,
        subject: 'Your OTP Code',
        text: `Your OTP is ${otp}. Valid for 5 minutes.`,
      });
    } catch (err) {
      results.email = { sent: false, error: err.message };
    }
  }

  return results;
});

module.exports = { otpQueue, enqueueOtpDelivery };

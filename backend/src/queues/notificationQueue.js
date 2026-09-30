const Queue = require('bull');
const conn = require('./connection');
const { sendEmail } = require('../services/emailService');
const { sendSms } = require('../services/smsService');
const { sendToUser, sendToTokens } = require('../services/pushService');

const notificationQueue = new Queue('notifications', conn.redis);

// job types: booking_confirm, reminder, appointment_cancelled,
// password_reset, prescription_ready, follow_up_due
const enqueueNotification = (type, payload) =>
  notificationQueue.add(
    { type, payload },
    { attempts: 3, backoff: { type: 'exponential', delay: 5000 }, removeOnComplete: true }
  );

const TEMPLATES = {
  booking_confirm: (p) => ({
    subject: 'Appointment Confirmation',
    text: `Your appointment (ID: ${p.appointmentId}) is confirmed. Please pay the consultation fee at the clinic.`,
  }),
  reminder: (p) => ({
    subject: 'Appointment Reminder',
    text: `Reminder: you have an appointment on ${p.date} at ${p.startTime}.`,
  }),
  prescription_ready: (p) => ({
    subject: 'Prescription Ready',
    text: `Your prescription is ready. Download: ${p.pdfUrl || ''}`,
  }),
  appointment_cancelled: (p) => ({
    subject: 'Appointment Cancelled',
    text: `Your appointment on ${p.date || ''} ${p.startTime || ''} has been cancelled.${p.reason ? ` Reason: ${p.reason}.` : ''}`,
  }),
  password_reset: (p) => ({
    subject: 'Reset your password',
    text: `Hello${p.name ? ` ${p.name}` : ''}, use this link to set a new password (valid ${p.minutes || 30} minutes): ${p.link}`,
  }),
  follow_up_due: (p) => ({
    subject: 'Follow-up Due',
    text: `Your follow-up visit is due on ${p.followUpDate}.`,
  }),
};

notificationQueue.process(async (job) => {
  const { type, payload } = job.data;
  const template = payload.subject || payload.text
    ? { subject: payload.subject || type, text: payload.text || '' }
    : TEMPLATES[type]
    ? TEMPLATES[type](payload)
    : { subject: type, text: JSON.stringify(payload) };

  const results = {};

  if (payload.email) {
    try {
      results.email = await sendEmail({ to: payload.email, subject: template.subject, text: template.text });
    } catch (err) {
      results.email = { sent: false, error: err.message };
    }
  }

  if (payload.phone) {
    try {
      results.sms = await sendSms({ to: payload.phone, message: template.text });
    } catch (err) {
      results.sms = { sent: false, error: err.message };
    }
  }

  // push: payload.userId targets every device signed into that account; payload.tokens
  // is the escape hatch for one specific install
  if (payload.userId || payload.tokens?.length) {
    try {
      const message = {
        title: template.subject,
        body: template.text,
        type,
        data: {
          appointmentId: payload.appointmentId,
          prescriptionId: payload.prescriptionId,
          link: payload.link,
        },
      };
      results.push = payload.tokens?.length
        ? await sendToTokens(payload.tokens, message)
        : await sendToUser(payload.userId, message);
    } catch (err) {
      results.push = { sent: 0, error: err.message };
    }
  }

  if (!payload.email && !payload.phone && !payload.userId && !payload.tokens?.length) {
    console.log(`[Notification] type=${type} — no email/phone on payload, logged only`, JSON.stringify(payload));
  }

  // WhatsApp: plug provider (e.g. WhatsApp Cloud API / Twilio) here when available.
  return { type, results };
});

module.exports = { notificationQueue, enqueueNotification };

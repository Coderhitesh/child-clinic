const nodemailer = require('nodemailer');
const env = require('../config/env');

let transporter = null;

const getTransporter = () => {
  if (transporter) return transporter;
  if (!env.EMAIL_HOST || !env.EMAIL_USER || !env.EMAIL_PASS) {
    console.warn('[Email] SMTP not configured — set EMAIL_HOST/EMAIL_USER/EMAIL_PASS in .env');
    return null;
  }
  transporter = nodemailer.createTransport({
    host: env.EMAIL_HOST,
    port: env.EMAIL_PORT,
    secure: env.EMAIL_SECURE, // true for 465, false for other ports (STARTTLS)
    auth: { user: env.EMAIL_USER, pass: env.EMAIL_PASS },
  });
  return transporter;
};

const sendEmail = async ({ to, subject, html, text, attachments }) => {
  const t = getTransporter();
  if (!t) return { sent: false, reason: 'smtp_not_configured' };
  if (!to) return { sent: false, reason: 'no_recipient' };

  const info = await t.sendMail({
    from: `"${env.EMAIL_FROM_NAME}" <${env.EMAIL_FROM_ADDRESS}>`,
    to,
    subject,
    html,
    text: text || undefined,
    attachments: attachments || undefined,
  });
  return { sent: true, messageId: info.messageId };
};

module.exports = { sendEmail };

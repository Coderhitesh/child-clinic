const admin = require('firebase-admin');
const env = require('../config/env');
const DeviceToken = require('../models/DeviceToken');

/**
 * Firebase Cloud Messaging.
 *
 * Credentials come from FIREBASE_SERVICE_ACCOUNT (raw JSON or base64) or from
 * GOOGLE_APPLICATION_CREDENTIALS pointing at the service-account file. With neither
 * set, push is simply skipped — the rest of the notification pipeline (email, SMS)
 * carries on, so local development needs no Firebase project.
 */
let app = null;
let initTried = false;

const init = () => {
  if (initTried) return app;
  initTried = true;

  try {
    const raw = env.FIREBASE_SERVICE_ACCOUNT;
    if (raw) {
      const json = raw.trim().startsWith('{')
        ? JSON.parse(raw)
        : JSON.parse(Buffer.from(raw, 'base64').toString('utf8'));
      app = admin.initializeApp({ credential: admin.credential.cert(json) });
    } else if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
      app = admin.initializeApp({ credential: admin.credential.applicationDefault() });
    } else {
      console.warn('[Push] no Firebase credentials configured — push notifications are disabled');
    }
  } catch (err) {
    console.error('[Push] could not initialise Firebase:', err.message);
    app = null;
  }
  return app;
};

// Android needs the channel id on the message, so every notification type maps to
// a channel the app creates at startup. Keep these two lists in sync.
const CHANNELS = {
  appointments: { id: 'appointments', sound: 'default' },
  reminders: { id: 'reminders', sound: 'default' },
  payments: { id: 'payments', sound: 'default' },
  prescriptions: { id: 'prescriptions', sound: 'default' },
  promotions: { id: 'promotions', sound: null },
  general: { id: 'general', sound: 'default' },
};

const TYPE_TO_CHANNEL = {
  booking_confirm: 'appointments',
  appointment_cancelled: 'appointments',
  reminder: 'reminders',
  prescription_ready: 'prescriptions',
  follow_up_due: 'reminders',
  password_reset: 'general',
  promotion: 'promotions',
};

const channelFor = (type) => CHANNELS[TYPE_TO_CHANNEL[type] || 'general'] || CHANNELS.general;

const tokensForUser = async (userId) => {
  if (!userId) return [];
  const rows = await DeviceToken.find({ user: userId, isActive: true }).select('token');
  return rows.map((r) => r.token);
};

// FCM tells us which tokens are dead; clear them so the list stays small.
const pruneTokens = async (tokens, responses) => {
  const dead = [];
  responses.forEach((r, i) => {
    const code = r.error?.code || '';
    if (code.includes('registration-token-not-registered') || code.includes('invalid-argument')) {
      dead.push(tokens[i]);
    }
  });
  if (dead.length) {
    await DeviceToken.updateMany({ token: { $in: dead } }, { isActive: false });
  }
};

const sendToTokens = async (tokens, { title, body, type = 'general', data = {} }) => {
  if (!init() || !tokens.length) return { sent: 0, skipped: true };

  const channel = channelFor(type);
  const payload = {
    notification: { title, body },
    data: Object.fromEntries(
      Object.entries({ type, ...data }).map(([k, v]) => [k, v == null ? '' : String(v)])
    ),
    android: {
      priority: type === 'reminder' ? 'high' : 'normal',
      notification: { channelId: channel.id, sound: channel.sound || undefined },
    },
    apns: {
      payload: { aps: { sound: channel.sound || undefined, 'content-available': 1 } },
    },
  };

  const res = await admin.messaging().sendEachForMulticast({ tokens, ...payload });
  await pruneTokens(tokens, res.responses);
  return { sent: res.successCount, failed: res.failureCount };
};

const sendToUser = async (userId, message) => {
  const tokens = await tokensForUser(userId);
  return sendToTokens(tokens, message);
};

module.exports = { sendToUser, sendToTokens, CHANNELS, TYPE_TO_CHANNEL, channelFor };

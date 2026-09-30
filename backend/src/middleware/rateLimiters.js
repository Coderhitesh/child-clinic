const rateLimit = require('express-rate-limit');
const { RedisStore } = require('rate-limit-redis');
const redisClient = require('../config/redis');

const makeLimiter = ({ windowMs, max, prefix }) =>
  rateLimit({
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    store: new RedisStore({
      sendCommand: (...args) => redisClient.call(...args),
      prefix: `rl:${prefix}:`,
    }),
    message: { success: false, message: 'Too many requests, slow down.' },
  });

const authLimiter = makeLimiter({ windowMs: 15 * 60 * 1000, max: 10, prefix: 'auth' });
const paymentLimiter = makeLimiter({ windowMs: 15 * 60 * 1000, max: 20, prefix: 'payment' });
const generalLimiter = makeLimiter({ windowMs: 15 * 60 * 1000, max: 300, prefix: 'general' });

module.exports = { authLimiter, paymentLimiter, generalLimiter };

const env = require('../config/env');

// shared bull config, redis via url
module.exports = {
  redis: env.REDIS_URL,
};

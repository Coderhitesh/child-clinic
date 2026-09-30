const redisClient = require('../config/redis');

const DEFAULT_TTL = 300; // 5 min

const cacheGet = async (key) => {
  const val = await redisClient.get(key);
  return val ? JSON.parse(val) : null;
};

const cacheSet = async (key, value, ttl = DEFAULT_TTL) => {
  await redisClient.set(key, JSON.stringify(value), 'EX', ttl);
};

const cacheDelByPrefix = async (prefix) => {
  const stream = redisClient.scanStream({ match: `${prefix}*` });
  const pipeline = redisClient.pipeline();
  let count = 0;
  for await (const keys of stream) {
    keys.forEach((k) => {
      pipeline.del(k);
      count += 1;
    });
  }
  if (count) await pipeline.exec();
};

module.exports = { cacheGet, cacheSet, cacheDelByPrefix };

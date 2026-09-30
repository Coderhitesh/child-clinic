const env = require('../config/env');

module.exports = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.isOperational ? err.message : 'Internal server error';

  if (env.NODE_ENV !== 'production') {
    console.error(err);
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(err.details ? { details: err.details } : {}),
    ...(env.NODE_ENV !== 'production' && !err.isOperational ? { stack: err.stack } : {}),
  });
};

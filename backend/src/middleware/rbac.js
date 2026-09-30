const ApiError = require('../utils/apiError');

// restrictTo('superadmin','clinic_admin')
const restrictTo = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return next(new ApiError(403, 'Not authorized for this action'));
  }
  next();
};

module.exports = { restrictTo };

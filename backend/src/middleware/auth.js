const ApiError = require('../utils/apiError');
const catchAsync = require('../utils/catchAsync');
const { verifyAccessToken } = require('../utils/jwt');
const User = require('../models/User');

const protect = catchAsync(async (req, res, next) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    throw new ApiError(401, 'Not authenticated');
  }
  const token = header.split(' ')[1];
  let decoded;
  try {
    decoded = verifyAccessToken(token);
  } catch {
    throw new ApiError(401, 'Invalid or expired token');
  }
  const user = await User.findById(decoded.id);
  if (!user || !user.isActive) throw new ApiError(401, 'User no longer active');
  req.user = user;
  next();
});

// Public routes: attach req.user when a valid token is sent, otherwise carry on as a guest.
// Lets public list endpoints narrow results for signed-in clinic staff.
const optionalAuth = async (req, res, next) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) return next();
  try {
    const decoded = verifyAccessToken(header.split(' ')[1]);
    const user = await User.findById(decoded.id);
    if (user && user.isActive) req.user = user;
  } catch {
    // invalid/expired token on a public route: treat as guest
  }
  next();
};

module.exports = { protect, optionalAuth };

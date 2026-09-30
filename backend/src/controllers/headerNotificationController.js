const HeaderNotification = require('../models/HeaderNotification');
const catchAsync = require('../utils/catchAsync');
const base = require('../utils/crudFactory')(HeaderNotification, { defaultSort: '-createdAt' });

// public: currently active notification(s) to show at top of site header
base.active = catchAsync(async (req, res) => {
  const now = new Date();
  const notifications = await HeaderNotification.find({
    isActive: true,
    $and: [
      { $or: [{ startDate: null }, { startDate: { $exists: false } }, { startDate: { $lte: now } }] },
      { $or: [{ endDate: null }, { endDate: { $exists: false } }, { endDate: { $gte: now } }] },
    ],
  }).sort('-createdAt');
  res.json({ success: true, data: notifications });
});

module.exports = base;

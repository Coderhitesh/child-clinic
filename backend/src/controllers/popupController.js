const Popup = require('../models/Popup');
const catchAsync = require('../utils/catchAsync');
const base = require('../utils/crudFactory')(Popup, { defaultSort: '-createdAt' });

base.active = catchAsync(async (req, res) => {
  const { page = 'home' } = req.query;
  const now = new Date();
  const popups = await Popup.find({
    isActive: true,
    $and: [
      { $or: [{ startDate: null }, { startDate: { $exists: false } }, { startDate: { $lte: now } }] },
      { $or: [{ endDate: null }, { endDate: { $exists: false } }, { endDate: { $gte: now } }] },
    ],
    $or: [{ targetPages: page }, { targetPages: 'all' }],
  });
  res.json({ success: true, data: popups });
});

module.exports = base;

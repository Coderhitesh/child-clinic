const Banner = require('../models/Banner');
const catchAsync = require('../utils/catchAsync');
const base = require('../utils/crudFactory')(Banner, { defaultSort: 'order' });

// public: active banners for a placement (+ within date window), e.g. GET /banners/active?placement=home_hero
base.active = catchAsync(async (req, res) => {
  const { placement, pageSlug } = req.query;
  const now = new Date();
  const filter = {
    isActive: true,
    placement: placement || 'home_hero',
    $and: [
      { $or: [{ startDate: null }, { startDate: { $exists: false } }, { startDate: { $lte: now } }] },
      { $or: [{ endDate: null }, { endDate: { $exists: false } }, { endDate: { $gte: now } }] },
    ],
  };
  if (pageSlug) filter.pageSlug = pageSlug;
  const banners = await Banner.find(filter).sort('order');
  res.json({ success: true, data: banners });
});

module.exports = base;

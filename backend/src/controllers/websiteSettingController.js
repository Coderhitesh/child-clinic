const WebsiteSetting = require('../models/WebsiteSetting');
const catchAsync = require('../utils/catchAsync');

// Singleton — public GET returns the one settings doc (creates a default one on first read).
exports.get = catchAsync(async (req, res) => {
  let settings = await WebsiteSetting.findOne();
  if (!settings) settings = await WebsiteSetting.create({});
  res.json({ success: true, data: settings });
});

exports.update = catchAsync(async (req, res) => {
  let settings = await WebsiteSetting.findOne();
  if (!settings) {
    settings = await WebsiteSetting.create(req.body);
  } else {
    Object.assign(settings, req.body);
    await settings.save();
  }
  res.json({ success: true, data: settings });
});

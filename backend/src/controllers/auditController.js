const AuditLog = require('../models/AuditLog');
const catchAsync = require('../utils/catchAsync');
const User = require('../models/User');
const { isClinicScoped, ownClinicIds } = require('../utils/clinicAccess');

exports.list = catchAsync(async (req, res) => {
  const { resourceType, userId, page = 1, limit = 50 } = req.query;
  const filter = {};
  if (resourceType) filter.resourceType = resourceType;
  if (userId) filter.user = userId;

  // clinic_admin: only actions by staff of its own clinic(s)
  if (isClinicScoped(req.user)) {
    const staffIds = (await User.distinct('_id', { clinics: { $in: ownClinicIds(req.user) } })).map(String);
    filter.user = userId && staffIds.includes(String(userId)) ? userId : { $in: staffIds };
  }

  const logs = await AuditLog.find(filter)
    .sort('-createdAt')
    .skip((page - 1) * limit)
    .limit(Number(limit))
    .populate('user', 'name email role');

  res.json({ success: true, data: logs });
});

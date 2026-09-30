const DeviceToken = require('../models/DeviceToken');
const catchAsync = require('../utils/catchAsync');
const ApiError = require('../utils/apiError');
const { logAudit } = require('../middleware/audit');
const User = require('../models/User');
const Appointment = require('../models/Appointment');
const { isClinicScoped, ownClinicIds } = require('../utils/clinicAccess');

// clinic_admin: accounts linked to its clinic(s) — own staff + people who booked there
const scopedUserIds = async (user) => {
  const own = ownClinicIds(user);
  const [staff, bookers] = await Promise.all([
    User.distinct('_id', { clinics: { $in: own } }),
    Appointment.distinct('bookedBy', { clinic: { $in: own } }),
  ]);
  return [...new Set([...staff, ...bookers].map(String))];
};
const { sendToUser, sendToTokens } = require('../services/pushService');

// The app calls this after every launch and on every token refresh; upserting on the
// token keeps one row per install even across reinstalls and account switches.
exports.register = catchAsync(async (req, res) => {
  const { token, platform, deviceId, deviceName, appVersion, topics, permissionGranted, osVersion } = req.body;
  if (!token) throw new ApiError(400, 'token required');
  if (!['android', 'ios', 'web'].includes(platform)) throw new ApiError(400, 'platform must be android, ios or web');

  const device = await DeviceToken.findOneAndUpdate(
    { token },
    {
      token,
      user: req.user._id,
      platform,
      deviceId,
      deviceName,
      appVersion,
      osVersion,
      ...(topics ? { topics } : {}),
      ...(permissionGranted === undefined ? {} : { permissionGranted }),
      isActive: true,
      lastSeenAt: new Date(),
    },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );

  res.status(201).json({ success: true, data: device });
});

// Called on sign-out: the install stays, the account link does not.
exports.unregister = catchAsync(async (req, res) => {
  const { token } = req.body;
  if (!token) throw new ApiError(400, 'token required');
  await DeviceToken.findOneAndUpdate({ token }, { user: null, isActive: false });
  res.json({ success: true, message: 'Device unregistered' });
});

exports.myDevices = catchAsync(async (req, res) => {
  const rows = await DeviceToken.find({ user: req.user._id, isActive: true }).sort('-lastSeenAt');
  res.json({ success: true, data: rows });
});

// Staff tool: fire a test push at your own devices to check the wiring end to end.
exports.test = catchAsync(async (req, res) => {
  const result = await sendToUser(req.user._id, {
    title: req.body.title || 'Test notification',
    body: req.body.body || 'If you can read this, push is wired up correctly.',
    type: req.body.type || 'general',
  });
  res.json({ success: true, data: result });
});

/* ------------------------------------------------------------ admin views */

// Who can actually be reached: one row per install, newest first.
exports.adminList = catchAsync(async (req, res) => {
  const { platform, permission, search } = req.query;
  const filter = { isActive: true };
  if (platform) filter.platform = platform;
  if (permission === 'granted') filter.permissionGranted = true;
  if (permission === 'denied') filter.permissionGranted = false;

  if (search) {
    const users = await User.find({
      $or: [
        { name: new RegExp(search, 'i') },
        { email: new RegExp(search, 'i') },
        { phone: new RegExp(search, 'i') },
      ],
    }).select('_id');
    filter.user = { $in: users.map((u) => u._id) };
  }

  if (isClinicScoped(req.user)) {
    const allowed = await scopedUserIds(req.user);
    const current = filter.user ? filter.user.$in.map(String) : allowed;
    filter.user = { $in: current.filter((id) => allowed.includes(id)) };
  }

  const rows = await DeviceToken.find(filter)
    .populate('user', 'name email phone role')
    .sort('-lastSeenAt')
    .limit(Number(req.query.limit) || 500);

  res.json({ success: true, data: rows });
});

// Headline numbers for the console: reach, and where it is leaking.
exports.stats = catchAsync(async (req, res) => {
  const base = { isActive: true };
  const userBase = { role: 'patient', isActive: true };
  if (isClinicScoped(req.user)) {
    const mongoose = require('mongoose');
    const allowed = (await scopedUserIds(req.user)).map((id) => new mongoose.Types.ObjectId(id));
    base.user = { $in: allowed };
    userBase._id = { $in: allowed };
  }
  const [total, granted, byPlatform, patients, reachableUsers] = await Promise.all([
    DeviceToken.countDocuments(base),
    DeviceToken.countDocuments({ ...base, permissionGranted: true }),
    DeviceToken.aggregate([
      { $match: base },
      { $group: { _id: '$platform', count: { $sum: 1 } } },
    ]),
    User.countDocuments(userBase),
    DeviceToken.distinct('user', {
      ...base,
      permissionGranted: true,
      user: base.user ? base.user : { $ne: null },
    }),
  ]);

  res.json({
    success: true,
    data: {
      devices: total,
      permissionGranted: granted,
      permissionDenied: total - granted,
      byPlatform,
      patients,
      usersReachable: reachableUsers.length,
      // patients with the app installed and notifications allowed
      coverage: patients ? Math.round((reachableUsers.length / patients) * 100) : 0,
    },
  });
});

// One-off push from the console: everyone, one patient, or a single install.
exports.broadcast = catchAsync(async (req, res) => {
  const { title, body, type = 'promotion', audience = 'all', userId, token, data } = req.body;
  if (!title || !body) throw new ApiError(400, 'title and body required');

  const message = { title, body, type, data: data || {} };

  if (audience === 'device') {
    if (!token) throw new ApiError(400, 'token required for a single device');
    const result = await sendToTokens([token], message);
    return res.json({ success: true, data: result });
  }

  if (audience === 'user') {
    if (!userId) throw new ApiError(400, 'userId required');
    const result = await sendToUser(userId, message);
    return res.json({ success: true, data: result });
  }

  // everyone reachable, in batches — FCM caps a multicast at 500 tokens
  const rows = await DeviceToken.find({ isActive: true, permissionGranted: true }).select('token');
  const tokens = rows.map((r) => r.token);
  let sent = 0;
  let failed = 0;
  for (let i = 0; i < tokens.length; i += 500) {
    // eslint-disable-next-line no-await-in-loop
    const result = await sendToTokens(tokens.slice(i, i + 500), message);
    sent += result.sent || 0;
    failed += result.failed || 0;
  }

  await logAudit({ req, action: 'PUSH_BROADCAST', resourceType: 'DeviceToken', meta: { title, type, tokens: tokens.length } });
  return res.json({ success: true, data: { targeted: tokens.length, sent, failed } });
});

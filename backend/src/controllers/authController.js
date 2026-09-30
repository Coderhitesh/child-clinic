const crypto = require('crypto');
const User = require('../models/User');
const catchAsync = require('../utils/catchAsync');
const ApiError = require('../utils/apiError');
const { signAccessToken, signRefreshToken, verifyRefreshToken } = require('../utils/jwt');
const { setOtp, verifyOtp } = require('../utils/otp');
const { enqueueOtpDelivery } = require('../queues/otpQueue');
const { enqueueNotification } = require('../queues/notificationQueue');
const env = require('../config/env');

// '' must never reach the DB: email/phone are unique+sparse, so an empty string
// counts as a real value and the 2nd user without one would hit a duplicate-key error.
const clean = (v) => {
  if (v === undefined || v === null) return undefined;
  const t = String(v).trim();
  return t || undefined;
};

const issueTokens = (user) => {
  const payload = { id: user._id, role: user.role, v: user.refreshTokenVersion };
  return {
    accessToken: signAccessToken({ id: user._id, role: user.role }),
    refreshToken: signRefreshToken(payload),
  };
};

exports.register = catchAsync(async (req, res) => {
  const { name, password, role } = req.body;
  const email = clean(req.body.email);
  const phone = clean(req.body.phone);
  // public self-signup only ever creates 'patient' accounts; staff created by admins.
  const safeRole = ['patient'].includes(role) ? role : 'patient';
  const user = await User.create({ name, email, phone, password, role: safeRole });
  const tokens = issueTokens(user);
  res.status(201).json({ success: true, data: { user: sanitize(user), ...tokens } });
});

exports.createStaff = catchAsync(async (req, res) => {
  // superadmin -> any role; clinic_admin -> doctor/receptionist within own clinic only
  const { name, password, role, clinics, doctorProfile } = req.body;
  const email = clean(req.body.email);
  const phone = clean(req.body.phone);
  if (req.user.role === 'clinic_admin') {
    if (!['doctor', 'receptionist'].includes(role)) {
      throw new ApiError(403, 'clinic_admin can only create doctor/receptionist accounts');
    }
    const own = (req.user.clinics || []).map((c) => c.toString());
    const requested = (clinics || []).map((c) => c.toString());
    if (requested.some((c) => !own.includes(c))) {
      throw new ApiError(403, 'Cannot assign staff outside your clinic');
    }
  }
  const user = await User.create({ name, email, phone, password, role, clinics, doctorProfile });
  res.status(201).json({ success: true, data: sanitize(user) });
});

exports.login = catchAsync(async (req, res) => {
  const { password } = req.body;
  // `email` may carry either an email or a mobile number
  const identifier = clean(req.body.email ?? req.body.identifier);
  if (!identifier || !password) throw new ApiError(400, 'Email or mobile and password are required');
  const user = await User.findOne(
    identifier.includes('@') ? { email: identifier.toLowerCase() } : { phone: identifier }
  ).select('+password');
  if (!user) throw new ApiError(401, 'Invalid credentials');
  if (!user.password) {
    // account was created by OTP and has no password yet
    throw new ApiError(400, 'This account signs in with an OTP. Request one, then set a password from your profile.');
  }
  if (!(await user.comparePassword(password))) throw new ApiError(401, 'Invalid credentials');
  if (!user.isActive) throw new ApiError(403, 'Account disabled');
  user.lastLoginAt = new Date();
  await user.save({ validateBeforeSave: false });
  const tokens = issueTokens(user);
  res.json({ success: true, data: { user: sanitize(user), ...tokens } });
});

exports.refresh = catchAsync(async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) throw new ApiError(400, 'refreshToken required');
  let decoded;
  try {
    decoded = verifyRefreshToken(refreshToken);
  } catch {
    throw new ApiError(401, 'Invalid refresh token');
  }
  const user = await User.findById(decoded.id);
  if (!user || user.refreshTokenVersion !== decoded.v) {
    throw new ApiError(401, 'Refresh token revoked');
  }
  const tokens = issueTokens(user);
  res.json({ success: true, data: tokens });
});

exports.logout = catchAsync(async (req, res) => {
  // rotate refresh token version -> invalidates all outstanding refresh tokens
  req.user.refreshTokenVersion += 1;
  await req.user.save({ validateBeforeSave: false });
  res.json({ success: true, message: 'Logged out' });
});

exports.requestOtp = catchAsync(async (req, res) => {
  const { identifier } = req.body; // phone or email
  if (!identifier) throw new ApiError(400, 'identifier required');

  const existing = await User.findOne({ $or: [{ phone: identifier }, { email: identifier }] });
  if (existing && !existing.isActive) throw new ApiError(403, 'Account disabled');

  const otp = await setOtp(identifier);
  console.log(`OTP for ${identifier}: ${otp} (expires in ${env.OTP_TTL_MINUTES} minutes)`);
  const isEmail = identifier.includes('@');
  console.log("isEmail",isEmail)
  await enqueueOtpDelivery(
    isEmail ? { email: identifier, otp } : { phone: identifier, otp }
  ); // queued, never sync send

  // tells the frontend whether to collect a name on the verify step
  res.json({ success: true, message: 'OTP queued for delivery', data: { accountExists: Boolean(existing) } });
});

// Verifying an OTP signs the person in — and if there is no account for that phone or
// email yet, one is created on the spot as a patient. This is what lets someone book
// without registering first: they only ever prove the number is theirs.
exports.verifyOtpLogin = catchAsync(async (req, res) => {
  const { identifier, otp, name } = req.body;
  const ok = await verifyOtp(identifier, otp);
  if (!ok) throw new ApiError(400, 'Invalid or expired OTP');

  const isEmail = String(identifier).includes('@');
  let user = await User.findOne({ $or: [{ phone: identifier }, { email: identifier }] });
  let created = false;

  if (!user) {
    user = await User.create({
      name: (name || '').trim() || (isEmail ? identifier.split('@')[0] : `Guest ${String(identifier).slice(-4)}`),
      ...(isEmail ? { email: identifier } : { phone: identifier }),
      role: 'patient',
      // no password — they can set one later from their profile
    });
    created = true;
  }

  if (!user.isActive) throw new ApiError(403, 'Account disabled');

  user.lastLoginAt = new Date();
  await user.save({ validateBeforeSave: false });

  const tokens = issueTokens(user);
  res.status(created ? 201 : 200).json({
    success: true,
    data: { user: sanitize(user), ...tokens, isNewAccount: created },
  });
});

exports.me = catchAsync(async (req, res) => {
  // +password so sanitize() can report hasPassword; the field itself is stripped
  const user = await User.findById(req.user._id).select('+password');
  res.json({ success: true, data: sanitize(user) });
});

// emails a one-time reset link. Always answers 200 so the endpoint can't be used
// to discover which addresses have accounts.
exports.forgotPassword = catchAsync(async (req, res) => {
  const { email } = req.body;
  if (!email) throw new ApiError(400, 'email required');

  const user = await User.findOne({ email: String(email).toLowerCase() });
  if (user && user.isActive) {
    const raw = crypto.randomBytes(32).toString('hex');
    user.passwordResetToken = crypto.createHash('sha256').update(raw).digest('hex');
    user.passwordResetExpires = new Date(Date.now() + env.PASSWORD_RESET_TTL_MINUTES * 60 * 1000);
    await user.save({ validateBeforeSave: false });

    const link = `${env.FRONTEND_BASE_URL}/reset-password?token=${raw}`;
    await enqueueNotification('password_reset', {
      email: user.email,
      phone: user.phone,
      name: user.name,
      link,
      minutes: env.PASSWORD_RESET_TTL_MINUTES,
    });
  }

  res.json({ success: true, message: 'If that email has an account, a reset link is on its way' });
});

exports.resetPassword = catchAsync(async (req, res) => {
  const { token, password } = req.body;
  if (!token || !password) throw new ApiError(400, 'token and password required');
  if (String(password).length < 8) throw new ApiError(400, 'Password must be at least 8 characters');

  const hashed = crypto.createHash('sha256').update(token).digest('hex');
  const user = await User.findOne({
    passwordResetToken: hashed,
    passwordResetExpires: { $gt: new Date() },
  }).select('+passwordResetToken +passwordResetExpires');

  if (!user) throw new ApiError(400, 'This reset link is invalid or has expired');

  user.password = password;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  user.refreshTokenVersion += 1; // kill every existing session
  await user.save();

  const tokens = issueTokens(user);
  res.json({ success: true, data: { user: sanitize(user), ...tokens } });
});

// list staff/users — superadmin sees all, clinic_admin only its own clinics' staff
exports.listUsers = catchAsync(async (req, res) => {
  const { role, search } = req.query;
  const filter = {};
  if (req.user.role === 'clinic_admin') {
    filter.clinics = { $in: req.user.clinics };
    filter.role = { $in: role ? [role] : ['doctor', 'receptionist'] };
  } else if (role) {
    filter.role = role;
  }
  if (search) {
    filter.$or = [
      { name: new RegExp(search, 'i') },
      { email: new RegExp(search, 'i') },
      { phone: new RegExp(search, 'i') },
    ];
  }

  const users = await User.find(filter)
    .populate('clinics', 'name')
    .sort('-createdAt')
    .limit(Number(req.query.limit) || 500);

  res.json({ success: true, data: users.map(sanitize) });
});

// admin edit of a staff account — role/clinics/active state, optional password reset
exports.updateUser = catchAsync(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) throw new ApiError(404, 'User not found');

  if (req.user.role === 'clinic_admin') {
    if (!['doctor', 'receptionist'].includes(user.role)) {
      throw new ApiError(403, 'clinic_admin can only manage doctor/receptionist accounts');
    }
    const own = (req.user.clinics || []).map((c) => c.toString());
    const belongs = (user.clinics || []).some((c) => own.includes(c.toString()));
    if (!belongs) throw new ApiError(403, 'Cannot manage staff outside your clinic');
  }

  const { name, role, clinics, isActive, password } = req.body;
  if (name !== undefined) user.name = name;
  if (req.body.email !== undefined) user.email = clean(req.body.email);
  if (req.body.phone !== undefined) user.phone = clean(req.body.phone);
  if (clinics !== undefined) {
    if (req.user.role === 'clinic_admin') {
      const own = (req.user.clinics || []).map((c) => c.toString());
      if ((clinics || []).some((c) => !own.includes(String(c)))) {
        throw new ApiError(403, 'Cannot assign staff outside your clinic');
      }
      // links to other clinics are kept; clinic_admin only edits its own
      const others = (user.clinics || []).filter((c) => !own.includes(c.toString()));
      user.clinics = [...others, ...(clinics || [])];
    } else {
      user.clinics = clinics;
    }
  }
  if (isActive !== undefined) user.isActive = isActive;
  if (role !== undefined && req.user.role === 'superadmin') user.role = role;
  if (password) {
    user.password = password;
    user.refreshTokenVersion += 1; // force re-login everywhere
  }
  await user.save();

  res.json({ success: true, data: sanitize(user) });
});

// signed-in user edits their own name/phone/email, or changes password
exports.updateMe = catchAsync(async (req, res) => {
  const { name, currentPassword, newPassword } = req.body;
  const user = await User.findById(req.user._id).select('+password');
  if (!user) throw new ApiError(404, 'User not found');

  if (name !== undefined) user.name = name;
  // email is optional: blank clears it (as long as a mobile number remains)
  if (req.body.email !== undefined) user.email = clean(req.body.email);
  if (req.body.phone !== undefined) user.phone = clean(req.body.phone);

  if (newPassword) {
    // an OTP-created account has no password yet, so the first one needs no current password
    if (user.password) {
      if (!currentPassword) throw new ApiError(400, 'currentPassword required');
      const ok = await user.comparePassword(currentPassword);
      if (!ok) throw new ApiError(401, 'Current password is incorrect');
    }
    user.password = newPassword;
    user.refreshTokenVersion += 1;
  }

  await user.save();
  res.json({ success: true, data: sanitize(user) });
});

function sanitize(user) {
  const obj = user.toObject ? user.toObject() : user;
  // hasPassword lets the UI decide between "change password" and "set a password"
  obj.hasPassword = Boolean(obj.password);
  delete obj.password;
  delete obj.passwordResetToken;
  delete obj.passwordResetExpires;
  return obj;
}

const Coupon = require('../models/Coupon');
const catchAsync = require('../utils/catchAsync');
const ApiError = require('../utils/apiError');
const { computeDiscount } = require('../services/couponService');
const { isClinicScoped, ownClinicIds, assertAllWithinOwn } = require('../utils/clinicAccess');

// clinic_admin: only coupons limited to its own clinic(s). Global coupons (no clinic list)
// and coupons shared with other clinics stay with superadmin.
const scopedCouponFilter = (user) => ({
  'applicableClinics.0': { $exists: true },
  applicableClinics: { $not: { $elemMatch: { $nin: ownClinicIds(user) } } },
});

const findScopedCoupon = async (req) => {
  const filter = { _id: req.params.id };
  if (isClinicScoped(req.user)) Object.assign(filter, scopedCouponFilter(req.user));
  const coupon = await Coupon.findOne(filter);
  if (!coupon) throw new ApiError(404, 'Coupon not found');
  return coupon;
};

const scopeCouponBody = (req) => {
  if (!isClinicScoped(req.user)) return;
  if (!Array.isArray(req.body.applicableClinics) || !req.body.applicableClinics.length) {
    req.body.applicableClinics = ownClinicIds(req.user);
  }
  assertAllWithinOwn(req.user, req.body.applicableClinics);
};

exports.create = catchAsync(async (req, res) => {
  scopeCouponBody(req);
  const coupon = await Coupon.create(req.body);
  res.status(201).json({ success: true, data: coupon });
});

exports.list = catchAsync(async (req, res) => {
  const filter = req.query.includeInactive === 'true' ? {} : { isActive: true };
  if (isClinicScoped(req.user)) Object.assign(filter, scopedCouponFilter(req.user));
  const coupons = await Coupon.find(filter).sort('-createdAt');
  res.json({ success: true, data: coupons });
});

exports.getOne = catchAsync(async (req, res) => {
  const coupon = await findScopedCoupon(req);
  res.json({ success: true, data: coupon });
});

exports.update = catchAsync(async (req, res) => {
  await findScopedCoupon(req);
  if (req.body.applicableClinics !== undefined) scopeCouponBody(req);
  const coupon = await Coupon.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!coupon) throw new ApiError(404, 'Coupon not found');
  res.json({ success: true, data: coupon });
});

exports.remove = catchAsync(async (req, res) => {
  await findScopedCoupon(req);
  const coupon = await Coupon.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
  if (!coupon) throw new ApiError(404, 'Coupon not found');
  res.json({ success: true, message: 'Coupon deactivated' });
});

// POST /coupons/validate — preview discount without booking (frontend shows this before confirm)
exports.validate = catchAsync(async (req, res) => {
  const { code, amount, clinicId, specialityId } = req.body;
  const { coupon, discount } = await computeDiscount({
    code,
    userId: req.user._id,
    amount,
    clinicId,
    specialityId,
  });
  res.json({
    success: true,
    data: {
      valid: true,
      discount,
      payableAmount: amount - discount,
      coupon: { code: coupon.code, description: coupon.description },
    },
  });
});

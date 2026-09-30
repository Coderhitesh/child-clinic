const Coupon = require('../models/Coupon');
const CouponUsage = require('../models/CouponUsage');
const ApiError = require('../utils/apiError');

const computeDiscount = async ({ code, userId, amount, clinicId, specialityId }) => {
  const coupon = await Coupon.findOne({ code: code.toUpperCase(), isActive: true });
  if (!coupon) throw new ApiError(404, 'Invalid coupon code');

  const now = new Date();
  if (coupon.validFrom > now || coupon.validTo < now) {
    throw new ApiError(400, 'Coupon is expired or not yet valid');
  }
  if (amount < coupon.minAppointmentAmount) {
    throw new ApiError(400, `Minimum consultation amount of ${coupon.minAppointmentAmount} required`);
  }
  if (coupon.applicableClinics.length && !coupon.applicableClinics.map((c) => c.toString()).includes(String(clinicId))) {
    throw new ApiError(400, 'Coupon not applicable at this clinic');
  }
  if (
    coupon.applicableSpecialities.length &&
    !coupon.applicableSpecialities.map((s) => s.toString()).includes(String(specialityId))
  ) {
    throw new ApiError(400, 'Coupon not applicable for this speciality');
  }
  if (coupon.usageLimitTotal && coupon.usedCount >= coupon.usageLimitTotal) {
    throw new ApiError(400, 'Coupon usage limit reached');
  }

  const userUsageCount = await CouponUsage.countDocuments({ coupon: coupon._id, user: userId });
  if (userUsageCount >= coupon.usageLimitPerUser) {
    throw new ApiError(400, 'You have already used this coupon');
  }

  let discount =
    coupon.discountType === 'percentage' ? (amount * coupon.discountValue) / 100 : coupon.discountValue;
  if (coupon.discountType === 'percentage' && coupon.maxDiscountAmount) {
    discount = Math.min(discount, coupon.maxDiscountAmount);
  }
  discount = Math.min(discount, amount);

  return { coupon, discount: Math.round(discount * 100) / 100 };
};

// Called once an appointment is actually confirmed (pay_at_clinic immediately,
// bookings are confirmed) — never on cancelled ones.
const recordCouponUsage = async ({ couponId, userId, appointmentId, discountApplied }) => {
  await CouponUsage.create({ coupon: couponId, user: userId, appointment: appointmentId, discountApplied });
  await Coupon.findByIdAndUpdate(couponId, { $inc: { usedCount: 1 } });
};

module.exports = { computeDiscount, recordCouponUsage };

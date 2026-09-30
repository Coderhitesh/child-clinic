const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    description: String,
    discountType: { type: String, enum: ['percentage', 'flat'], required: true },
    discountValue: { type: Number, required: true, min: 0 }, // percentage (0-100) or flat amount
    maxDiscountAmount: Number, // cap for percentage-type coupons
    minAppointmentAmount: { type: Number, default: 0 },
    applicableClinics: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Clinic' }], // empty = all clinics
    applicableSpecialities: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Speciality' }], // empty = all
    usageLimitTotal: Number, // null = unlimited
    usageLimitPerUser: { type: Number, default: 1 },
    usedCount: { type: Number, default: 0 },
    validFrom: { type: Date, default: Date.now },
    validTo: { type: Date, required: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Coupon', couponSchema);

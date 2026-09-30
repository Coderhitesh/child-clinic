const mongoose = require('mongoose');
const seoSchema = require('./seoSchema');
const { FIXED_CONSULTATION_FEE } = require('../config/fees');

const doctorSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true, trim: true },
    speciality: { type: mongoose.Schema.Types.ObjectId, ref: 'Speciality', required: true },
    clinics: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Clinic', required: true }],
    qualification: String,
    about: { type: String, trim: true },
    photo: String,
    experienceYears: Number,
    // fixed for every doctor — see config/fees.js
    consultationFee: { type: Number, default: FIXED_CONSULTATION_FEE, min: 0, max: FIXED_CONSULTATION_FEE },
    // per-clinic timings for slot generation
    clinicTimings: [
      {
        clinic: { type: mongoose.Schema.Types.ObjectId, ref: 'Clinic' },
        startTime: { type: String, default: '09:00' },
        endTime: { type: String, default: '17:00' },
        slotDurationMinutes: { type: Number, default: 15 },
        workingDays: { type: [Number], default: [1, 2, 3, 4, 5, 6] },
      },
    ],
    isActive: { type: Boolean, default: true },
    seo: { type: seoSchema, default: () => ({}) },
  },
  { timestamps: true }
);

// whatever the client sends, a doctor's fee is always the fixed fee
doctorSchema.pre('validate', function (next) {
  this.consultationFee = FIXED_CONSULTATION_FEE;
  next();
});

module.exports = mongoose.model('Doctor', doctorSchema);

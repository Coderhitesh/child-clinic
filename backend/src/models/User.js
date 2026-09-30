const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    // email and phone are both optional on their own — an OTP signup may only have a
    // phone number — but a user must have at least one of them (checked below).
    email: { type: String, unique: true, sparse: true, lowercase: true, trim: true },
    phone: { type: String, unique: true, sparse: true, trim: true },
    // absent for accounts created by OTP; they sign in with an OTP until they set one
    password: { type: String, minlength: 8, select: false },
    role: {
      type: String,
      enum: ['superadmin', 'clinic_admin', 'doctor', 'receptionist', 'patient'],
      required: true,
      default: 'patient',
    },
    // scoping: clinic_admin/doctor/receptionist tied to clinic(s)
    clinics: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Clinic' }],
    doctorProfile: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor' },
    isActive: { type: Boolean, default: true },
    refreshTokenVersion: { type: Number, default: 0 },
    passwordResetToken: { type: String, select: false }, // sha256 of the emailed token
    passwordResetExpires: { type: Date, select: false },
    lastLoginAt: Date,
  },
  { timestamps: true }
);

userSchema.pre('validate', function (next) {
  if (!this.email && !this.phone) {
    return next(new Error('A user needs an email or a phone number'));
  }
  next();
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('password') || !this.password) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = function (candidate) {
  if (!this.password) return Promise.resolve(false);
  return bcrypt.compare(candidate, this.password);
};

module.exports = mongoose.model('User', userSchema);

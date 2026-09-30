const mongoose = require('mongoose');

// One global default record (clinic: null) + optional per-clinic overrides.
const paymentModeSettingSchema = new mongoose.Schema(
  {
    clinic: { type: mongoose.Schema.Types.ObjectId, ref: 'Clinic', default: null, unique: true, sparse: true },
    payAtClinicEnabled: { type: Boolean, default: true },
    payOnlineEnabled: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('PaymentModeSetting', paymentModeSettingSchema);

const mongoose = require('mongoose');

const slotSchema = new mongoose.Schema(
  {
    clinic: { type: mongoose.Schema.Types.ObjectId, ref: 'Clinic', required: true },
    doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true },
    date: { type: String, required: true }, // YYYY-MM-DD
    startTime: { type: String, required: true }, // HH:mm
    endTime: { type: String, required: true },
    status: {
      type: String,
      enum: ['available', 'held', 'booked', 'blocked'],
      default: 'available',
    },
    appointment: { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment' },
    blockedReason: String,
    isWalkIn: { type: Boolean, default: false }, // created at the desk, outside the generated grid
  },
  { timestamps: true }
);

slotSchema.index({ clinic: 1, doctor: 1, date: 1, startTime: 1 }, { unique: true });

module.exports = mongoose.model('Slot', slotSchema);

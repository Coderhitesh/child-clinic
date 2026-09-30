const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema(
  {
    speciality: { type: mongoose.Schema.Types.ObjectId, ref: 'Speciality', required: true },
    clinic: { type: mongoose.Schema.Types.ObjectId, ref: 'Clinic', required: true },
    doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true },
    slot: { type: mongoose.Schema.Types.ObjectId, ref: 'Slot', required: true },
    patient: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
    bookedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: String, required: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    source: { type: String, enum: ['online', 'walk_in'], default: 'online' },
    reminderSentAt: { type: Date, default: null },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'completed', 'cancelled', 'no_show'],
      default: 'pending',
    },
    // payment is always at the clinic ('pay_online' kept only so old records still validate)
    paymentMethod: { type: String, enum: ['pay_at_clinic', 'pay_online'], default: 'pay_at_clinic' },
    payment: { type: mongoose.Schema.Types.ObjectId, ref: 'Payment' },
    consultationFee: { type: Number, required: true },
    couponCode: String,
    discountAmount: { type: Number, default: 0 },
    payableAmount: { type: Number },
    symptoms: String,
    diagnosis: String,
    doctorNotes: String,
    followUpDate: Date,
    prescription: { type: mongoose.Schema.Types.ObjectId, ref: 'Prescription' },
    // YouTube video shared with the patient for this visit (set by clinic staff / admin)
    youtubeUrl: { type: String, trim: true },
    videoTitle: { type: String, trim: true },
    videoUpdatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    videoUpdatedAt: Date,
    // manual fee change on this appointment (superadmin / clinic_admin)
    feeUpdatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    feeUpdatedAt: Date,
    cancelledReason: String,
    cancelledBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

appointmentSchema.index({ clinic: 1, doctor: 1, date: 1 });
appointmentSchema.index({ patient: 1 });

module.exports = mongoose.model('Appointment', appointmentSchema);

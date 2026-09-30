const mongoose = require('mongoose');

const prescriptionSchema = new mongoose.Schema(
  {
    appointment: { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment', required: true },
    patient: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
    doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true },
    clinic: { type: mongoose.Schema.Types.ObjectId, ref: 'Clinic', required: true },
    diagnosis: String,
    medicines: [
      {
        name: String,
        dosage: String,
        frequency: String,
        durationDays: Number,
        instructions: String,
        timings: { type: [String], default: [] }, // morning | afternoon | evening | night
        food: { type: String, enum: ['', 'before', 'after', 'with'], default: '' },
      },
    ],
    images: { type: [String], default: [] }, // uploaded prescription photos / pdf
    generalInstructions: String,
    followUpDate: Date,
    pdfUrl: String,
    pdfVersion: { type: Number, default: 0 },
    pdfStatus: { type: String, enum: ['pending', 'generated', 'failed'], default: 'pending' },
    deliveredVia: [{ type: String, enum: ['email', 'sms', 'whatsapp', 'account'] }],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Prescription', prescriptionSchema);

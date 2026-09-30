const mongoose = require('mongoose');
const { nextPatientId } = require('../services/patientIdService');

const patientSchema = new mongoose.Schema(
  {
    // human-readable unique id, e.g. PT-000123. Set automatically; never edited.
    patientId: { type: String, unique: true, sparse: true, trim: true },
    guardianUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // parent/patient login account
    // clinics this patient belongs to (added on booking / when clinic staff create the record)
    clinics: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Clinic' }],
    name: { type: String, required: true, trim: true },
    dob: Date,
    age: Number,
    gender: { type: String, enum: ['male', 'female', 'other'] },
    contact: {
      phone: String,
      email: String,
    },
    guardianDetails: {
      name: String,
      relation: String,
      phone: String,
    },
    // generic per-speciality dynamic fields (pregnancy details, joint history, etc.)
    extraDetails: { type: mongoose.Schema.Types.Mixed, default: {} },
    isArchived: { type: Boolean, default: false },
    uploadedDocs: [
      {
        name: String,
        url: String,
        uploadedAt: { type: Date, default: Date.now },
      },
    ],
    assignedVideos: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Video' }],
    isEncrypted: { type: Boolean, default: false }, // marker: sensitive fields encrypted at rest
  },
  { timestamps: true }
);

patientSchema.index({ clinics: 1 });

// every new patient gets the next id automatically, whichever route created it
patientSchema.pre('validate', async function assignPatientId(next) {
  try {
    if (this.isNew && !this.patientId) this.patientId = await nextPatientId();
    next();
  } catch (err) {
    next(err);
  }
});

module.exports = mongoose.model('Patient', patientSchema);

const mongoose = require('mongoose');

const videoSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    youtubeUrl: { type: String, required: true },
    category: {
      type: String,
      enum: [
        'treatment',
        'therapy_exercises',
        'parenting_guidance',
        'nutrition',
        'development',
        'post_treatment_care',
        'doctor_advice',
        'general',
      ],
      default: 'general',
    },
    speciality: { type: mongoose.Schema.Types.ObjectId, ref: 'Speciality' },
    assignedPatients: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Patient' }],
    description: String,
    isActive: { type: Boolean, default: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    // owning clinic; null = global library managed by superadmin
    clinic: { type: mongoose.Schema.Types.ObjectId, ref: 'Clinic', default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Video', videoSchema);

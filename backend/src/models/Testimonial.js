const mongoose = require('mongoose');

const testimonialSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    designation: String,
    photo: String,
    rating: { type: Number, min: 1, max: 5, default: 5 },
    message: { type: String, required: true },
    clinic: { type: mongoose.Schema.Types.ObjectId, ref: 'Clinic' },
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Testimonial', testimonialSchema);

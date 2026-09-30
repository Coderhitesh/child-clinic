const mongoose = require('mongoose');
const seoSchema = require('./seoSchema');

const specialitySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    description: { type: String, trim: true },
    image: String,
    isActive: { type: Boolean, default: true },
    seo: { type: seoSchema, default: () => ({}) },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Speciality', specialitySchema);

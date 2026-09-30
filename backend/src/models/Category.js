const mongoose = require('mongoose');
const seoSchema = require('./seoSchema');

const categorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    type: { type: String, enum: ['blog', 'video', 'service', 'general'], default: 'general' },
    image: String,
    description: String,
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    seo: { type: seoSchema, default: () => ({}) },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Category', categorySchema);

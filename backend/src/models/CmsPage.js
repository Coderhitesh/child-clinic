const mongoose = require('mongoose');
const seoSchema = require('./seoSchema');

const cmsPageSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    content: { type: String, required: true }, // HTML/rich text
    type: {
      type: String,
      enum: ['privacy_policy', 'terms_conditions', 'disclaimer', 'refund_policy', 'about', 'other'],
      default: 'other',
    },
    seo: { type: seoSchema, default: () => ({}) },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('CmsPage', cmsPageSchema);

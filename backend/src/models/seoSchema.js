const mongoose = require('mongoose');

// Reusable SEO sub-schema — attach to any model that maps to a public page
// (clinics, doctors, specialities, categories, cms pages, blogs, etc).
const seoSchema = new mongoose.Schema(
  {
    metaTitle: String,
    metaDescription: String,
    metaKeywords: String, // comma-separated
    canonicalUrl: String,
    ogTitle: String,
    ogDescription: String,
    ogImage: String,
    robots: { type: String, enum: ['index,follow', 'noindex,follow', 'index,nofollow', 'noindex,nofollow'], default: 'index,follow' },
  },
  { _id: false }
);

module.exports = seoSchema;

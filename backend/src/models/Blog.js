const mongoose = require('mongoose');
const seoSchema = require('./seoSchema');

const blogSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    excerpt: String,
    content: { type: String, required: true },
    coverImage: String,
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
    speciality: { type: mongoose.Schema.Types.ObjectId, ref: 'Speciality' },
    tags: [String],
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    isPublished: { type: Boolean, default: false },
    publishedAt: Date,
    seo: { type: seoSchema, default: () => ({}) },
    views: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Blog', blogSchema);

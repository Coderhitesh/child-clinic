const mongoose = require('mongoose');

const bannerSchema = new mongoose.Schema(
  {
    title: { type: String, trim: true },
    image: { type: String, required: true },
    mobileImage: String,
    link: String,
    buttonText: String,
    placement: {
      type: String,
      enum: ['home_hero', 'page_banner'],
      required: true,
    },
    pageSlug: String, // required when placement = page_banner (e.g. 'about', 'contact', speciality slug)
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    startDate: Date,
    endDate: Date,
  },
  { timestamps: true }
);

bannerSchema.index({ placement: 1, pageSlug: 1, isActive: 1 });

module.exports = mongoose.model('Banner', bannerSchema);

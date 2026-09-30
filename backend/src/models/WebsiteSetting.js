const mongoose = require('mongoose');
const seoSchema = require('./seoSchema');

// Singleton document — always fetch/update the single record (findOne / upsert).
const websiteSettingSchema = new mongoose.Schema(
  {
    siteName: { type: String, default: 'Clinic System' },
    tagline: String,

    // Logo management — separate assets for header/footer/mobile + favicon,
    // since these are near-always different crops/sizes in real deployments.
    branding: {
      logoHeader: String,
      logoFooter: String,
      logoMobile: String,
      logoDark: String, // for dark-mode/dark-background sections
      favicon: String,
      appleTouchIcon: String,
    },

    contactEmail: String,
    contactPhone: String,
    supportPhone: String,
    address: String,
    socialLinks: {
      facebook: String,
      instagram: String,
      twitter: String,
      youtube: String,
      linkedin: String,
      whatsapp: String,
    },
    seo: { type: seoSchema, default: () => ({}) }, // site-wide default SEO (used as fallback when a page has none set)
    footerText: String,
    googleMapsEmbedUrl: String,
    playStoreUrl: String,
    appStoreUrl: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model('WebsiteSetting', websiteSettingSchema);

const mongoose = require('mongoose');

// The first-run carousel in the mobile app. Editable from the console so the
// pitch can change without shipping a build.
const onboardingSlideSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    body: { type: String, trim: true },
    image: String, // full-bleed artwork; falls back to the icon when empty
    icon: { type: String, default: 'sparkles-outline' }, // Ionicons name
    accentFrom: { type: String, default: '#ecfbf9' },
    accentTo: { type: String, default: '#d2f4ef' },
    ctaText: String, // overrides "Next" on the last slide
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('OnboardingSlide', onboardingSlideSchema);

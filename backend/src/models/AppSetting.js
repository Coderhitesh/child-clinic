const mongoose = require('mongoose');

// Singleton the mobile app polls on launch: whether to show the maintenance wall,
// and which build it should be running.
const platformSchema = new mongoose.Schema(
  {
    latestVersion: { type: String, default: '1.0.0' },
    minSupportedVersion: { type: String, default: '1.0.0' }, // below this the update is forced
    storeUrl: String,
    releaseNotes: String,
  },
  { _id: false }
);

const appSettingSchema = new mongoose.Schema(
  {
    key: { type: String, default: 'app', unique: true },
    maintenance: {
      enabled: { type: Boolean, default: false },
      title: { type: String, default: 'We will be right back' },
      message: { type: String, default: 'The app is down for scheduled maintenance. Please try again shortly.' },
      until: Date,
      allowBrowsing: { type: Boolean, default: false }, // read-only mode instead of a hard wall
    },
    android: { type: platformSchema, default: () => ({}) },
    ios: { type: platformSchema, default: () => ({}) },
    supportPhone: String,
    supportEmail: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model('AppSetting', appSettingSchema);

const mongoose = require('mongoose');

// One row per install. The token is the identity; a reinstall or a token refresh
// simply upserts, and signing out detaches the user without deleting the row.
const deviceTokenSchema = new mongoose.Schema(
  {
    token: { type: String, required: true, unique: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    platform: { type: String, enum: ['android', 'ios', 'web'], required: true },
    deviceId: String,
    deviceName: String,
    appVersion: String,
    topics: [String], // channels this device opted into
    permissionGranted: { type: Boolean, default: true }, // OS-level notification permission
    osVersion: String,
    isActive: { type: Boolean, default: true },
    lastSeenAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

deviceTokenSchema.index({ user: 1, isActive: 1 });

module.exports = mongoose.model('DeviceToken', deviceTokenSchema);

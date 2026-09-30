const mongoose = require('mongoose');

const headerNotificationSchema = new mongoose.Schema(
  {
    message: { type: String, required: true },
    link: String,
    linkText: String,
    bgColor: { type: String, default: '#000000' },
    textColor: { type: String, default: '#ffffff' },
    isActive: { type: Boolean, default: true },
    startDate: Date,
    endDate: Date,
    dismissible: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('HeaderNotification', headerNotificationSchema);

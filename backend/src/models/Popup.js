const mongoose = require('mongoose');

const popupSchema = new mongoose.Schema(
  {
    title: String,
    content: String,
    image: String,
    link: String,
    buttonText: String,
    showOnce: { type: Boolean, default: true }, // show once per session on frontend
    delaySeconds: { type: Number, default: 3 },
    isActive: { type: Boolean, default: true },
    startDate: Date,
    endDate: Date,
    targetPages: { type: [String], default: ['home'] }, // page slugs to show on, 'all' = everywhere
  },
  { timestamps: true }
);

module.exports = mongoose.model('Popup', popupSchema);

const mongoose = require('mongoose');

const contactSubmissionSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: String,
    subject: String,
    message: { type: String, required: true },
    clinic: { type: mongoose.Schema.Types.ObjectId, ref: 'Clinic' }, // optional: which clinic page it came from
    status: { type: String, enum: ['new', 'read', 'responded', 'spam'], default: 'new' },
    respondedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    respondedAt: Date,
    responseNote: String,
    ip: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model('ContactSubmission', contactSubmissionSchema);

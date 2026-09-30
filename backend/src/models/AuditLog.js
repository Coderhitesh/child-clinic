const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    role: String,
    action: { type: String, required: true }, // e.g. 'PATIENT_VIEW', 'PAYMENT_UPDATE'
    resourceType: String,
    resourceId: mongoose.Schema.Types.ObjectId,
    ip: String,
    userAgent: String,
    method: String,
    path: String,
    meta: mongoose.Schema.Types.Mixed,
  },
  { timestamps: true }
);

auditLogSchema.index({ createdAt: -1 });
auditLogSchema.index({ resourceType: 1, resourceId: 1 });

module.exports = mongoose.model('AuditLog', auditLogSchema);

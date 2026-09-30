const AuditLog = require('../models/AuditLog');

// Fire-and-forget audit logger. Call from controllers on sensitive access (patient/payment).
const logAudit = async ({ req, action, resourceType, resourceId, meta }) => {
  try {
    await AuditLog.create({
      user: req.user?._id,
      role: req.user?.role,
      action,
      resourceType,
      resourceId,
      ip: req.ip,
      userAgent: req.headers['user-agent'],
      method: req.method,
      path: req.originalUrl,
      meta,
    });
  } catch (err) {
    console.error('[Audit] failed to write log', err.message);
  }
};

module.exports = { logAudit };

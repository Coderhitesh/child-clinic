const ApiError = require('../utils/apiError');

// Ensures clinic_admin/doctor/receptionist only touch their assigned clinic(s).
// superadmin bypasses. Expects req.params.clinicId OR req.body.clinic OR req.query.clinic.
const enforceClinicScope = (req, res, next) => {
  if (req.user.role === 'superadmin') return next();

  const clinicId =
    req.params.clinicId || req.body.clinic || req.query.clinic || req.params.id;

  if (!clinicId) return next(); // route validates elsewhere / list routes filter in controller

  const allowed = (req.user.clinics || []).map((c) => c.toString());
  if (!allowed.includes(clinicId.toString())) {
    return next(new ApiError(403, 'No access to this clinic'));
  }
  next();
};

module.exports = { enforceClinicScope };

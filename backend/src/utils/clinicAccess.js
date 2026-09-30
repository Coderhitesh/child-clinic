const ApiError = require('./apiError');

// Roles tied to one or more clinics. superadmin (and patient) are not clinic-scoped.
const CLINIC_SCOPED_ROLES = ['clinic_admin', 'doctor', 'receptionist'];

const idStr = (v) => (v && v._id ? v._id : v)?.toString();

const isClinicScoped = (user) => !!user && CLINIC_SCOPED_ROLES.includes(user.role);

const ownClinicIds = (user) => (user?.clinics || []).map((c) => idStr(c));

// true for superadmin/patient/public; for clinic staff only when the clinic is theirs
const hasClinicAccess = (user, clinicId) => {
  if (!isClinicScoped(user)) return true;
  if (!clinicId) return false;
  return ownClinicIds(user).includes(idStr(clinicId));
};

const assertClinicAccess = (user, clinicId) => {
  if (!hasClinicAccess(user, clinicId)) throw new ApiError(403, 'No access to this clinic');
};

// record linked to several clinics (doctor, staff): at least one must be the user's
const assertAnyClinicAccess = (user, clinicIds = []) => {
  if (!isClinicScoped(user)) return;
  const own = ownClinicIds(user);
  if (!(clinicIds || []).some((c) => own.includes(idStr(c)))) {
    throw new ApiError(403, 'No access to this clinic');
  }
};

// every requested clinic must be the user's own
const assertAllWithinOwn = (user, clinicIds = []) => {
  if (!isClinicScoped(user)) return;
  const own = ownClinicIds(user);
  if ((clinicIds || []).some((c) => !own.includes(idStr(c)))) {
    throw new ApiError(403, 'Cannot assign outside your clinic');
  }
};

// Mongo filter: patients a clinic user may see (tagged to their clinic, or visited it)
const patientScopeFilter = async (user) => {
  const Appointment = require('../models/Appointment');
  const own = ownClinicIds(user);
  const visited = await Appointment.distinct('patient', { clinic: { $in: own } });
  return { $or: [{ clinics: { $in: own } }, { _id: { $in: visited } }] };
};

const assertPatientAccess = async (user, patient) => {
  if (!isClinicScoped(user)) return;
  const Appointment = require('../models/Appointment');
  const own = ownClinicIds(user);
  if ((patient.clinics || []).some((c) => own.includes(idStr(c)))) return;
  const visited = await Appointment.exists({ patient: patient._id, clinic: { $in: own } });
  if (!visited) throw new ApiError(403, 'No access to this patient');
};

// a patient account may only touch appointments/payments of its own family members
const assertOwnAppointment = async (user, appointment) => {
  if (!user || user.role !== 'patient') return;
  const Patient = require('../models/Patient');
  const pid = appointment.patient?._id || appointment.patient;
  const mine = await Patient.exists({ _id: pid, guardianUser: user._id });
  if (!mine) throw new ApiError(403, 'Not your appointment');
};

module.exports = {
  assertOwnAppointment,
  CLINIC_SCOPED_ROLES,
  isClinicScoped,
  ownClinicIds,
  hasClinicAccess,
  assertClinicAccess,
  assertAnyClinicAccess,
  assertAllWithinOwn,
  patientScopeFilter,
  assertPatientAccess,
};

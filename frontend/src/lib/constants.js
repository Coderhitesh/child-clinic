export const ROLES = {
  SUPERADMIN: 'superadmin',
  CLINIC_ADMIN: 'clinic_admin',
  DOCTOR: 'doctor',
  RECEPTIONIST: 'receptionist',
  PATIENT: 'patient',
};

// fixed consultation fee (₹) — must match backend config/fees.js
export const FIXED_CONSULTATION_FEE = 600;

export const STAFF_ROLES = [ROLES.SUPERADMIN, ROLES.CLINIC_ADMIN, ROLES.DOCTOR, ROLES.RECEPTIONIST];

export const ROLE_LABEL = {
  superadmin: 'Super Admin',
  clinic_admin: 'Clinic Admin',
  doctor: 'Doctor',
  receptionist: 'Receptionist',
  patient: 'Patient',
};

export const APPOINTMENT_STATUS = ['pending', 'confirmed', 'completed', 'cancelled', 'no_show'];

export const STATUS_TONE = {
  pending: 'warning',
  confirmed: 'info',
  completed: 'success',
  cancelled: 'danger',
  no_show: 'muted',
  paid: 'success',
  failed: 'danger',
  refunded: 'muted',
  collected_at_clinic: 'success',
  new: 'info',
  read: 'muted',
  responded: 'success',
  spam: 'danger',
  available: 'success',
  held: 'warning',
  booked: 'info',
  blocked: 'danger',
};

export const GENDERS = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other', label: 'Other' },
];

export const VIDEO_CATEGORIES = [
  'treatment', 'therapy_exercises', 'parenting_guidance', 'nutrition',
  'development', 'post_treatment_care', 'doctor_advice', 'general',
];

export const CMS_PAGE_TYPES = [
  'privacy_policy', 'terms_conditions', 'disclaimer', 'refund_policy', 'about', 'other',
];

export const WEEK_DAYS = [
  { value: 0, label: 'Sun', short: 'Sun' }, { value: 1, label: 'Mon', short: 'Mon' }, { value: 2, label: 'Tue', short: 'Tue' },
  { value: 3, label: 'Wed', short: 'Wed' }, { value: 4, label: 'Thu', short: 'Thu' }, { value: 5, label: 'Fri', short: 'Fri' },
  { value: 6, label: 'Sat', short: 'Sat' },
];

export const COOKIE = {
  ACCESS: 'cl_access',
  REFRESH: 'cl_refresh',
  ROLE: 'cl_role',
  USER: 'cl_user',
};

export const PLACEHOLDER_DOCTOR = 'https://placehold.co/320x320/eafaf8/0c8a84?text=Doctor';
export const PLACEHOLDER_CLINIC = 'https://placehold.co/640x360/eafaf8/0c8a84?text=Clinic';
export const PLACEHOLDER_COVER = 'https://placehold.co/800x450/eafaf8/0c8a84?text=Normal Child Clinic';

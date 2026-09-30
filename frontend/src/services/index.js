import api, { unwrap } from '@/lib/api';

// Thin wrappers around the single axios instance. Every backend route group is covered.
const get = (url, params) => api.get(url, { params }).then(unwrap);
const post = (url, body) => api.post(url, body).then(unwrap);
const patch = (url, body) => api.patch(url, body).then(unwrap);
const put = (url, body) => api.put(url, body).then(unwrap);
const del = (url) => api.delete(url).then(unwrap);

/* ------------------------------------------------------------------ auth */
/* ---------------------------------------------------------------- uploads */
export const uploadApi = {
  // multipart — the axios instance sets the auth header, the browser sets the boundary
  file: (file) => {
    const fd = new FormData();
    fd.append('file', file);
    return api.post('/uploads', fd).then(unwrap);
  },
  files: (list) => {
    const fd = new FormData();
    Array.from(list).forEach((f) => fd.append('files', f));
    return api.post('/uploads/multiple', fd).then(unwrap);
  },
  remove: (url) => api.delete('/uploads', { data: { url } }).then(unwrap),
};

export const authApi = {
  register: (b) => post('/auth/register', b),
  login: (b) => post('/auth/login', b),
  refresh: (b) => post('/auth/refresh', b),
  requestOtp: (b) => post('/auth/otp/request', b),
  verifyOtp: (b) => post('/auth/otp/verify', b),
  logout: () => post('/auth/logout', {}),
  me: () => get('/auth/me'),
  createStaff: (b) => post('/auth/staff', b),
  updateMe: (b) => patch('/auth/me', b),
  forgotPassword: (email) => post('/auth/forgot-password', { email }),
  resetPassword: (b) => post('/auth/reset-password', b),
};

/* ------------------------------------------------------------ staff/users */
export const userApi = {
  list: (p) => get('/auth/users', p),
  update: (id, b) => patch(`/auth/users/${id}`, b),
};

/* ------------------------------------------------------------ catalogue */
export const specialityApi = {
  list: (p) => get('/specialities', p),
  get: (id) => get(`/specialities/${id}`),
  create: (b) => post('/specialities', b),
  update: (id, b) => patch(`/specialities/${id}`, b),
  remove: (id) => del(`/specialities/${id}`),
};

export const clinicApi = {
  list: (p) => get('/clinics', p),
  get: (id) => get(`/clinics/${id}`),
  create: (b) => post('/clinics', b),
  update: (id, b) => patch(`/clinics/${id}`, b),
  remove: (id) => del(`/clinics/${id}`),
  assignSpecialities: (id, specialities) => patch(`/clinics/${id}/specialities`, { specialities }),
};

export const doctorApi = {
  list: (p) => get('/doctors', p),
  get: (id) => get(`/doctors/${id}`),
  create: (b) => post('/doctors', b),
  update: (id, b) => patch(`/doctors/${id}`, b),
  remove: (id) => del(`/doctors/${id}`),
};

/* ---------------------------------------------------------- scheduling */
export const slotApi = {
  availability: (p) => get('/slots/availability', p),
  list: (p) => get('/slots', p), // staff view: every slot, any status
  generate: (b) => post('/slots/generate', b),
  block: (id, reason) => patch(`/slots/${id}/block`, { reason }),
  unblock: (id) => patch(`/slots/${id}/unblock`),
};

export const appointmentApi = {
  book: (b) => post('/appointments', b),
  walkIn: (b) => post('/appointments/walk-in', b), // desk booking, confirmed on the spot
  list: (p) => get('/appointments', p),
  get: (id) => get(`/appointments/${id}`),
  reschedule: (id, newSlotId) => patch(`/appointments/${id}/reschedule`, { newSlotId }),
  cancel: (id, reason) => patch(`/appointments/${id}/cancel`, { reason }),
  updateStatus: (id, b) => patch(`/appointments/${id}/status`, b),
  updateFee: (id, consultationFee) => patch(`/appointments/${id}/fee`, { consultationFee }),
  updateVideo: (id, b) => patch(`/appointments/${id}/video`, b), // { youtubeUrl, videoTitle } — empty url removes
  slip: (id) => api.get(`/appointments/${id}/slip`, { responseType: 'blob' }).then((r) => r.data),
};

/* ------------------------------------------------------------ payments */
export const paymentApi = {
  byAppointment: (appointmentId) => get(`/payments/appointment/${appointmentId}`),
  collect: (id) => patch(`/payments/${id}/collect`),
};

export const couponApi = {
  validate: (b) => post('/coupons/validate', b),
  list: (p) => get('/coupons', p),
  get: (id) => get(`/coupons/${id}`),
  create: (b) => post('/coupons', b),
  update: (id, b) => patch(`/coupons/${id}`, b),
  remove: (id) => del(`/coupons/${id}`),
};

/* ------------------------------------------------------ clinical records */
export const patientApi = {
  list: (p) => get('/patients', p),
  get: (id) => get(`/patients/${id}`),
  create: (b) => post('/patients', b),
  update: (id, b) => patch(`/patients/${id}`, b),
  addDoc: (id, b) => post(`/patients/${id}/docs`, b),
  remove: (id) => del(`/patients/${id}`),
};

export const prescriptionApi = {
  list: (p) => get('/prescriptions', p),
  create: (b) => post('/prescriptions', b),
  update: (id, b) => put(`/prescriptions/${id}`, b),
  get: (id) => get(`/prescriptions/${id}`),
  listByPatient: (patientId) => get(`/prescriptions/patient/${patientId}`),
};

export const videoApi = {
  list: (p) => get('/videos', p),
  create: (b) => post('/videos', b),
  update: (id, b) => patch(`/videos/${id}`, b),
  remove: (id) => del(`/videos/${id}`),
  assign: (id, patientId) => post(`/videos/${id}/assign`, { patientId }),
  unassign: (id, patientId) => del(`/videos/${id}/assign/${patientId}`),
};

/* --------------------------------------------------- insights & audit */
export const dashboardApi = {
  clinic: (p) => get('/dashboard/clinic', p),
  global: () => get('/dashboard/global'),
};

export const reportApi = {
  appointments: (p) => get('/reports/appointments', p),
  revenue: (p) => get('/reports/revenue', p),
  doctorPerformance: (p) => get('/reports/doctor-performance', p),
  patients: (p) => get('/reports/patients', p),
  csvUrl: (kind, params) => {
    const qs = new URLSearchParams({ ...params, format: 'csv' }).toString();
    return `/reports/${kind}?${qs}`;
  },
  downloadCsv: (kind, params) =>
    api.get(`/reports/${kind}`, { params: { ...params, format: 'csv' }, responseType: 'blob' }),
};

export const auditApi = {
  list: (p) => get('/audit-logs', p),
};

/* ------------------------------------------------------------ website */
export const categoryApi = {
  list: (p) => get('/categories', p),
  get: (id) => get(`/categories/${id}`),
  create: (b) => post('/categories', b),
  update: (id, b) => patch(`/categories/${id}`, b),
  remove: (id) => del(`/categories/${id}`),
};

export const bannerApi = {
  active: (p) => get('/banners/active', p),
  list: (p) => get('/banners', p),
  get: (id) => get(`/banners/${id}`),
  create: (b) => post('/banners', b),
  update: (id, b) => patch(`/banners/${id}`, b),
  remove: (id) => del(`/banners/${id}`),
};

export const popupApi = {
  active: (p) => get('/popups/active', p),
  list: (p) => get('/popups', p),
  get: (id) => get(`/popups/${id}`),
  create: (b) => post('/popups', b),
  update: (id, b) => patch(`/popups/${id}`, b),
  remove: (id) => del(`/popups/${id}`),
};

export const testimonialApi = {
  list: (p) => get('/testimonials', p),
  get: (id) => get(`/testimonials/${id}`),
  create: (b) => post('/testimonials', b),
  update: (id, b) => patch(`/testimonials/${id}`, b),
  remove: (id) => del(`/testimonials/${id}`),
};

export const cmsPageApi = {
  list: (p) => get('/cms-pages', p),
  bySlug: (slug) => get(`/cms-pages/slug/${slug}`),
  get: (id) => get(`/cms-pages/${id}`),
  create: (b) => post('/cms-pages', b),
  update: (id, b) => patch(`/cms-pages/${id}`, b),
  remove: (id) => del(`/cms-pages/${id}`),
};

export const blogApi = {
  list: (p) => get('/blogs', p),
  bySlug: (slug) => get(`/blogs/slug/${slug}`),
  get: (id) => get(`/blogs/${id}`),
  create: (b) => post('/blogs', b),
  update: (id, b) => patch(`/blogs/${id}`, b),
  remove: (id) => del(`/blogs/${id}`),
};

export const faqApi = {
  list: (p) => get('/faqs', p),
  get: (id) => get(`/faqs/${id}`),
  create: (b) => post('/faqs', b),
  update: (id, b) => patch(`/faqs/${id}`, b),
  remove: (id) => del(`/faqs/${id}`),
};

export const contactApi = {
  submit: (b) => post('/contact-submissions', b),
  list: (p) => get('/contact-submissions', p),
  get: (id) => get(`/contact-submissions/${id}`),
  respond: (id, responseNote) => patch(`/contact-submissions/${id}/respond`, { responseNote }),
  markSpam: (id) => patch(`/contact-submissions/${id}/spam`),
};

export const headerNotificationApi = {
  active: () => get('/header-notifications/active'),
  list: (p) => get('/header-notifications', p),
  get: (id) => get(`/header-notifications/${id}`),
  create: (b) => post('/header-notifications', b),
  update: (id, b) => patch(`/header-notifications/${id}`, b),
  remove: (id) => del(`/header-notifications/${id}`),
};

export const partnerApi = {
  list: (p) => get('/partners', p),
  get: (id) => get(`/partners/${id}`),
  create: (b) => post('/partners', b),
  update: (id, b) => patch(`/partners/${id}`, b),
  remove: (id) => del(`/partners/${id}`),
};

/* ------------------------------------------------------- mobile app config */
export const appSettingApi = {
  get: () => get('/app-config/admin'),
  publicConfig: (p) => get('/app-config', p),
  update: (b) => put('/app-config', b),
};

export const deviceApi = {
  list: (p) => get('/devices', p),
  stats: () => get('/devices/stats'),
  broadcast: (b) => post('/devices/broadcast', b),
  test: (b) => post('/devices/test', b),
};

export const onboardingApi = {
  list: (p) => get('/onboarding-slides', p),
  create: (b) => post('/onboarding-slides', b),
  update: (id, b) => patch(`/onboarding-slides/${id}`, b),
  remove: (id) => del(`/onboarding-slides/${id}`),
};

export const websiteSettingApi = {
  get: () => get('/website-settings'),
  update: (b) => put('/website-settings', b),
};

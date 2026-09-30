import api, { unwrap } from '../lib/api';

const get = (url, params) => api.get(url, { params }).then(unwrap);
const post = (url, body) => api.post(url, body).then(unwrap);
const patch = (url, body) => api.patch(url, body).then(unwrap);
const del = (url, config) => api.delete(url, config).then(unwrap);

export const authApi = {
  register: (b) => post('/auth/register', b),
  login: (b) => post('/auth/login', b),
  logout: () => post('/auth/logout'),
  me: () => get('/auth/me'),
  updateMe: (b) => patch('/auth/me', b),
  requestOtp: (b) => post('/auth/otp/request', b),
  verifyOtp: (b) => post('/auth/otp/verify', b),
  forgotPassword: (email) => post('/auth/forgot-password', { email }),
  resetPassword: (b) => post('/auth/reset-password', b),
};

export const specialityApi = { list: (p) => get('/specialities', p), get: (id) => get(`/specialities/${id}`) };

export const clinicApi = { list: (p) => get('/clinics', p), get: (id) => get(`/clinics/${id}`) };

export const doctorApi = { list: (p) => get('/doctors', p), get: (id) => get(`/doctors/${id}`) };

export const slotApi = { availability: (p) => get('/slots/availability', p) };

export const appointmentApi = {
  book: (b) => post('/appointments', b),
  list: (p) => get('/appointments', p),
  get: (id) => get(`/appointments/${id}`),
  reschedule: (id, newSlotId) => patch(`/appointments/${id}/reschedule`, { newSlotId }),
  cancel: (id, reason) => patch(`/appointments/${id}/cancel`, { reason }),
};

export const paymentApi = { byAppointment: (id) => get(`/payments/appointment/${id}`) };

export const paymentModeApi = { get: (clinic) => get('/payment-modes', clinic ? { clinic } : undefined) };

export const couponApi = { validate: (b) => post('/coupons/validate', b) };

export const patientApi = {
  list: (p) => get('/patients', p),
  get: (id) => get(`/patients/${id}`),
  create: (b) => post('/patients', b),
  update: (id, b) => patch(`/patients/${id}`, b),
  addDoc: (id, b) => post(`/patients/${id}/docs`, b),
  remove: (id) => del(`/patients/${id}`),
};

export const prescriptionApi = {
  get: (id) => get(`/prescriptions/${id}`),
  listByPatient: (patientId) => get(`/prescriptions/patient/${patientId}`),
};

export const videoApi = { list: (p) => get('/videos', p) };

export const blogApi = { list: (p) => get('/blogs', p), bySlug: (slug) => get(`/blogs/slug/${slug}`) };

export const faqApi = { list: (p) => get('/faqs', p) };

export const cmsPageApi = { bySlug: (slug) => get(`/cms-pages/slug/${slug}`) };

export const bannerApi = { active: (p) => get('/banners/active', p) };

export const testimonialApi = { list: (p) => get('/testimonials', p) };

export const partnerApi = { list: (p) => get('/partners', p) };

export const contactApi = { submit: (b) => post('/contact-submissions', b) };

export const websiteSettingApi = { get: () => get('/website-settings') };

export const onboardingApi = {
  list: () => get('/onboarding-slides'),
};

export const appConfigApi = {
  // called on every launch: maintenance flag + which build this install should be on
  get: (p) => get('/app-config', p),
};

export const deviceApi = {
  register: (b) => post('/devices', b),
  unregister: (token) => post('/devices/unregister', { token }),
  mine: () => get('/devices/me'),
};

export const uploadApi = {
  file: (asset) => {
    const fd = new FormData();
    fd.append('file', {
      uri: asset.uri,
      name: asset.name || 'upload.jpg',
      type: asset.mimeType || 'image/jpeg',
    });
    return api.post('/uploads', fd).then(unwrap);
  },
};

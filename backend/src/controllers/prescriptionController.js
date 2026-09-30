const Prescription = require('../models/Prescription');
const Appointment = require('../models/Appointment');
const catchAsync = require('../utils/catchAsync');
const ApiError = require('../utils/apiError');
const { enqueuePrescriptionPdf } = require('../queues/pdfQueue');
const { logAudit } = require('../middleware/audit');
const Patient = require('../models/Patient');
const { isClinicScoped, ownClinicIds, assertClinicAccess } = require('../utils/clinicAccess');
const { ensurePrescriptionPdf } = require('../services/prescriptionPdf');
const { absoluteUrl } = require('../utils/fileUrl');

// plain object with an absolute pdfUrl so the frontend can open it from its own origin
// drop blank medicine rows and non-positive durations before saving
const cleanMeds = (list) =>
  (list || [])
    .filter((m) => m && String(m.name || '').trim())
    .map((m) => {
      const o = { ...m, name: String(m.name).trim() };
      if (!(Number(o.durationDays) > 0)) delete o.durationDays;
      return o;
    });

const shape = (p, req) => {
  const o = p.toObject ? p.toObject() : p;
  if (o.pdfUrl) o.pdfUrl = absoluteUrl(o.pdfUrl, req);
  return o;
};

// a patient account may only touch prescriptions of its own family members
const assertOwnPatient = async (user, patientId) => {
  if (user.role !== 'patient') return;
  const id = patientId?._id || patientId;
  const mine = await Patient.exists({ _id: id, guardianUser: user._id });
  if (!mine) throw new ApiError(403, 'Not your prescription');
};

exports.create = catchAsync(async (req, res) => {
  const { appointmentId, diagnosis, generalInstructions, followUpDate, images } = req.body;
  const medicines = cleanMeds(req.body.medicines);
  const appt = await Appointment.findById(appointmentId);
  if (!appt) throw new ApiError(404, 'Appointment not found');
  assertClinicAccess(req.user, appt.clinic);

  if (!(medicines || []).length && !(images || []).length) {
    throw new ApiError(400, 'Add at least one medicine or upload a prescription image');
  }

  const prescription = await Prescription.create({
    appointment: appointmentId,
    patient: appt.patient,
    doctor: appt.doctor,
    clinic: appt.clinic,
    diagnosis,
    medicines,
    generalInstructions,
    followUpDate,
    images: images || [],
  });

  appt.prescription = prescription._id;
  appt.diagnosis = diagnosis;
  appt.followUpDate = followUpDate;
  appt.status = 'completed';
  await appt.save();

  enqueuePrescriptionPdf(prescription._id).catch((e) => console.error('[pdf] enqueue failed', e.message));
  await logAudit({ req, action: 'PRESCRIPTION_CREATE', resourceType: 'Prescription', resourceId: prescription._id });

  res.status(201).json({ success: true, data: prescription });
});

exports.getOne = catchAsync(async (req, res) => {
  const prescription = await Prescription.findById(req.params.id).populate('patient doctor clinic');
  if (!prescription) throw new ApiError(404, 'Prescription not found');
  assertClinicAccess(req.user, prescription.clinic);
  await assertOwnPatient(req.user, prescription.patient);
  await ensurePrescriptionPdf(prescription);
  await logAudit({ req, action: 'PRESCRIPTION_VIEW', resourceType: 'Prescription', resourceId: prescription._id });
  res.json({ success: true, data: shape(prescription, req) });
});

// superadmin / clinic admin can change a prescription after it is saved
exports.update = catchAsync(async (req, res) => {
  const prescription = await Prescription.findById(req.params.id);
  if (!prescription) throw new ApiError(404, 'Prescription not found');
  assertClinicAccess(req.user, prescription.clinic);

  const { diagnosis, generalInstructions, followUpDate, images } = req.body;
  const medicines = req.body.medicines !== undefined ? cleanMeds(req.body.medicines) : undefined;
  const nextMeds = medicines !== undefined ? medicines : prescription.medicines;
  const nextImgs = images !== undefined ? images : prescription.images;
  if (!(nextMeds || []).length && !(nextImgs || []).length) {
    throw new ApiError(400, 'Add at least one medicine or a prescription image');
  }

  if (diagnosis !== undefined) prescription.diagnosis = diagnosis;
  if (medicines !== undefined) prescription.medicines = medicines;
  if (images !== undefined) prescription.images = images;
  if (generalInstructions !== undefined) prescription.generalInstructions = generalInstructions;
  if (followUpDate !== undefined) prescription.followUpDate = followUpDate || undefined;
  prescription.pdfStatus = 'pending'; // forces PDF rebuild
  await prescription.save();

  await Appointment.findByIdAndUpdate(prescription.appointment, {
    diagnosis: prescription.diagnosis,
    followUpDate: prescription.followUpDate,
  });

  await ensurePrescriptionPdf(prescription);
  await logAudit({ req, action: 'PRESCRIPTION_UPDATE', resourceType: 'Prescription', resourceId: prescription._id });
  res.json({ success: true, data: shape(prescription, req) });
});

// staff listing — newest first, optional clinic/doctor/patient/date filters
exports.list = catchAsync(async (req, res) => {
  const { clinic, doctor, patient, from, to } = req.query;
  const filter = {};
  if (isClinicScoped(req.user)) {
    const own = ownClinicIds(req.user);
    filter.clinic = clinic && own.includes(String(clinic)) ? clinic : { $in: own };
  } else if (clinic) {
    filter.clinic = clinic;
  }
  if (doctor) filter.doctor = doctor;
  if (patient) filter.patient = patient;
  if (from || to) {
    filter.createdAt = {};
    if (from) filter.createdAt.$gte = new Date(from);
    if (to) filter.createdAt.$lte = new Date(to);
  }

  const prescriptions = await Prescription.find(filter)
    .populate('patient', 'name patientId contact')
    .populate('doctor', 'name')
    .populate('clinic', 'name')
    .sort('-createdAt')
    .limit(Number(req.query.limit) || 200);

  res.json({ success: true, data: prescriptions.map((p) => shape(p, req)) });
});

exports.listByPatient = catchAsync(async (req, res) => {
  await assertOwnPatient(req.user, req.params.patientId);
  const filter = { patient: req.params.patientId };
  if (isClinicScoped(req.user)) filter.clinic = { $in: ownClinicIds(req.user) };
  const prescriptions = await Prescription.find(filter)
    .populate('doctor', 'name')
    .populate('clinic', 'name logo phone alternatePhone email address')
    .sort('-createdAt');
  await Promise.all(prescriptions.map((p) => ensurePrescriptionPdf(p)));
  res.json({ success: true, data: prescriptions.map((p) => shape(p, req)) });
});

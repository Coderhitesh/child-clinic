const Patient = require('../models/Patient');
const catchAsync = require('../utils/catchAsync');
const ApiError = require('../utils/apiError');
const Appointment = require('../models/Appointment');
const { logAudit } = require('../middleware/audit');
const {
  isClinicScoped,
  ownClinicIds,
  patientScopeFilter,
  assertPatientAccess,
} = require('../utils/clinicAccess');

// '' is not a valid gender enum value — treat a blank pick as "not given"
const tidy = (body = {}) => {
  const b = { ...body };
  delete b.patientId; // system-generated, cannot be set or changed by a client
  if (!b.gender) delete b.gender;
  if (b.age === '' || b.age === null) delete b.age;
  if (!b.dob) delete b.dob;
  return b;
};

exports.create = catchAsync(async (req, res) => {
  const patient = await Patient.create({
    ...tidy(req.body),
    guardianUser: req.user.role === 'patient' ? req.user._id : req.body.guardianUser,
    // clinic staff: the record belongs to their clinic
    ...(isClinicScoped(req.user) ? { clinics: ownClinicIds(req.user) } : {}),
  });
  await logAudit({ req, action: 'PATIENT_CREATE', resourceType: 'Patient', resourceId: patient._id });
  res.status(201).json({ success: true, data: patient });
});

exports.list = catchAsync(async (req, res) => {
  const filter = req.query.includeArchived === 'true' ? {} : { isArchived: { $ne: true } };
  if (req.user.role === 'patient') {
    filter.guardianUser = req.user._id;
  }
  if (isClinicScoped(req.user)) {
    Object.assign(filter, await patientScopeFilter(req.user));
  }
  const patients = await Patient.find(filter).sort('-createdAt');
  res.json({ success: true, data: patients });
});

exports.getOne = catchAsync(async (req, res) => {
  const patient = await Patient.findById(req.params.id).populate('assignedVideos');
  if (!patient) throw new ApiError(404, 'Patient not found');

  if (req.user.role === 'patient' && patient.guardianUser?.toString() !== req.user._id.toString()) {
    throw new ApiError(403, 'Not your patient record');
  }
  await assertPatientAccess(req.user, patient);

  await logAudit({ req, action: 'PATIENT_VIEW', resourceType: 'Patient', resourceId: patient._id });
  res.json({ success: true, data: patient });
});

exports.update = catchAsync(async (req, res) => {
  const existing = await Patient.findById(req.params.id);
  if (!existing) throw new ApiError(404, 'Patient not found');
  await assertPatientAccess(req.user, existing);
  if (isClinicScoped(req.user)) delete req.body.clinics; // clinic tags are managed by the system
  if (req.user.role === 'patient' && existing.guardianUser?.toString() !== req.user._id.toString()) {
    throw new ApiError(403, 'Not your patient record');
  }
  delete req.body.guardianUser;

  const patient = await Patient.findByIdAndUpdate(req.params.id, tidy(req.body), {
    new: true,
    runValidators: true,
  });
  if (!patient) throw new ApiError(404, 'Patient not found');
  await logAudit({ req, action: 'PATIENT_UPDATE', resourceType: 'Patient', resourceId: patient._id });
  res.json({ success: true, data: patient });
});

exports.addDoc = catchAsync(async (req, res) => {
  const { name, url } = req.body;
  const existing = await Patient.findById(req.params.id);
  if (!existing) throw new ApiError(404, 'Patient not found');
  if (req.user.role === 'patient' && existing.guardianUser?.toString() !== req.user._id.toString()) {
    throw new ApiError(403, 'Not your patient record');
  }
  await assertPatientAccess(req.user, existing);

  const patient = await Patient.findByIdAndUpdate(
    req.params.id,
    { $push: { uploadedDocs: { name, url } } },
    { new: true }
  );
  if (!patient) throw new ApiError(404, 'Patient not found');
  await logAudit({ req, action: 'PATIENT_DOC_ADD', resourceType: 'Patient', resourceId: patient._id });
  res.json({ success: true, data: patient });
});

// A patient with history is archived rather than deleted, so past appointments and
// prescriptions keep pointing at a real record. One with no history is removed outright.
exports.remove = catchAsync(async (req, res) => {
  const patient = await Patient.findById(req.params.id);
  if (!patient) throw new ApiError(404, 'Patient not found');

  if (req.user.role === 'patient' && patient.guardianUser?.toString() !== req.user._id.toString()) {
    throw new ApiError(403, 'Not your patient record');
  }
  await assertPatientAccess(req.user, patient);

  const upcoming = await Appointment.countDocuments({
    patient: patient._id,
    status: { $in: ['pending', 'confirmed'] },
  });
  if (upcoming > 0) {
    throw new ApiError(400, 'Cancel the upcoming appointments for this patient first');
  }

  const history = await Appointment.countDocuments({ patient: patient._id });
  if (history > 0) {
    patient.isArchived = true;
    await patient.save();
    await logAudit({ req, action: 'PATIENT_ARCHIVE', resourceType: 'Patient', resourceId: patient._id });
    return res.json({ success: true, message: 'Patient archived (visit history kept)', archived: true });
  }

  await patient.deleteOne();
  await logAudit({ req, action: 'PATIENT_DELETE', resourceType: 'Patient', resourceId: patient._id });
  res.json({ success: true, message: 'Patient deleted', archived: false });
});

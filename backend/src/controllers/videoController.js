const Video = require('../models/Video');
const Patient = require('../models/Patient');
const catchAsync = require('../utils/catchAsync');
const ApiError = require('../utils/apiError');
const {
  isClinicScoped,
  ownClinicIds,
  hasClinicAccess,
  assertPatientAccess,
} = require('../utils/clinicAccess');

const YOUTUBE_RE =
  /^(https?:\/\/)?((www|m)\.)?(youtube\.com\/(watch\?(.*&)?v=|embed\/|shorts\/|live\/)|youtu\.be\/)[\w-]{11}/i;

// blank optional fields must not reach Mongo (a '' speciality would fail the ObjectId cast)
const tidy = (body) => {
  const b = { ...body };
  if (b.youtubeUrl !== undefined) {
    b.youtubeUrl = String(b.youtubeUrl).trim();
    if (!YOUTUBE_RE.test(b.youtubeUrl)) throw new ApiError(400, 'Enter a valid YouTube link');
  }
  if (!b.speciality) delete b.speciality;
  delete b.assignedPatients; // only the assign endpoint may change this
  return b;
};

// clinic staff: global videos (no clinic) + their own clinic's videos
const visibleFilter = (user) => ({
  $or: [{ clinic: null }, { clinic: { $exists: false } }, { clinic: { $in: ownClinicIds(user) } }],
});

// clinic staff can only change videos that belong to their clinic
const assertVideoEditable = (user, video) => {
  if (!isClinicScoped(user)) return;
  if (!video.clinic || !hasClinicAccess(user, video.clinic)) {
    throw new ApiError(403, 'You can only edit your own clinic videos');
  }
};

exports.create = catchAsync(async (req, res) => {
  const body = { ...tidy(req.body), createdBy: req.user._id };
  if (isClinicScoped(req.user)) {
    const own = ownClinicIds(req.user);
    body.clinic = body.clinic && own.includes(String(body.clinic)) ? body.clinic : own[0];
  }
  const video = await Video.create(body);
  res.status(201).json({ success: true, data: video });
});

exports.list = catchAsync(async (req, res) => {
  const { category, speciality, patient, patients, includeInactive } = req.query;
  const isStaff = req.user && ['superadmin', 'clinic_admin', 'doctor', 'receptionist'].includes(req.user.role);
  const filter = isStaff && includeInactive === 'true' ? {} : { isActive: true };
  if (category) filter.category = category;
  if (speciality) filter.speciality = speciality;

  if (!isStaff) {
    // patients only ever see videos assigned to their own family members; guests see nothing
    if (!req.user) return res.json({ success: true, data: [] });
    const mine = (await Patient.find({ guardianUser: req.user._id }).select('_id')).map((p) => String(p._id));
    const asked = patient ? [String(patient)] : patients ? String(patients).split(',').filter(Boolean) : mine;
    filter.assignedPatients = { $in: asked.filter((id) => mine.includes(id)) };
  } else {
    if (patient) filter.assignedPatients = patient;
    else if (patients) filter.assignedPatients = { $in: String(patients).split(',').filter(Boolean) };
    if (isClinicScoped(req.user)) Object.assign(filter, visibleFilter(req.user));
  }

  const query = Video.find(filter).populate('speciality', 'name').sort('-createdAt');
  if (!isStaff) query.select('-assignedPatients -createdBy');
  res.json({ success: true, data: await query });
});

exports.assignToPatient = catchAsync(async (req, res) => {
  const { patientId } = req.body;
  const existing = await Video.findById(req.params.id);
  if (!existing) throw new ApiError(404, 'Video not found');
  if (isClinicScoped(req.user)) {
    if (existing.clinic && !hasClinicAccess(req.user, existing.clinic)) {
      throw new ApiError(403, 'No access to this video');
    }
    const patient = await Patient.findById(patientId);
    if (!patient) throw new ApiError(404, 'Patient not found');
    await assertPatientAccess(req.user, patient);
  }
  const video = await Video.findByIdAndUpdate(
    req.params.id,
    { $addToSet: { assignedPatients: patientId } },
    { new: true }
  );
  if (!video) throw new ApiError(404, 'Video not found');
  await Patient.findByIdAndUpdate(patientId, { $addToSet: { assignedVideos: video._id } });
  res.json({ success: true, data: video });
});

exports.update = catchAsync(async (req, res) => {
  const existing = await Video.findById(req.params.id);
  if (!existing) throw new ApiError(404, 'Video not found');
  assertVideoEditable(req.user, existing);
  if (isClinicScoped(req.user)) delete req.body.clinic;
  const video = await Video.findByIdAndUpdate(req.params.id, tidy(req.body), { new: true, runValidators: true });
  if (!video) throw new ApiError(404, 'Video not found');
  res.json({ success: true, data: video });
});

exports.remove = catchAsync(async (req, res) => {
  const existing = await Video.findById(req.params.id);
  if (!existing) throw new ApiError(404, 'Video not found');
  assertVideoEditable(req.user, existing);
  const video = await Video.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
  if (!video) throw new ApiError(404, 'Video not found');
  res.json({ success: true, message: 'Video deactivated' });
});

exports.unassignFromPatient = catchAsync(async (req, res) => {
  const { id, patientId } = req.params;
  const video = await Video.findById(id);
  if (!video) throw new ApiError(404, 'Video not found');
  if (isClinicScoped(req.user)) {
    const patient = await Patient.findById(patientId);
    if (!patient) throw new ApiError(404, 'Patient not found');
    await assertPatientAccess(req.user, patient);
  }
  await Video.updateOne({ _id: id }, { $pull: { assignedPatients: patientId } });
  await Patient.updateOne({ _id: patientId }, { $pull: { assignedVideos: id } });
  res.json({ success: true, message: 'Video removed from patient' });
});

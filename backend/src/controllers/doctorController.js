const Doctor = require('../models/Doctor');
const catchAsync = require('../utils/catchAsync');
const ApiError = require('../utils/apiError');
const { cacheGet, cacheSet, cacheDelByPrefix } = require('../services/cacheService');
const { FIXED_CONSULTATION_FEE } = require('../config/fees');
const {
  isClinicScoped,
  ownClinicIds,
  assertAnyClinicAccess,
  assertAllWithinOwn,
} = require('../utils/clinicAccess');

exports.create = catchAsync(async (req, res) => {
  const body = { ...req.body, consultationFee: FIXED_CONSULTATION_FEE };
  if (isClinicScoped(req.user)) {
    if (!Array.isArray(body.clinics) || !body.clinics.length) body.clinics = ownClinicIds(req.user);
    assertAllWithinOwn(req.user, body.clinics);
    assertAllWithinOwn(req.user, (body.clinicTimings || []).map((t) => t.clinic).filter(Boolean));
  }
  const doctor = await Doctor.create(body);
  await cacheDelByPrefix('doctors:');
  res.status(201).json({ success: true, data: doctor });
});

exports.list = catchAsync(async (req, res) => {
  const { speciality, clinic } = req.query;
  const scoped = isClinicScoped(req.user);

  const cacheKey = `doctors:list:${speciality || 'x'}:${clinic || 'x'}`;
  if (!scoped) {
    const cached = await cacheGet(cacheKey);
    if (cached) return res.json({ success: true, data: cached, cached: true });
  }

  const filter = req.query.includeInactive === 'true' ? {} : { isActive: true };
  if (speciality) filter.speciality = speciality;
  if (clinic) filter.clinics = clinic;

  // signed-in clinic staff only see doctors of their own clinic(s)
  if (scoped) {
    const own = ownClinicIds(req.user);
    filter.clinics = clinic && own.includes(String(clinic)) ? clinic : { $in: own };
  }

  const doctors = await Doctor.find(filter)
    .populate('speciality', 'name slug')
    .populate('clinics', 'name slug address timezone');
  if (!scoped) await cacheSet(cacheKey, doctors, 120);
  res.json({ success: true, data: doctors });
});

exports.getOne = catchAsync(async (req, res) => {
  const doctor = await Doctor.findById(req.params.id)
    .populate('speciality', 'name slug')
    .populate('clinics', 'name slug address timezone');
  if (!doctor) throw new ApiError(404, 'Doctor not found');
  res.json({ success: true, data: doctor });
});

exports.update = catchAsync(async (req, res) => {
  const existing = await Doctor.findById(req.params.id);
  if (!existing) throw new ApiError(404, 'Doctor not found');

  const body = { ...req.body, consultationFee: FIXED_CONSULTATION_FEE };

  if (isClinicScoped(req.user)) {
    assertAnyClinicAccess(req.user, existing.clinics);
    const own = ownClinicIds(req.user);

    // clinic_admin only edits its own clinic assignments; other clinics' links are kept as-is
    if (body.clinics !== undefined) {
      assertAllWithinOwn(req.user, body.clinics);
      const others = existing.clinics.filter((c) => !own.includes(c.toString()));
      body.clinics = [...others, ...(body.clinics || [])];
    }
    if (body.clinicTimings !== undefined) {
      assertAllWithinOwn(req.user, (body.clinicTimings || []).map((t) => t.clinic).filter(Boolean));
      const otherTimings = existing.clinicTimings.filter((t) => t.clinic && !own.includes(t.clinic.toString()));
      body.clinicTimings = [...otherTimings, ...(body.clinicTimings || [])];
    }
  }

  const doctor = await Doctor.findByIdAndUpdate(req.params.id, body, {
    new: true,
    runValidators: true,
  });
  await cacheDelByPrefix('doctors:');
  res.json({ success: true, data: doctor });
});

exports.remove = catchAsync(async (req, res) => {
  const existing = await Doctor.findById(req.params.id);
  if (!existing) throw new ApiError(404, 'Doctor not found');
  assertAnyClinicAccess(req.user, existing.clinics);

  await Doctor.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
  await cacheDelByPrefix('doctors:');
  res.json({ success: true, message: 'Doctor deactivated' });
});

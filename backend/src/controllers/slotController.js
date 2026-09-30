const Slot = require('../models/Slot');
const Doctor = require('../models/Doctor');
const catchAsync = require('../utils/catchAsync');
const ApiError = require('../utils/apiError');
const { generateDaySlots } = require('../utils/slotGenerator');
const { cacheGet, cacheSet, cacheDelByPrefix } = require('../services/cacheService');
const { assertClinicAccess } = require('../utils/clinicAccess');
const Clinic = require('../models/Clinic');
const { isPast } = require('../utils/slotTime');

// generate slots for doctor+clinic across a date range based on doctor.clinicTimings
exports.generate = catchAsync(async (req, res) => {
  const { doctorId, clinicId, startDate, endDate } = req.body;
  assertClinicAccess(req.user, clinicId);
  const doctor = await Doctor.findById(doctorId);
  if (!doctor) throw new ApiError(404, 'Doctor not found');
  const timing = doctor.clinicTimings.find((t) => t.clinic.toString() === clinicId);
  if (!timing) throw new ApiError(400, 'No timing configured for doctor at this clinic');

  const created = [];
  const cur = new Date(startDate);
  const end = new Date(endDate);
  while (cur <= end) {
    const dayOfWeek = cur.getDay();
    if (timing.workingDays.includes(dayOfWeek)) {
      const dateStr = cur.toISOString().slice(0, 10);
      const daySlots = generateDaySlots(timing.startTime, timing.endTime, timing.slotDurationMinutes);
      for (const s of daySlots) {
        try {
          const slot = await Slot.create({
            clinic: clinicId,
            doctor: doctorId,
            date: dateStr,
            startTime: s.startTime,
            endTime: s.endTime,
          });
          created.push(slot);
        } catch (err) {
          if (err.code !== 11000) throw err; // ignore duplicate slot
        }
      }
    }
    cur.setDate(cur.getDate() + 1);
  }
  await cacheDelByPrefix(`slots:${clinicId}:${doctorId}`);
  res.status(201).json({ success: true, count: created.length, data: created });
});

exports.availability = catchAsync(async (req, res) => {
  const { clinicId, doctorId, date } = req.query;
  if (!clinicId || !doctorId || !date) {
    throw new ApiError(400, 'clinicId, doctorId, date required');
  }
  const cacheKey = `slots:${clinicId}:${doctorId}:${date}`;
  let slots = await cacheGet(cacheKey);
  if (!slots) {
    slots = await Slot.find({
      clinic: clinicId,
      doctor: doctorId,
      date,
      status: 'available',
    })
      .sort('startTime')
      .lean();
    await cacheSet(cacheKey, slots, 60);
  }

  // Past-ness is worked out on every request (never cached), in the clinic's timezone.
  // Slots whose time has gone stay in the list, flagged, so the site can show them as unavailable.
  const clinic = await Clinic.findById(clinicId).select('timezone').lean();
  const tz = clinic?.timezone || 'Asia/Kolkata';
  const data = slots.map((s) => ({ ...s, isPast: isPast(s.date, s.startTime, tz) }));
  res.json({ success: true, data });
});

// full day view for staff — every slot regardless of status (optionally filtered)
exports.list = catchAsync(async (req, res) => {
  const { clinicId, doctorId, date, from, to, status } = req.query;
  if (!clinicId || !doctorId) throw new ApiError(400, 'clinicId and doctorId required');
  assertClinicAccess(req.user, clinicId);

  const filter = { clinic: clinicId, doctor: doctorId };
  if (date) filter.date = date;
  else if (from || to) {
    filter.date = {};
    if (from) filter.date.$gte = from;
    if (to) filter.date.$lte = to;
  }
  if (status) filter.status = { $in: String(status).split(',') };

  const slots = await Slot.find(filter).sort('date startTime');
  res.json({ success: true, data: slots });
});

exports.block = catchAsync(async (req, res) => {
  const { reason } = req.body;
  const existing = await Slot.findById(req.params.id).select('clinic');
  if (!existing) throw new ApiError(404, 'Slot not found');
  assertClinicAccess(req.user, existing.clinic);
  const slot = await Slot.findByIdAndUpdate(
    req.params.id,
    { status: 'blocked', blockedReason: reason },
    { new: true }
  );
  if (!slot) throw new ApiError(404, 'Slot not found');
  await cacheDelByPrefix(`slots:${slot.clinic}:${slot.doctor}`);
  res.json({ success: true, data: slot });
});

exports.unblock = catchAsync(async (req, res) => {
  const existing = await Slot.findById(req.params.id).select('clinic');
  if (!existing) throw new ApiError(404, 'Blocked slot not found');
  assertClinicAccess(req.user, existing.clinic);
  const slot = await Slot.findOneAndUpdate(
    { _id: req.params.id, status: 'blocked' },
    { status: 'available', blockedReason: null },
    { new: true }
  );
  if (!slot) throw new ApiError(404, 'Blocked slot not found');
  await cacheDelByPrefix(`slots:${slot.clinic}:${slot.doctor}`);
  res.json({ success: true, data: slot });
});

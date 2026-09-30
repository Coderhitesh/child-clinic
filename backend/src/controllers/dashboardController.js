const Appointment = require('../models/Appointment');
const Clinic = require('../models/Clinic');
const Doctor = require('../models/Doctor');
const Patient = require('../models/Patient');
const catchAsync = require('../utils/catchAsync');
const { cacheGet, cacheSet } = require('../services/cacheService');

const todayStr = () => new Date().toISOString().slice(0, 10);

// clinic-scoped dashboard: own clinic(s) only
exports.clinicDashboard = catchAsync(async (req, res) => {
  const clinicIds =
    req.user.role === 'superadmin' && req.query.clinic
      ? [req.query.clinic]
      : req.user.clinics;

  const cacheKey = `dash:clinic:${clinicIds.join(',')}`;
  const cached = await cacheGet(cacheKey);
  if (cached) return res.json({ success: true, data: cached, cached: true });

  const filter = { clinic: { $in: clinicIds } };
  const [todayCount, upcoming, completed, cancelled, doctorsCount] = await Promise.all([
    Appointment.countDocuments({ ...filter, date: todayStr() }),
    Appointment.countDocuments({ ...filter, date: { $gte: todayStr() }, status: { $in: ['pending', 'confirmed'] } }),
    Appointment.countDocuments({ ...filter, status: 'completed' }),
    Appointment.countDocuments({ ...filter, status: 'cancelled' }),
    Doctor.countDocuments({ clinics: { $in: clinicIds }, isActive: true }),
  ]);

  const data = {
    clinics: clinicIds,
    todayAppointments: todayCount,
    upcomingAppointments: upcoming,
    completedConsultations: completed,
    cancelledAppointments: cancelled,
    activeDoctors: doctorsCount,
  };
  await cacheSet(cacheKey, data, 60);
  res.json({ success: true, data });
});

// superadmin: all clinics, all specialities aggregate
exports.globalDashboard = catchAsync(async (req, res) => {
  const cacheKey = 'dash:global';
  const cached = await cacheGet(cacheKey);
  if (cached) return res.json({ success: true, data: cached, cached: true });

  const [totalClinics, totalDoctors, totalPatients, todayCount, upcoming, completed, cancelled] =
    await Promise.all([
      Clinic.countDocuments({ isActive: true }),
      Doctor.countDocuments({ isActive: true }),
      Patient.countDocuments(),
      Appointment.countDocuments({ date: todayStr() }),
      Appointment.countDocuments({ date: { $gte: todayStr() }, status: { $in: ['pending', 'confirmed'] } }),
      Appointment.countDocuments({ status: 'completed' }),
      Appointment.countDocuments({ status: 'cancelled' }),
    ]);

  const data = {
    totalClinics,
    totalDoctors,
    totalPatients,
    todayAppointments: todayCount,
    upcomingAppointments: upcoming,
    completedConsultations: completed,
    cancelledAppointments: cancelled,
  };
  await cacheSet(cacheKey, data, 60);
  res.json({ success: true, data });
});

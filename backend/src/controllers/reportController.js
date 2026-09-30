const Appointment = require('../models/Appointment');
const Payment = require('../models/Payment');
const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor');
const catchAsync = require('../utils/catchAsync');
const { Parser } = require('json2csv');

// clinic-scoped roles only see own clinic(s); superadmin sees all (or filters by ?clinic=)
const resolveClinicFilter = (req) => {
  if (req.user.role === 'superadmin') {
    return req.query.clinic ? { clinic: req.query.clinic } : {};
  }
  return { clinic: { $in: req.user.clinics } };
};

const dateRangeFilter = (req) => {
  const { from, to } = req.query;
  const filter = {};
  if (from || to) {
    filter.date = {};
    if (from) filter.date.$gte = from;
    if (to) filter.date.$lte = to;
  }
  return filter;
};

const maybeExportCsv = (req, res, rows, filename) => {
  if (req.query.format !== 'csv') return false;
  if (!rows.length) {
    res.status(200).send('');
    return true;
  }
  const parser = new Parser({ fields: Object.keys(rows[0]) });
  const csv = parser.parse(rows);
  res.header('Content-Type', 'text/csv');
  res.attachment(filename);
  res.send(csv);
  return true;
};

// 1. Appointments report — date range, clinic-wise, status breakdown
exports.appointmentsReport = catchAsync(async (req, res) => {
  const filter = { ...resolveClinicFilter(req), ...dateRangeFilter(req) };

  const [byStatus, byClinic, total] = await Promise.all([
    Appointment.aggregate([{ $match: filter }, { $group: { _id: '$status', count: { $sum: 1 } } }]),
    Appointment.aggregate([
      { $match: filter },
      { $group: { _id: '$clinic', count: { $sum: 1 } } },
      { $lookup: { from: 'clinics', localField: '_id', foreignField: '_id', as: 'clinic' } },
      { $unwind: '$clinic' },
      { $project: { _id: 0, clinicId: '$_id', clinicName: '$clinic.name', count: 1 } },
    ]),
    Appointment.countDocuments(filter),
  ]);

  if (req.query.format === 'csv') {
    const rows = await Appointment.find(filter)
      .populate('clinic', 'name')
      .populate('doctor', 'name')
      .populate('patient', 'name patientId')
      .lean();
    const flat = rows.map((a) => ({
      appointmentId: a._id.toString(),
      clinic: a.clinic?.name,
      doctor: a.doctor?.name,
      patient: a.patient?.name,
      date: a.date,
      startTime: a.startTime,
      status: a.status,
      paymentMethod: a.paymentMethod,
      consultationFee: a.consultationFee,
    }));
    if (maybeExportCsv(req, res, flat, 'appointments_report.csv')) return;
  }

  res.json({ success: true, data: { total, byStatus, byClinic } });
});

// 2. Revenue report — payments grouped by clinic/method/date
exports.revenueReport = catchAsync(async (req, res) => {
  const { from, to, clinic } = req.query;
  const clinicFilter =
    req.user.role === 'superadmin'
      ? clinic
        ? { clinic: clinic }
        : {}
      : { clinic: { $in: req.user.clinics } };

  const matchFilter = { ...clinicFilter, status: { $in: ['paid', 'collected_at_clinic'] } };
  if (from || to) {
    matchFilter.paidAt = {};
    if (from) matchFilter.paidAt.$gte = new Date(from);
    if (to) matchFilter.paidAt.$lte = new Date(to);
  }

  const [totalRevenue, byMethod, byClinic, byDay] = await Promise.all([
    Payment.aggregate([{ $match: matchFilter }, { $group: { _id: null, sum: { $sum: '$amount' } } }]),
    Payment.aggregate([{ $match: matchFilter }, { $group: { _id: '$method', sum: { $sum: '$amount' }, count: { $sum: 1 } } }]),
    Payment.aggregate([
      { $match: matchFilter },
      { $group: { _id: '$clinic', sum: { $sum: '$amount' }, count: { $sum: 1 } } },
      { $lookup: { from: 'clinics', localField: '_id', foreignField: '_id', as: 'clinic' } },
      { $unwind: '$clinic' },
      { $project: { _id: 0, clinicId: '$_id', clinicName: '$clinic.name', sum: 1, count: 1 } },
    ]),
    Payment.aggregate([
      { $match: matchFilter },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$paidAt' } }, sum: { $sum: '$amount' } } },
      { $sort: { _id: 1 } },
    ]),
  ]);

  const data = {
    totalRevenue: totalRevenue[0]?.sum || 0,
    byMethod,
    byClinic,
    byDay,
  };

  if (req.query.format === 'csv') {
    const rows = await Payment.find(matchFilter).populate('clinic', 'name').lean();
    const flat = rows.map((p) => ({
      paymentId: p._id.toString(),
      clinic: p.clinic?.name,
      amount: p.amount,
      method: p.method,
      status: p.status,
      paidAt: p.paidAt,
    }));
    if (maybeExportCsv(req, res, flat, 'revenue_report.csv')) return;
  }

  res.json({ success: true, data });
});

// 3. Doctor performance — appointments count, completed, cancelled, no-show per doctor
exports.doctorPerformanceReport = catchAsync(async (req, res) => {
  const filter = { ...resolveClinicFilter(req), ...dateRangeFilter(req) };

  const rows = await Appointment.aggregate([
    { $match: filter },
    {
      $group: {
        _id: '$doctor',
        total: { $sum: 1 },
        completed: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } },
        cancelled: { $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] } },
        noShow: { $sum: { $cond: [{ $eq: ['$status', 'no_show'] }, 1, 0] } },
        revenue: { $sum: '$consultationFee' },
      },
    },
    { $lookup: { from: 'doctors', localField: '_id', foreignField: '_id', as: 'doctor' } },
    { $unwind: '$doctor' },
    {
      $project: {
        _id: 0,
        doctorId: '$_id',
        doctorName: '$doctor.name',
        total: 1,
        completed: 1,
        cancelled: 1,
        noShow: 1,
        revenue: 1,
      },
    },
    { $sort: { total: -1 } },
  ]);

  if (maybeExportCsv(req, res, rows, 'doctor_performance_report.csv')) return;
  res.json({ success: true, data: rows });
});

// 4. New patients report — registrations over period (global count; clinic scoping not
// applicable since Patient isn't clinic-owned, so restrict to superadmin/clinic_admin via route)
exports.patientsReport = catchAsync(async (req, res) => {
  const { from, to } = req.query;
  const filter = {};
  if (from || to) {
    filter.createdAt = {};
    if (from) filter.createdAt.$gte = new Date(from);
    if (to) filter.createdAt.$lte = new Date(to);
  }

  if (req.query.format === 'csv') {
    const rows = await Patient.find(filter).sort('-createdAt').lean();
    const flat = rows.map((p) => ({
      patientId: p._id.toString(),
      name: p.name,
      gender: p.gender,
      age: p.age,
      phone: p.contact?.phone,
      email: p.contact?.email,
      registeredAt: p.createdAt,
    }));
    if (maybeExportCsv(req, res, flat, 'patients_report.csv')) return;
  }

  const [total, byDay] = await Promise.all([
    Patient.countDocuments(filter),
    Patient.aggregate([
      { $match: filter },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]),
  ]);

  res.json({ success: true, data: { total, byDay } });
});

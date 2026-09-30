const Payment = require('../models/Payment');
const Appointment = require('../models/Appointment');
const catchAsync = require('../utils/catchAsync');
const ApiError = require('../utils/apiError');
const { logAudit } = require('../middleware/audit');
const { assertClinicAccess, assertOwnAppointment } = require('../utils/clinicAccess');

// Payment is always taken at the clinic — staff mark it collected here.
exports.markCollectedAtClinic = catchAsync(async (req, res) => {
  const payment = await Payment.findById(req.params.id);
  if (!payment) throw new ApiError(404, 'Payment not found');
  assertClinicAccess(req.user, payment.clinic);
  if (payment.status === 'collected_at_clinic') {
    return res.json({ success: true, data: payment });
  }
  payment.status = 'collected_at_clinic';
  payment.paidAt = new Date();
  payment.collectedBy = req.user._id;
  await payment.save();

  await logAudit({ req, action: 'PAYMENT_COLLECTED', resourceType: 'Payment', resourceId: payment._id });
  res.json({ success: true, data: payment });
});

exports.getByAppointment = catchAsync(async (req, res) => {
  const payment = await Payment.findOne({ appointment: req.params.appointmentId });
  if (!payment) throw new ApiError(404, 'Payment not found');
  assertClinicAccess(req.user, payment.clinic);
  if (req.user.role === 'patient') {
    const appt = await Appointment.findById(req.params.appointmentId).select('patient');
    if (!appt) throw new ApiError(404, 'Appointment not found');
    await assertOwnAppointment(req.user, appt);
  }
  await logAudit({ req, action: 'PAYMENT_VIEW', resourceType: 'Payment', resourceId: payment._id });
  res.json({ success: true, data: payment });
});

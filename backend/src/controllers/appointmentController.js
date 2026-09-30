const mongoose = require('mongoose');
const Appointment = require('../models/Appointment');
const Slot = require('../models/Slot');
const Doctor = require('../models/Doctor');
const Clinic = require('../models/Clinic');
const Patient = require('../models/Patient');
const Payment = require('../models/Payment');
const catchAsync = require('../utils/catchAsync');
const ApiError = require('../utils/apiError');
const { claimSlot, freeSlot, releaseSlotIfHeld, confirmSlotBooking } = require('../services/slotService');
const { enqueueNotification } = require('../queues/notificationQueue');
const { cacheDelByPrefix } = require('../services/cacheService');
const { isPast } = require('../utils/slotTime');

const PAST_MSG = 'This time has already passed. Please choose a later time slot.';
const { logAudit } = require('../middleware/audit');
const { computeDiscount, recordCouponUsage } = require('../services/couponService');
const { FIXED_CONSULTATION_FEE } = require('../config/fees');
const { assertClinicAccess, assertPatientAccess, assertOwnAppointment } = require('../utils/clinicAccess');
const { buildAppointmentSlip } = require('../services/appointmentSlipPdf');

// every appointment starts at the fixed fee; staff can change it later per appointment.
// Never trust a client amount.
const resolveFee = () => FIXED_CONSULTATION_FEE;

const YOUTUBE_RE =
  /^(https?:\/\/)?((www|m)\.)?(youtube\.com\/(watch\?(.*&)?v=|embed\/|shorts\/|live\/)|youtu\.be\/)[\w-]{11}/i;

// payment is always collected at the clinic
const PAY_METHOD = 'pay_at_clinic';

// Step 1-7 of booking flow: speciality -> clinic -> doctor -> date -> slot -> patient -> payment method
exports.book = catchAsync(async (req, res) => {
  const {
    specialityId,
    clinicId,
    doctorId,
    slotId,
    patient: patientInput,
    symptoms,
    couponCode,
  } = req.body;

  if (!patientInput) throw new ApiError(400, 'Patient details are required');

  const [doctor, clinic, slot] = await Promise.all([
    Doctor.findById(doctorId),
    Clinic.findById(clinicId),
    Slot.findById(slotId),
  ]);
  if (!doctor || !clinic || !slot) throw new ApiError(404, 'Doctor/Clinic/Slot not found');
  if (doctor.speciality.toString() !== specialityId) {
    throw new ApiError(400, 'Doctor does not belong to selected speciality');
  }
  if (!doctor.clinics.map((c) => c.toString()).includes(clinicId)) {
    throw new ApiError(400, 'Doctor not assigned to selected clinic');
  }
  if (slot.clinic.toString() !== clinicId || slot.doctor.toString() !== doctorId) {
    throw new ApiError(400, 'Slot does not match clinic/doctor');
  }
  if (isPast(slot.date, slot.startTime, clinic.timezone)) throw new ApiError(400, PAST_MSG);
  // fail early (before a patient record is created) if someone else already took it
  if (slot.status !== 'available') {
    throw new ApiError(409, 'That slot was just taken — please pick another time');
  }

  const fee = resolveFee(doctor, clinic);

  // optional coupon: validated server-side, never trust a client-sent discount amount
  let couponResult = null;
  if (couponCode) {
    couponResult = await computeDiscount({
      code: couponCode,
      userId: req.user._id,
      amount: fee,
      clinicId,
      specialityId,
    });
  }
  const discountAmount = couponResult ? couponResult.discount : 0;
  const payableAmount = fee - discountAmount;

  // find or create patient profile (reused across visits)
  let patient;
  if (patientInput._id) {
    patient = await Patient.findById(patientInput._id);
    if (!patient) throw new ApiError(404, 'Patient not found');
    if (req.user.role === 'patient' && patient.guardianUser?.toString() !== req.user._id.toString()) {
      throw new ApiError(403, 'Not your patient record');
    }
  } else {
    const fresh = { ...patientInput };
    delete fresh.patientId;
    if (!fresh.gender) delete fresh.gender;
    if (!fresh.dob) delete fresh.dob;
    if (fresh.age === '' || fresh.age === null) delete fresh.age;
    patient = await Patient.create({
      ...fresh,
      guardianUser: req.user.role === 'patient' ? req.user._id : fresh.guardianUser,
    });
  }

  await Patient.updateOne({ _id: patient._id }, { $addToSet: { clinics: clinicId } });

  // take the slot atomically first, so two people can never book the same time
  await claimSlot(slotId);
  let appointment;
  let payment;
  try {
  appointment = await Appointment.create({
    speciality: specialityId,
    clinic: clinicId,
    doctor: doctorId,
    slot: slotId,
    patient: patient._id,
    bookedBy: req.user._id,
    date: slot.date,
    startTime: slot.startTime,
    endTime: slot.endTime,
    status: 'pending',
    paymentMethod: PAY_METHOD,
    consultationFee: fee,
    couponCode: couponResult ? couponResult.coupon.code : undefined,
    discountAmount,
    payableAmount,
    symptoms,
  });

  payment = await Payment.create({
    appointment: appointment._id,
    clinic: clinicId,
    amount: payableAmount,
    method: PAY_METHOD,
    status: 'pending',
  });

  appointment.payment = payment._id;
  await appointment.save();
  } catch (err) {
    await freeSlot(slotId);
    if (appointment?._id) await Appointment.deleteOne({ _id: appointment._id });
    throw err;
  }
  await confirmSlotBooking(slotId, appointment._id);
  await cacheDelByPrefix(`slots:${clinicId}:${doctorId}`);

  if (couponResult) {
    await recordCouponUsage({
      couponId: couponResult.coupon._id,
      userId: req.user._id,
      appointmentId: appointment._id,
      discountApplied: discountAmount,
    });
  }

  await enqueueNotification('booking_confirm', {
    appointmentId: appointment._id,
    patientId: patient._id,
    userId: patient.guardianUser || appointment.bookedBy, // push goes to the account that owns the record
    paymentStatus: 'pending_at_clinic',
    email: patient.contact?.email,
    phone: patient.contact?.phone || patient.guardianDetails?.phone,
  });

  // send back exactly what was booked (doctor / clinic / patient / speciality names, date, time)
  const populated = await Appointment.findById(appointment._id).populate('speciality clinic doctor patient payment');

  res.status(201).json({ success: true, data: { appointment: populated, payment, discountAmount, payableAmount } });
});

exports.get = catchAsync(async (req, res) => {
  const appt = await Appointment.findById(req.params.id)
    .populate('speciality clinic doctor patient payment');
  if (!appt) throw new ApiError(404, 'Appointment not found');
  assertClinicAccess(req.user, appt.clinic);
  await assertOwnAppointment(req.user, appt);

  await logAudit({ req, action: 'APPOINTMENT_VIEW', resourceType: 'Appointment', resourceId: appt._id });
  res.json({ success: true, data: appt });
});


/**
 * Walk-in booking — reception/clinic desk only.
 *
 * Differences from the public flow: the visit is confirmed on the spot, the patient
 * can be created inline, and a time that has no generated slot still works — an
 * ad-hoc slot is created and marked booked so the day view and reschedule flow keep
 * behaving normally. Fees, coupons and payment modes go through the same server-side
 * rules as an online booking.
 */
exports.walkIn = catchAsync(async (req, res) => {
  const {
    clinicId,
    doctorId,
    slotId,
    date,
    startTime,
    patient: patientInput,
    symptoms,
    couponCode,
    collectNow = false,
  } = req.body;

  if (!clinicId || !doctorId) throw new ApiError(400, 'clinicId and doctorId required');
  if (!patientInput || (!patientInput._id && !patientInput.name)) {
    throw new ApiError(400, 'Provide an existing patient id or at least a name');
  }
  // a clinic-scoped user can only book at their own clinic
  if (['clinic_admin', 'receptionist', 'doctor'].includes(req.user.role)) {
    const own = (req.user.clinics || []).map((c) => c.toString());
    if (!own.includes(String(clinicId))) throw new ApiError(403, 'Not your clinic');
  }

  const [doctor, clinic] = await Promise.all([Doctor.findById(doctorId), Clinic.findById(clinicId)]);
  if (!doctor || !clinic) throw new ApiError(404, 'Doctor/Clinic not found');
  if (!doctor.clinics.map((c) => c.toString()).includes(String(clinicId))) {
    throw new ApiError(400, 'Doctor not assigned to selected clinic');
  }

  const now = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  const visitDate = date || `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
  const wantedTime = startTime || `${pad(now.getHours())}:${pad(now.getMinutes())}`;

  // 1. explicit slot, 2. next free slot at/after the requested time, 3. ad-hoc walk-in slot
  let slot = null;
  if (slotId) {
    slot = await Slot.findById(slotId);
    if (!slot) throw new ApiError(404, 'Slot not found');
    if (slot.status !== 'available') throw new ApiError(409, 'That slot is no longer free');
    if (isPast(slot.date, slot.endTime, clinic.timezone)) throw new ApiError(400, PAST_MSG);
    if (slot.clinic.toString() !== String(clinicId) || slot.doctor.toString() !== String(doctorId)) {
      throw new ApiError(400, 'Slot does not match clinic/doctor');
    }
  } else {
    slot = await Slot.findOne({
      clinic: clinicId,
      doctor: doctorId,
      date: visitDate,
      status: 'available',
      startTime: { $gte: wantedTime },
    }).sort('startTime');
  }

  if (!slot) {
    const timing = doctor.clinicTimings.find((t) => t.clinic.toString() === String(clinicId));
    const duration = timing?.slotDurationMinutes || 15;
    const [h, m] = wantedTime.split(':').map(Number);
    const endMins = h * 60 + m + duration;
    const endTime = `${pad(Math.floor((endMins % 1440) / 60))}:${pad(endMins % 60)}`;

    try {
      slot = await Slot.create({
        clinic: clinicId,
        doctor: doctorId,
        date: visitDate,
        startTime: wantedTime,
        endTime,
        status: 'available',
        isWalkIn: true,
      });
    } catch (err) {
      if (err.code === 11000) throw new ApiError(409, 'A slot already exists at that time — pick it from the list instead');
      throw err;
    }
  }

  const fee = resolveFee(doctor, clinic);

  let couponResult = null;
  if (couponCode) {
    couponResult = await computeDiscount({
      code: couponCode,
      userId: req.user._id,
      amount: fee,
      clinicId,
      specialityId: doctor.speciality.toString(),
    });
  }
  const discountAmount = couponResult ? couponResult.discount : 0;
  const payableAmount = fee - discountAmount;

  let patient;
  if (patientInput._id) {
    patient = await Patient.findById(patientInput._id);
    if (!patient) throw new ApiError(404, 'Patient not found');
    await assertPatientAccess(req.user, patient);
  } else {
    const fresh = { ...patientInput };
    delete fresh.patientId;
    if (!fresh.gender) delete fresh.gender;
    if (!fresh.dob) delete fresh.dob;
    if (fresh.age === '' || fresh.age === null) delete fresh.age;
    patient = await Patient.create(fresh);
  }
  await Patient.updateOne({ _id: patient._id }, { $addToSet: { clinics: clinicId } });

  await claimSlot(slot._id);
  const appointment = await Appointment.create({
    speciality: doctor.speciality,
    clinic: clinicId,
    doctor: doctorId,
    slot: slot._id,
    patient: patient._id,
    bookedBy: req.user._id,
    date: slot.date,
    startTime: slot.startTime,
    endTime: slot.endTime,
    status: 'confirmed', // the patient is standing at the desk
    source: 'walk_in',
    paymentMethod: PAY_METHOD,
    consultationFee: fee,
    couponCode: couponResult ? couponResult.coupon.code : undefined,
    discountAmount,
    payableAmount,
    symptoms,
  });

  const payment = await Payment.create({
    appointment: appointment._id,
    clinic: clinicId,
    amount: payableAmount,
    method: PAY_METHOD,
    status: collectNow ? 'collected_at_clinic' : 'pending',
    paidAt: collectNow ? new Date() : undefined,
    collectedBy: collectNow ? req.user._id : undefined,
  });

  appointment.payment = payment._id;
  await appointment.save();

  await confirmSlotBooking(slot._id, appointment._id);
  await cacheDelByPrefix(`slots:${clinicId}:${doctorId}`);

  if (couponResult) {
    await recordCouponUsage({
      couponId: couponResult.coupon._id,
      userId: req.user._id,
      appointmentId: appointment._id,
      discountApplied: discountAmount,
    });
  }

  await logAudit({ req, action: 'APPOINTMENT_WALK_IN', resourceType: 'Appointment', resourceId: appointment._id });

  await enqueueNotification('booking_confirm', {
    appointmentId: appointment._id,
    userId: patient.guardianUser,
    paymentStatus: payment.status,
    email: patient.contact?.email,
    phone: patient.contact?.phone || patient.guardianDetails?.phone,
  });

  const populated = await Appointment.findById(appointment._id).populate('speciality clinic doctor patient payment');

  res.status(201).json({
    success: true,
    message: 'Walk-in appointment confirmed',
    data: { appointment: populated, payment, slotCreated: Boolean(slot.isWalkIn) },
  });
});

exports.list = catchAsync(async (req, res) => {
  const { clinic, doctor, status, date, patient, source } = req.query;
  const filter = {};
  if (clinic) filter.clinic = clinic;
  if (doctor) filter.doctor = doctor;
  if (status) filter.status = status;
  if (date) filter.date = date;
  if (patient) filter.patient = patient;
  if (source) filter.source = source;

  // clinic-scoped roles only see their own clinics
  if (['clinic_admin', 'doctor', 'receptionist'].includes(req.user.role)) {
    filter.clinic = { $in: req.user.clinics };
  }
  if (req.user.role === 'patient') {
    const myPatients = await Patient.find({ guardianUser: req.user._id }).select('_id');
    filter.patient = { $in: myPatients.map((p) => p._id) };
  }

  const appts = await Appointment.find(filter)
    .populate('speciality clinic doctor patient payment')
    .sort('-createdAt');
  res.json({ success: true, data: appts });
});

exports.reschedule = catchAsync(async (req, res) => {
  const { newSlotId } = req.body;
  const appt = await Appointment.findById(req.params.id);
  if (!appt) throw new ApiError(404, 'Appointment not found');
  assertClinicAccess(req.user, appt.clinic);
  await assertOwnAppointment(req.user, appt);
  if (['completed', 'cancelled'].includes(appt.status)) {
    throw new ApiError(400, 'Cannot reschedule a completed/cancelled appointment');
  }
  const newSlot = await Slot.findById(newSlotId);
  if (!newSlot || newSlot.status !== 'available') throw new ApiError(409, 'New slot unavailable');
  const apptClinic = await Clinic.findById(appt.clinic).select('timezone').lean();
  if (isPast(newSlot.date, newSlot.startTime, apptClinic?.timezone)) throw new ApiError(400, PAST_MSG);
  if (newSlot.clinic.toString() !== appt.clinic.toString() || newSlot.doctor.toString() !== appt.doctor.toString()) {
    throw new ApiError(400, 'New slot must match same clinic/doctor');
  }
  const patientForNotify = await Patient.findById(appt.patient);

  // take the new slot atomically first, then free the old one
  const oldSlotId = appt.slot;
  await claimSlot(newSlot._id);
  await Slot.updateOne({ _id: newSlot._id }, { appointment: appt._id });
  await freeSlot(oldSlotId);

  appt.slot = newSlot._id;
  appt.date = newSlot.date;
  appt.startTime = newSlot.startTime;
  appt.endTime = newSlot.endTime;
  await appt.save();

  await cacheDelByPrefix(`slots:${appt.clinic}:${appt.doctor}`);
  await enqueueNotification('booking_confirm', {
    appointmentId: appt._id,
    userId: patientForNotify?.guardianUser || appt.bookedBy,
    rescheduled: true,
    date: appt.date,
    startTime: appt.startTime,
    email: patientForNotify?.contact?.email,
    phone: patientForNotify?.contact?.phone || patientForNotify?.guardianDetails?.phone,
  });

  res.json({ success: true, data: appt });
});

exports.cancel = catchAsync(async (req, res) => {
  const { reason } = req.body;
  const appt = await Appointment.findById(req.params.id).populate('payment');
  if (!appt) throw new ApiError(404, 'Appointment not found');
  assertClinicAccess(req.user, appt.clinic);
  await assertOwnAppointment(req.user, appt);
  if (appt.status === 'cancelled') throw new ApiError(400, 'Already cancelled');
  if (appt.status === 'completed') throw new ApiError(400, 'Cannot cancel completed appointment');

  appt.status = 'cancelled';
  appt.cancelledReason = reason;
  appt.cancelledBy = req.user._id;
  await appt.save();

  const slot = await Slot.findById(appt.slot);
  if (slot) {
    slot.status = 'available';
    slot.appointment = undefined;
    await slot.save();
  }
  await releaseSlotIfHeld(appt.slot);
  await cacheDelByPrefix(`slots:${appt.clinic}:${appt.doctor}`);

  const patientForNotify = await Patient.findById(appt.patient);
  await enqueueNotification('appointment_cancelled', {
    appointmentId: appt._id,
    userId: patientForNotify?.guardianUser || appt.bookedBy,
    date: appt.date,
    startTime: appt.startTime,
    reason,
    email: patientForNotify?.contact?.email,
    phone: patientForNotify?.contact?.phone || patientForNotify?.guardianDetails?.phone,
  });

  res.json({ success: true, data: appt });
});

exports.updateStatus = catchAsync(async (req, res) => {
  const { status, diagnosis, doctorNotes, followUpDate } = req.body;
  const allowed = ['confirmed', 'completed', 'no_show'];
  if (!allowed.includes(status)) throw new ApiError(400, 'Invalid status transition');

  const existing = await Appointment.findById(req.params.id).select('clinic status');
  if (!existing) throw new ApiError(404, 'Appointment not found');
  assertClinicAccess(req.user, existing.clinic);
  // a cancelled visit has already given its slot back, it cannot be revived here
  if (existing.status === 'cancelled') throw new ApiError(400, 'Cancelled appointment cannot be changed');

  const appt = await Appointment.findByIdAndUpdate(
    req.params.id,
    { status, diagnosis, doctorNotes, followUpDate },
    { new: true }
  );
  if (!appt) throw new ApiError(404, 'Appointment not found');
  res.json({ success: true, data: appt });
});

// Change the fee of one appointment. clinic_admin: 0 – fixed fee; superadmin: any amount.
exports.updateFee = catchAsync(async (req, res) => {
  const fee = Number(req.body.consultationFee);
  if (req.body.consultationFee === '' || req.body.consultationFee == null || !Number.isFinite(fee) || fee < 0) {
    throw new ApiError(400, 'Enter a valid fee');
  }
  if (req.user.role !== 'superadmin' && fee > FIXED_CONSULTATION_FEE) {
    throw new ApiError(400, `Fee cannot be more than ₹${FIXED_CONSULTATION_FEE}`);
  }

  const appt = await Appointment.findById(req.params.id).populate('payment');
  if (!appt) throw new ApiError(404, 'Appointment not found');
  assertClinicAccess(req.user, appt.clinic);
  if (appt.status === 'cancelled') throw new ApiError(400, 'Cannot change the fee of a cancelled appointment');

  const payment = appt.payment;
  if (payment && ['paid', 'collected_at_clinic', 'refunded'].includes(payment.status)) {
    throw new ApiError(400, 'Payment is already settled — fee can no longer be changed');
  }

  const previous = appt.consultationFee;
  appt.consultationFee = fee;
  appt.payableAmount = Math.max(0, fee - (appt.discountAmount || 0));
  appt.feeUpdatedBy = req.user._id;
  appt.feeUpdatedAt = new Date();
  await appt.save();

  if (payment) {
    await Payment.updateOne({ _id: payment._id }, { $set: { amount: appt.payableAmount } });
  }

  await logAudit({
    req,
    action: 'APPOINTMENT_FEE_UPDATE',
    resourceType: 'Appointment',
    resourceId: appt._id,
    meta: { from: previous, to: fee },
  });

  const populated = await Appointment.findById(appt._id).populate('speciality clinic doctor patient payment');
  res.json({ success: true, message: 'Fee updated', data: populated });
});

// Add / replace / clear the YouTube video attached to an appointment.
exports.updateVideo = catchAsync(async (req, res) => {
  const youtubeUrl = (req.body.youtubeUrl || '').trim();
  const videoTitle = (req.body.videoTitle || '').trim();
  if (youtubeUrl && !YOUTUBE_RE.test(youtubeUrl)) {
    throw new ApiError(400, 'Enter a valid YouTube link');
  }

  const appt = await Appointment.findById(req.params.id);
  if (!appt) throw new ApiError(404, 'Appointment not found');
  assertClinicAccess(req.user, appt.clinic);

  appt.youtubeUrl = youtubeUrl || undefined;
  appt.videoTitle = youtubeUrl ? videoTitle || undefined : undefined;
  appt.videoUpdatedBy = req.user._id;
  appt.videoUpdatedAt = new Date();
  await appt.save();

  await logAudit({
    req,
    action: youtubeUrl ? 'APPOINTMENT_VIDEO_UPDATE' : 'APPOINTMENT_VIDEO_REMOVE',
    resourceType: 'Appointment',
    resourceId: appt._id,
  });

  const populated = await Appointment.findById(appt._id).populate('speciality clinic doctor patient payment');
  res.json({ success: true, message: youtubeUrl ? 'Video saved' : 'Video removed', data: populated });
});

// Appointment slip PDF: only once the clinic has confirmed the booking (or the visit is done).
// Built on the fly from the live appointment so it always shows the current date/time.
exports.slip = catchAsync(async (req, res) => {
  const appt = await Appointment.findById(req.params.id).populate('speciality clinic doctor patient payment');
  if (!appt) throw new ApiError(404, 'Appointment not found');
  assertClinicAccess(req.user, appt.clinic?._id || appt.clinic);
  await assertOwnAppointment(req.user, appt);
  if (!['confirmed', 'completed'].includes(appt.status)) {
    throw new ApiError(409, appt.status === 'pending'
      ? 'Slip is available once the clinic confirms your appointment'
      : 'Slip is not available for this appointment');
  }

  const name = `appointment-slip-${String(appt._id).slice(-8).toUpperCase()}.pdf`;
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="${name}"`);
  res.setHeader('Cache-Control', 'no-store');
  await buildAppointmentSlip(appt, res);
});

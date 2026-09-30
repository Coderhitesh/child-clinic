/**
 * Appointment reminders.
 *
 * Runs as a repeatable Bull job (every 15 minutes) and, on each pass, picks up
 * confirmed appointments starting inside the reminder window that have not been
 * reminded yet. `reminderSentAt` on the appointment is the idempotency guard, so
 * running this twice — or restarting the process — never double-sends.
 *
 * Started automatically by server.js; also runnable on its own with `npm run reminders`.
 */
const Queue = require('bull');
const conn = require('../queues/connection');
const Appointment = require('../models/Appointment');
const Patient = require('../models/Patient');
const { enqueueNotification } = require('../queues/notificationQueue');
const env = require('../config/env');

const reminderQueue = new Queue('appointment-reminders', conn.redis);

const pad = (n) => String(n).padStart(2, '0');
const dateKey = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

const sweep = async () => {
  const now = new Date();
  const until = new Date(now.getTime() + env.REMINDER_HOURS_BEFORE * 60 * 60 * 1000);

  // date is stored as 'YYYY-MM-DD', so the window is today..untilDay and the
  // exact cut-off is applied per appointment using its startTime.
  const appointments = await Appointment.find({
    status: { $in: ['pending', 'confirmed'] },
    reminderSentAt: null,
    date: { $gte: dateKey(now), $lte: dateKey(until) },
  })
    .populate('doctor', 'name')
    .populate('clinic', 'name phone');

  let sent = 0;
  for (const appt of appointments) {
    const startsAt = new Date(`${appt.date}T${appt.startTime || '00:00'}:00`);
    if (startsAt < now || startsAt > until) continue;

    const patient = await Patient.findById(appt.patient);
    await enqueueNotification('reminder', {
      appointmentId: appt._id,
      date: appt.date,
      startTime: appt.startTime,
      doctor: appt.doctor?.name,
      clinic: appt.clinic?.name,
      clinicPhone: appt.clinic?.phone,
      userId: patient?.guardianUser || appt.bookedBy,
      email: patient?.contact?.email,
      phone: patient?.contact?.phone || patient?.guardianDetails?.phone,
    });

    appt.reminderSentAt = new Date();
    await appt.save({ validateBeforeSave: false });
    sent += 1;
  }

  return { scanned: appointments.length, sent };
};

reminderQueue.process(async () => sweep());

const startReminderScheduler = async () => {
  // clear old repeat definitions so changing the interval doesn't leave duplicates behind
  const repeatables = await reminderQueue.getRepeatableJobs();
  await Promise.all(repeatables.map((r) => reminderQueue.removeRepeatableByKey(r.key)));

  await reminderQueue.add({}, { repeat: { cron: '*/15 * * * *' }, removeOnComplete: true });
  console.log(`[Reminders] scheduler running — ${env.REMINDER_HOURS_BEFORE}h before each appointment`);
};

module.exports = { reminderQueue, startReminderScheduler, sweep };

if (require.main === module) {
  const mongoose = require('mongoose');
  mongoose
    .connect(env.MONGO_URI)
    .then(() => sweep())
    .then((r) => {
      console.log('[Reminders] one-off sweep', r);
      return mongoose.disconnect();
    })
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('[Reminders] failed', err);
      process.exit(1);
    });
}

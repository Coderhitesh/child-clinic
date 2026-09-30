const app = require('./app');
const connectDB = require('./config/db');
require('./config/redis'); // init redis connection
const env = require('./config/env');

// import queue processors so they register on boot
require('./queues/notificationQueue');
require('./queues/otpQueue');
require('./queues/pdfQueue');
const { startReminderScheduler } = require('./jobs/reminderScheduler');
const Doctor = require('./models/Doctor');
const { FIXED_CONSULTATION_FEE } = require('./config/fees');
const { backfillPatientIds } = require('./services/patientIdService');

connectDB().then(async () => {
  // bring existing doctors to the fixed fee (idempotent, runs on every boot)
  try {
    const r = await Doctor.updateMany(
      { consultationFee: { $ne: FIXED_CONSULTATION_FEE } },
      { $set: { consultationFee: FIXED_CONSULTATION_FEE } }
    );
    if (r.modifiedCount) console.log(`[Fees] ${r.modifiedCount} doctor fee(s) set to ₹${FIXED_CONSULTATION_FEE}`);
  } catch (err) {
    console.error('[Fees] could not normalise doctor fees', err);
  }

  // give every patient created before ids existed a unique id (idempotent, no-op once done)
  try {
    const r = await backfillPatientIds();
    if (r.assigned) console.log(`[PatientId] ${r.assigned} existing patient(s) given an id`);
  } catch (err) {
    console.error('[PatientId] backfill failed', err);
  }

  const server = app.listen(env.PORT, () => {
    console.log(`[Server] running on port ${env.PORT} (${env.NODE_ENV})`);
  });

  startReminderScheduler().catch((err) => console.error('[Reminders] could not start', err));

  process.on('unhandledRejection', (err) => {
    console.error('[UnhandledRejection]', err);
    server.close(() => process.exit(1));
  });
});

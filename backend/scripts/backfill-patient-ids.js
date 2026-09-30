// One-time (re-runnable) job: gives every existing patient a unique patient id.
//   npm run backfill:patient-ids
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') }); // load MONGO_URI before anything else
const connectDB = require('../src/config/db');
const { backfillPatientIds } = require('../src/services/patientIdService');

connectDB()
  .then(backfillPatientIds)
  .then((r) => {
    console.log(`[PatientId] ${r.assigned} patient(s) updated (${r.checked} were missing an id)`);
    process.exit(0);
  })
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
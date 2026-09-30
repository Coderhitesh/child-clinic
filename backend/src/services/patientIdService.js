const Counter = require('../models/Counter');

const PREFIX = 'PT-';
const PAD = 6;
const KEY = 'patientId';

const format = (n) => `${PREFIX}${String(n).padStart(PAD, '0')}`;

// atomic: two patients created at the same instant can never get the same number
const nextPatientId = async () => {
  const c = await Counter.findOneAndUpdate({ _id: KEY }, { $inc: { seq: 1 } }, { new: true, upsert: true });
  return format(c.seq);
};

// Gives an id to every patient that has none (oldest first). Safe to run any number of times.
const backfillPatientIds = async () => {
  const Patient = require('../models/Patient');
  const missing = await Patient.find({ $or: [{ patientId: { $exists: false } }, { patientId: null }, { patientId: '' }] })
    .select('_id')
    .sort('createdAt')
    .lean();
  let done = 0;
  for (const p of missing) {
    // eslint-disable-next-line no-await-in-loop
    const patientId = await nextPatientId();
    // eslint-disable-next-line no-await-in-loop
    const r = await Patient.updateOne(
      { _id: p._id, $or: [{ patientId: { $exists: false } }, { patientId: null }, { patientId: '' }] },
      { $set: { patientId } }
    );
    if (r.modifiedCount) done += 1;
  }
  return { checked: missing.length, assigned: done };
};

module.exports = { nextPatientId, backfillPatientIds, format };

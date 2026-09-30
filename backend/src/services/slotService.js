const Slot = require('../models/Slot');
const ApiError = require('../utils/apiError');

// Atomically takes a free slot. Two people picking the same slot: only one wins, the other gets 409.
const claimSlot = async (slotId) => {
  const slot = await Slot.findOneAndUpdate(
    { _id: slotId, status: 'available' },
    { status: 'booked' },
    { new: true }
  );
  if (!slot) throw new ApiError(409, 'That slot was just taken — please pick another time');
  return slot;
};

const freeSlot = async (slotId) => {
  await Slot.updateOne({ _id: slotId }, { status: 'available', $unset: { appointment: 1 } });
};

// legacy: only frees slots left in "held" state by old online-payment bookings
const releaseSlotIfHeld = async (slotId) => {
  await Slot.updateOne({ _id: slotId, status: 'held' }, { status: 'available' });
};

const confirmSlotBooking = async (slotId, appointmentId) =>
  Slot.findByIdAndUpdate(slotId, { status: 'booked', appointment: appointmentId }, { new: true });

module.exports = { claimSlot, freeSlot, releaseSlotIfHeld, confirmSlotBooking };

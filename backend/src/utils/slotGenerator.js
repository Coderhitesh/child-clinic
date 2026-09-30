// Generates HH:mm interval slots between start and end time given duration
const generateDaySlots = (startTime, endTime, durationMinutes) => {
  const toMinutes = (t) => {
    const [h, m] = t.split(':').map(Number);
    return h * 60 + m;
  };
  const toHHMM = (mins) => {
    const h = String(Math.floor(mins / 60)).padStart(2, '0');
    const m = String(mins % 60).padStart(2, '0');
    return `${h}:${m}`;
  };

  const slots = [];
  let cur = toMinutes(startTime);
  const end = toMinutes(endTime);
  while (cur + durationMinutes <= end) {
    slots.push({ startTime: toHHMM(cur), endTime: toHHMM(cur + durationMinutes) });
    cur += durationMinutes;
  }
  return slots;
};

module.exports = { generateDaySlots };

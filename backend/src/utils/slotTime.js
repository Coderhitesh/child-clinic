// "Now" and "has this slot already started?" in the clinic's own timezone (not the server's).
const nowInZone = (tz = 'Asia/Kolkata') => {
  let parts;
  try {
    parts = new Intl.DateTimeFormat('en-CA', {
      timeZone: tz || 'Asia/Kolkata',
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
    }).formatToParts(new Date());
  } catch {
    return nowInZone('Asia/Kolkata');
  }
  const get = (t) => parts.find((p) => p.type === t)?.value;
  return { date: `${get('year')}-${get('month')}-${get('day')}`, time: `${get('hour')}:${get('minute')}` };
};

// true when date (YYYY-MM-DD) + time (HH:mm) is now or earlier
const isPast = (date, time, tz) => {
  if (!date || !time) return false;
  const n = nowInZone(tz);
  return date < n.date || (date === n.date && time <= n.time);
};

module.exports = { nowInZone, isPast };

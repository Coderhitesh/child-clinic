'use client';
import { useEffect, useState } from 'react';

const zoneNow = (tz = 'Asia/Kolkata') => {
  let parts;
  try {
    parts = new Intl.DateTimeFormat('en-CA', {
      timeZone: tz || 'Asia/Kolkata', year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
    }).formatToParts(new Date());
  } catch {
    return zoneNow('Asia/Kolkata');
  }
  const g = (t) => parts.find((p) => p.type === t)?.value;
  return { date: `${g('year')}-${g('month')}-${g('day')}`, time: `${g('hour')}:${g('minute')}` };
};

// true if this slot's start time is now or already gone (clinic timezone). The server checks again on booking.
export const isSlotPast = (slot, tz) => {
  if (!slot) return false;
  if (slot.isPast) return true;
  if (!slot.date || !slot.startTime) return false;
  const n = zoneNow(tz);
  return slot.date < n.date || (slot.date === n.date && slot.startTime <= n.time);
};

// re-renders every 30s so slots turn "Passed" while the page stays open
export function useMinuteTick() {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setTick((v) => v + 1), 30000);
    return () => clearInterval(t);
  }, []);
  return tick;
}

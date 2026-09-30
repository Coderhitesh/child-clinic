'use client';
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CalendarDays, Phone } from 'lucide-react';
import { slotApi } from '@/services';
import { Button } from '@/components/ui/button';
import { SimpleSelect } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { inr, to12h, toDateKey, idOf, getErr } from '@/lib/utils';
import { isSlotPast, useMinuteTick } from '@/lib/slot-time';
import { FIXED_CONSULTATION_FEE } from '@/lib/constants';

const nextDays = (n = 7) =>
  Array.from({ length: n }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return d;
  });

export default function DoctorBookingPanel({ doctor }) {
  const router = useRouter();
  const clinics = doctor.clinics || [];
  const [clinicId, setClinicId] = useState(idOf(clinics[0]) || '');
  const [date, setDate] = useState(toDateKey(new Date()));
  const [slots, setSlots] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const days = useMemo(() => nextDays(7), []);
  const tz = clinics.find((c) => idOf(c) === clinicId)?.timezone;
  useMinuteTick();

  useEffect(() => {
    if (!clinicId || !date) return;
    setLoading(true);
    setSelected(null);
    slotApi
      .availability({ clinicId, doctorId: doctor._id, date })
      .then((s) => { setSlots(s || []); setError(''); })
      .catch((e) => { setSlots([]); setError(getErr(e)); })
      .finally(() => setLoading(false));
  }, [clinicId, date, doctor._id]);

  const morning = slots.filter((s) => Number(s.startTime.split(':')[0]) < 12);
  const afternoon = slots.filter((s) => Number(s.startTime.split(':')[0]) >= 12);
  const allPast = slots.length > 0 && slots.every((s) => isSlotPast(s, tz));
  const anyPast = slots.some((s) => isSlotPast(s, tz));

  // drop a selection once its time has gone
  useEffect(() => {
    if (selected && isSlotPast(slots.find((s) => s._id === selected), tz)) setSelected(null);
  });

  const goBook = () => {
    const qs = new URLSearchParams({
      doctor: doctor._id,
      clinic: clinicId,
      speciality: idOf(doctor.speciality),
      date,
    });
    if (selected) qs.set('slot', selected);
    router.push(`/book?${qs.toString()}`);
  };

  return (
    <div className="sticky top-20 space-y-4">
      <div className="soft-card p-5">
        <h2 className="font-semibold text-ink">Book an appointment</h2>
        <p className="mt-0.5 text-xs text-muted-foreground">Choose your preferred date and time</p>

        <div className="mt-4">
          <SimpleSelect
            value={clinicId}
            onChange={setClinicId}
            placeholder="Select clinic"
            options={clinics.map((c) => ({ value: idOf(c), label: c.name || 'Clinic' }))}
          />
        </div>

        <div className="mt-4 grid grid-cols-7 gap-1">
          {days.map((d) => {
            const key = toDateKey(d);
            const active = key === date;
            return (
              <button
                key={key}
                onClick={() => setDate(key)}
                className={`rounded-lg py-2 text-center text-[11px] transition-colors ${
                  active ? 'bg-brand-600 text-white' : 'bg-brand-50 text-ink hover:bg-brand-100'
                }`}
              >
                <span className="block font-medium">{d.toLocaleDateString('en-IN', { weekday: 'short' })}</span>
                <span className="block">{d.getDate()}</span>
              </button>
            );
          })}
        </div>

        <div className="mt-5 space-y-4">
          {loading ? (
            <div className="grid grid-cols-3 gap-2">{[...Array(6)].map((_, i) => <Skeleton key={i} className="h-9" />)}</div>
          ) : error ? (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">{error}</p>
          ) : slots.length === 0 ? (
            <p className="rounded-lg bg-amber-50 px-3 py-3 text-xs text-amber-800">
              No open slots on this date. Pick another day, or ask the clinic to open slots.
            </p>
          ) : (
            <>
              {allPast && (
                <p className="rounded-lg bg-amber-50 px-3 py-3 text-xs text-amber-800">
                  All slots for this date have already passed. Pick another day.
                </p>
              )}
              {anyPast && !allPast && (
                <p className="text-[11px] text-muted-foreground">Greyed-out times have already passed and can&apos;t be booked.</p>
              )}
              <SlotGroup title="Morning" slots={morning} tz={tz} selected={selected} onSelect={setSelected} />
              <SlotGroup title="Afternoon" slots={afternoon} tz={tz} selected={selected} onSelect={setSelected} />
            </>
          )}
        </div>

        <div className="mt-5 flex items-center justify-between border-t border-border pt-4">
          <span className="text-sm text-muted-foreground">Consultation fee</span>
          <span className="text-lg font-bold text-ink">{inr(FIXED_CONSULTATION_FEE)}</span>
        </div>

        <Button className="mt-4 w-full" size="lg" onClick={goBook} disabled={!clinicId}>
          <CalendarDays className="h-4 w-4" /> {selected ? 'Continue with this slot' : 'Book appointment'}
        </Button>
        <p className="mt-2 text-center text-[11px] text-muted-foreground">You can reschedule or cancel anytime</p>
      </div>

      <div className="soft-card bg-brand-50 p-5">
        <p className="flex items-center gap-2 text-sm font-semibold text-ink"><Phone className="h-4 w-4" />Need help?</p>
        <p className="mt-1 text-xs text-muted-foreground">Our care team can find the right slot for you.</p>
        <Button asChild variant="outline" className="mt-4 w-full"><a href="/contact">Request a callback</a></Button>
      </div>
    </div>
  );
}

function SlotGroup({ title, slots, selected, onSelect, tz }) {
  if (!slots.length) return null;
  return (
    <div>
      <p className="mb-2 text-xs font-semibold text-ink">{title}</p>
      <div className="grid grid-cols-3 gap-2">
        {slots.map((s) => {
          const past = isSlotPast(s, tz);
          return (
            <button
              key={s._id}
              type="button"
              disabled={past}
              title={past ? 'This time has already passed' : undefined}
              onClick={() => !past && onSelect(s._id)}
              className={`rounded-lg border px-2 py-2 text-xs transition-colors ${
                past
                  ? 'cursor-not-allowed border-border bg-muted/60 text-muted-foreground line-through opacity-60'
                  : selected === s._id
                    ? 'border-brand-600 bg-brand-600 text-white'
                    : 'border-border bg-white text-ink hover:border-brand-300 hover:bg-brand-50'
              }`}
            >
              {to12h(s.startTime)}
              {past && <span className="block text-[9px] font-medium no-underline">Passed</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}

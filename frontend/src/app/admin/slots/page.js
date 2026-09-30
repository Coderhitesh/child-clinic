'use client';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { CalendarPlus, Lock, Unlock, RefreshCw } from 'lucide-react';
import { slotApi, clinicApi, doctorApi } from '@/services';
import PageHeader from '@/components/admin/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SimpleSelect } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Spinner } from '@/components/ui/spinner';
import { EmptyState } from '@/components/ui/empty-state';
import { Skeleton } from '@/components/ui/skeleton';
import { to12h, toDateKey, prettyDate, getErr, idOf } from '@/lib/utils';

const TONE = {
  available: 'border-emerald-200 bg-emerald-50 text-emerald-800 hover:border-red-300 hover:bg-red-50',
  blocked: 'border-red-200 bg-red-50 text-red-700',
  booked: 'border-sky-200 bg-sky-50 text-sky-800 cursor-default',
  held: 'border-amber-200 bg-amber-50 text-amber-800 cursor-default',
};

export default function SlotsPage() {
  const [clinics, setClinics] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [clinicId, setClinicId] = useState('');
  const [doctorId, setDoctorId] = useState('');
  const [date, setDate] = useState(toDateKey(new Date()));
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [genOpen, setGenOpen] = useState(false);

  useEffect(() => {
    Promise.all([clinicApi.list().catch(() => []), doctorApi.list().catch(() => [])])
      .then(([c, d]) => { setClinics(c || []); setDoctors(d || []); });
  }, []);

  const doctorsForClinic = doctors.filter(
    (d) => !clinicId || (d.clinics || []).some((c) => idOf(c) === clinicId)
  );

  const load = () => {
    if (!clinicId || !doctorId || !date) return;
    setLoading(true);
    slotApi
      .list({ clinicId, doctorId, date })
      .then((s) => setSlots(s || []))
      .catch((e) => { setSlots([]); toast.error(getErr(e)); })
      .finally(() => setLoading(false));
  };

  useEffect(load, [clinicId, doctorId, date]); // eslint-disable-line react-hooks/exhaustive-deps

  const counts = useMemo(() => {
    const c = { available: 0, booked: 0, blocked: 0, held: 0 };
    slots.forEach((s) => { c[s.status] = (c[s.status] || 0) + 1; });
    return c;
  }, [slots]);

  const replace = (updated) =>
    setSlots((list) => list.map((s) => (s._id === updated._id ? updated : s)));

  const toggle = async (slot) => {
    try {
      if (slot.status === 'available') {
        const updated = await slotApi.block(slot._id, 'Blocked by clinic staff');
        replace(updated);
        toast.success(`${to12h(slot.startTime)} blocked`);
      } else if (slot.status === 'blocked') {
        const updated = await slotApi.unblock(slot._id);
        replace(updated);
        toast.success(`${to12h(slot.startTime)} reopened`);
      }
    } catch (e) { toast.error(getErr(e)); }
  };

  return (
    <>
      <PageHeader
        title="Slots & schedule"
        sub="The full day as the clinic sees it — open, held, booked and blocked. Tap an open slot to block it, a blocked one to reopen."
        actions={
          <div className="flex gap-2">
            <Button variant="outline" onClick={load} disabled={!clinicId || !doctorId}><RefreshCw className="h-4 w-4" />Refresh</Button>
            <Button onClick={() => setGenOpen(true)}><CalendarPlus className="h-4 w-4" />Generate slots</Button>
          </div>
        }
      />

      <div className="mb-6 grid gap-3 rounded-xl border border-border bg-white p-4 sm:grid-cols-3">
        <div>
          <Label className="mb-1.5 block">Clinic</Label>
          <SimpleSelect
            value={clinicId}
            onChange={(v) => { setClinicId(v); setDoctorId(''); }}
            placeholder="Select clinic"
            options={clinics.map((c) => ({ value: c._id, label: c.name }))}
          />
        </div>
        <div>
          <Label className="mb-1.5 block">Doctor</Label>
          <SimpleSelect
            value={doctorId}
            onChange={setDoctorId}
            placeholder="Select doctor"
            options={doctorsForClinic.map((d) => ({ value: d._id, label: d.name }))}
            disabled={!clinicId}
          />
        </div>
        <div>
          <Label className="mb-1.5 block">Date</Label>
          <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </div>
      </div>

      {!clinicId || !doctorId ? (
        <EmptyState
          icon={CalendarPlus}
          title="Choose a clinic and doctor"
          description="Pick both above to see the day's schedule."
        />
      ) : loading ? (
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
          {[...Array(12)].map((_, i) => <Skeleton key={i} className="h-14" />)}
        </div>
      ) : (
        <section className="rounded-xl border border-border bg-white p-5">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-semibold text-ink">{prettyDate(date)}</h2>
            <div className="flex flex-wrap gap-2">
              <Badge tone="success">{counts.available} open</Badge>
              <Badge tone="info">{counts.booked} booked</Badge>
              {counts.held > 0 && <Badge tone="warning">{counts.held} held</Badge>}
              <Badge tone="danger">{counts.blocked} blocked</Badge>
            </div>
          </div>

          {slots.length === 0 ? (
            <p className="rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-800">
              No slots exist for this date. Generate them from the doctor&apos;s clinic timings.
            </p>
          ) : (
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
              {slots.map((s) => {
                const clickable = ['available', 'blocked'].includes(s.status);
                return (
                  <button
                    key={s._id}
                    onClick={() => clickable && toggle(s)}
                    disabled={!clickable}
                    title={s.status === 'blocked' ? s.blockedReason || 'Blocked' : s.status}
                    className={`group rounded-lg border px-2 py-2.5 text-xs transition-colors ${TONE[s.status] || 'border-border'}`}
                  >
                    <span className="block font-medium">{to12h(s.startTime)}</span>
                    <span className="mt-0.5 block text-[10px] capitalize opacity-70 group-hover:hidden">{s.status}</span>
                    {clickable && (
                      <span className="mt-0.5 hidden items-center justify-center gap-1 text-[10px] group-hover:flex">
                        {s.status === 'available'
                          ? <><Lock className="h-3 w-3" />Block</>
                          : <><Unlock className="h-3 w-3" />Reopen</>}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </section>
      )}

      <GenerateDialog
        open={genOpen}
        onOpenChange={setGenOpen}
        clinics={clinics}
        doctors={doctors}
        defaults={{ clinicId, doctorId, startDate: date }}
        onDone={load}
      />
    </>
  );
}

function GenerateDialog({ open, onOpenChange, clinics, doctors, defaults, onDone }) {
  const [form, setForm] = useState({
    clinicId: defaults.clinicId || '',
    doctorId: defaults.doctorId || '',
    startDate: defaults.startDate || toDateKey(new Date()),
    endDate: '',
  });
  const [busy, setBusy] = useState(false);

  useEffect(() => { if (open) setForm((f) => ({ ...f, ...defaults })); }, [open]); // eslint-disable-line

  const submit = async () => {
    if (!form.clinicId || !form.doctorId || !form.startDate || !form.endDate) {
      toast.error('Clinic, doctor and both dates are needed');
      return;
    }
    setBusy(true);
    try {
      const res = await slotApi.generate(form);
      toast.success(`${res?.length ?? 0} slots created`);
      onOpenChange(false);
      onDone();
    } catch (e) { toast.error(getErr(e)); } finally { setBusy(false); }
  };

  const doctorsForClinic = doctors.filter(
    (d) => !form.clinicId || (d.clinics || []).some((c) => idOf(c) === form.clinicId)
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Generate slots</DialogTitle>
          <DialogDescription>
            Slots are built from the doctor&apos;s shift at this clinic — start time, end time, slot length and working days.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label className="mb-1.5 block">Clinic</Label>
            <SimpleSelect
              value={form.clinicId}
              onChange={(v) => setForm((f) => ({ ...f, clinicId: v, doctorId: '' }))}
              placeholder="Select clinic"
              options={clinics.map((c) => ({ value: c._id, label: c.name }))}
            />
          </div>
          <div>
            <Label className="mb-1.5 block">Doctor</Label>
            <SimpleSelect
              value={form.doctorId}
              onChange={(v) => setForm((f) => ({ ...f, doctorId: v }))}
              placeholder="Select doctor"
              options={doctorsForClinic.map((d) => ({ value: d._id, label: d.name }))}
              disabled={!form.clinicId}
            />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <Label className="mb-1.5 block">From</Label>
              <Input type="date" value={form.startDate} onChange={(e) => setForm((f) => ({ ...f, startDate: e.target.value }))} />
            </div>
            <div>
              <Label className="mb-1.5 block">To</Label>
              <Input type="date" value={form.endDate} min={form.startDate} onChange={(e) => setForm((f) => ({ ...f, endDate: e.target.value }))} />
            </div>
          </div>
          <p className="text-xs text-muted-foreground">Days the doctor does not sit at this clinic are skipped, and existing slots are never duplicated.</p>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={submit} disabled={busy}>{busy && <Spinner />}Generate</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

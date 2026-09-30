'use client';
import PatientId from '@/components/ui/patient-id';
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { ChevronLeft, ChevronRight, CalendarDays, CheckCircle2, UserX, Stethoscope, Clock } from 'lucide-react';
import { appointmentApi, doctorApi } from '@/services';
import { useAuthStore } from '@/store/authStore';
import PageHeader from '@/components/admin/page-header';
import StatCard from '@/components/admin/stat-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SimpleSelect } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { StatusBadge } from '@/components/ui/badge';
import { EmptyState } from '@/components/ui/empty-state';
import { PageLoader } from '@/components/ui/spinner';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { inr, initials, prettyDate, to12h, toDateKey, idOf, getErr } from '@/lib/utils';

const shift = (key, days) => {
  const d = new Date(`${key}T00:00:00`);
  d.setDate(d.getDate() + days);
  return toDateKey(d);
};

export default function MyDayPage() {
  const user = useAuthStore((s) => s.user);
  const [date, setDate] = useState(toDateKey(new Date()));
  const [doctorId, setDoctorId] = useState('');
  const [doctors, setDoctors] = useState([]);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState('');

  // A doctor account is linked to exactly one Doctor profile; other staff pick one.
  useEffect(() => {
    doctorApi.list()
      .then((list) => {
        setDoctors(list || []);
        const mine = (list || []).find((d) => idOf(d.user) === idOf(user?._id) || idOf(d._id) === idOf(user?.doctorProfile));
        setDoctorId((prev) => prev || mine?._id || '');
      })
      .catch(() => {});
  }, [user]);

  const load = () => {
    setLoading(true);
    appointmentApi.list({ date, ...(doctorId ? { doctor: doctorId } : {}) })
      .then((d) => setRows(d || []))
      .catch((e) => toast.error(getErr(e)))
      .finally(() => setLoading(false));
  };

  useEffect(load, [date, doctorId]); // eslint-disable-line react-hooks/exhaustive-deps

  const day = useMemo(
    () => [...rows].sort((a, b) => (a.startTime || '').localeCompare(b.startTime || '')),
    [rows]
  );

  const counts = useMemo(() => ({
    total: day.length,
    done: day.filter((a) => a.status === 'completed').length,
    waiting: day.filter((a) => ['pending', 'confirmed'].includes(a.status)).length,
    noShow: day.filter((a) => a.status === 'no_show').length,
  }), [day]);

  const mark = async (appt, status) => {
    setBusyId(appt._id);
    try {
      await appointmentApi.updateStatus(appt._id, { status });
      toast.success(status === 'no_show' ? 'Marked as no-show' : 'Marked as seen');
      load();
    } catch (e) { toast.error(getErr(e)); } finally { setBusyId(''); }
  };

  return (
    <>
      <PageHeader
        title="My day"
        sub="The consulting list in time order — open a visit to write the prescription."
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={() => setDate(shift(date, -1))} aria-label="Previous day"><ChevronLeft className="h-4 w-4" /></Button>
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-[160px]" />
            <Button variant="outline" size="icon" onClick={() => setDate(shift(date, 1))} aria-label="Next day"><ChevronRight className="h-4 w-4" /></Button>
            <Button variant="ghost" onClick={() => setDate(toDateKey(new Date()))}>Today</Button>
            <Button asChild><Link href="/admin/appointments/new">Walk-in</Link></Button>
          </div>
        }
      />

      {doctors.length > 1 && (
        <div className="mb-5 max-w-xs">
          <SimpleSelect
            value={doctorId}
            onChange={setDoctorId}
            allowEmpty
            emptyLabel="Every doctor"
            placeholder="Doctor"
            options={doctors.map((d) => ({ value: d._id, label: d.name }))}
          />
        </div>
      )}

      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="On the list" value={counts.total} icon={CalendarDays} />
        <StatCard label="Still to see" value={counts.waiting} icon={Clock} tone="amber" />
        <StatCard label="Seen" value={counts.done} icon={CheckCircle2} tone="emerald" />
        <StatCard label="No shows" value={counts.noShow} icon={UserX} />
      </div>

      {loading ? (
        <PageLoader />
      ) : !day.length ? (
        <EmptyState
          icon={Stethoscope}
          title={`Nothing booked for ${prettyDate(date)}`}
          description="A free day — or slots still waiting to be filled."
        />
      ) : (
        <div className="space-y-3">
          {day.map((a) => (
            <Card key={a._id}>
              <CardContent className="flex flex-wrap items-center gap-4 p-4">
                <div className="w-20 shrink-0">
                  <p className="font-semibold text-ink">{to12h(a.startTime)}</p>
                  <p className="text-xs text-muted-foreground">{to12h(a.endTime)}</p>
                </div>

                <Avatar><AvatarFallback>{initials(a.patient?.name)}</AvatarFallback></Avatar>

                <div className="min-w-[160px] flex-1">
                  <p className="font-medium">{a.patient?.name} <PatientId id={a.patient?.patientId} className="ml-1" /></p>
                  <p className="text-sm text-muted-foreground">
                    {[a.patient?.age ? `${a.patient.age} yrs` : null, a.patient?.gender, a.patient?.contact?.phone].filter(Boolean).join(' · ')}
                  </p>
                  {a.symptoms && <p className="mt-1 text-sm text-ink-soft line-clamp-1">{a.symptoms}</p>}
                </div>

                <div className="text-sm">
                  <p className="text-muted-foreground">{a.clinic?.name}</p>
                  <p className="font-medium">{inr(a.payableAmount ?? a.consultationFee)}</p>
                </div>

                <StatusBadge value={a.status} />

                <div className="flex gap-1">
                  {['pending', 'confirmed'].includes(a.status) && (
                    <>
                      <Button variant="outline" size="sm" disabled={busyId === a._id} onClick={() => mark(a, 'completed')}>Seen</Button>
                      <Button variant="ghost" size="sm" disabled={busyId === a._id} onClick={() => mark(a, 'no_show')}>No show</Button>
                    </>
                  )}
                  <Button asChild size="sm"><Link href={`/admin/appointments/${a._id}`}>Open</Link></Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}

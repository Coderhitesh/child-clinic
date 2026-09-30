'use client';
import PatientId from '@/components/ui/patient-id';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  CalendarDays, CalendarClock, CheckCircle2, XCircle, Building2, Stethoscope, Users, IndianRupee, ArrowRight,
} from 'lucide-react';
import { dashboardApi, appointmentApi, reportApi } from '@/services';
import { useAuthStore, isSuperAdmin } from '@/store/authStore';
import PageHeader from '@/components/admin/page-header';
import StatCard from '@/components/admin/stat-card';
import DataTable from '@/components/admin/data-table';
import { StatusBadge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { inr, prettyDate, to12h, getErr } from '@/lib/utils';
import { toast } from 'sonner';

export default function AdminOverview() {
  const user = useAuthStore((s) => s.user);
  const params = useSearchParams();
  const [stats, setStats] = useState(null);
  const [revenue, setRevenue] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params.get('denied')) toast.error('That section is not available for your role.');
  }, [params]);

  useEffect(() => {
    if (!user) return;
    const load = isSuperAdmin(user) ? dashboardApi.global() : dashboardApi.clinic();
    Promise.all([
      load.catch(() => null),
      appointmentApi.list().catch(() => []),
      reportApi.revenue().catch(() => null),
    ])
      .then(([s, a, r]) => {
        setStats(s);
        setAppointments(a || []);
        setRevenue(r);
      })
      .catch((e) => toast.error(getErr(e)))
      .finally(() => setLoading(false));
  }, [user]);

  const today = new Date().toISOString().slice(0, 10);
  const todays = appointments.filter((a) => a.date === today);

  return (
    <>
      <PageHeader
        title={`Good day, ${user?.name?.split(' ')[0] || 'there'}`}
        sub={isSuperAdmin(user) ? 'Network-wide activity across every clinic.' : 'Activity for the clinics you manage.'}
        actions={<Button asChild variant="outline"><Link href="/admin/appointments">All appointments <ArrowRight className="h-4 w-4" /></Link></Button>}
      />

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-28" />)}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Today's appointments" value={stats?.todayAppointments ?? todays.length} icon={CalendarDays} />
          <StatCard label="Upcoming" value={stats?.upcomingAppointments ?? '—'} icon={CalendarClock} tone="sky" />
          <StatCard label="Completed consultations" value={stats?.completedConsultations ?? '—'} icon={CheckCircle2} tone="emerald" />
          <StatCard label="Cancelled" value={stats?.cancelledAppointments ?? '—'} icon={XCircle} tone="coral" />
          {isSuperAdmin(user) ? (
            <>
              <StatCard label="Clinics" value={stats?.totalClinics ?? '—'} icon={Building2} />
              <StatCard label="Doctors" value={stats?.totalDoctors ?? '—'} icon={Stethoscope} tone="sky" />
              <StatCard label="Patients" value={stats?.totalPatients ?? '—'} icon={Users} tone="amber" />
            </>
          ) : (
            <StatCard label="Active doctors" value={stats?.activeDoctors ?? '—'} icon={Stethoscope} tone="sky" />
          )}
          <StatCard label="Revenue collected" value={inr(revenue?.totalRevenue || 0)} icon={IndianRupee} tone="emerald" />
        </div>
      )}

      <section className="mt-8">
        <h2 className="mb-3 text-lg font-semibold text-ink">Today at the clinic</h2>
        <DataTable
          loading={loading}
          rows={todays}
          emptyTitle="No appointments today"
          emptyDescription="New bookings will show up here as they come in."
          columns={[
            { key: 'startTime', header: 'Time', render: (r) => to12h(r.startTime) },
            { key: 'patient.name', header: 'Patient', render: (r) => <span>{r.patient?.name} <PatientId id={r.patient?.patientId} className="ml-1" /></span> },
            { key: 'doctor.name', header: 'Doctor' },
            { key: 'clinic.name', header: 'Clinic' },
            { key: 'status', header: 'Status', render: (r) => <StatusBadge value={r.status} /> },
            { key: 'payableAmount', header: 'Amount', render: (r) => inr(r.payableAmount ?? r.consultationFee) },
            {
              key: 'open',
              header: '',
              className: 'text-right',
              render: (r) => (
                <Button asChild variant="ghost" size="sm"><Link href={`/admin/appointments/${r._id}`}>Open</Link></Button>
              ),
            },
          ]}
        />
      </section>

      <section className="mt-8">
        <h2 className="mb-3 text-lg font-semibold text-ink">Latest bookings</h2>
        <DataTable
          loading={loading}
          rows={appointments.slice(0, 10)}
          emptyTitle="No bookings yet"
          columns={[
            { key: 'date', header: 'Date', render: (r) => `${prettyDate(r.date)} · ${to12h(r.startTime)}` },
            { key: 'patient.name', header: 'Patient', render: (r) => <span>{r.patient?.name} <PatientId id={r.patient?.patientId} className="ml-1" /></span> },
            { key: 'doctor.name', header: 'Doctor' },
            { key: 'paymentMethod', header: 'Payment', render: (r) => (r.payment?.status === 'collected_at_clinic' ? 'Collected' : 'At clinic') },
            { key: 'status', header: 'Status', render: (r) => <StatusBadge value={r.status} /> },
          ]}
        />
      </section>
    </>
  );
}

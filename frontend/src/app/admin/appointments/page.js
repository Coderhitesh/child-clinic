'use client';
import PatientId from '@/components/ui/patient-id';
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { appointmentApi, clinicApi, doctorApi } from '@/services';
import { useAuthStore } from '@/store/authStore';
import PageHeader from '@/components/admin/page-header';
import DataTable from '@/components/admin/data-table';
import { StatusBadge, Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SimpleSelect } from '@/components/ui/select';
import { inr, prettyDate, to12h, getErr, toDateKey } from '@/lib/utils';
import { APPOINTMENT_STATUS, ROLES } from '@/lib/constants';

export default function AppointmentsPage() {
  const user = useAuthStore((s) => s.user);
  const [rows, setRows] = useState([]);
  const [clinics, setClinics] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ status: '', clinic: '', doctor: '', date: '' });

  useEffect(() => {
    Promise.all([clinicApi.list().catch(() => []), doctorApi.list().catch(() => [])])
      .then(([c, d]) => { setClinics(c || []); setDoctors(d || []); });
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = Object.fromEntries(Object.entries(filters).filter(([, v]) => v));
    appointmentApi
      .list(params)
      .then((d) => setRows(d || []))
      .catch((e) => toast.error(getErr(e)))
      .finally(() => setLoading(false));
  }, [filters]);

  const set = (k) => (v) => setFilters((f) => ({ ...f, [k]: v }));

  const counts = useMemo(() => {
    const out = { total: rows.length };
    APPOINTMENT_STATUS.forEach((s) => { out[s] = rows.filter((r) => r.status === s).length; });
    return out;
  }, [rows]);

  return (
    <>
      <PageHeader
        title="Appointments"
        sub={`${counts.total} in view · ${counts.confirmed || 0} confirmed · ${counts.pending || 0} pending`}
        actions={
          user?.role !== ROLES.DOCTOR ? (
            <div className="flex gap-2">
              <Button asChild><Link href="/admin/appointments/new">Walk-in booking</Link></Button>
              <Button asChild variant="outline"><Link href="/book">Full booking flow</Link></Button>
            </div>
          ) : null
        }
      />

      <DataTable
        loading={loading}
        rows={rows}
        searchKeys={['patient.patientId', 'patient.name', 'doctor.name', 'clinic.name', 'status']}
        searchPlaceholder="Search by patient, doctor or clinic"
        toolbar={
          <div className="flex flex-wrap gap-2">
            <SimpleSelect
              value={filters.status} onChange={set('status')} allowEmpty emptyLabel="All statuses" placeholder="Status"
              options={APPOINTMENT_STATUS.map((s) => ({ value: s, label: s.replace('_', ' ') }))}
              className="w-[150px]"
            />
            <SimpleSelect
              value={filters.clinic} onChange={set('clinic')} allowEmpty emptyLabel="All clinics" placeholder="Clinic"
              options={clinics.map((c) => ({ value: c._id, label: c.name }))} className="w-[160px]"
            />
            <SimpleSelect
              value={filters.doctor} onChange={set('doctor')} allowEmpty emptyLabel="All doctors" placeholder="Doctor"
              options={doctors.map((d) => ({ value: d._id, label: d.name }))} className="w-[160px]"
            />
            <Input type="date" value={filters.date} onChange={(e) => set('date')(e.target.value)} className="w-[160px]" />
            {(filters.status || filters.clinic || filters.doctor || filters.date) && (
              <Button variant="ghost" onClick={() => setFilters({ status: '', clinic: '', doctor: '', date: '' })}>Clear</Button>
            )}
            <Button variant="outline" onClick={() => set('date')(toDateKey(new Date()))}>Today</Button>
          </div>
        }
        emptyTitle="No appointments match these filters"
        columns={[
          { key: 'date', header: 'Date & time', render: (r) => (
            <span className="whitespace-nowrap">{prettyDate(r.date)}<span className="block text-xs text-muted-foreground">{to12h(r.startTime)}</span></span>
          ) },
          { key: 'patient.name', header: 'Patient', render: (r) => (
            <span>
              {r.patient?.name}
              <PatientId id={r.patient?.patientId} className="ml-2" />
              {r.source === 'walk_in' && <Badge tone="coral" className="ml-2">Walk-in</Badge>}
            </span>
          ) },
          { key: 'doctor.name', header: 'Doctor' },
          { key: 'clinic.name', header: 'Clinic' },
          { key: 'paymentMethod', header: 'Payment', render: (r) => (
            <span>
              {r.payment?.status === 'collected_at_clinic' ? 'Collected' : 'At clinic'}
              <span className="block text-xs text-muted-foreground">{inr(r.payableAmount ?? r.consultationFee)}</span>
            </span>
          ) },
          { key: 'status', header: 'Status', render: (r) => <StatusBadge value={r.status} /> },
          { key: 'open', header: '', className: 'text-right', render: (r) => (
            <Button asChild variant="ghost" size="sm"><Link href={`/admin/appointments/${r._id}`}>Open</Link></Button>
          ) },
        ]}
      />
    </>
  );
}

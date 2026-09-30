'use client';
import PatientId from '@/components/ui/patient-id';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { FileText } from 'lucide-react';
import { patientApi, prescriptionApi, clinicApi, doctorApi } from '@/services';
import { useAuthStore, isSuperAdmin } from '@/store/authStore';
import PageHeader from '@/components/admin/page-header';
import DataTable from '@/components/admin/data-table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SimpleSelect } from '@/components/ui/select';
import { StatusBadge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { EmptyState } from '@/components/ui/empty-state';
import { prettyDate, prettyDateTime, getErr, fileUrl } from '@/lib/utils';

const monthAgo = () => {
  const d = new Date();
  d.setDate(d.getDate() - 30);
  return d.toISOString().slice(0, 10);
};

export default function PrescriptionsPage() {
  const user = useAuthStore((s) => s.user);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [clinics, setClinics] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);
  const [filters, setFilters] = useState({ clinic: '', doctor: '', from: monthAgo(), to: '' });

  // "By patient" tab
  const [patientId, setPatientId] = useState('');
  const [patientRows, setPatientRows] = useState([]);
  const [patientLoading, setPatientLoading] = useState(false);

  const load = () => {
    setLoading(true);
    const params = Object.fromEntries(Object.entries(filters).filter(([, v]) => v));
    prescriptionApi.list(params)
      .then((d) => setRows(d || []))
      .catch((e) => toast.error(getErr(e)))
      .finally(() => setLoading(false));
  };

  useEffect(load, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    patientApi.list().then((d) => setPatients(d || [])).catch(() => {});
    doctorApi.list().then((d) => setDoctors(d || [])).catch(() => {});
    if (isSuperAdmin(user)) clinicApi.list().then((d) => setClinics(d || [])).catch(() => {});
  }, [user]);

  useEffect(() => {
    if (!patientId) { setPatientRows([]); return; }
    setPatientLoading(true);
    prescriptionApi.listByPatient(patientId)
      .then((d) => setPatientRows(d || []))
      .catch((e) => toast.error(getErr(e)))
      .finally(() => setPatientLoading(false));
  }, [patientId]);

  const columns = [
    { key: 'createdAt', header: 'Issued', render: (r) => prettyDateTime(r.createdAt) },
    { key: 'patient.name', header: 'Patient', render: (r) => <span>{r.patient?.name} <PatientId id={r.patient?.patientId} className="ml-1" /></span> },
    { key: 'doctor.name', header: 'Doctor' },
    { key: 'clinic.name', header: 'Clinic' },
    { key: 'diagnosis', header: 'Diagnosis', className: 'max-w-[240px] truncate' },
    { key: 'medicines', header: 'Medicines', render: (r) => `${r.medicines?.length || 0} item(s)` },
    { key: 'followUpDate', header: 'Follow-up', render: (r) => (r.followUpDate ? prettyDate(r.followUpDate) : '—') },
    { key: 'pdfStatus', header: 'PDF', render: (r) => (
      (r.images?.length && !r.medicines?.length) || r.pdfUrl
        ? <Button asChild variant="ghost" size="sm"><a href={fileUrl(r.images?.length && !r.medicines?.length ? r.images[0] : r.pdfUrl)} target="_blank" rel="noreferrer">Open</a></Button>
        : <StatusBadge value={r.pdfStatus === 'failed' ? 'cancelled' : 'pending'} label={r.pdfStatus || 'queued'} />
    ) },
    { key: 'visit', header: '', className: 'text-right', render: (r) => (
      r.appointment
        ? <Button asChild variant="ghost" size="sm"><Link href={`/admin/appointments/${r.appointment?._id || r.appointment}`}>Visit</Link></Button>
        : null
    ) },
  ];

  return (
    <>
      <PageHeader title="Prescriptions" sub="Everything written across the clinics, and a per-patient history view." />

      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">All prescriptions</TabsTrigger>
          <TabsTrigger value="patient">By patient</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <div className="mb-4 flex flex-wrap items-end gap-3 rounded-xl border bg-white p-4">
            {isSuperAdmin(user) && (
              <div>
                <Label className="mb-1.5 block">Clinic</Label>
                <SimpleSelect
                  value={filters.clinic} onChange={(v) => setFilters((f) => ({ ...f, clinic: v }))}
                  allowEmpty emptyLabel="All clinics" placeholder="All clinics" className="w-[180px]"
                  options={clinics.map((c) => ({ value: c._id, label: c.name }))}
                />
              </div>
            )}
            <div>
              <Label className="mb-1.5 block">Doctor</Label>
              <SimpleSelect
                value={filters.doctor} onChange={(v) => setFilters((f) => ({ ...f, doctor: v }))}
                allowEmpty emptyLabel="All doctors" placeholder="All doctors" className="w-[180px]"
                options={doctors.map((d) => ({ value: d._id, label: d.name }))}
              />
            </div>
            <div>
              <Label className="mb-1.5 block">From</Label>
              <Input type="date" value={filters.from} onChange={(e) => setFilters((f) => ({ ...f, from: e.target.value }))} className="w-[160px]" />
            </div>
            <div>
              <Label className="mb-1.5 block">To</Label>
              <Input type="date" value={filters.to} onChange={(e) => setFilters((f) => ({ ...f, to: e.target.value }))} className="w-[160px]" />
            </div>
            <Button onClick={load}>Apply</Button>
          </div>

          <DataTable
            loading={loading}
            rows={rows}
            searchKeys={['patient.patientId', 'patient.name', 'doctor.name', 'diagnosis']}
            searchPlaceholder="Search by patient, doctor or diagnosis"
            emptyTitle="No prescriptions in this range"
            columns={columns}
          />
        </TabsContent>

        <TabsContent value="patient">
          <div className="mb-4 max-w-sm">
            <Label className="mb-1.5 block">Patient</Label>
            <SimpleSelect
              value={patientId}
              onChange={setPatientId}
              placeholder="Choose a patient"
              options={patients.map((p) => ({ value: p._id, label: p.patientId ? `${p.name} (${p.patientId})` : p.name }))}
            />
          </div>

          {!patientId ? (
            <EmptyState icon={FileText} title="Pick a patient" description="Their full prescription history will show here." />
          ) : (
            <DataTable
              loading={patientLoading}
              rows={patientRows}
              emptyTitle="No prescriptions for this patient"
              columns={columns.filter((c) => c.key !== 'patient.name')}
            />
          )}
        </TabsContent>
      </Tabs>
    </>
  );
}

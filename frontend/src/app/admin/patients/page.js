'use client';
import PatientId from '@/components/ui/patient-id';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { Plus } from 'lucide-react';
import { patientApi } from '@/services';
import PageHeader from '@/components/admin/page-header';
import DataTable from '@/components/admin/data-table';
import DynamicForm from '@/components/admin/dynamic-form';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Spinner } from '@/components/ui/spinner';
import { prettyDate, getErr } from '@/lib/utils';
import { GENDERS } from '@/lib/constants';

const FIELDS = [
  { name: 'name', label: 'Full name', required: true },
  { name: 'dob', label: 'Date of birth', type: 'date' },
  { name: 'gender', label: 'Gender', type: 'select', options: GENDERS, required: true },
  { name: 'contact.phone', label: 'Phone' },
  { name: 'contact.email', label: 'Email', type: 'email' },
  { type: 'section', label: 'Guardian', help: 'Used when the patient is a child or dependent.' },
  { name: 'guardianDetails.name', label: 'Guardian name' },
  { name: 'guardianDetails.relation', label: 'Relation' },
  { name: 'guardianDetails.phone', label: 'Guardian phone' },
];

export default function PatientsPage() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ gender: 'male', contact: {}, guardianDetails: {} });
  const [busy, setBusy] = useState(false);

  const load = () => {
    setLoading(true);
    patientApi.list()
      .then((d) => setRows(d || []))
      .catch((e) => toast.error(getErr(e)))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const save = async () => {
    setBusy(true);
    try {
      await patientApi.create(form);
      toast.success('Patient record created');
      setOpen(false);
      setForm({ gender: 'male', contact: {}, guardianDetails: {} });
      load();
    } catch (e) { toast.error(getErr(e)); } finally { setBusy(false); }
  };

  return (
    <>
      <PageHeader
        title="Patients"
        sub="Every patient record the clinic has created, including family members added at booking."
        actions={<Button onClick={() => setOpen(true)}><Plus className="h-4 w-4" /> Add patient</Button>}
      />

      <DataTable
        loading={loading}
        rows={rows}
        searchKeys={['patientId', 'name', 'contact.phone', 'contact.email', 'guardianDetails.name']}
        searchPlaceholder="Search by name, phone or guardian"
        emptyTitle="No patient records yet"
        columns={[
          { key: 'patientId', header: 'Patient ID', render: (r) => <PatientId id={r.patientId} /> },
          { key: 'name', header: 'Patient' },
          { key: 'gender', header: 'Gender' },
          { key: 'dob', header: 'Date of birth', render: (r) => (r.dob ? prettyDate(r.dob) : '—') },
          { key: 'contact.phone', header: 'Phone' },
          { key: 'guardianDetails.name', header: 'Guardian' },
          { key: 'createdAt', header: 'Added', render: (r) => prettyDate(r.createdAt) },
          { key: 'open', header: '', className: 'text-right', render: (r) => (
            <Button asChild variant="ghost" size="sm"><Link href={`/admin/patients/${r._id}`}>Open</Link></Button>
          ) },
        ]}
      />

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add patient</DialogTitle>
            <DialogDescription>Create a record before booking on someone&apos;s behalf.</DialogDescription>
          </DialogHeader>
          <DynamicForm fields={FIELDS} value={form} onChange={setForm} />
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={save} disabled={busy || !form.name}>{busy && <Spinner />}Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

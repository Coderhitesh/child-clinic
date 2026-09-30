'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { FileText, Download } from 'lucide-react';
import { patientApi, prescriptionApi } from '@/services';
import PageHeader from '@/components/admin/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { SimpleSelect } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { EmptyState } from '@/components/ui/empty-state';
import { PageLoader, Spinner } from '@/components/ui/spinner';
import PrescriptionCard from '@/components/prescription/prescription-card';
import { prettyDate, prettyDateTime, getErr, fileUrl } from '@/lib/utils';

export default function MyPrescriptions() {
  const [patients, setPatients] = useState([]);
  const [patientId, setPatientId] = useState('');
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetching, setFetching] = useState(false);

  useEffect(() => {
    patientApi.list()
      .then((d) => {
        setPatients(d || []);
        if (d?.length) setPatientId(d[0]._id);
      })
      .catch((e) => toast.error(getErr(e)))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!patientId) return;
    setFetching(true);
    prescriptionApi.listByPatient(patientId)
      .then((d) => setRows(d || []))
      .catch((e) => toast.error(getErr(e)))
      .finally(() => setFetching(false));
  }, [patientId]);

  if (loading) return <PageLoader />;

  return (
    <>
      <PageHeader title="Prescriptions" sub="Everything your doctors have written, kept in one place." />

      {!patients.length ? (
        <EmptyState
          icon={FileText}
          title="No patient records yet"
          description="Add a family member — or book your first visit — and prescriptions will appear here."
          action={<Button asChild><Link href="/dashboard/family">Add family member</Link></Button>}
        />
      ) : (
        <>
          <div className="mb-5 max-w-xs">
            <Label className="mb-1.5 block">Showing for</Label>
            <SimpleSelect value={patientId} onChange={setPatientId} options={patients.map((p) => ({ value: p._id, label: p.patientId ? `${p.name} (${p.patientId})` : p.name }))} />
          </div>

          {fetching ? (
            <div className="flex justify-center py-10"><Spinner /></div>
          ) : !rows.length ? (
            <EmptyState icon={FileText} title="No prescriptions yet" description="They show up here right after a consultation." />
          ) : (
            <div className="space-y-5">
              {rows.map((p) => <PrescriptionCard key={p._id} prescription={{ ...p, patient: p.patient?.name ? p.patient : patients.find((x) => x._id === patientId) }} />)}
            </div>
          )}
        </>
      )}
    </>
  );
}

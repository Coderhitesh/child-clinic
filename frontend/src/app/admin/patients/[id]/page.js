'use client';
import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { toast } from 'sonner';
import { ArrowLeft, Paperclip, Plus, Video as VideoIcon, FileText } from 'lucide-react';
import { patientApi, prescriptionApi, appointmentApi, videoApi } from '@/services';
import PageHeader from '@/components/admin/page-header';
import DataTable from '@/components/admin/data-table';
import DynamicForm from '@/components/admin/dynamic-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FileUpload } from '@/components/ui/file-upload';
import { Label } from '@/components/ui/label';
import { SimpleSelect } from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { StatusBadge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { PageLoader, Spinner } from '@/components/ui/spinner';
import { prettyDate, prettyDateTime, to12h, getErr, fileUrl } from '@/lib/utils';
import { GENDERS } from '@/lib/constants';

const FIELDS = [
  { name: 'name', label: 'Full name', required: true },
  { name: 'dob', label: 'Date of birth', type: 'date' },
  { name: 'gender', label: 'Gender', type: 'select', options: GENDERS },
  { name: 'contact.phone', label: 'Phone' },
  { name: 'contact.email', label: 'Email', type: 'email' },
  { type: 'section', label: 'Guardian' },
  { name: 'guardianDetails.name', label: 'Guardian name' },
  { name: 'guardianDetails.relation', label: 'Relation' },
  { name: 'guardianDetails.phone', label: 'Guardian phone' },
];

export default function PatientDetail() {
  const { id } = useParams();
  const [patient, setPatient] = useState(null);
  const [form, setForm] = useState(null);
  const [prescriptions, setPrescriptions] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [docOpen, setDocOpen] = useState(false);
  const [videoOpen, setVideoOpen] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    Promise.all([
      patientApi.get(id),
      prescriptionApi.listByPatient(id).catch(() => []),
      appointmentApi.list({ patient: id }).catch(() => []),
      videoApi.list().catch(() => []),
    ])
      .then(([p, rx, ap, vd]) => {
        setPatient(p);
        setForm(JSON.parse(JSON.stringify({ ...p, dob: p.dob ? String(p.dob).slice(0, 10) : '' })));
        setPrescriptions(rx || []);
        setAppointments(ap || []);
        setVideos(vd || []);
      })
      .catch((e) => toast.error(getErr(e)))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => { load(); }, [load]);

  if (loading && !patient) return <PageLoader label="Opening patient record" />;
  if (!patient) return <p className="text-sm text-muted-foreground">This record could not be loaded.</p>;

  const save = async () => {
    setSaving(true);
    try {
      await patientApi.update(id, {
        name: form.name, dob: form.dob || undefined, gender: form.gender,
        contact: form.contact, guardianDetails: form.guardianDetails,
      });
      toast.success('Patient record updated');
      load();
    } catch (e) { toast.error(getErr(e)); } finally { setSaving(false); }
  };

  return (
    <>
      <Button asChild variant="ghost" size="sm" className="mb-3 -ml-2">
        <Link href="/admin/patients"><ArrowLeft className="h-4 w-4" /> All patients</Link>
      </Button>

      <PageHeader
        title={patient.name}
        sub={[patient.patientId, patient.gender, patient.dob ? prettyDate(patient.dob) : null, patient.contact?.phone].filter(Boolean).join(' · ')}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setDocOpen(true)}><Paperclip className="h-4 w-4" /> Attach document</Button>
            <Button onClick={() => setVideoOpen(true)}><VideoIcon className="h-4 w-4" /> Assign video</Button>
          </div>
        }
      />

      <Tabs defaultValue="profile">
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="appointments">Appointments ({appointments.length})</TabsTrigger>
          <TabsTrigger value="prescriptions">Prescriptions ({prescriptions.length})</TabsTrigger>
          <TabsTrigger value="documents">Documents ({patient.uploadedDocs?.length || 0})</TabsTrigger>
          <TabsTrigger value="videos">Videos ({patient.assignedVideos?.length || 0})</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <div className="rounded-xl border border-border bg-white p-5">
            <DynamicForm fields={FIELDS} value={form} onChange={setForm} />
            <Button className="mt-5" onClick={save} disabled={saving}>{saving && <Spinner />}Save changes</Button>
          </div>
        </TabsContent>

        <TabsContent value="appointments">
          <DataTable
            rows={appointments}
            emptyTitle="No appointments for this patient"
            columns={[
              { key: 'date', header: 'Date', render: (r) => `${prettyDate(r.date)} · ${to12h(r.startTime)}` },
              { key: 'doctor.name', header: 'Doctor' },
              { key: 'clinic.name', header: 'Clinic' },
              { key: 'status', header: 'Status', render: (r) => <StatusBadge value={r.status} /> },
              { key: 'open', header: '', className: 'text-right', render: (r) => (
                <Button asChild variant="ghost" size="sm"><Link href={`/admin/appointments/${r._id}`}>Open</Link></Button>
              ) },
            ]}
          />
        </TabsContent>

        <TabsContent value="prescriptions">
          <DataTable
            rows={prescriptions}
            emptyTitle="No prescriptions issued yet"
            columns={[
              { key: 'createdAt', header: 'Issued', render: (r) => prettyDateTime(r.createdAt) },
              { key: 'diagnosis', header: 'Diagnosis' },
              { key: 'medicines', header: 'Medicines', render: (r) => `${r.medicines?.length || 0} item(s)` },
              { key: 'pdfStatus', header: 'PDF', render: (r) => <StatusBadge value={r.pdfStatus === 'generated' ? 'completed' : r.pdfStatus} /> },
              { key: 'open', header: '', className: 'text-right', render: (r) =>
                (r.pdfUrl || (r.images?.length && !r.medicines?.length)) ? (
                  <Button asChild variant="ghost" size="sm"><a href={fileUrl(r.images?.length && !r.medicines?.length ? r.images[0] : r.pdfUrl)} target="_blank" rel="noreferrer"><FileText className="h-4 w-4" /> Open PDF</a></Button>
                ) : <span className="text-xs text-muted-foreground">Generating</span>
              },
            ]}
          />
        </TabsContent>

        <TabsContent value="documents">
          <DataTable
            rows={patient.uploadedDocs || []}
            emptyTitle="No documents attached"
            columns={[
              { key: 'name', header: 'Document' },
              { key: 'uploadedAt', header: 'Added', render: (r) => prettyDateTime(r.uploadedAt) },
              { key: 'open', header: '', className: 'text-right', render: (r) => (
                <Button asChild variant="ghost" size="sm"><a href={r.url} target="_blank" rel="noreferrer">Open</a></Button>
              ) },
            ]}
          />
        </TabsContent>

        <TabsContent value="videos">
          <DataTable
            rows={patient.assignedVideos || []}
            emptyTitle="No videos assigned"
            columns={[
              { key: 'title', header: 'Video' },
              { key: 'category', header: 'Category' },
              { key: 'open', header: '', className: 'text-right', render: (r) => (
                <div className="flex justify-end gap-1">
                  <Button asChild variant="ghost" size="sm"><a href={r.youtubeUrl} target="_blank" rel="noreferrer">Watch</a></Button>
                  <Button variant="ghost" size="sm" onClick={async () => {
                    try { await videoApi.unassign(r._id, id); toast.success('Video removed from patient'); load(); }
                    catch (e) { toast.error(getErr(e)); }
                  }}>Remove</Button>
                </div>
              ) },
            ]}
          />
        </TabsContent>
      </Tabs>

      <AttachDocDialog open={docOpen} onOpenChange={setDocOpen} patientId={id} onDone={load} />
      <AssignVideoDialog open={videoOpen} onOpenChange={setVideoOpen} patientId={id} videos={videos} onDone={load} />
    </>
  );
}

function AttachDocDialog({ open, onOpenChange, patientId, onDone }) {
  const [doc, setDoc] = useState({ name: '', url: '' });
  const [busy, setBusy] = useState(false);
  const submit = async () => {
    setBusy(true);
    try {
      await patientApi.addDoc(patientId, doc);
      toast.success('Document attached');
      setDoc({ name: '', url: '' });
      onOpenChange(false);
      onDone();
    } catch (e) { toast.error(getErr(e)); } finally { setBusy(false); }
  };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader><DialogTitle>Attach a document</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <div>
            <Label className="mb-1.5 block">Document name</Label>
            <Input value={doc.name} onChange={(e) => setDoc((d) => ({ ...d, name: e.target.value }))} placeholder="Blood report, X-ray…" />
          </div>
          <div>
            <Label className="mb-1.5 block">File</Label>
            <FileUpload
              value={doc.url}
              onChange={(url, meta) => setDoc((d) => ({ ...d, url, name: d.name || meta?.name || '' }))}
              accept="image/*,application/pdf"
              label="Upload report"
              preview={false}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={submit} disabled={busy || !doc.name || !doc.url}>{busy && <Spinner />}Attach</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function AssignVideoDialog({ open, onOpenChange, patientId, videos, onDone }) {
  const [videoId, setVideoId] = useState('');
  const [busy, setBusy] = useState(false);
  const submit = async () => {
    setBusy(true);
    try {
      await videoApi.assign(videoId, patientId);
      toast.success('Video assigned to patient');
      onOpenChange(false);
      onDone();
    } catch (e) { toast.error(getErr(e)); } finally { setBusy(false); }
  };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader><DialogTitle>Assign a care video</DialogTitle></DialogHeader>
        <div>
          <Label className="mb-1.5 block">Video</Label>
          <SimpleSelect
            value={videoId}
            onChange={setVideoId}
            placeholder="Select a video"
            options={videos.map((v) => ({ value: v._id, label: v.title }))}
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={submit} disabled={busy || !videoId}>{busy && <Spinner />}Assign</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

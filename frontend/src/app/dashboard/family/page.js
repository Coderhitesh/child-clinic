'use client';
import PatientId from '@/components/ui/patient-id';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { Plus, Users, Pencil, FileUp, Trash2 } from 'lucide-react';
import { patientApi } from '@/services';
import PageHeader from '@/components/admin/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { SimpleSelect } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { EmptyState } from '@/components/ui/empty-state';
import { Spinner, PageLoader } from '@/components/ui/spinner';
import { FileUpload } from '@/components/ui/file-upload';
import ConfirmDialog from '@/components/admin/confirm-dialog';
import { GENDERS } from '@/lib/constants';
import { initials, prettyDate, titleCase, getErr } from '@/lib/utils';

const blank = {
  name: '', dob: '', age: '', gender: '',
  contact: { phone: '', email: '' },
  guardianDetails: { name: '', relation: '', phone: '' },
  extraDetails: '',
};

export default function FamilyPage() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(blank);
  const [saving, setSaving] = useState(false);
  const [docFor, setDocFor] = useState(null);
  const [toDelete, setToDelete] = useState(null);
  const [doc, setDoc] = useState({ name: '', url: '' });

  const load = () => {
    setLoading(true);
    patientApi.list()
      .then((d) => setRows(d || []))
      .catch((e) => toast.error(getErr(e)))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const set = (patch) => setForm((f) => ({ ...f, ...patch }));

  const openCreate = () => { setEditing(null); setForm(blank); setOpen(true); };
  const openEdit = (p) => {
    setEditing(p);
    setForm({
      ...blank,
      ...p,
      dob: p.dob ? String(p.dob).slice(0, 10) : '',
      gender: p.gender || '',
      age: p.age ?? '',
      contact: { ...blank.contact, ...(p.contact || {}) },
      guardianDetails: { ...blank.guardianDetails, ...(p.guardianDetails || {}) },
      // Mixed field: an empty {} would render as [object Object] in the textarea
      extraDetails: typeof p.extraDetails === 'string' ? p.extraDetails : '',
    });
    setOpen(true);
  };

  const save = async () => {
    if (!form.name) { toast.error('A name is needed'); return; }
    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        age: form.age !== '' && form.age != null ? Number(form.age) : undefined,
        dob: form.dob || undefined,
        gender: form.gender || undefined,
        contact: form.contact,
        guardianDetails: form.guardianDetails,
        extraDetails: form.extraDetails,
      };
      if (editing) { await patientApi.update(editing._id, payload); toast.success('Details updated'); }
      else { await patientApi.create(payload); toast.success('Family member added'); }
      setOpen(false);
      load();
    } catch (e) { toast.error(getErr(e)); } finally { setSaving(false); }
  };

  const attach = async () => {
    if (!doc.url) { toast.error('Paste a file link'); return; }
    try {
      await patientApi.addDoc(docFor._id, doc);
      toast.success('Document attached');
      setDocFor(null);
      setDoc({ name: '', url: '' });
      load();
    } catch (e) { toast.error(getErr(e)); }
  };

  const remove = async () => {
    try {
      const res = await patientApi.remove(toDelete._id);
      toast.success(res?.archived ? 'Removed — past visits stay on record' : 'Family member removed');
      setToDelete(null);
      load();
    } catch (e) { toast.error(getErr(e)); }
  };

  if (loading) return <PageLoader />;

  return (
    <>
      <PageHeader
        title="Family members"
        sub="Book for your children, parents or anyone in your care without creating separate accounts."
        actions={<Button onClick={openCreate}><Plus className="h-4 w-4" />Add member</Button>}
      />

      {!rows.length ? (
        <EmptyState
          icon={Users}
          title="No family members yet"
          description="Add someone once, then book visits for them in two taps."
          action={<Button onClick={openCreate}><Plus className="h-4 w-4" />Add member</Button>}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {rows.map((p) => (
            <Card key={p._id}>
              <CardContent className="p-5">
                <div className="flex items-start gap-3">
                  <Avatar><AvatarFallback>{initials(p.name)}</AvatarFallback></Avatar>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold">{p.name}</p>
                    <PatientId id={p.patientId} />
                    <p className="text-sm text-muted-foreground">
                      {[p.gender && titleCase(p.gender), p.age ? `${p.age} yrs` : p.dob ? prettyDate(p.dob) : null].filter(Boolean).join(' · ') || '—'}
                    </p>
                    {(p.contact?.phone || p.guardianDetails?.phone) && <p className="mt-1 text-sm text-muted-foreground">{p.contact?.phone || p.guardianDetails.phone}</p>}
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <Button variant="outline" size="sm" onClick={() => openEdit(p)}><Pencil className="h-3.5 w-3.5" />Edit</Button>
                  <Button variant="outline" size="sm" onClick={() => setDocFor(p)}><FileUp className="h-3.5 w-3.5" />Add report</Button>
                  <Button asChild variant="ghost" size="sm"><Link href={`/doctors?patient=${p._id}`}>Book</Link></Button>
                  <Button variant="ghost" size="icon" onClick={() => setToDelete(p)} aria-label="Remove">
                    <Trash2 className="h-4 w-4 text-red-600" />
                  </Button>
                </div>

                {Boolean(p.uploadedDocs?.length) && (
                  <div className="mt-3 space-y-1 border-t pt-3">
                    {p.uploadedDocs.slice(0, 3).map((d, i) => (
                      <a key={i} href={d.url} target="_blank" rel="noreferrer" className="block truncate text-xs text-brand-700 hover:underline">
                        {d.name || d.url}
                      </a>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>{editing ? `Edit ${editing.name}` : 'Add a family member'}</DialogTitle>
            <DialogDescription>Only a name is required — the rest helps the doctor.</DialogDescription>
          </DialogHeader>

          <div className="max-h-[60vh] space-y-4 overflow-y-auto pr-1">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Label className="mb-1.5 block">Full name *</Label>
                <Input value={form.name} onChange={(e) => set({ name: e.target.value })} />
              </div>
              <div>
                <Label className="mb-1.5 block">Date of birth</Label>
                <Input type="date" value={form.dob} onChange={(e) => set({ dob: e.target.value })} />
              </div>
              <div>
                <Label className="mb-1.5 block">Age</Label>
                <Input type="number" min="0" value={form.age} onChange={(e) => set({ age: e.target.value })} />
              </div>
              <div>
                <Label className="mb-1.5 block">Gender</Label>
                <SimpleSelect value={form.gender} onChange={(v) => set({ gender: v })} placeholder="Select" options={GENDERS} />
              </div>
              <div>
                <Label className="mb-1.5 block">Phone</Label>
                <Input value={form.contact.phone} onChange={(e) => set({ contact: { ...form.contact, phone: e.target.value } })} />
              </div>
              <div className="sm:col-span-2">
                <Label className="mb-1.5 block">Email <span className="text-xs font-normal text-muted-foreground">(optional)</span></Label>
                <Input type="email" value={form.contact.email} onChange={(e) => set({ contact: { ...form.contact, email: e.target.value } })} />
              </div>
            </div>

            <div>
              <p className="mb-2 text-sm font-medium">Guardian (for a child or dependent)</p>
              <div className="grid gap-3 sm:grid-cols-3">
                <Input placeholder="Name" value={form.guardianDetails.name} onChange={(e) => set({ guardianDetails: { ...form.guardianDetails, name: e.target.value } })} />
                <Input placeholder="Relation" value={form.guardianDetails.relation} onChange={(e) => set({ guardianDetails: { ...form.guardianDetails, relation: e.target.value } })} />
                <Input placeholder="Phone" value={form.guardianDetails.phone} onChange={(e) => set({ guardianDetails: { ...form.guardianDetails, phone: e.target.value } })} />
              </div>
            </div>

            <div>
              <Label className="mb-1.5 block">Anything the doctor should know</Label>
              <Textarea rows={3} value={form.extraDetails} onChange={(e) => set({ extraDetails: e.target.value })} placeholder="Ongoing medication, past surgeries, allergies…" />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={save} disabled={saving}>{saving && <Spinner />}{editing ? 'Save changes' : 'Add member'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(docFor)} onOpenChange={(v) => !v && setDocFor(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Attach a report</DialogTitle>
            <DialogDescription>A lab PDF, a scan, an old prescription — upload it or paste a link.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label className="mb-1.5 block">Title</Label>
              <Input value={doc.name} onChange={(e) => setDoc((d) => ({ ...d, name: e.target.value }))} placeholder="Blood test — March" />
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
            <Button variant="outline" onClick={() => setDocFor(null)}>Cancel</Button>
            <Button onClick={attach}>Attach</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={Boolean(toDelete)}
        onOpenChange={(v) => !v && setToDelete(null)}
        title={`Remove ${toDelete?.name || 'this person'}?`}
        description="If they have past visits the record is archived instead of deleted, so prescriptions and history stay intact. Cancel any upcoming appointments first."
        confirmLabel="Remove"
        onConfirm={remove}
      />
    </>
  );
}

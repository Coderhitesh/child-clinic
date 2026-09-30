'use client';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, Clock, X } from 'lucide-react';
import { doctorApi, clinicApi, specialityApi, authApi } from '@/services';
import { useAuthStore, isSuperAdmin } from '@/store/authStore';
import PageHeader from '@/components/admin/page-header';
import DataTable from '@/components/admin/data-table';
import ConfirmDialog from '@/components/admin/confirm-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { SimpleSelect } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Spinner } from '@/components/ui/spinner';
import { PhotoUpload } from '@/components/ui/photo-upload';
import DoctorPhoto from '@/components/ui/doctor-photo';
import { StatusBadge } from '@/components/ui/badge';
import { WEEK_DAYS, FIXED_CONSULTATION_FEE } from '@/lib/constants';
import { inr, getErr, to12h } from '@/lib/utils';

const blankTiming = { clinic: '', startTime: '09:00', endTime: '13:00', slotDurationMinutes: 15, workingDays: [1, 2, 3, 4, 5] };

const emptyDoctor = {
  name: '', speciality: '', clinics: [], qualification: '', experienceYears: 0,
  consultationFee: FIXED_CONSULTATION_FEE, about: '', photo: '', isActive: true, clinicTimings: [],
  seo: { metaTitle: '', metaDescription: '' },
  account: { name: '', email: '', phone: '', password: '' },
};

export default function DoctorsPage() {
  const user = useAuthStore((s) => s.user);
  const [rows, setRows] = useState([]);
  const [clinics, setClinics] = useState([]);
  const [specialities, setSpecialities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyDoctor);
  const [saving, setSaving] = useState(false);
  const [toDelete, setToDelete] = useState(null);

  const load = () => {
    setLoading(true);
    doctorApi.list({ includeInactive: 'true' })
      .then((d) => setRows(d || []))
      .catch((e) => toast.error(getErr(e)))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    clinicApi.list().then((d) => setClinics(d || [])).catch(() => {});
    specialityApi.list().then((d) => setSpecialities(d || [])).catch(() => {});
  }, []);

  const clinicOptions = useMemo(() => clinics.map((c) => ({ value: c._id, label: c.name })), [clinics]);

  const set = (patch) => setForm((f) => ({ ...f, ...patch }));
  const setAccount = (patch) => setForm((f) => ({ ...f, account: { ...f.account, ...patch } }));

  const openCreate = () => {
    setEditing(null);
    setForm(emptyDoctor);
    setOpen(true);
  };

  const openEdit = (row) => {
    setEditing(row);
    setForm({
      ...emptyDoctor,
      ...row,
      speciality: row.speciality?._id || row.speciality || '',
      clinics: (row.clinics || []).map((c) => c?._id || c),
      clinicTimings: (row.clinicTimings || []).map((t) => ({ ...t, clinic: t.clinic?._id || t.clinic || '' })),
      seo: row.seo || {},
      account: emptyDoctor.account,
    });
    setOpen(true);
  };

  const toggleClinic = (id) => {
    const has = form.clinics.includes(id);
    set({ clinics: has ? form.clinics.filter((c) => c !== id) : [...form.clinics, id] });
  };

  const setTiming = (i, patch) => {
    const next = form.clinicTimings.map((t, idx) => (idx === i ? { ...t, ...patch } : t));
    set({ clinicTimings: next });
  };

  const save = async () => {
    if (!form.name || !form.speciality) { toast.error('Name and speciality are required'); return; }
    setSaving(true);
    try {
      const payload = {
        name: form.name,
        speciality: form.speciality,
        clinics: form.clinics,
        qualification: form.qualification,
        experienceYears: Number(form.experienceYears) || 0,
        consultationFee: FIXED_CONSULTATION_FEE, // fixed; backend enforces it too
        about: form.about,
        photo: form.photo,
        isActive: form.isActive,
        clinicTimings: form.clinicTimings
          .filter((t) => t.clinic)
          .map((t) => ({ ...t, slotDurationMinutes: Number(t.slotDurationMinutes) || 15 })),
        seo: form.seo,
      };

      if (editing) {
        await doctorApi.update(editing._id, payload);
        toast.success('Doctor updated');
      } else {
        const a = form.account;
        if (!a.email || !a.password) { toast.error('A login email and password are needed for the doctor account'); setSaving(false); return; }
        // The Doctor profile needs a User to sign in with, so the staff account is created first.
        const staff = await authApi.createStaff({
          name: a.name || form.name,
          email: a.email,
          phone: a.phone,
          password: a.password,
          role: 'doctor',
        });
        const userId = staff?.user?._id || staff?._id;
        await doctorApi.create({ ...payload, user: userId });
        toast.success('Doctor added with a login account');
      }
      setOpen(false);
      load();
    } catch (e) {
      toast.error(getErr(e));
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    try {
      await doctorApi.remove(toDelete._id);
      toast.success('Doctor deactivated');
      load();
    } catch (e) { toast.error(getErr(e)); }
  };

  return (
    <>
      <PageHeader
        title="Doctors"
        sub="Profiles, fees and the hours each doctor sits at each clinic. Slots are generated from these timings."
        actions={<Button onClick={openCreate}><Plus className="h-4 w-4" />Add doctor</Button>}
      />

      <DataTable
        loading={loading}
        rows={rows}
        searchKeys={['name', 'qualification', 'speciality.name']}
        searchPlaceholder="Search doctors"
        columns={[
          { key: 'name', header: 'Doctor', render: (r) => (
            <div className="flex items-center gap-3">
              <DoctorPhoto name={r.name} photo={r.photo} className="h-9 w-9 rounded-full text-xs" />
              <span className="font-medium">{r.name}</span>
            </div>
          ) },
          { key: 'speciality.name', header: 'Speciality' },
          { key: 'qualification', header: 'Qualification' },
          { key: 'experienceYears', header: 'Experience', render: (r) => `${r.experienceYears || 0} yrs` },
          { key: 'consultationFee', header: 'Fee', render: (r) => inr(r.consultationFee) },
          { key: 'clinics', header: 'Clinics', render: (r) => `${r.clinics?.length || 0}` },
          { key: 'isActive', header: 'Status', render: (r) => <StatusBadge value={r.isActive ? 'confirmed' : 'cancelled'} /> },
          { key: '__a', header: '', className: 'text-right w-[120px]', render: (r) => (
            <div className="flex justify-end gap-1">
              <Button variant="ghost" size="icon" onClick={() => openEdit(r)} aria-label="Edit"><Pencil className="h-4 w-4" /></Button>
              {isSuperAdmin(user) && (
                <Button variant="ghost" size="icon" onClick={() => setToDelete(r)} aria-label="Deactivate"><Trash2 className="h-4 w-4 text-red-600" /></Button>
              )}
            </div>
          ) },
        ]}
      />

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{editing ? `Edit ${editing.name}` : 'Add doctor'}</DialogTitle>
            <DialogDescription>
              {editing ? 'Profile changes go live on the website immediately.' : 'A login account is created first, then the public profile.'}
            </DialogDescription>
          </DialogHeader>

          <div className="max-h-[65vh] space-y-5 overflow-y-auto pr-1">
            {!editing && (
              <section className="rounded-xl border bg-muted/40 p-4">
                <h4 className="mb-3 text-sm font-semibold">Login account</h4>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field label="Account name"><Input value={form.account.name} onChange={(e) => setAccount({ name: e.target.value })} placeholder="Same as doctor name" /></Field>
                  <Field label="Email *"><Input type="email" value={form.account.email} onChange={(e) => setAccount({ email: e.target.value })} /></Field>
                  <Field label="Phone"><Input value={form.account.phone} onChange={(e) => setAccount({ phone: e.target.value })} /></Field>
                  <Field label="Temporary password *"><Input type="text" value={form.account.password} onChange={(e) => setAccount({ password: e.target.value })} /></Field>
                </div>
              </section>
            )}

            <section className="grid gap-3 sm:grid-cols-2">
              <Field label="Display name *"><Input value={form.name} onChange={(e) => set({ name: e.target.value })} placeholder="Dr. Anaya Sharma" /></Field>
              <Field label="Speciality *">
                <SimpleSelect value={form.speciality} onChange={(v) => set({ speciality: v })} placeholder="Choose" options={specialities.map((s) => ({ value: s._id, label: s.name }))} />
              </Field>
              <Field label="Qualification"><Input value={form.qualification} onChange={(e) => set({ qualification: e.target.value })} placeholder="MBBS, MD (Pediatrics)" /></Field>
              <Field label="Years of experience"><Input type="number" min="0" value={form.experienceYears} onChange={(e) => set({ experienceYears: e.target.value })} /></Field>
              <Field label="Consultation fee (₹)"><Input type="number" value={FIXED_CONSULTATION_FEE} disabled readOnly title="Fixed fee for all doctors" /></Field>

            </section>

            <Field label="Photo"><PhotoUpload name={form.name} value={form.photo} onChange={(v) => set({ photo: v || '' })} /></Field>

            <Field label="About">
              <Textarea rows={3} value={form.about} onChange={(e) => set({ about: e.target.value })} placeholder="A short introduction shown on the profile page." />
            </Field>

            <section>
              <Label className="mb-2 block">Works at</Label>
              <div className="flex flex-wrap gap-2">
                {clinicOptions.map((c) => (
                  <button
                    key={c.value}
                    type="button"
                    onClick={() => toggleClinic(c.value)}
                    className={`rounded-full border px-3 py-1.5 text-sm transition ${form.clinics.includes(c.value) ? 'border-brand-500 bg-brand-50 text-brand-700' : 'hover:bg-muted'}`}
                  >
                    {c.label}
                  </button>
                ))}
                {!clinicOptions.length && <p className="text-sm text-muted-foreground">Add a clinic first.</p>}
              </div>
            </section>

            <section>
              <div className="mb-2 flex items-center justify-between">
                <Label className="flex items-center gap-1.5"><Clock className="h-4 w-4" />Clinic timings</Label>
                <Button type="button" variant="outline" size="sm" onClick={() => set({ clinicTimings: [...form.clinicTimings, blankTiming] })}>
                  <Plus className="h-4 w-4" />Add shift
                </Button>
              </div>

              {!form.clinicTimings.length && (
                <p className="rounded-lg border border-dashed p-3 text-sm text-muted-foreground">
                  No shifts yet. Slots can only be generated for a clinic that has a shift here.
                </p>
              )}

              <div className="space-y-3">
                {form.clinicTimings.map((t, i) => (
                  <div key={i} className="rounded-xl border p-3">
                    <div className="mb-3 flex items-center justify-between gap-2">
                      <SimpleSelect
                        value={t.clinic}
                        onChange={(v) => setTiming(i, { clinic: v })}
                        placeholder="Clinic"
                        options={clinicOptions}
                        className="w-full max-w-xs"
                      />
                      <Button type="button" variant="ghost" size="icon" onClick={() => set({ clinicTimings: form.clinicTimings.filter((_, idx) => idx !== i) })} aria-label="Remove shift">
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-3">
                      <Field label="Starts"><Input type="time" value={t.startTime} onChange={(e) => setTiming(i, { startTime: e.target.value })} /></Field>
                      <Field label="Ends"><Input type="time" value={t.endTime} onChange={(e) => setTiming(i, { endTime: e.target.value })} /></Field>
                      <Field label="Slot length (min)"><Input type="number" min="5" step="5" value={t.slotDurationMinutes} onChange={(e) => setTiming(i, { slotDurationMinutes: e.target.value })} /></Field>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {WEEK_DAYS.map((d) => {
                        const on = (t.workingDays || []).includes(d.value);
                        return (
                          <button
                            key={d.value}
                            type="button"
                            onClick={() => setTiming(i, {
                              workingDays: on
                                ? t.workingDays.filter((x) => x !== d.value)
                                : [...(t.workingDays || []), d.value].sort((a, b) => a - b),
                            })}
                            className={`h-8 w-10 rounded-lg border text-xs font-medium transition ${on ? 'border-brand-500 bg-brand-500 text-white' : 'hover:bg-muted'}`}
                          >
                            {d.short}
                          </button>
                        );
                      })}
                      <span className="ml-2 self-center text-xs text-muted-foreground">
                        {to12h(t.startTime)} – {to12h(t.endTime)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="grid gap-3 sm:grid-cols-2">
              <Field label="Meta title"><Input value={form.seo?.metaTitle || ''} onChange={(e) => set({ seo: { ...form.seo, metaTitle: e.target.value } })} /></Field>
              <Field label="Meta description"><Input value={form.seo?.metaDescription || ''} onChange={(e) => set({ seo: { ...form.seo, metaDescription: e.target.value } })} /></Field>
            </section>

            <div className="flex items-center justify-between rounded-xl border p-3">
              <div>
                <p className="text-sm font-medium">Listed on the website</p>
                <p className="text-xs text-muted-foreground">Turn off to hide the profile without deleting it.</p>
              </div>
              <Switch checked={Boolean(form.isActive)} onCheckedChange={(v) => set({ isActive: v })} />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={save} disabled={saving}>{saving && <Spinner />}{editing ? 'Save changes' : 'Create doctor'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={Boolean(toDelete)}
        onOpenChange={(v) => !v && setToDelete(null)}
        title={`Deactivate ${toDelete?.name || 'this doctor'}?`}
        description="The profile stops appearing on the website. Existing appointments are untouched."
        confirmLabel="Deactivate"
        onConfirm={remove}
      />
    </>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <Label className="mb-1.5 block">{label}</Label>
      {children}
    </div>
  );
}

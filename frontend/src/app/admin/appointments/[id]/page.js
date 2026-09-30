'use client';
import PatientId from '@/components/ui/patient-id';
import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { ArrowLeft, CalendarClock, CreditCard, FileText, Ban, Check, RefreshCcw, Plus, Trash2, Pencil, Youtube } from 'lucide-react';
import { appointmentApi, paymentApi, prescriptionApi, slotApi } from '@/services';
import { useAuthStore, can } from '@/store/authStore';
import PageHeader from '@/components/admin/page-header';
import ConfirmDialog from '@/components/admin/confirm-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { SimpleSelect } from '@/components/ui/select';
import { Badge, StatusBadge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { PageLoader, Spinner } from '@/components/ui/spinner';
import { inr, prettyDate, prettyDateTime, to12h, getErr, idOf, toDateKey, youtubeEmbedUrl } from '@/lib/utils';
import { FIXED_CONSULTATION_FEE } from '@/lib/constants';
import { FileUpload } from '@/components/ui/file-upload';
import PrescriptionCard from '@/components/prescription/prescription-card';
import SlipButton from '@/components/appointment/slip-button';
import DoctorPhoto from '@/components/ui/doctor-photo';
import MedicineEditor from '@/components/prescription/medicine-editor';
import { emptyMedicine as newMedicine } from '@/components/prescription/shared';

// who can change an appointment's fee / its YouTube video
const FEE_EDITORS = ['superadmin', 'clinic_admin'];
const VIDEO_EDITORS = ['superadmin', 'clinic_admin', 'doctor', 'receptionist'];


export default function AppointmentDetail() {
  const { id } = useParams();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);

  const [appt, setAppt] = useState(null);
  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [rxOpen, setRxOpen] = useState(false);
  const [reschedOpen, setReschedOpen] = useState(false);
  const [feeOpen, setFeeOpen] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    appointmentApi
      .get(id)
      .then((a) => {
        setAppt(a);
        return paymentApi.byAppointment(id).catch(() => null);
      })
      .then(setPayment)
      .catch((e) => toast.error(getErr(e)))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => { load(); }, [load]);

  if (loading && !appt) return <PageLoader label="Opening appointment" />;
  if (!appt) return <p className="text-sm text-muted-foreground">This appointment could not be loaded.</p>;

  const setStatus = async (status) => {
    try {
      await appointmentApi.updateStatus(id, { status });
      toast.success(`Marked ${status.replace('_', ' ')}`);
      load();
    } catch (e) { toast.error(getErr(e)); }
  };

  const cancel = async (reason) => {
    try {
      await appointmentApi.cancel(id, reason);
      toast.success('Appointment cancelled');
      load();
    } catch (e) { toast.error(getErr(e)); }
  };

  const collect = async () => {
    try {
      await paymentApi.collect(payment._id);
      toast.success('Payment marked collected');
      load();
    } catch (e) { toast.error(getErr(e)); }
  };

  const feeLocked =
    appt.status === 'cancelled' ||
    ['paid', 'collected_at_clinic', 'refunded'].includes(payment?.status);
  const canEditFee = FEE_EDITORS.includes(user?.role) && !feeLocked;
  const canEditVideo = VIDEO_EDITORS.includes(user?.role);

  return (
    <>
      <Button asChild variant="ghost" size="sm" className="mb-3 -ml-2">
        <Link href="/admin/appointments"><ArrowLeft className="h-4 w-4" /> All appointments</Link>
      </Button>

      <PageHeader
        title={`${appt.patient?.name || 'Patient'} · ${prettyDate(appt.date)}`}
        sub={`${to12h(appt.startTime)} – ${to12h(appt.endTime)} with ${appt.doctor?.name || 'doctor'} at ${appt.clinic?.name || 'clinic'}`}
        actions={
          <div className="flex flex-wrap gap-2">
            <SlipButton appointment={appt} variant="outline" />
            {appt.status !== 'cancelled' && appt.status !== 'completed' && (
              <>
                <Button variant="outline" onClick={() => setReschedOpen(true)}>
                  <CalendarClock className="h-4 w-4" /> Reschedule
                </Button>
                {appt.status === 'pending' && (
                  <Button variant="brand" onClick={() => setStatus('confirmed')}><Check className="h-4 w-4" /> Confirm</Button>
                )}
                <Button variant="outline" onClick={() => setStatus('no_show')}>Mark no-show</Button>
                <Button variant="destructive" onClick={() => setCancelOpen(true)}><Ban className="h-4 w-4" /> Cancel</Button>
              </>
            )}
            {can(user, 'prescriptions', 'write') && appt.status !== 'cancelled' && !appt.prescription && (
              <Button onClick={() => setRxOpen(true)}><FileText className="h-4 w-4" /> Write prescription</Button>
            )}
          </div>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <div className="space-y-6">
          <Panel title="Visit details">
            <dl className="grid gap-4 sm:grid-cols-2">
              <Item label="Status"><StatusBadge value={appt.status} /></Item>
              <Item label="Doctor">
                <span className="flex items-center gap-2">
                  <DoctorPhoto name={appt.doctor?.name} photo={appt.doctor?.photo} className="h-8 w-8 rounded-full text-xs" />
                  {appt.doctor?.name || '—'}
                </span>
              </Item>
              <Item label="Speciality">{appt.speciality?.name || '—'}</Item>
              <Item label="Booked on">{prettyDateTime(appt.createdAt)}</Item>
              <Item label="Booked by">{appt.bookedBy?.name || '—'}</Item>
              <Item label="Reason for visit" full>{appt.symptoms || 'Not specified'}</Item>
              {appt.diagnosis && <Item label="Diagnosis" full>{appt.diagnosis}</Item>}
              {appt.doctorNotes && <Item label="Doctor notes" full>{appt.doctorNotes}</Item>}
              {appt.followUpDate && <Item label="Follow-up">{prettyDate(appt.followUpDate)}</Item>}
              {appt.cancelledReason && <Item label="Cancellation reason" full>{appt.cancelledReason}</Item>}
            </dl>
          </Panel>

          <Panel title="Patient">
            <dl className="grid gap-4 sm:grid-cols-2">
              <Item label="Name">{appt.patient?.name}</Item>
              <Item label="Patient ID"><PatientId id={appt.patient?.patientId} /></Item>
              <Item label="Gender">{appt.patient?.gender || '—'}</Item>
              <Item label="Date of birth">{appt.patient?.dob ? prettyDate(appt.patient.dob) : '—'}</Item>
              <Item label="Phone">{appt.patient?.contact?.phone || appt.patient?.guardianDetails?.phone || '—'}</Item>
              <Item label="Email">{appt.patient?.contact?.email || '—'}</Item>
              <Item label="Guardian">
                {appt.patient?.guardianDetails?.name
                  ? `${appt.patient.guardianDetails.name} (${appt.patient.guardianDetails.relation || 'guardian'})`
                  : '—'}
              </Item>
            </dl>
            {appt.patient?._id && (
              <Button asChild variant="outline" size="sm" className="mt-4">
                <Link href={`/admin/patients/${appt.patient._id}`}>Open patient record</Link>
              </Button>
            )}
          </Panel>

          <VideoPanel appointment={appt} canEdit={canEditVideo} onDone={load} />

          {appt.prescription && <PrescriptionPanel id={appt.prescription?._id || appt.prescription} appointment={appt} />}
        </div>

        <aside className="space-y-4">
          <Panel title="Payment">
            <dl className="space-y-3">
              <Item label="Method">Pay at clinic</Item>
              <Item label="Status"><StatusBadge value={payment?.status || 'pending'} /></Item>
              <Item label="Consultation fee">
                <span className="flex items-center justify-between gap-2">
                  <span>{inr(appt.consultationFee)}</span>
                  {canEditFee && (
                    <Button variant="ghost" size="sm" className="h-7 px-2" onClick={() => setFeeOpen(true)}>
                      <Pencil className="h-3.5 w-3.5" /> Change
                    </Button>
                  )}
                </span>
                {appt.feeUpdatedAt && (
                  <span className="mt-0.5 block text-xs text-muted-foreground">Changed {prettyDateTime(appt.feeUpdatedAt)}</span>
                )}
              </Item>
              {appt.discountAmount > 0 && (
                <Item label="Coupon">
                  <span className="text-emerald-700">{appt.couponCode} · − {inr(appt.discountAmount)}</span>
                </Item>
              )}
              <Item label="Payable">
                <span className="text-lg font-bold text-ink">{inr(appt.payableAmount ?? appt.consultationFee)}</span>
              </Item>
              {payment?.paidAt && <Item label="Paid at">{prettyDateTime(payment.paidAt)}</Item>}
            </dl>

            <div className="mt-4 space-y-2">
              {can(user, 'payments', 'collect') && payment?.status === 'pending' && appt.status !== 'cancelled' && (
                <Button className="w-full" onClick={collect}><CreditCard className="h-4 w-4" /> Mark collected at clinic</Button>
              )}
            </div>
          </Panel>

          <Panel title="Slot">
            <dl className="space-y-3">
              <Item label="Date">{prettyDate(appt.date)}</Item>
              <Item label="Time">{to12h(appt.startTime)} – {to12h(appt.endTime)}</Item>
              <Item label="Clinic">{appt.clinic?.name}</Item>
            </dl>
          </Panel>
        </aside>
      </div>

      <ConfirmDialog
        open={cancelOpen}
        onOpenChange={setCancelOpen}
        title="Cancel this appointment?"
        description="The slot is released immediately and the patient is notified."
        confirmLabel="Cancel appointment"
        withReason
        reasonLabel="Reason for cancellation"
        onConfirm={cancel}
      />

      <RescheduleDialog
        open={reschedOpen}
        onOpenChange={setReschedOpen}
        appointment={appt}
        onDone={load}
      />

      <FeeDialog
        open={feeOpen}
        onOpenChange={setFeeOpen}
        appointment={appt}
        maxFee={user?.role === 'superadmin' ? null : FIXED_CONSULTATION_FEE}
        onDone={load}
      />

      <PrescriptionDialog
        open={rxOpen}
        onOpenChange={setRxOpen}
        appointment={appt}
        onDone={load}
      />
    </>
  );
}

function PrescriptionPanel({ id, appointment }) {
  const user = useAuthStore((s) => s.user);
  const [rx, setRx] = useState(null);
  const [err, setErr] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const reload = useCallback(() => {
    prescriptionApi.get(id).then(setRx).catch(() => setErr(true));
  }, [id]);
  useEffect(() => { reload(); }, [reload]);
  if (err) return <Panel title="Prescription"><p className="text-sm text-red-600">Could not load prescription.</p></Panel>;
  if (!rx) return <Panel title="Prescription"><div className="flex justify-center py-6"><Spinner /></div></Panel>;
  const canEdit = FEE_EDITORS.includes(user?.role);
  return (
    <>
      <PrescriptionCard prescription={rx} onEdit={canEdit ? () => setEditOpen(true) : undefined} />
      {canEdit && <PrescriptionDialog open={editOpen} onOpenChange={setEditOpen} appointment={appointment} prescription={rx} onDone={reload} />}
    </>
  );
}

function Panel({ title, children }) {
  return (
    <section className="rounded-xl border border-border bg-white p-5">
      <h2 className="mb-4 font-semibold text-ink">{title}</h2>
      {children}
    </section>
  );
}

function Item({ label, children, full }) {
  return (
    <div className={full ? 'sm:col-span-2' : ''}>
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="mt-0.5 text-sm text-ink">{children}</dd>
    </div>
  );
}

function FeeDialog({ open, onOpenChange, appointment, maxFee, onDone }) {
  const [fee, setFee] = useState(String(appointment.consultationFee ?? FIXED_CONSULTATION_FEE));
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (open) setFee(String(appointment.consultationFee ?? FIXED_CONSULTATION_FEE));
  }, [open, appointment]);

  const value = Number(fee);
  const invalid = fee === '' || !Number.isFinite(value) || value < 0 || (maxFee != null && value > maxFee);
  const discount = appointment.discountAmount || 0;

  const submit = async () => {
    setBusy(true);
    try {
      await appointmentApi.updateFee(appointment._id, value);
      toast.success('Fee updated');
      onOpenChange(false);
      onDone();
    } catch (e) { toast.error(getErr(e)); } finally { setBusy(false); }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Change consultation fee</DialogTitle>
          <DialogDescription>
            Default fee is {inr(FIXED_CONSULTATION_FEE)}.{maxFee != null ? ` Maximum allowed is ${inr(maxFee)}.` : ''}
          </DialogDescription>
        </DialogHeader>
        <div>
          <Label className="mb-1.5 block">Fee (₹)</Label>
          <Input
            type="number"
            min="0"
            max={maxFee ?? undefined}
            value={fee}
            onChange={(e) => setFee(e.target.value)}
          />
          {invalid && fee !== '' && (
            <p className="mt-1.5 text-xs text-red-600">
              {maxFee != null && value > maxFee ? `Fee cannot be more than ${inr(maxFee)}` : 'Enter a valid amount'}
            </p>
          )}
          {!invalid && (
            <p className="mt-2 text-sm text-muted-foreground">
              Payable: <span className="font-semibold text-ink">{inr(Math.max(0, value - discount))}</span>
              {discount > 0 && <> (after {inr(discount)} coupon)</>}
            </p>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={submit} disabled={invalid || busy}>{busy && <Spinner />}Save fee</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function VideoPanel({ appointment, canEdit, onDone }) {
  const [editing, setEditing] = useState(false);
  const [url, setUrl] = useState(appointment.youtubeUrl || '');
  const [title, setTitle] = useState(appointment.videoTitle || '');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setUrl(appointment.youtubeUrl || '');
    setTitle(appointment.videoTitle || '');
  }, [appointment]);

  const embed = youtubeEmbedUrl(appointment.youtubeUrl);
  const draftValid = !url.trim() || Boolean(youtubeEmbedUrl(url));

  const save = async (nextUrl, nextTitle) => {
    setBusy(true);
    try {
      await appointmentApi.updateVideo(appointment._id, { youtubeUrl: nextUrl, videoTitle: nextTitle });
      toast.success(nextUrl ? 'Video saved' : 'Video removed');
      setEditing(false);
      onDone();
    } catch (e) { toast.error(getErr(e)); } finally { setBusy(false); }
  };

  if (!embed && !canEdit) return null;

  return (
    <Panel title="YouTube video">
      {embed && !editing && (
        <>
          {appointment.videoTitle && <p className="mb-2 text-sm font-medium text-ink">{appointment.videoTitle}</p>}
          <div className="aspect-video w-full overflow-hidden rounded-lg border border-border bg-black">
            <iframe
              src={embed}
              title={appointment.videoTitle || 'Appointment video'}
              className="h-full w-full"
              allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
          {appointment.videoUpdatedAt && (
            <p className="mt-2 text-xs text-muted-foreground">Updated {prettyDateTime(appointment.videoUpdatedAt)}</p>
          )}
        </>
      )}

      {!embed && !editing && (
        <p className="text-sm text-muted-foreground">No video added for this appointment yet.</p>
      )}

      {editing ? (
        <div className="space-y-3">
          <div>
            <Label className="mb-1.5 block">YouTube link</Label>
            <Input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://www.youtube.com/watch?v=…" />
            {!draftValid && <p className="mt-1.5 text-xs text-red-600">Enter a valid YouTube link</p>}
          </div>
          <div>
            <Label className="mb-1.5 block">Title (optional)</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Home exercises after the visit" />
          </div>
          <div className="flex flex-wrap gap-2">
            <Button onClick={() => save(url.trim(), title.trim())} disabled={busy || !draftValid || !url.trim()}>
              {busy && <Spinner />}Save video
            </Button>
            <Button variant="outline" onClick={() => { setEditing(false); setUrl(appointment.youtubeUrl || ''); setTitle(appointment.videoTitle || ''); }}>
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        canEdit && (
          <div className="mt-4 flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
              <Youtube className="h-4 w-4" /> {embed ? 'Change video' : 'Add video'}
            </Button>
            {embed && (
              <Button variant="ghost" size="sm" className="text-red-600" disabled={busy} onClick={() => save('', '')}>
                <Trash2 className="h-4 w-4" /> Remove
              </Button>
            )}
          </div>
        )
      )}
    </Panel>
  );
}

function RescheduleDialog({ open, onOpenChange, appointment, onDone }) {
  const [date, setDate] = useState(appointment.date);
  const [slots, setSlots] = useState([]);
  const [picked, setPicked] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!open || !date) return;
    slotApi
      .availability({ clinicId: idOf(appointment.clinic), doctorId: idOf(appointment.doctor), date })
      .then((s) => setSlots((s || []).filter((x) => !x.isPast)))
      .catch(() => setSlots([]));
  }, [open, date, appointment]);

  const submit = async () => {
    setBusy(true);
    try {
      await appointmentApi.reschedule(appointment._id, picked);
      toast.success('Appointment moved');
      onOpenChange(false);
      onDone();
    } catch (e) { toast.error(getErr(e)); } finally { setBusy(false); }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Reschedule appointment</DialogTitle>
          <DialogDescription>Only slots for the same doctor and clinic can be used.</DialogDescription>
        </DialogHeader>
        <div>
          <Label className="mb-1.5 block">New date</Label>
          <Input type="date" value={date} min={toDateKey(new Date())} onChange={(e) => { setDate(e.target.value); setPicked(''); }} />
        </div>
        <div className="mt-4">
          <Label className="mb-2 block">Available slots</Label>
          {slots.length === 0 ? (
            <p className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">No open slots on this date.</p>
          ) : (
            <div className="grid grid-cols-4 gap-2">
              {slots.map((s) => (
                <button
                  key={s._id}
                  onClick={() => setPicked(s._id)}
                  className={`rounded-lg border px-2 py-2 text-xs ${
                    picked === s._id ? 'border-brand-600 bg-brand-600 text-white' : 'border-border hover:bg-brand-50'
                  }`}
                >
                  {to12h(s.startTime)}
                </button>
              ))}
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Keep current slot</Button>
          <Button onClick={submit} disabled={!picked || busy}>{busy && <Spinner />}Move appointment</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function PrescriptionDialog({ open, onOpenChange, appointment, prescription, onDone }) {
  const editing = Boolean(prescription);
  const blank = () => ({ diagnosis: '', generalInstructions: '', followUpDate: '', medicines: [newMedicine()], images: [] });
  const fromRx = (p) => ({
    diagnosis: p.diagnosis || '',
    generalInstructions: p.generalInstructions || '',
    followUpDate: p.followUpDate ? String(p.followUpDate).slice(0, 10) : '',
    medicines: p.medicines?.length
      ? p.medicines.map((m) => ({ name: m.name || '', dosage: m.dosage || '', timings: m.timings || [], food: m.food || '', durationDays: m.durationDays ? String(m.durationDays) : '', instructions: m.instructions || '', frequency: m.frequency }))
      : [newMedicine()],
    images: p.images || [],
  });
  const [mode, setMode] = useState('type'); // type | upload
  const [origMode, setOrigMode] = useState('type');
  const [form, setForm] = useState(blank);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!open) return;
    if (prescription) {
      setForm(fromRx(prescription));
      const m = prescription.images?.length && !prescription.medicines?.length ? 'upload' : 'type';
      setMode(m);
      setOrigMode(m);
    } else {
      setForm(blank());
      setMode('type');
      setOrigMode('type');
    }
  }, [open, prescription]); // eslint-disable-line react-hooks/exhaustive-deps

  const submit = async () => {
    const medicines = mode === 'type'
      ? form.medicines.filter((m) => m.name).map((m) => ({ ...m, durationDays: m.durationDays ? Number(m.durationDays) : undefined }))
      : [];
    const images = mode === 'upload' ? form.images : []; // one mode only: typed OR uploaded
    if (!medicines.length && !images.length) {
      return toast.error(mode === 'type' ? 'Add at least one medicine' : 'Upload at least one image');
    }
    setBusy(true);
    try {
      const body = {
        diagnosis: form.diagnosis,
        generalInstructions: form.generalInstructions,
        followUpDate: form.followUpDate || undefined,
        medicines,
        images,
      };
      if (editing) await prescriptionApi.update(prescription._id, body);
      else await prescriptionApi.create({ ...body, appointmentId: appointment._id });
      toast.success(editing ? 'Prescription updated' : 'Prescription saved');
      onOpenChange(false);
      onDone();
    } catch (e) { toast.error(getErr(e)); } finally { setBusy(false); }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editing ? 'Edit prescription' : 'Write prescription'}</DialogTitle>
          <DialogDescription>{editing ? 'Changes update the PDF too.' : 'Saving this also marks the appointment completed.'}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="inline-flex rounded-lg border border-border p-1">
            {[['type', 'Type prescription'], ['upload', 'Upload image / PDF']].map(([k, label]) => (
              <button
                key={k}
                type="button"
                onClick={() => setMode(k)}
                className={`rounded-md px-4 py-1.5 text-sm font-medium transition-colors ${mode === k ? 'bg-brand-600 text-white' : 'text-ink hover:bg-brand-50'}`}
              >
                {label}
              </button>
            ))}
          </div>

          {editing && mode !== origMode && (
            <p className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">
              {mode === 'type'
                ? 'Saving will replace the uploaded image/PDF with this typed prescription.'
                : 'Saving will replace the typed medicines with the uploaded image/PDF.'}
            </p>
          )}

          <div>
            <Label className="mb-1.5 block">Diagnosis</Label>
            <Input value={form.diagnosis} onChange={(e) => setForm((f) => ({ ...f, diagnosis: e.target.value }))} placeholder="Primary diagnosis" />
          </div>

          {mode === 'type' ? (
            <div>
              <Label className="mb-2 block">Medicines</Label>
              <MedicineEditor medicines={form.medicines} onChange={(medicines) => setForm((f) => ({ ...f, medicines }))} />
            </div>
          ) : (
            <div>
              <Label className="mb-2 block">Prescription photo / PDF</Label>
              <FileUpload
                multiple
                maxFiles={6}
                accept="image/*,application/pdf"
                label="Upload prescription"
                value={form.images}
                onChange={(images) => setForm((f) => ({ ...f, images }))}
              />
            </div>
          )}

          <div className="grid gap-4 md:grid-cols-[1fr_200px]">
            <div>
              <Label className="mb-1.5 block">General instructions</Label>
              <Textarea
                rows={3}
                value={form.generalInstructions}
                onChange={(e) => setForm((f) => ({ ...f, generalInstructions: e.target.value }))}
                placeholder="Diet, rest, warning signs to watch for"
              />
            </div>
            <div>
              <Label className="mb-1.5 block">Follow-up date</Label>
              <Input type="date" value={form.followUpDate} onChange={(e) => setForm((f) => ({ ...f, followUpDate: e.target.value }))} />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={submit} disabled={busy}>{busy && <Spinner />}{editing ? 'Save changes' : 'Save prescription'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

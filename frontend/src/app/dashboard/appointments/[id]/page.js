'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { ArrowLeft, MapPin, Phone, CalendarClock, XCircle, FileText } from 'lucide-react';
import { appointmentApi, slotApi, prescriptionApi } from '@/services';
import PageHeader from '@/components/admin/page-header';
import ConfirmDialog from '@/components/admin/confirm-dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatusBadge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Spinner, PageLoader } from '@/components/ui/spinner';
import PrescriptionCard from '@/components/prescription/prescription-card';
import SlipButton from '@/components/appointment/slip-button';
import DoctorPhoto from '@/components/ui/doctor-photo';
import { inr, prettyDate, prettyDateTime, to12h, toDateKey, getErr, youtubeEmbedUrl, fileUrl } from '@/lib/utils';

export default function MyAppointmentDetail() {
  const { id } = useParams();
  const router = useRouter();
  const [appt, setAppt] = useState(null);
  const [prescription, setPrescription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [reason, setReason] = useState('');
  const [rescheduleOpen, setRescheduleOpen] = useState(false);
  const [slots, setSlots] = useState([]);
  const [date, setDate] = useState('');
  const [busy, setBusy] = useState(false);

  const load = () => {
    setLoading(true);
    appointmentApi.get(id)
      .then((a) => {
        setAppt(a);
        if (a?.prescription) {
          const pid = a.prescription?._id || a.prescription;
          prescriptionApi.get(pid).then(setPrescription).catch(() => {});
        }
      })
      .catch((e) => toast.error(getErr(e)))
      .finally(() => setLoading(false));
  };

  useEffect(load, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!rescheduleOpen || !date || !appt) return;
    slotApi.availability({ clinicId: appt.clinic?._id, doctorId: appt.doctor?._id, date })
      .then((d) => setSlots((d || []).filter((x) => !x.isPast)))
      .catch((e) => toast.error(getErr(e)));
  }, [rescheduleOpen, date, appt]);

  const cancel = async () => {
    try {
      await appointmentApi.cancel(id, reason);
      toast.success('Appointment cancelled');
      load();
    } catch (e) { toast.error(getErr(e)); }
  };

  const reschedule = async (slotId) => {
    setBusy(true);
    try {
      await appointmentApi.reschedule(id, slotId);
      toast.success('Appointment moved');
      setRescheduleOpen(false);
      load();
    } catch (e) { toast.error(getErr(e)); } finally { setBusy(false); }
  };

  if (loading) return <PageLoader />;
  if (!appt) return <p className="text-muted-foreground">This appointment could not be loaded.</p>;

  const canChange = ['pending', 'confirmed'].includes(appt.status) && appt.date >= toDateKey(new Date());

  return (
    <>
      <Button variant="ghost" size="sm" className="mb-3" onClick={() => router.push('/dashboard/appointments')}>
        <ArrowLeft className="h-4 w-4" />All appointments
      </Button>

      <PageHeader
        title={`Visit with ${appt.doctor?.name || 'your doctor'}`}
        sub={`${prettyDate(appt.date)} at ${to12h(appt.startTime)}`}
        actions={<div className="flex items-center gap-3"><StatusBadge value={appt.status} /><SlipButton appointment={appt} /></div>}
      />

      {appt.status === 'pending' && (
        <p className="mb-4 rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Your appointment is booked and waiting for the clinic to confirm it. The appointment slip will be available to download here as soon as it is confirmed.
        </p>
      )}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle>Visit details</CardTitle></CardHeader>
            <CardContent className="space-y-3 text-sm">
              <Row label="Patient" value={appt.patient?.name} />
              {appt.patient?.patientId && <Row label="Patient ID" value={appt.patient.patientId} />}
              <Row label="Speciality" value={appt.speciality?.name} />
              <div className="flex items-center justify-between gap-2">
                <span className="text-muted-foreground">Doctor</span>
                <span className="flex items-center gap-2 font-medium">
                  <DoctorPhoto name={appt.doctor?.name} photo={appt.doctor?.photo} className="h-8 w-8 rounded-full text-xs" />
                  {appt.doctor?.name || '—'}
                </span>
              </div>
              <Row label="Time" value={`${to12h(appt.startTime)} – ${to12h(appt.endTime)}`} />
              {appt.symptoms && <Row label="Symptoms you shared" value={appt.symptoms} />}
              {appt.diagnosis && <Row label="Diagnosis" value={appt.diagnosis} />}
              {appt.doctorNotes && <Row label="Doctor's notes" value={appt.doctorNotes} />}
              {appt.followUpDate && <Row label="Follow-up" value={prettyDate(appt.followUpDate)} />}
            </CardContent>
          </Card>

          {prescription && <PrescriptionCard prescription={prescription} />}

          {youtubeEmbedUrl(appt.youtubeUrl) && (
            <Card>
              <CardHeader><CardTitle>{appt.videoTitle || 'Video from your clinic'}</CardTitle></CardHeader>
              <CardContent>
                <div className="aspect-video w-full overflow-hidden rounded-lg bg-black">
                  <iframe
                    src={youtubeEmbedUrl(appt.youtubeUrl)}
                    title={appt.videoTitle || 'Appointment video'}
                    className="h-full w-full"
                    allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle>Clinic</CardTitle></CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p className="font-medium">{appt.clinic?.name}</p>
              {appt.clinic?.address && (
                <p className="flex gap-2 text-muted-foreground">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
                  {[appt.clinic.address.line1, appt.clinic.address.line2, appt.clinic.address.city, appt.clinic.address.pincode].filter(Boolean).join(', ')}
                </p>
              )}
              {appt.clinic?.phone && (
                <p className="flex items-center gap-2 text-muted-foreground"><Phone className="h-4 w-4" />{appt.clinic.phone}</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Payment</CardTitle></CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Consultation</span><span>{inr(appt.consultationFee)}</span></div>
              {appt.discountAmount > 0 && (
                <div className="flex justify-between text-emerald-600">
                  <span>Discount {appt.couponCode ? `(${appt.couponCode})` : ''}</span><span>− {inr(appt.discountAmount)}</span>
                </div>
              )}
              <Separator />
              <div className="flex justify-between font-semibold"><span>Total</span><span>{inr(appt.payableAmount ?? appt.consultationFee)}</span></div>
              <div className="flex justify-between pt-1">
                <span className="text-muted-foreground">Pay at clinic</span>
                <StatusBadge value={appt.payment?.status || 'pending'} />
              </div>

            </CardContent>
          </Card>

          {canChange && (
            <Card>
              <CardHeader><CardTitle>Need a change?</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" className="w-full" onClick={() => { setRescheduleOpen(true); setDate(appt.date); }}>
                  <CalendarClock className="h-4 w-4" />Reschedule
                </Button>
                <Button variant="outline" className="w-full text-red-600" onClick={() => setCancelOpen(true)}>
                  <XCircle className="h-4 w-4" />Cancel visit
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <Dialog open={rescheduleOpen} onOpenChange={setRescheduleOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Move this appointment</DialogTitle>
            <DialogDescription>Pick another free slot with {appt.doctor?.name}.</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label className="mb-1.5 block">Date</Label>
              <Input type="date" value={date} min={toDateKey(new Date())} onChange={(e) => setDate(e.target.value)} />
            </div>
            <div className="grid max-h-64 grid-cols-3 gap-2 overflow-y-auto">
              {slots.map((s) => (
                <Button key={s._id} variant="outline" size="sm" disabled={busy} onClick={() => reschedule(s._id)}>
                  {to12h(s.startTime)}
                </Button>
              ))}
              {!slots.length && <p className="col-span-3 text-sm text-muted-foreground">No upcoming free slots on this date.</p>}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setRescheduleOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={cancelOpen}
        onOpenChange={setCancelOpen}
        title="Cancel this appointment?"
        description={
          <span className="block space-y-2">
            <span className="block">The slot goes back to the clinic straight away.</span>
            <Textarea rows={3} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Reason (optional)" />
          </span>
        }
        confirmLabel="Cancel visit"
        onConfirm={cancel}
      />
    </>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex flex-wrap justify-between gap-2">
      <span className="text-muted-foreground">{label}</span>
      <span className="max-w-[65%] text-right font-medium">{value || '—'}</span>
    </div>
  );
}

'use client';
import PatientId from '@/components/ui/patient-id';
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  ArrowLeft, UserPlus, Search, Clock, Ticket, X, CheckCircle2, Wallet, CreditCard,
} from 'lucide-react';
import {
  clinicApi, doctorApi, slotApi, patientApi, couponApi, appointmentApi,
} from '@/services';
import { useAuthStore } from '@/store/authStore';
import PageHeader from '@/components/admin/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { SimpleSelect } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Spinner } from '@/components/ui/spinner';
import { GENDERS, FIXED_CONSULTATION_FEE } from '@/lib/constants';
import { inr, initials, prettyDate, to12h, toDateKey, idOf, titleCase, getErr } from '@/lib/utils';

const nowTime = () => {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
};

const emptyPatient = {
  name: '', age: '', gender: '', contact: { phone: '', email: '' },
  guardianDetails: { name: '', relation: '', phone: '' },
};

export default function WalkInForm() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);

  const [clinics, setClinics] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);
  const [slots, setSlots] = useState([]);

  const [clinicId, setClinicId] = useState('');
  const [doctorId, setDoctorId] = useState('');
  const [date, setDate] = useState(toDateKey(new Date()));
  const [startTime, setStartTime] = useState(nowTime());
  const [slotId, setSlotId] = useState('');

  const [mode, setMode] = useState('existing'); // existing | new
  const [search, setSearch] = useState('');
  const [patientId, setPatientId] = useState('');
  const [newPatient, setNewPatient] = useState(emptyPatient);

  const [symptoms, setSymptoms] = useState('');
  const [couponCode, setCouponCode] = useState('');
  const [coupon, setCoupon] = useState(null);
  const [checking, setChecking] = useState(false);
  const [collectNow, setCollectNow] = useState(true);
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(null);

  useEffect(() => {
    Promise.all([clinicApi.list().catch(() => []), doctorApi.list().catch(() => []), patientApi.list().catch(() => [])])
      .then(([c, d, p]) => {
        setClinics(c || []);
        setDoctors(d || []);
        setPatients(p || []);
        const own = (user?.clinics || []).map(idOf).filter(Boolean);
        if (own.length === 1) setClinicId(own[0]);
        else if ((c || []).length === 1) setClinicId(c[0]._id);
      })
      .catch((e) => toast.error(getErr(e)));
  }, [user]);

  useEffect(() => {
    if (!clinicId || !doctorId || !date) { setSlots([]); return; }
    slotApi.availability({ clinicId, doctorId, date })
      .then((s) => setSlots(s || []))
      .catch(() => setSlots([]));
  }, [clinicId, doctorId, date]);

  const doctorsForClinic = useMemo(
    () => doctors.filter((d) => !clinicId || (d.clinics || []).some((c) => idOf(c) === clinicId)),
    [doctors, clinicId]
  );

  const doctor = doctors.find((d) => d._id === doctorId);
  const clinic = clinics.find((c) => c._id === clinicId);

  // fixed fee for every appointment (backend applies the same)
  const fee = useMemo(() => (doctor ? FIXED_CONSULTATION_FEE : 0), [doctor]);

  const discount = coupon?.discount || 0;
  const payable = Math.max(0, fee - discount);

  const matches = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return patients.slice(0, 6);
    return patients
      .filter((p) => [p.patientId, p.name, p.contact?.phone, p.contact?.email].filter(Boolean).some((v) => String(v).toLowerCase().includes(q)))
      .slice(0, 8);
  }, [patients, search]);

  const chosenPatient = patients.find((p) => p._id === patientId);
  const chosenSlot = slots.find((s) => s._id === slotId);

  const applyCoupon = async () => {
    if (!couponCode.trim()) return;
    if (!doctorId) { toast.error('Pick the doctor first'); return; }
    setChecking(true);
    try {
      const res = await couponApi.validate({
        code: couponCode.trim().toUpperCase(),
        amount: fee,
        clinicId,
        specialityId: idOf(doctor?.speciality),
      });
      setCoupon(res);
      toast.success(`Coupon applied — ${inr(res.discount)} off`);
    } catch (e) { setCoupon(null); toast.error(getErr(e)); } finally { setChecking(false); }
  };

  const submit = async () => {
    if (!clinicId || !doctorId) { toast.error('Pick a clinic and a doctor'); return; }
    if (mode === 'existing' && !patientId) { toast.error('Pick the patient, or add a new one'); return; }
    if (mode === 'new' && !newPatient.name) { toast.error('The new patient needs a name'); return; }

    setSaving(true);
    try {
      const payload = {
        clinicId,
        doctorId,
        date,
        startTime,
        slotId: slotId || undefined,
        symptoms,
        couponCode: coupon ? couponCode.trim().toUpperCase() : undefined,
        collectNow,
        patient: mode === 'existing'
          ? { _id: patientId }
          : { ...newPatient, age: newPatient.age ? Number(newPatient.age) : undefined },
      };
      const res = await appointmentApi.walkIn(payload);
      setDone(res);
      toast.success('Walk-in confirmed');
    } catch (e) { toast.error(getErr(e)); } finally { setSaving(false); }
  };

  if (done) {
    const appt = done.appointment;
    return (
      <>
        <PageHeader title="Walk-in confirmed" sub="The slot is booked and the visit is on the doctor's list." />
        <Card className="max-w-xl">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                <CheckCircle2 className="h-6 w-6" />
              </span>
              <div>
                <p className="font-semibold">{appt?.patient?.name} <PatientId id={appt?.patient?.patientId} className="ml-1" /></p>
                <p className="text-sm text-muted-foreground">
                  {appt?.doctor?.name} · {prettyDate(appt?.date)} at {to12h(appt?.startTime)}
                </p>
              </div>
            </div>

            <Separator className="my-5" />

            <div className="space-y-2 text-sm">
              <Row label="Clinic" value={appt?.clinic?.name} />
              <Row label="Amount" value={inr(appt?.payableAmount ?? appt?.consultationFee)} />
              <Row label="Payment" value={`At clinic · ${titleCase((done.payment?.status || '').replace(/_/g, ' '))}`} />
              {done.slotCreated && <Row label="Slot" value="Created for this walk-in" />}
            </div>

            <div className="mt-6 flex flex-wrap gap-2">
              <Button asChild><Link href={`/admin/appointments/${appt?._id}`}>Open the visit</Link></Button>
              <Button variant="outline" onClick={() => { setDone(null); setPatientId(''); setNewPatient(emptyPatient); setSymptoms(''); setCoupon(null); setCouponCode(''); setSlotId(''); setStartTime(nowTime()); }}>
                Book another
              </Button>
              <Button variant="ghost" onClick={() => router.push('/admin/appointments')}>All appointments</Button>
            </div>
          </CardContent>
        </Card>
      </>
    );
  }

  return (
    <>
      <Button variant="ghost" size="sm" className="mb-3" onClick={() => router.push('/admin/appointments')}>
        <ArrowLeft className="h-4 w-4" />All appointments
      </Button>

      <PageHeader
        title="Walk-in booking"
        sub="For a patient standing at the desk — the visit is confirmed straight away."
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle>Where and who</CardTitle></CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label className="mb-1.5 block">Clinic *</Label>
                <SimpleSelect
                  value={clinicId}
                  onChange={(v) => { setClinicId(v); setDoctorId(''); setSlotId(''); }}
                  placeholder="Select clinic"
                  options={clinics.map((c) => ({ value: c._id, label: c.name }))}
                />
              </div>
              <div>
                <Label className="mb-1.5 block">Doctor *</Label>
                <SimpleSelect
                  value={doctorId}
                  onChange={(v) => { setDoctorId(v); setSlotId(''); }}
                  placeholder="Select doctor"
                  options={doctorsForClinic.map((d) => ({ value: d._id, label: `${d.name}${d.speciality?.name ? ` · ${d.speciality.name}` : ''}` }))}
                  disabled={!clinicId}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><Clock className="h-4 w-4" />When</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label className="mb-1.5 block">Date</Label>
                  <Input type="date" value={date} onChange={(e) => { setDate(e.target.value); setSlotId(''); }} />
                </div>
                <div>
                  <Label className="mb-1.5 block">Time</Label>
                  <div className="flex gap-2">
                    <Input type="time" value={startTime} onChange={(e) => { setStartTime(e.target.value); setSlotId(''); }} />
                    <Button variant="outline" onClick={() => { setStartTime(nowTime()); setSlotId(''); }}>Now</Button>
                  </div>
                </div>
              </div>

              <div>
                <Label className="mb-2 block">Free slots {doctorId ? `on ${prettyDate(date)}` : ''}</Label>
                {!doctorId ? (
                  <p className="text-sm text-muted-foreground">Pick a doctor to see their open slots.</p>
                ) : !slots.length ? (
                  <p className="rounded-lg bg-amber-50 px-3 py-2.5 text-sm text-amber-800">
                    No free slots. The booking will create one at {to12h(startTime)} for this walk-in.
                  </p>
                ) : (
                  <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
                    {slots.map((s) => (
                      <button
                        key={s._id}
                        type="button"
                        onClick={() => setSlotId(slotId === s._id ? '' : s._id)}
                        className={`rounded-lg border px-2 py-2 text-xs transition ${slotId === s._id ? 'border-brand-500 bg-brand-500 text-white' : 'hover:border-brand-300 hover:bg-brand-50'}`}
                      >
                        {to12h(s.startTime)}
                      </button>
                    ))}
                  </div>
                )}
                {slots.length > 0 && !slotId && (
                  <p className="mt-2 text-xs text-muted-foreground">
                    Nothing selected — the next free slot from {to12h(startTime)} is used, or a new one is created.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex-row items-center justify-between">
              <CardTitle>Patient</CardTitle>
              <div className="flex gap-1">
                <Button variant={mode === 'existing' ? 'default' : 'outline'} size="sm" onClick={() => setMode('existing')}>
                  <Search className="h-3.5 w-3.5" />Existing
                </Button>
                <Button variant={mode === 'new' ? 'default' : 'outline'} size="sm" onClick={() => setMode('new')}>
                  <UserPlus className="h-3.5 w-3.5" />New
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {mode === 'existing' ? (
                <div className="space-y-3">
                  <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name, phone or email" />
                  <div className="divide-y rounded-xl border">
                    {matches.map((p) => (
                      <button
                        key={p._id}
                        type="button"
                        onClick={() => setPatientId(p._id)}
                        className={`flex w-full items-center gap-3 px-3 py-2.5 text-left transition ${patientId === p._id ? 'bg-brand-50' : 'hover:bg-muted/60'}`}
                      >
                        <Avatar className="h-8 w-8"><AvatarFallback className="text-xs">{initials(p.name)}</AvatarFallback></Avatar>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium">{p.name} <PatientId id={p.patientId} className="ml-1" /></p>
                          <p className="text-xs text-muted-foreground">
                            {[p.age ? `${p.age} yrs` : null, p.gender, p.contact?.phone].filter(Boolean).join(' · ') || '—'}
                          </p>
                        </div>
                        {patientId === p._id && <Badge tone="success">Selected</Badge>}
                      </button>
                    ))}
                    {!matches.length && <p className="px-3 py-4 text-sm text-muted-foreground">No match. Switch to New to register them.</p>}
                  </div>
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <Label className="mb-1.5 block">Full name *</Label>
                    <Input value={newPatient.name} onChange={(e) => setNewPatient((p) => ({ ...p, name: e.target.value }))} />
                  </div>
                  <div>
                    <Label className="mb-1.5 block">Age</Label>
                    <Input type="number" min="0" value={newPatient.age} onChange={(e) => setNewPatient((p) => ({ ...p, age: e.target.value }))} />
                  </div>
                  <div>
                    <Label className="mb-1.5 block">Gender</Label>
                    <SimpleSelect
                      value={newPatient.gender}
                      onChange={(v) => setNewPatient((p) => ({ ...p, gender: v }))}
                      placeholder="Select"
                      options={GENDERS}
                    />
                  </div>
                  <div>
                    <Label className="mb-1.5 block">Phone</Label>
                    <Input value={newPatient.contact.phone} onChange={(e) => setNewPatient((p) => ({ ...p, contact: { ...p.contact, phone: e.target.value } }))} />
                  </div>
                  <div>
                    <Label className="mb-1.5 block">Email</Label>
                    <Input type="email" value={newPatient.contact.email} onChange={(e) => setNewPatient((p) => ({ ...p, contact: { ...p.contact, email: e.target.value } }))} />
                  </div>
                  <div className="sm:col-span-2">
                    <Label className="mb-1.5 block">Guardian (for a child or dependent)</Label>
                    <div className="grid gap-3 sm:grid-cols-3">
                      <Input placeholder="Name" value={newPatient.guardianDetails.name} onChange={(e) => setNewPatient((p) => ({ ...p, guardianDetails: { ...p.guardianDetails, name: e.target.value } }))} />
                      <Input placeholder="Relation" value={newPatient.guardianDetails.relation} onChange={(e) => setNewPatient((p) => ({ ...p, guardianDetails: { ...p.guardianDetails, relation: e.target.value } }))} />
                      <Input placeholder="Phone" value={newPatient.guardianDetails.phone} onChange={(e) => setNewPatient((p) => ({ ...p, guardianDetails: { ...p.guardianDetails, phone: e.target.value } }))} />
                    </div>
                  </div>
                </div>
              )}

              <div className="mt-4">
                <Label className="mb-1.5 block">Reason for the visit</Label>
                <Textarea rows={2} value={symptoms} onChange={(e) => setSymptoms(e.target.value)} placeholder="Fever for three days, sore throat…" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="lg:sticky lg:top-20">
            <CardHeader><CardTitle>Payment</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between rounded-xl border p-3">
                <div>
                  <p className="text-sm font-medium">Money collected now</p>
                  <p className="text-xs text-muted-foreground">Payment is at the clinic — switch on if the patient has paid at the desk.</p>
                </div>
                <Switch checked={collectNow} onCheckedChange={setCollectNow} />
              </div>

              <div>
                <Label className="mb-1.5 flex items-center gap-1.5"><Ticket className="h-3.5 w-3.5" />Coupon</Label>
                {coupon ? (
                  <div className="flex items-center justify-between rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2">
                    <span className="text-sm font-medium text-emerald-800">{couponCode.toUpperCase()} · {inr(discount)} off</span>
                    <Button variant="ghost" size="icon" onClick={() => { setCoupon(null); setCouponCode(''); }} aria-label="Remove coupon">
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <Input value={couponCode} onChange={(e) => setCouponCode(e.target.value)} placeholder="FIRSTVISIT" />
                    <Button variant="outline" onClick={applyCoupon} disabled={checking}>{checking ? <Spinner /> : 'Apply'}</Button>
                  </div>
                )}
              </div>

              <Separator />

              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Consultation</span><span>{inr(fee)}</span></div>
                {discount > 0 && (
                  <div className="flex justify-between text-emerald-600"><span>Discount</span><span>− {inr(discount)}</span></div>
                )}
                <div className="flex justify-between text-base font-semibold"><span>Payable</span><span>{inr(payable)}</span></div>
              </div>

              <div className="rounded-xl bg-muted/60 p-3 text-xs text-muted-foreground">
                {doctor ? (
                  <>
                    {doctor.name} · {chosenSlot ? to12h(chosenSlot.startTime) : `from ${to12h(startTime)}`} · {prettyDate(date)}
                    <br />
                    {(mode === 'existing' ? chosenPatient?.name : newPatient.name) || 'No patient selected yet'}
                  </>
                ) : 'Pick a clinic, doctor and patient to continue.'}
              </div>

              <Button className="w-full" onClick={submit} disabled={saving}>
                {saving && <Spinner />}Confirm walk-in
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}

function ModeButton({ icon: Icon, label, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left text-sm transition ${active ? 'border-brand-500 bg-brand-50 text-brand-800' : 'hover:bg-muted/60'}`}
    >
      <Icon className="h-4 w-4" />
      {label}
    </button>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex justify-between gap-2">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value || '—'}</span>
    </div>
  );
}

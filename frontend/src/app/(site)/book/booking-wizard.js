'use client';
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import {
  Check, ChevronLeft, ChevronRight, Wallet, ShieldCheck, Ticket, X,
} from 'lucide-react';
import {
  specialityApi, clinicApi, doctorApi, slotApi, patientApi, appointmentApi, couponApi,
} from '@/services';
import { useBookingStore } from '@/store/bookingStore';
import { useAuthStore } from '@/store/authStore';
import GuestVerify from './guest-verify';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { SimpleSelect } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import DoctorPhoto from '@/components/ui/doctor-photo';
import PatientId from '@/components/ui/patient-id';
import { inr, to12h, toDateKey, prettyDate, idOf, getErr, initials } from '@/lib/utils';
import { GENDERS, FIXED_CONSULTATION_FEE } from '@/lib/constants';
import { isSlotPast, useMinuteTick } from '@/lib/slot-time';

const STEPS = [
  'Select doctor',
  'Choose date & time',
  'Patient details',
  'Fee & coupon',
  'Review & confirm',
];

export default function BookingWizard() {
  const router = useRouter();
  const params = useSearchParams();
  const user = useAuthStore((s) => s.user);
  const b = useBookingStore();

  const [specialities, setSpecialities] = useState([]);
  const [clinics, setClinics] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [slots, setSlots] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [loadedFor, setLoadedFor] = useState(''); // which clinic|doctor|date the current slots belong to
  const [submitting, setSubmitting] = useState(false);
  const [prefilled, setPrefilled] = useState(false);
  useMinuteTick(); // keeps "Passed" labels current while the page is open

  /* ---------------------------------------------------------- bootstrap */
  useEffect(() => {
    Promise.all([
      specialityApi.list(),
      clinicApi.list(),
      doctorApi.list(),
      // a visitor has no patients yet and no token to ask with
      user ? patientApi.list().catch(() => []) : Promise.resolve([]),
    ])
      .then(([sp, cl, dc, pt]) => {
        setSpecialities(sp || []);
        setClinics(cl || []);
        setDoctors(dc || []);
        setPatients(pt || []);
      })
      .catch((e) => toast.error(getErr(e)));
    return () => b.reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Prefill from query params coming off a doctor profile or speciality page
  useEffect(() => {
    if (prefilled || !doctors.length) return;
    const dId = params.get('doctor');
    const cId = params.get('clinic');
    const sId = params.get('speciality');
    const date = params.get('date');
    const slot = params.get('slot');

    const doctor = doctors.find((d) => d._id === dId);
    const patch = {};
    if (sId) patch.speciality = specialities.find((s) => s._id === sId) || null;
    if (doctor) {
      patch.doctor = doctor;
      if (!patch.speciality) patch.speciality = doctor.speciality;
    }
    if (cId) patch.clinic = clinics.find((c) => c._id === cId) || { _id: cId, name: 'Selected clinic' };
    if (date) patch.date = date;
    if (Object.keys(patch).length) {
      b.set({ ...patch, step: doctor ? (date ? 2 : 2) : 1 });
      if (slot) b.set({ slot: { _id: slot } });
    }
    setPrefilled(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [doctors, clinics, specialities, prefilled]);

  /* ------------------------------------------------------------- slots */
  useEffect(() => {
    const clinicId = idOf(b.clinic);
    const doctorId = idOf(b.doctor);
    if (!clinicId || !doctorId || !b.date) { setSlots([]); setLoadedFor(''); return; }
    const key = `${clinicId}|${doctorId}|${b.date}`;
    let stale = false;
    setLoadingSlots(true);
    slotApi
      .availability({ clinicId, doctorId, date: b.date })
      .then((s) => { if (!stale) { setSlots(s || []); setLoadedFor(key); } })
      .catch((e) => { if (!stale) { setSlots([]); setLoadedFor(key); toast.error(getErr(e)); } })
      .finally(() => { if (!stale) setLoadingSlots(false); });
    return () => { stale = true; };
  }, [b.clinic, b.doctor, b.date]);

  // a slot chosen earlier (or arriving from a link) whose time has gone can't stay selected
  const clinicTz = b.clinic?.timezone;
  useEffect(() => {
    const picked = idOf(b.slot);
    // only judge the picked slot once the list for the current clinic/doctor/date has arrived
    if (!picked || loadingSlots || loadedFor !== `${idOf(b.clinic)}|${idOf(b.doctor)}|${b.date}`) return;
    const match = slots.find((x) => x._id === picked);
    if (!match) {
      b.pickSlot(null);
      if (!b.slot?.startTime) toast.error('That slot is no longer available. Please pick another time.');
      return;
    }
    if (!b.slot?.startTime) b.pickSlot(match); // fill in time/date so summary and booking show the real slot
    if (isSlotPast(match, clinicTz)) {
      b.pickSlot(null);
      toast.error('That time has already passed. Please pick a later slot.');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slots, b.slot, loadingSlots, loadedFor]);

  /* ---------------------------------------------------------- filtering */
  const filteredDoctors = useMemo(() => {
    return doctors.filter((d) => {
      if (b.speciality && idOf(d.speciality) !== idOf(b.speciality)) return false;
      if (b.clinic && !(d.clinics || []).some((c) => idOf(c) === idOf(b.clinic))) return false;
      return true;
    });
  }, [doctors, b.speciality, b.clinic]);

  const doctorClinics = useMemo(() => {
    if (!b.doctor) return clinics;
    const ids = (b.doctor.clinics || []).map(idOf);
    return clinics.filter((c) => ids.includes(c._id));
  }, [clinics, b.doctor]);

  const days = useMemo(() => {
    return Array.from({ length: 14 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() + i);
      return d;
    });
  }, []);

  const fee = FIXED_CONSULTATION_FEE; // same fixed fee the server charges
  const discount = b.couponResult?.discount || 0;
  const payable = Math.max(0, fee - discount);

  /* ----------------------------------------------------------- actions */
  const applyCoupon = async () => {
    if (!b.couponCode) return;
    try {
      const res = await couponApi.validate({
        code: b.couponCode.toUpperCase(),
        amount: fee,
        clinicId: idOf(b.clinic),
        specialityId: idOf(b.speciality),
      });
      b.set({ couponResult: res });
      toast.success(`Coupon applied — you save ${inr(res.discount)}`);
    } catch (e) {
      b.set({ couponResult: null });
      toast.error(getErr(e));
    }
  };

  // called after an OTP signup/sign-in from inside the wizard
  const onVerified = async (signedIn) => {
    const list = await patientApi.list().catch(() => []);
    setPatients(list || []);
    b.set({
      newPatient: {
        ...b.newPatient,
        name: b.newPatient.name || (list?.length ? '' : signedIn?.name || ''),
        contact: {
          ...b.newPatient.contact,
          phone: b.newPatient.contact.phone || signedIn?.phone || '',
          email: b.newPatient.contact.email || signedIn?.email || '',
        },
      },
    });
  };

  const buildPatientPayload = () => {
    if (b.patient?._id) return { _id: b.patient._id };
    const np = b.newPatient;
    return {
      name: np.name,
      dob: np.dob || undefined,
      gender: np.gender,
      contact: { phone: np.contact.phone || user?.phone, email: np.contact.email || user?.email },
      guardianDetails: {
        name: np.guardianDetails.name || user?.name,
        relation: np.guardianDetails.relation || np.relation,
        phone: np.guardianDetails.phone || user?.phone,
      },
    };
  };

  const confirm = async () => {
    if (!b.agreed) return toast.error('Please accept the terms to continue');
    setSubmitting(true);
    try {
      const payload = {
        specialityId: idOf(b.doctor?.speciality) || idOf(b.speciality),
        clinicId: idOf(b.clinic),
        doctorId: idOf(b.doctor),
        slotId: idOf(b.slot),
        patient: buildPatientPayload(),
        symptoms: b.symptoms || undefined,
        couponCode: b.couponResult ? b.couponCode.toUpperCase() : undefined,
      };
      const res = await appointmentApi.book(payload);
      b.set({ result: res });

      toast.success('Appointment booked — pay at the clinic during your visit');
      router.push(`/dashboard/appointments/${res.appointment._id}`);
    } catch (e) {
      toast.error(getErr(e));
    } finally {
      setSubmitting(false);
    }
  };

  /* ----------------------------------------------------- step guarding */
  const canContinue = () => {
    if (b.step === 1) return Boolean(b.doctor && b.clinic);
    if (b.step === 2) return Boolean(b.date && b.slot);
    if (b.step === 3) return Boolean(user) && Boolean(b.patient?._id || b.newPatient.name);
    return true;
  };

  return (
    <>
      <section className="hero-wash border-b border-border">
        <div className="container py-8">
          <h1 className="text-3xl font-extrabold md:text-4xl">Book your appointment</h1>
          <p className="mt-2 text-sm text-ink-soft">Quality healthcare in a few simple steps.</p>
        </div>
      </section>

      <div className="container py-8">
        <Stepper step={b.step} onJump={(n) => n < b.step && b.goto(n)} />

        <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_340px]">
          <div className="space-y-6">
            {b.step === 1 && (
              <StepCard n={1} title="Select doctor" sub="Choose your speciality, clinic and doctor.">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label className="mb-1.5 block">Speciality</Label>
                    <SimpleSelect
                      value={idOf(b.speciality)}
                      onChange={(v) => b.pickSpeciality(specialities.find((s) => s._id === v) || null)}
                      allowEmpty emptyLabel="Any speciality" placeholder="Any speciality"
                      options={specialities.map((s) => ({ value: s._id, label: s.name }))}
                    />
                  </div>
                  <div>
                    <Label className="mb-1.5 block">Clinic</Label>
                    <SimpleSelect
                      value={idOf(b.clinic)}
                      onChange={(v) => b.pickClinic(clinics.find((c) => c._id === v) || null)}
                      allowEmpty emptyLabel="All clinics" placeholder="All clinics"
                      options={clinics.map((c) => ({ value: c._id, label: c.name }))}
                    />
                  </div>
                </div>

                <div className="mt-5 space-y-3">
                  {filteredDoctors.map((d) => {
                    const active = idOf(b.doctor) === d._id;
                    return (
                      <button
                        key={d._id}
                        onClick={() => {
                          b.pickDoctor(d);
                          if (!b.speciality) b.set({ speciality: d.speciality });
                          const first = (d.clinics || [])[0];
                          if (!b.clinic && first) b.set({ clinic: clinics.find((c) => c._id === idOf(first)) || first });
                        }}
                        className={`flex w-full items-center gap-4 rounded-xl border p-4 text-left transition-colors ${
                          active ? 'border-brand-500 bg-brand-50' : 'border-border hover:border-brand-300'
                        }`}
                      >
                        <DoctorPhoto name={d.name} photo={d.photo} className="h-14 w-14 rounded-xl" />
                        <span className="min-w-0 flex-1">
                          <span className="block truncate font-semibold text-ink">{d.name}</span>
                          <span className="mt-1 flex flex-wrap items-center gap-2">
                            <Badge tone="info">{d.speciality?.name || 'General'}</Badge>
                            {d.experienceYears ? (
                              <span className="text-xs text-muted-foreground">{d.experienceYears} yrs experience</span>
                            ) : null}
                          </span>
                        </span>
                        <span className="shrink-0 text-right">
                          <span className="block font-semibold text-ink">{inr(FIXED_CONSULTATION_FEE)}</span>
                          <span className="block text-[11px] text-muted-foreground">Consultation fee</span>
                        </span>
                      </button>
                    );
                  })}
                  {!filteredDoctors.length && (
                    <p className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">
                      No doctors match this speciality and clinic. Try clearing one of them.
                    </p>
                  )}
                </div>

                {b.doctor && doctorClinics.length > 1 && (
                  <div className="mt-5">
                    <Label className="mb-1.5 block">Consulting at</Label>
                    <SimpleSelect
                      value={idOf(b.clinic)}
                      onChange={(v) => b.switchClinic(clinics.find((c) => c._id === v) || null)}
                      placeholder="Select clinic"
                      options={doctorClinics.map((c) => ({ value: c._id, label: c.name }))}
                    />
                  </div>
                )}
              </StepCard>
            )}

            {b.step === 2 && (
              <StepCard n={2} title="Choose date & time" sub="Pick a slot that works for you.">
                <div className="grid grid-cols-7 gap-2">
                  {days.map((d) => {
                    const key = toDateKey(d);
                    const active = key === b.date;
                    return (
                      <button
                        key={key}
                        onClick={() => b.pickDate(key)}
                        className={`rounded-lg py-2 text-center text-xs transition-colors ${
                          active ? 'bg-brand-600 text-white' : 'bg-brand-50 text-ink hover:bg-brand-100'
                        }`}
                      >
                        <span className="block font-medium">{d.toLocaleDateString('en-IN', { weekday: 'short' })}</span>
                        <span className="block text-sm font-semibold">{d.getDate()}</span>
                        <span className="block text-[10px] opacity-70">{d.toLocaleDateString('en-IN', { month: 'short' })}</span>
                      </button>
                    );
                  })}
                </div>

                <div className="mt-6">
                  {!b.date ? (
                    <p className="rounded-lg bg-brand-50 px-4 py-3 text-sm text-ink-soft">Pick a date to see open slots.</p>
                  ) : loadingSlots ? (
                    <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                      {[...Array(8)].map((_, i) => <div key={i} className="h-10 animate-pulse rounded-lg bg-muted" />)}
                    </div>
                  ) : slots.length === 0 ? (
                    <p className="rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-800">
                      No open slots on {prettyDate(b.date)}. Try another date.
                    </p>
                  ) : (
                    <SlotGrids slots={slots} tz={clinicTz} selected={idOf(b.slot)} onSelect={(s) => b.pickSlot(s)} />
                  )}
                </div>
              </StepCard>
            )}

            {b.step === 3 && (
              <StepCard n={3} title="Patient details" sub="Who is this appointment for?">
                {!user && <GuestVerify onVerified={onVerified} />}

                {user && patients.length > 0 && (
                  <>
                    <Label className="mb-2 block">Existing patient</Label>
                    <div className="grid gap-2 sm:grid-cols-2">
                      {patients.map((p) => {
                        const active = b.patient?._id === p._id;
                        return (
                          <button
                            key={p._id}
                            onClick={() => b.set({ patient: p })}
                            className={`flex items-center gap-3 rounded-lg border p-3 text-left ${
                              active ? 'border-brand-500 bg-brand-50' : 'border-border hover:border-brand-300'
                            }`}
                          >
                            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-100 text-xs font-semibold text-brand-700">
                              {initials(p.name)}
                            </span>
                            <span className="min-w-0">
                              <span className="block truncate text-sm font-medium text-ink">{p.name} <PatientId id={p.patientId} className="ml-1" /></span>
                              <span className="block text-xs text-muted-foreground">
                                {p.gender || '—'}{p.dob ? ` · ${prettyDate(p.dob)}` : ''}
                              </span>
                            </span>
                          </button>
                        );
                      })}
                    </div>
                    <div className="my-5 flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="h-px flex-1 bg-border" /> or add someone new <span className="h-px flex-1 bg-border" />
                    </div>
                  </>
                )}

                <div className={`grid gap-4 sm:grid-cols-2 ${user ? '' : 'pointer-events-none select-none opacity-40'}`}>
                  <div>
                    <Label className="mb-1.5 block">Full name</Label>
                    <Input
                      value={b.newPatient.name}
                      onChange={(e) => { b.set({ newPatient: { ...b.newPatient, name: e.target.value }, patient: null }); }}
                      placeholder="Patient name"
                    />
                  </div>
                  <div>
                    <Label className="mb-1.5 block">Date of birth</Label>
                    <Input
                      type="date"
                      value={b.newPatient.dob}
                      onChange={(e) => b.set({ newPatient: { ...b.newPatient, dob: e.target.value } })}
                    />
                  </div>
                  <div>
                    <Label className="mb-1.5 block">Gender</Label>
                    <SimpleSelect
                      value={b.newPatient.gender}
                      onChange={(v) => b.set({ newPatient: { ...b.newPatient, gender: v } })}
                      options={GENDERS}
                    />
                  </div>
                  <div>
                    <Label className="mb-1.5 block">Relation to you</Label>
                    <Input
                      value={b.newPatient.relation}
                      onChange={(e) => b.set({ newPatient: { ...b.newPatient, relation: e.target.value } })}
                      placeholder="Son, daughter, self…"
                    />
                  </div>
                  <div>
                    <Label className="mb-1.5 block">Contact phone</Label>
                    <Input
                      value={b.newPatient.contact.phone}
                      onChange={(e) => b.set({ newPatient: { ...b.newPatient, contact: { ...b.newPatient.contact, phone: e.target.value } } })}
                      placeholder={user?.phone || '10-digit mobile'}
                    />
                  </div>
                  <div>
                    <Label className="mb-1.5 block">Contact email</Label>
                    <Input
                      value={b.newPatient.contact.email}
                      onChange={(e) => b.set({ newPatient: { ...b.newPatient, contact: { ...b.newPatient.contact, email: e.target.value } } })}
                      placeholder={user?.email || 'you@example.com'}
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <Label className="mb-1.5 block">Reason for visit</Label>
                    <Textarea
                      value={b.symptoms}
                      onChange={(e) => b.set({ symptoms: e.target.value })}
                      rows={3}
                      placeholder="Symptoms, concerns or anything the doctor should know"
                    />
                  </div>
                </div>
              </StepCard>
            )}

            {b.step === 4 && (
              <StepCard n={4} title="Fee & coupon" sub="Payment is collected at the clinic during your visit.">
                <div className="flex items-start gap-3 rounded-xl border border-brand-200 bg-brand-50/60 p-4 text-sm">
                  <Wallet className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" />
                  <div>
                    <p className="font-medium text-ink">Pay at clinic</p>
                    <p className="text-muted-foreground">Nothing to pay now. Cash, card or UPI at the front desk on the day of your visit.</p>
                  </div>
                </div>

                <div className="mt-6 rounded-xl border border-border p-4">
                  <Label className="mb-2 flex items-center gap-2"><Ticket className="h-4 w-4 text-brand-600" />Have a coupon?</Label>
                  <div className="flex gap-2">
                    <Input
                      value={b.couponCode}
                      onChange={(e) => b.set({ couponCode: e.target.value.toUpperCase() })}
                      placeholder="Enter code"
                      className="uppercase"
                    />
                    {b.couponResult ? (
                      <Button variant="outline" onClick={() => b.set({ couponResult: null, couponCode: '' })}>
                        <X className="h-4 w-4" /> Remove
                      </Button>
                    ) : (
                      <Button variant="brand" onClick={applyCoupon} disabled={!b.couponCode}>Apply</Button>
                    )}
                  </div>
                  {b.couponResult && (
                    <p className="mt-2 text-sm text-emerald-700">
                      {b.couponResult.coupon?.code} applied — you save {inr(b.couponResult.discount)}
                    </p>
                  )}
                </div>

                <div className="mt-5 rounded-xl bg-brand-50 p-4 text-sm">
                  <Row label="Consultation fee" value={inr(fee)} />
                  {discount > 0 && <Row label="Coupon discount" value={`− ${inr(discount)}`} accent />}
                  <Row label="Convenience fee" value={inr(0)} />
                  <div className="mt-2 border-t border-brand-200 pt-2">
                    <Row label="Total amount" value={inr(payable)} bold />
                  </div>
                </div>
              </StepCard>
            )}

            {b.step === 5 && (
              <StepCard n={5} title="Review & confirm" sub="Check everything before you confirm.">
                <div className="grid gap-3 sm:grid-cols-2">
                  <Review label="Doctor" value={b.doctor?.name} sub={b.doctor?.speciality?.name} />
                  <Review label="Clinic" value={b.clinic?.name} sub={b.clinic?.address?.city} />
                  <Review label="Date" value={prettyDate(b.date)} sub={b.slot ? to12h(b.slot.startTime) : ''} />
                  <Review
                    label="Patient"
                    value={b.patient?.name || b.newPatient.name}
                    sub={[b.patient?.patientId, b.patient?.gender || b.newPatient.gender].filter(Boolean).join(' · ')}
                  />
                  <Review label="Payment" value="Pay at clinic" sub={inr(payable)} />
                  <Review label="Reason" value={b.symptoms || 'Not specified'} />
                </div>

                <label className="mt-6 flex items-start gap-3 text-sm">
                  <Checkbox checked={b.agreed} onCheckedChange={(v) => b.set({ agreed: Boolean(v) })} className="mt-0.5" />
                  <span className="text-ink-soft">
                    I agree to the <Link href="/p/terms-conditions" className="text-brand-700 underline">terms &amp; conditions</Link> and the{' '}
                    <Link href="/p/refund-policy" className="text-brand-700 underline">cancellation policy</Link>.
                  </span>
                </label>

                <Button size="lg" className="mt-6 w-full" onClick={confirm} disabled={submitting || !b.agreed}>
                  {submitting ? 'Confirming…' : 'Confirm appointment'}
                </Button>
              </StepCard>
            )}

            <div className="flex items-center justify-between">
              <Button variant="outline" onClick={b.back} disabled={b.step === 1}>
                <ChevronLeft className="h-4 w-4" /> Back
              </Button>
              {b.step < 5 && (
                <Button onClick={b.next} disabled={!canContinue()}>
                  Continue <ChevronRight className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>

          {/* Summary rail */}
          <aside className="space-y-4">
            <div className="soft-card sticky top-20 p-5">
              <h2 className="font-semibold text-ink">Appointment summary</h2>

              {b.doctor ? (
                <div className="mt-4 flex items-center gap-3">
                  <DoctorPhoto name={b.doctor.name} photo={b.doctor.photo} className="h-11 w-11 rounded-xl text-sm" />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-ink">{b.doctor.name}</p>
                    <p className="truncate text-xs text-muted-foreground">{b.doctor.speciality?.name}</p>
                  </div>
                </div>
              ) : (
                <p className="mt-4 text-sm text-muted-foreground">No doctor selected yet.</p>
              )}

              <ol className="mt-5 space-y-3">
                <SummaryRow n={1} label="Doctor" value={b.doctor?.name} done={!!b.doctor} />
                <SummaryRow n={2} label="Date & time" value={b.slot ? `${prettyDate(b.date)} · ${to12h(b.slot.startTime)}` : null} done={!!b.slot} />
                <SummaryRow n={3} label="Patient" value={b.patient?.name || b.newPatient.name} done={!!(b.patient?._id || b.newPatient.name)} />
                <SummaryRow n={4} label="Payment" value="Pay at clinic" done />
              </ol>

              <div className="mt-5 flex items-center justify-between border-t border-border pt-4">
                <span className="text-sm text-muted-foreground">Total amount</span>
                <span className="text-lg font-bold text-ink">{inr(payable)}</span>
              </div>
            </div>

            <div className="soft-card flex gap-3 bg-brand-50 p-5">
              <ShieldCheck className="h-5 w-5 shrink-0 text-brand-600" />
              <div>
                <p className="text-sm font-semibold text-ink">Your information is safe</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Patient records are encrypted and only visible to your care team.
                </p>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </>
  );
}

/* ------------------------------------------------------------- pieces */

function Stepper({ step, onJump }) {
  return (
    <ol className="flex flex-wrap items-center gap-x-2 gap-y-3">
      {STEPS.map((label, i) => {
        const n = i + 1;
        const done = step > n;
        const active = step === n;
        return (
          <li key={label} className="flex items-center gap-2">
            <button
              onClick={() => onJump(n)}
              className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold transition-colors ${
                done ? 'bg-brand-600 text-white' : active ? 'bg-coral-400 text-white' : 'bg-muted text-muted-foreground'
              }`}
            >
              {done ? <Check className="h-4 w-4" /> : n}
            </button>
            <span className={`text-sm ${active ? 'font-semibold text-ink' : 'text-muted-foreground'}`}>{label}</span>
            {n < STEPS.length && <span className="mx-1 hidden h-px w-8 bg-border sm:block" />}
          </li>
        );
      })}
    </ol>
  );
}

function StepCard({ n, title, sub, children }) {
  return (
    <section className="soft-card p-6">
      <div className="mb-5 flex items-start gap-3">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-600 text-sm font-bold text-white">{n}</span>
        <div>
          <h2 className="text-lg font-bold text-ink">{title}</h2>
          <p className="text-sm text-muted-foreground">{sub}</p>
        </div>
      </div>
      {children}
    </section>
  );
}

function SlotGrids({ slots, selected, onSelect, tz }) {
  const anyPast = slots.some((s) => isSlotPast(s, tz));
  const allPast = slots.every((s) => isSlotPast(s, tz));
  const groups = [
    ['Morning', slots.filter((s) => Number(s.startTime.split(':')[0]) < 12)],
    ['Afternoon', slots.filter((s) => { const h = Number(s.startTime.split(':')[0]); return h >= 12 && h < 17; })],
    ['Evening', slots.filter((s) => Number(s.startTime.split(':')[0]) >= 17)],
  ];
  return (
    <div className="space-y-5">
      {allPast && (
        <p className="rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-800">
          All slots for this date have already passed. Please pick another date.
        </p>
      )}
      {anyPast && !allPast && (
        <p className="text-xs text-muted-foreground">Greyed-out times have already passed and can&apos;t be booked.</p>
      )}
      {groups.map(([title, list]) =>
        list.length ? (
          <div key={title}>
            <p className="mb-2 text-xs font-semibold text-ink">{title}</p>
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
              {list.map((s) => {
                const past = isSlotPast(s, tz);
                return (
                  <button
                    key={s._id}
                    type="button"
                    disabled={past}
                    title={past ? 'This time has already passed' : undefined}
                    onClick={() => !past && onSelect(s)}
                    className={`rounded-lg border px-2 py-2.5 text-xs transition-colors ${
                      past
                        ? 'cursor-not-allowed border-border bg-muted/60 text-muted-foreground line-through opacity-60'
                        : selected === s._id
                          ? 'border-brand-600 bg-brand-600 text-white'
                          : 'border-border bg-white text-ink hover:border-brand-300 hover:bg-brand-50'
                    }`}
                  >
                    {to12h(s.startTime)}
                    {past && <span className="block text-[9px] font-medium no-underline">Passed</span>}
                  </button>
                );
              })}
            </div>
          </div>
        ) : null
      )}
    </div>
  );
}

function Row({ label, value, bold, accent }) {
  return (
    <div className="flex items-center justify-between py-1">
      <span className={bold ? 'font-semibold text-ink' : 'text-muted-foreground'}>{label}</span>
      <span className={`${bold ? 'text-base font-bold text-ink' : accent ? 'text-emerald-700' : 'text-ink'}`}>{value}</span>
    </div>
  );
}

function Review({ label, value, sub }) {
  return (
    <div className="rounded-lg border border-border p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-0.5 text-sm font-medium text-ink">{value || '—'}</p>
      {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
    </div>
  );
}

function SummaryRow({ n, label, value, done }) {
  return (
    <li className="flex items-start gap-3">
      <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold ${
        done ? 'bg-brand-600 text-white' : 'bg-muted text-muted-foreground'
      }`}>
        {done ? <Check className="h-3 w-3" /> : n}
      </span>
      <span className="min-w-0">
        <span className="block text-xs text-muted-foreground">{label}</span>
        <span className="block truncate text-sm font-medium text-ink">{value || 'Not selected'}</span>
      </span>
    </li>
  );
}

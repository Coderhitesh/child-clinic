import { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Screen from '../src/components/ui/Screen';
import Header from '../src/components/ui/Header';
import Card from '../src/components/ui/Card';
import Button from '../src/components/ui/Button';
import Input from '../src/components/ui/Input';
import Chip from '../src/components/ui/Chip';
import Select from '../src/components/ui/Select';
import Avatar from '../src/components/ui/Avatar';
import { Loader } from '../src/components/ui/States';
import { useToast } from '../src/components/ui/Toast';
import { Row } from '../src/components/app/cards';
import GuestVerify from '../src/components/app/GuestVerify';
import {
  specialityApi, doctorApi, clinicApi, slotApi, patientApi,
  appointmentApi, couponApi, paymentModeApi,
} from '../src/services';
import { useAuthStore } from '../src/store/authStore';
import { openCheckout } from '../src/lib/razorpay';
import { useBookingStore } from '../src/store/bookingStore';
import { colors, font, radius, shadow } from '../src/lib/theme';
import { GENDERS, PAYMENT_METHODS } from '../src/lib/constants';
import {
  inr, to12h, prettyDate, shortDate, weekdayShort, nextDays, idOf, titleCase, getErr,
} from '../src/lib/utils';

const STEPS = ['Doctor', 'Time', 'Patient', 'Payment', 'Review'];

export default function BookScreen() {
  const router = useRouter();
  const toast = useToast();
  const user = useAuthStore((s) => s.user);
  const b = useBookingStore();

  const [specialities, setSpecialities] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [clinics, setClinics] = useState([]);
  const [patients, setPatients] = useState([]);
  const [slots, setSlots] = useState([]);
  const [modes, setModes] = useState({ payAtClinicEnabled: true, payOnlineEnabled: true });
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [checkingCoupon, setCheckingCoupon] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [ready, setReady] = useState(false);

  const days = useMemo(() => nextDays(10), []);

  useEffect(() => {
    Promise.all([
      specialityApi.list().catch(() => []),
      doctorApi.list().catch(() => []),
      clinicApi.list().catch(() => []),
      user ? patientApi.list().catch(() => []) : Promise.resolve([]),
    ])
      .then(([sp, dc, cl, pt]) => {
        setSpecialities(sp || []);
        setDoctors(dc || []);
        setClinics(cl || []);
        setPatients(pt || []);
      })
      .finally(() => setReady(true));
  }, [user]);

  useEffect(() => {
    const clinicId = idOf(b.clinic);
    if (!clinicId) return;
    paymentModeApi.get(clinicId).then((m) => m && setModes(m)).catch(() => {});
  }, [b.clinic]);

  useEffect(() => {
    const clinicId = idOf(b.clinic);
    const doctorId = idOf(b.doctor);
    if (!clinicId || !doctorId || !b.date) { setSlots([]); return; }
    setLoadingSlots(true);
    slotApi.availability({ clinicId, doctorId, date: b.date })
      .then((s) => setSlots(s || []))
      .catch(() => setSlots([]))
      .finally(() => setLoadingSlots(false));
  }, [b.clinic, b.doctor, b.date]);

  const onVerified = async () => {
    const list = await patientApi.list().catch(() => []);
    setPatients(list || []);
  };

  const doctorsFiltered = doctors.filter(
    (d) => !b.speciality || idOf(d.speciality) === idOf(b.speciality)
  );
  const doctorClinics = (b.doctor?.clinics || []).map((c) =>
    typeof c === 'object' && c.name ? c : clinics.find((x) => x._id === idOf(c)) || null
  ).filter(Boolean);

  const applyCoupon = async () => {
    if (!b.couponCode.trim()) return;
    setCheckingCoupon(true);
    try {
      const res = await couponApi.validate({
        code: b.couponCode.trim().toUpperCase(),
        amount: b.fee(),
        clinicId: idOf(b.clinic),
        specialityId: idOf(b.speciality) || idOf(b.doctor?.speciality),
      });
      b.set({ couponResult: res });
      toast.show(`Coupon applied — you save ${inr(res.discount)}`, 'success');
    } catch (e) {
      b.set({ couponResult: null });
      toast.show(getErr(e), 'error');
    } finally {
      setCheckingCoupon(false);
    }
  };

  const buildPatient = () => {
    if (b.patient?._id) return { _id: b.patient._id };
    const np = b.newPatient;
    return {
      name: np.name,
      dob: np.dob || undefined,
      gender: np.gender || undefined,
      contact: {
        phone: np.contact.phone || user?.phone,
        email: np.contact.email || user?.email,
      },
      guardianDetails: {
        name: np.guardianDetails.name || user?.name,
        relation: np.guardianDetails.relation,
        phone: np.guardianDetails.phone || user?.phone,
      },
    };
  };

  const confirm = async () => {
    if (!b.agreed) return toast.show('Please accept the terms to continue', 'error');
    setSubmitting(true);
    try {
      const res = await appointmentApi.book({
        specialityId: idOf(b.speciality) || idOf(b.doctor?.speciality),
        clinicId: idOf(b.clinic),
        doctorId: idOf(b.doctor),
        slotId: idOf(b.slot),
        patient: buildPatient(),
        paymentMethod: b.paymentMethod,
        symptoms: b.symptoms || undefined,
        couponCode: b.couponResult ? b.couponCode.trim().toUpperCase() : undefined,
      });

      const appointmentId = res.appointment?._id || res._id;

      if (b.paymentMethod === 'pay_online' && res.order) {
        const out = await openCheckout({
          order: res.order,
          amount: res.payableAmount ?? b.payable(),
          user,
          patient: b.patient || b.newPatient,
          description: `Consultation with ${b.doctor?.name || ''}`,
        });
        // the webhook is what confirms the booking, so the app only reports back
        if (out.ok) toast.show('Payment submitted — confirming your slot', 'success');
        else if (out.reason === 'cancelled') {
          toast.show('Payment cancelled — your slot is held for a short while', 'info');
        } else {
          toast.show(out.message, 'error');
        }
      } else {
        toast.show('Appointment booked', 'success');
      }

      b.reset();
      router.replace(`/appointment/${appointmentId}`);
    } catch (e) {
      toast.show(getErr(e), 'error');
    } finally {
      setSubmitting(false);
    }
    return undefined;
  };

  const canContinue = () => {
    if (b.step === 1) return Boolean(b.doctor && b.clinic);
    if (b.step === 2) return Boolean(b.date && b.slot);
    if (b.step === 3) return Boolean(user) && Boolean(b.patient?._id || b.newPatient.name);
    if (b.step === 4) return Boolean(b.paymentMethod);
    return true;
  };

  if (!ready) return <Loader label="Setting up your booking" />;

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <Header title="Book an appointment" subtitle={`Step ${b.step} of 5 · ${STEPS[b.step - 1]}`} />

      <View style={styles.progress}>
        {STEPS.map((s, i) => (
          <View key={s} style={[styles.progressBar, i < b.step && { backgroundColor: colors.brand500 }]} />
        ))}
      </View>

      <Screen
        contentStyle={{ paddingTop: 12, gap: 14 }}
        footer={
          <View style={styles.bar}>
            {b.step > 1 && <Button title="Back" variant="outline" onPress={b.back} />}
            <View style={{ flex: 1 }}>
              <Text style={font.small}>Payable</Text>
              <Text style={{ fontSize: 17, fontWeight: '800', color: colors.ink }}>{inr(b.payable())}</Text>
            </View>
            {b.step < 5 ? (
              <Button
                title="Continue"
                onPress={() => (canContinue() ? b.next() : toast.show('Finish this step first', 'error'))}
                size="lg"
              />
            ) : (
              <Button title="Confirm booking" onPress={confirm} loading={submitting} size="lg" />
            )}
          </View>
        }
      >
        {/* ---------------------------------------------------- 1. doctor */}
        {b.step === 1 && (
          <>
            <Card>
              <Text style={font.h3}>Speciality</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingVertical: 12 }}>
                <Chip label="All" active={!b.speciality} onPress={() => b.pickSpeciality(null)} />
                {specialities.map((s) => (
                  <Chip
                    key={s._id}
                    label={s.name}
                    active={idOf(b.speciality) === s._id}
                    onPress={() => b.pickSpeciality(s)}
                  />
                ))}
              </ScrollView>
            </Card>

            <Text style={font.h3}>Choose a doctor</Text>
            {doctorsFiltered.map((d) => {
              const active = idOf(b.doctor) === d._id;
              return (
                <Card key={d._id} onPress={() => b.pickDoctor(d)} style={active && styles.selected}>
                  <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
                    <Avatar name={d.name} uri={d.photo} size={48} />
                    <View style={{ flex: 1 }}>
                      <Text style={font.h3}>{d.name}</Text>
                      <Text style={font.small}>{d.speciality?.name} · {d.experienceYears || 0} yrs</Text>
                    </View>
                    <Text style={{ fontWeight: '800', color: colors.ink }}>{inr(d.consultationFee)}</Text>
                  </View>
                </Card>
              );
            })}

            {!!b.doctor && (
              <Card>
                <Text style={font.h3}>Which clinic?</Text>
                <View style={{ gap: 8, marginTop: 10 }}>
                  {doctorClinics.map((c) => (
                    <Pressable
                      key={c._id}
                      onPress={() => b.pickClinic(c)}
                      style={[styles.option, idOf(b.clinic) === c._id && styles.optionActive]}
                    >
                      <Ionicons
                        name={idOf(b.clinic) === c._id ? 'radio-button-on' : 'radio-button-off'}
                        size={18}
                        color={idOf(b.clinic) === c._id ? colors.brand600 : colors.muted}
                      />
                      <View style={{ flex: 1 }}>
                        <Text style={font.label}>{c.name}</Text>
                        {!!c.address && (
                          <Text style={font.small} numberOfLines={1}>
                            {[c.address.line1, c.address.city].filter(Boolean).join(', ')}
                          </Text>
                        )}
                      </View>
                    </Pressable>
                  ))}
                  {doctorClinics.length === 0 && (
                    <Text style={font.small}>This doctor has no clinic listed yet.</Text>
                  )}
                </View>
              </Card>
            )}
          </>
        )}

        {/* ------------------------------------------------------ 2. time */}
        {b.step === 2 && (
          <>
            <Card>
              <Text style={font.h3}>Pick a day</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingVertical: 12 }}>
                {days.map((d) => {
                  const active = d === b.date;
                  return (
                    <Pressable
                      key={d}
                      onPress={() => b.pickDate(d)}
                      style={[styles.day, active && { backgroundColor: colors.brand500, borderColor: colors.brand500 }]}
                    >
                      <Text style={{ fontSize: 11, fontWeight: '700', color: active ? '#d2f4ef' : colors.muted }}>
                        {weekdayShort(d)}
                      </Text>
                      <Text style={{ fontSize: 15, fontWeight: '800', marginTop: 2, color: active ? colors.white : colors.ink }}>
                        {shortDate(d)}
                      </Text>
                    </Pressable>
                  );
                })}
              </ScrollView>
            </Card>

            <Card>
              <Text style={font.h3}>Free slots {b.date ? `on ${prettyDate(b.date)}` : ''}</Text>
              {loadingSlots ? (
                <Loader />
              ) : slots.length === 0 ? (
                <Text style={[font.small, { marginTop: 10 }]}>
                  Nothing free on this day. Try another date.
                </Text>
              ) : (
                <View style={styles.slotGrid}>
                  {slots.map((s) => (
                    <Chip
                      key={s._id}
                      label={to12h(s.startTime)}
                      active={idOf(b.slot) === s._id}
                      onPress={() => b.pickSlot(s)}
                    />
                  ))}
                </View>
              )}
            </Card>
          </>
        )}

        {/* --------------------------------------------------- 3. patient */}
        {b.step === 3 && (
          <>
            {!user && <GuestVerify onVerified={onVerified} />}

            {!!user && patients.length > 0 && (
              <Card>
                <Text style={font.h3}>Existing patient</Text>
                <View style={{ gap: 8, marginTop: 10 }}>
                  {patients.map((p) => (
                    <Pressable
                      key={p._id}
                      onPress={() => b.set({ patient: p })}
                      style={[styles.option, b.patient?._id === p._id && styles.optionActive]}
                    >
                      <Avatar name={p.name} size={34} />
                      <View style={{ flex: 1 }}>
                        <Text style={font.label}>{p.name}</Text>
                        <Text style={font.small}>
                          {[p.age ? `${p.age} yrs` : null, p.gender && titleCase(p.gender)].filter(Boolean).join(' · ') || '—'}
                        </Text>
                      </View>
                      {b.patient?._id === p._id && <Ionicons name="checkmark-circle" size={20} color={colors.brand600} />}
                    </Pressable>
                  ))}
                </View>
              </Card>
            )}

            <Card style={!user && { opacity: 0.45 }}>
              <Text style={font.h3}>{patients.length ? 'Or someone new' : 'Who is this visit for?'}</Text>
              <View style={{ gap: 12, marginTop: 12 }} pointerEvents={user ? 'auto' : 'none'}>
                <Input
                  label="Full name"
                  value={b.newPatient.name}
                  onChangeText={(v) => b.set({ newPatient: { ...b.newPatient, name: v }, patient: null })}
                  placeholder="Patient name"
                />
                <Select
                  label="Gender"
                  value={b.newPatient.gender}
                  onChange={(v) => b.set({ newPatient: { ...b.newPatient, gender: v } })}
                  options={GENDERS.map((g) => ({ value: g, label: titleCase(g) }))}
                  placeholder="Select"
                />
                <Input
                  label="Mobile"
                  value={b.newPatient.contact.phone}
                  onChangeText={(v) => b.set({ newPatient: { ...b.newPatient, contact: { ...b.newPatient.contact, phone: v } } })}
                  keyboardType="phone-pad"
                  placeholder={user?.phone || '98XXXXXXXX'}
                />
                <Input
                  label="Reason for the visit"
                  value={b.symptoms}
                  onChangeText={(v) => b.set({ symptoms: v })}
                  placeholder="Fever for three days, sore throat…"
                  multiline
                />
              </View>
            </Card>
          </>
        )}

        {/* --------------------------------------------------- 4. payment */}
        {b.step === 4 && (
          <>
            <Card>
              <Text style={font.h3}>How would you like to pay?</Text>
              <View style={{ gap: 10, marginTop: 12 }}>
                {PAYMENT_METHODS.filter((m) =>
                  m.value === 'pay_online' ? modes.payOnlineEnabled : modes.payAtClinicEnabled
                ).map((m) => (
                  <Pressable
                    key={m.value}
                    onPress={() => b.set({ paymentMethod: m.value })}
                    style={[styles.option, b.paymentMethod === m.value && styles.optionActive]}
                  >
                    <Ionicons
                      name={m.value === 'pay_online' ? 'card-outline' : 'wallet-outline'}
                      size={20}
                      color={b.paymentMethod === m.value ? colors.brand600 : colors.muted}
                    />
                    <View style={{ flex: 1 }}>
                      <Text style={font.label}>{m.label}</Text>
                      <Text style={font.small}>{m.hint}</Text>
                    </View>
                  </Pressable>
                ))}
              </View>
            </Card>

            <Card>
              <Text style={font.h3}>Have a coupon?</Text>
              {b.couponResult ? (
                <View style={styles.couponOn}>
                  <Text style={{ color: colors.success, fontWeight: '700' }}>
                    {b.couponCode.toUpperCase()} · {inr(b.couponResult.discount)} off
                  </Text>
                  <Pressable onPress={() => b.set({ couponResult: null, couponCode: '' })} hitSlop={8}>
                    <Ionicons name="close" size={18} color={colors.muted} />
                  </Pressable>
                </View>
              ) : (
                <View style={{ flexDirection: 'row', gap: 10, alignItems: 'flex-end', marginTop: 10 }}>
                  <Input
                    value={b.couponCode}
                    onChangeText={(v) => b.set({ couponCode: v })}
                    placeholder="FIRSTVISIT"
                    autoCapitalize="characters"
                    style={{ flex: 1 }}
                  />
                  <Button title="Apply" variant="outline" onPress={applyCoupon} loading={checkingCoupon} />
                </View>
              )}
            </Card>

            <Card>
              <Row label="Consultation" value={inr(b.fee())} />
              {!!b.couponResult?.discount && (
                <Row label="Discount" value={`− ${inr(b.couponResult.discount)}`} />
              )}
              <Row label="Payable now" value={b.paymentMethod === 'pay_online' ? inr(b.payable()) : '₹0'} />
              <Row label="Total" value={inr(b.payable())} last />
            </Card>
          </>
        )}

        {/* ---------------------------------------------------- 5. review */}
        {b.step === 5 && (
          <>
            <Card>
              <Text style={font.h3}>Review your booking</Text>
              <View style={{ marginTop: 8 }}>
                <Row label="Doctor" value={b.doctor?.name} />
                <Row label="Speciality" value={b.speciality?.name || b.doctor?.speciality?.name} />
                <Row label="Clinic" value={b.clinic?.name} />
                <Row label="When" value={`${prettyDate(b.date)} · ${to12h(b.slot?.startTime)}`} />
                <Row label="Patient" value={b.patient?.name || b.newPatient.name} />
                <Row label="Payment" value={b.paymentMethod === 'pay_online' ? 'Online' : 'At the clinic'} />
                <Row label="Total" value={inr(b.payable())} last />
              </View>
            </Card>

            <Pressable style={styles.agree} onPress={() => b.set({ agreed: !b.agreed })}>
              <Ionicons
                name={b.agreed ? 'checkbox' : 'square-outline'}
                size={20}
                color={b.agreed ? colors.brand600 : colors.muted}
              />
              <Text style={[font.body, { flex: 1 }]}>
                I confirm the details are correct and accept the clinic&apos;s terms and cancellation policy.
              </Text>
            </Pressable>

            <Text style={[font.small, { textAlign: 'center' }]}>
              You can reschedule or cancel from the visit screen.
            </Text>
          </>
        )}
      </Screen>
    </View>
  );
}

const styles = StyleSheet.create({
  progress: { flexDirection: 'row', gap: 4, paddingHorizontal: 16, paddingBottom: 4 },
  progressBar: { flex: 1, height: 4, borderRadius: 2, backgroundColor: colors.border },
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 16,
    paddingBottom: 26,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    ...shadow,
  },
  selected: { borderColor: colors.brand500, backgroundColor: colors.brand50 },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
  },
  optionActive: { borderColor: colors.brand500, backgroundColor: colors.brand50 },
  day: {
    width: 62,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
  },
  slotGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 },
  couponOn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
    padding: 12,
    borderRadius: radius.md,
    backgroundColor: colors.successSoft,
  },
  agree: { flexDirection: 'row', gap: 10, alignItems: 'flex-start', paddingHorizontal: 4 },
});

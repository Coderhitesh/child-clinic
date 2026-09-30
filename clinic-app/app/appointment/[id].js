import { useCallback, useEffect, useState } from 'react';
import { Alert, Linking, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Screen from '../../src/components/ui/Screen';
import Header from '../../src/components/ui/Header';
import Card from '../../src/components/ui/Card';
import Button from '../../src/components/ui/Button';
import Chip from '../../src/components/ui/Chip';
import Input from '../../src/components/ui/Input';
import { StatusBadge } from '../../src/components/ui/Badge';
import { ErrorState, Loader } from '../../src/components/ui/States';
import { useToast } from '../../src/components/ui/Toast';
import { Row } from '../../src/components/app/cards';
import { appointmentApi, slotApi, prescriptionApi, paymentApi } from '../../src/services';
import { openCheckout } from '../../src/lib/razorpay';
import { useAuthStore } from '../../src/store/authStore';
import { colors, font, radius } from '../../src/lib/theme';
import {
  inr, prettyDate, prettyDateTime, to12h, toDateKey, nextDays, weekdayShort, shortDate, idOf, getErr,
} from '../../src/lib/utils';

export default function AppointmentScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const toast = useToast();

  const user = useAuthStore((s) => s.user);
  const [appt, setAppt] = useState(null);
  const [prescription, setPrescription] = useState(null);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [busy, setBusy] = useState(false);

  const [rescheduleOpen, setRescheduleOpen] = useState(false);
  const [date, setDate] = useState('');
  const [slots, setSlots] = useState([]);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [reason, setReason] = useState('');

  const load = useCallback(async () => {
    try {
      const a = await appointmentApi.get(id);
      setAppt(a);
      if (a?.prescription) {
        prescriptionApi.get(idOf(a.prescription)).then(setPrescription).catch(() => {});
      }
    } catch (e) {
      setError(getErr(e));
    }
  }, [id]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if (!rescheduleOpen || !date || !appt) return;
    slotApi.availability({ clinicId: idOf(appt.clinic), doctorId: idOf(appt.doctor), date })
      .then((s) => setSlots(s || []))
      .catch(() => setSlots([]));
  }, [rescheduleOpen, date, appt]);

  const refresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const doCancel = async () => {
    setBusy(true);
    try {
      await appointmentApi.cancel(id, reason);
      toast.show('Appointment cancelled', 'success');
      setCancelOpen(false);
      await load();
    } catch (e) {
      toast.show(getErr(e), 'error');
    } finally {
      setBusy(false);
    }
  };

  const doReschedule = async (slotId) => {
    setBusy(true);
    try {
      await appointmentApi.reschedule(id, slotId);
      toast.show('Appointment moved', 'success');
      setRescheduleOpen(false);
      await load();
    } catch (e) {
      toast.show(getErr(e), 'error');
    } finally {
      setBusy(false);
    }
  };

  const payNow = async () => {
    setBusy(true);
    try {
      const payment = await paymentApi.byAppointment(id);
      const order = payment?.order || (payment?.gatewayOrderId
        ? { id: payment.gatewayOrderId, amount: (payment.amount || 0) * 100, currency: 'INR' }
        : null);
      if (!order) {
        toast.show('No pending online payment for this visit', 'info');
        return;
      }
      const out = await openCheckout({
        order,
        amount: payment.amount,
        user,
        patient: appt.patient,
        description: `Consultation with ${appt.doctor?.name || ''}`,
      });
      if (out.ok) {
        toast.show('Payment submitted — confirming', 'success');
        await load();
      } else if (out.reason !== 'cancelled') {
        toast.show(out.message, 'error');
      }
    } catch (e) {
      toast.show(getErr(e), 'error');
    } finally {
      setBusy(false);
    }
  };

  if (error) return <ErrorState message={error} onRetry={load} />;
  if (!appt) return <Loader label="Loading your visit" />;

  const changeable = ['pending', 'confirmed'].includes(appt.status) && appt.date >= toDateKey(new Date());
  const awaitingPayment = appt.paymentMethod === 'pay_online' && ['pending', 'failed'].includes(appt.payment?.status);
  const address = appt.clinic?.address || {};

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <Header title="Your visit" subtitle={`${prettyDate(appt.date)} · ${to12h(appt.startTime)}`} />
      <Screen refreshing={refreshing} onRefresh={refresh} contentStyle={{ gap: 14, paddingTop: 4 }}>
        <Card>
          <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 12 }}>
            <View style={{ flex: 1 }}>
              <Text style={font.h2}>{appt.doctor?.name}</Text>
              <Text style={font.body}>{appt.speciality?.name}</Text>
            </View>
            <StatusBadge value={appt.status} />
          </View>

          <View style={{ marginTop: 12 }}>
            <Row label="Patient" value={appt.patient?.name} />
            <Row label="When" value={`${prettyDate(appt.date)}, ${to12h(appt.startTime)} – ${to12h(appt.endTime)}`} />
            <Row label="Clinic" value={appt.clinic?.name} />
            {!!appt.symptoms && <Row label="Reason" value={appt.symptoms} />}
            {!!appt.diagnosis && <Row label="Diagnosis" value={appt.diagnosis} />}
            {!!appt.followUpDate && <Row label="Follow-up" value={prettyDate(appt.followUpDate)} last />}
          </View>
        </Card>

        <Card>
          <Text style={font.h3}>Getting there</Text>
          <Text style={[font.body, { marginTop: 6 }]}>
            {[address.line1, address.line2, address.city, address.pincode].filter(Boolean).join(', ') || 'Address on request'}
          </Text>
          <View style={{ flexDirection: 'row', gap: 10, marginTop: 12 }}>
            {!!appt.clinic?.phone && (
              <Button
                title="Call clinic"
                variant="outline"
                size="sm"
                icon={<Ionicons name="call-outline" size={15} color={colors.ink} />}
                onPress={() => Linking.openURL(`tel:${appt.clinic.phone}`)}
              />
            )}
            <Button
              title="Directions"
              variant="outline"
              size="sm"
              icon={<Ionicons name="navigate-outline" size={15} color={colors.ink} />}
              onPress={() =>
                Linking.openURL(
                  `https://maps.google.com/?q=${encodeURIComponent(
                    `${appt.clinic?.name} ${[address.line1, address.city].filter(Boolean).join(' ')}`
                  )}`
                )
              }
            />
          </View>
        </Card>

        <Card>
          <Text style={font.h3}>Payment</Text>
          <View style={{ marginTop: 8 }}>
            <Row label="Consultation" value={inr(appt.consultationFee)} />
            {!!appt.discountAmount && (
              <Row label={`Discount ${appt.couponCode ? `(${appt.couponCode})` : ''}`} value={`− ${inr(appt.discountAmount)}`} />
            )}
            <Row label="Total" value={inr(appt.payableAmount ?? appt.consultationFee)} />
            <Row
              label={appt.paymentMethod === 'pay_online' ? 'Paid online' : 'Pay at clinic'}
              value={appt.payment?.status ? appt.payment.status.replace(/_/g, ' ') : 'pending'}
              last
            />
          </View>
          {awaitingPayment && (
            <Button title="Pay now" onPress={payNow} loading={busy} full style={{ marginTop: 12 }} />
          )}
        </Card>

        {!!prescription && (
          <Card>
            <Text style={font.h3}>Prescription</Text>
            {!!prescription.diagnosis && <Text style={[font.body, { marginTop: 6 }]}>{prescription.diagnosis}</Text>}
            <View style={{ marginTop: 10, gap: 8 }}>
              {(prescription.medicines || []).map((m, i) => (
                <View key={i} style={styles.medicine}>
                  <Text style={font.label}>{m.name}</Text>
                  <Text style={font.small}>
                    {[m.dosage, m.frequency, m.durationDays && `${m.durationDays} days`].filter(Boolean).join(' · ')}
                    {m.instructions ? ` — ${m.instructions}` : ''}
                  </Text>
                </View>
              ))}
            </View>
            {!!prescription.generalInstructions && (
              <Text style={[font.body, { marginTop: 10 }]}>{prescription.generalInstructions}</Text>
            )}
            <Text style={[font.small, { marginTop: 10 }]}>Issued {prettyDateTime(prescription.createdAt)}</Text>
            {!!prescription.pdfUrl && (
              <Button
                title="Open PDF"
                variant="outline"
                size="sm"
                onPress={() => Linking.openURL(prescription.pdfUrl)}
                style={{ marginTop: 12 }}
              />
            )}
          </Card>
        )}

        {changeable && (
          <Card>
            <Text style={font.h3}>Need a change?</Text>
            <View style={{ gap: 10, marginTop: 12 }}>
              <Button
                title="Reschedule"
                variant="outline"
                full
                onPress={() => { setDate(appt.date); setRescheduleOpen(true); }}
              />
              <Button
                title="Cancel this visit"
                variant="danger"
                full
                onPress={() =>
                  Alert.alert('Cancel this visit?', 'The slot goes back to the clinic straight away.', [
                    { text: 'Keep it', style: 'cancel' },
                    { text: 'Cancel visit', style: 'destructive', onPress: () => setCancelOpen(true) },
                  ])
                }
              />
            </View>
            <Text style={[font.small, { marginTop: 10 }]}>
              Online payments are refunded to the original method once the clinic approves.
            </Text>
          </Card>
        )}
      </Screen>

      {/* reschedule sheet */}
      <Modal visible={rescheduleOpen} transparent animationType="slide" onRequestClose={() => setRescheduleOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setRescheduleOpen(false)}>
          <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
            <Text style={font.h2}>Move this appointment</Text>
            <Text style={[font.small, { marginTop: 2 }]}>Pick another free slot with {appt.doctor?.name}.</Text>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingVertical: 14 }}>
              {nextDays(10).map((d) => (
                <Pressable
                  key={d}
                  onPress={() => setDate(d)}
                  style={[styles.day, d === date && { backgroundColor: colors.brand500, borderColor: colors.brand500 }]}
                >
                  <Text style={{ fontSize: 11, fontWeight: '700', color: d === date ? '#d2f4ef' : colors.muted }}>
                    {weekdayShort(d)}
                  </Text>
                  <Text style={{ fontSize: 15, fontWeight: '800', color: d === date ? colors.white : colors.ink }}>
                    {shortDate(d)}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>

            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, minHeight: 60 }}>
              {slots.map((s) => (
                <Chip key={s._id} label={to12h(s.startTime)} onPress={() => doReschedule(s._id)} disabled={busy} />
              ))}
              {slots.length === 0 && <Text style={font.small}>No free slots on this day.</Text>}
            </View>

            <Button title="Close" variant="outline" full onPress={() => setRescheduleOpen(false)} style={{ marginTop: 14 }} />
          </Pressable>
        </Pressable>
      </Modal>

      {/* cancel sheet */}
      <Modal visible={cancelOpen} transparent animationType="slide" onRequestClose={() => setCancelOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setCancelOpen(false)}>
          <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
            <Text style={font.h2}>Cancel this visit</Text>
            <Input
              label="Reason (optional)"
              value={reason}
              onChangeText={setReason}
              placeholder="Something came up"
              multiline
              style={{ marginTop: 12 }}
            />
            <View style={{ flexDirection: 'row', gap: 10, marginTop: 16 }}>
              <Button title="Keep it" variant="outline" onPress={() => setCancelOpen(false)} />
              <Button title="Cancel visit" variant="danger" onPress={doCancel} loading={busy} />
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  medicine: {
    padding: 10,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.bg,
  },
  backdrop: { flex: 1, backgroundColor: 'rgba(15,61,86,0.35)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: colors.white,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    padding: 20,
    paddingBottom: 32,
  },
  day: {
    width: 62,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
});

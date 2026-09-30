import { useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Screen from '../../src/components/ui/Screen';
import Header from '../../src/components/ui/Header';
import Card from '../../src/components/ui/Card';
import Avatar from '../../src/components/ui/Avatar';
import Button from '../../src/components/ui/Button';
import Chip from '../../src/components/ui/Chip';
import { Badge } from '../../src/components/ui/Badge';
import { ErrorState, Loader } from '../../src/components/ui/States';
import { Row } from '../../src/components/app/cards';
import { doctorApi, clinicApi, slotApi } from '../../src/services';
import { useBookingStore } from '../../src/store/bookingStore';
import { colors, font, radius, shadow } from '../../src/lib/theme';
import { inr, to12h, nextDays, weekdayShort, idOf, getErr, shortDate } from '../../src/lib/utils';

export default function DoctorScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const booking = useBookingStore();

  const [doctor, setDoctor] = useState(null);
  const [clinics, setClinics] = useState([]);
  const [clinicId, setClinicId] = useState('');
  const [date, setDate] = useState(nextDays(1)[0]);
  const [slots, setSlots] = useState([]);
  const [slotId, setSlotId] = useState('');
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [error, setError] = useState('');

  const days = useMemo(() => nextDays(7), []);

  useEffect(() => {
    Promise.all([doctorApi.get(id), clinicApi.list().catch(() => [])])
      .then(([d, cl]) => {
        setDoctor(d);
        setClinics(cl || []);
        const first = (d?.clinics || [])[0];
        setClinicId(idOf(first));
      })
      .catch((e) => setError(getErr(e)));
  }, [id]);

  useEffect(() => {
    if (!clinicId || !date) return;
    setLoadingSlots(true);
    setSlotId('');
    slotApi.availability({ clinicId, doctorId: id, date })
      .then((s) => setSlots(s || []))
      .catch(() => setSlots([]))
      .finally(() => setLoadingSlots(false));
  }, [clinicId, date, id]);

  if (error) return <ErrorState message={error} />;
  if (!doctor) return <Loader label="Loading profile" />;

  const doctorClinics = (doctor.clinics || []).map((c) =>
    typeof c === 'object' ? c : clinics.find((x) => x._id === c) || { _id: c, name: 'Clinic' }
  );
  const clinic = doctorClinics.find((c) => c._id === clinicId);
  const slot = slots.find((s) => s._id === slotId);

  const proceed = () => {
    booking.reset();
    booking.set({
      speciality: doctor.speciality,
      doctor,
      clinic: clinic || null,
      date,
      slot: slot || null,
      step: slot ? 3 : 2,
    });
    router.push('/book');
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <Header title={doctor.name} subtitle={doctor.speciality?.name} />
      <Screen
        contentStyle={{ paddingTop: 4 }}
        footer={
          <View style={styles.bar}>
            <View style={{ flex: 1 }}>
              <Text style={font.small}>Consultation</Text>
              <Text style={{ fontSize: 18, fontWeight: '800', color: colors.ink }}>
                {inr(doctor.consultationFee)}
              </Text>
            </View>
            <Button
              title={slot ? `Book ${to12h(slot.startTime)}` : 'Choose a time'}
              onPress={proceed}
              size="lg"
            />
          </View>
        }
      >
        <Card>
          <View style={{ flexDirection: 'row', gap: 14 }}>
            <Avatar name={doctor.name} uri={doctor.photo} size={68} />
            <View style={{ flex: 1 }}>
              <Text style={font.h2}>{doctor.name}</Text>
              <Text style={font.body}>{doctor.qualification || doctor.speciality?.name}</Text>
              <View style={{ flexDirection: 'row', gap: 8, marginTop: 8 }}>
                <Badge label={`${doctor.experienceYears || 0} yrs experience`} />
                {!!doctor.speciality?.name && (
                  <Badge label={doctor.speciality.name} bg={colors.coralSoft} fg={colors.coral} />
                )}
              </View>
            </View>
          </View>

          {!!doctor.about && (
            <Text style={[font.body, { marginTop: 14, lineHeight: 21 }]}>{doctor.about}</Text>
          )}
        </Card>

        <Card style={{ marginTop: 14 }}>
          <Text style={font.h3}>Works at</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingVertical: 10 }}>
            {doctorClinics.map((c) => (
              <Chip key={c._id} label={c.name} active={clinicId === c._id} onPress={() => setClinicId(c._id)} />
            ))}
          </ScrollView>
          {!!clinic?.address && (
            <View style={{ flexDirection: 'row', gap: 6, marginTop: 2 }}>
              <Ionicons name="location-outline" size={14} color={colors.muted} />
              <Text style={[font.small, { flex: 1 }]}>
                {[clinic.address.line1, clinic.address.city, clinic.address.pincode].filter(Boolean).join(', ')}
              </Text>
            </View>
          )}
        </Card>

        <Card style={{ marginTop: 14 }}>
          <Text style={font.h3}>Pick a day</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingVertical: 12 }}>
            {days.map((d) => {
              const active = d === date;
              return (
                <View key={d} style={[styles.day, active && { backgroundColor: colors.brand500, borderColor: colors.brand500 }]}>
                  <Text
                    onPress={() => setDate(d)}
                    style={{ textAlign: 'center', fontSize: 11, fontWeight: '700', color: active ? '#d2f4ef' : colors.muted }}
                  >
                    {weekdayShort(d)}
                  </Text>
                  <Text
                    onPress={() => setDate(d)}
                    style={{ textAlign: 'center', fontSize: 15, fontWeight: '800', marginTop: 2, color: active ? colors.white : colors.ink }}
                  >
                    {shortDate(d)}
                  </Text>
                </View>
              );
            })}
          </ScrollView>

          <Text style={[font.h3, { marginTop: 6 }]}>Free slots</Text>
          {loadingSlots ? (
            <Loader />
          ) : slots.length === 0 ? (
            <Text style={[font.small, { marginTop: 10 }]}>
              No free slots on this day. Try another date or clinic.
            </Text>
          ) : (
            <View style={styles.slotGrid}>
              {slots.map((s) => (
                <Chip
                  key={s._id}
                  label={to12h(s.startTime)}
                  active={slotId === s._id}
                  onPress={() => setSlotId(slotId === s._id ? '' : s._id)}
                />
              ))}
            </View>
          )}
        </Card>

        <Card style={{ marginTop: 14, marginBottom: 8 }}>
          <Text style={[font.h3, { marginBottom: 4 }]}>At a glance</Text>
          <Row label="Speciality" value={doctor.speciality?.name} />
          <Row label="Experience" value={`${doctor.experienceYears || 0} years`} />
          <Row label="Qualification" value={doctor.qualification} />
          <Row label="Consultation fee" value={inr(doctor.consultationFee)} last />
        </Card>
      </Screen>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    paddingBottom: 26,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    ...shadow,
  },
  day: {
    width: 62,
    paddingVertical: 10,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
  },
  slotGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 },
});

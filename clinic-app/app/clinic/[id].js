import { useEffect, useState } from 'react';
import { Linking, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Screen from '../../src/components/ui/Screen';
import Header from '../../src/components/ui/Header';
import Card from '../../src/components/ui/Card';
import Button from '../../src/components/ui/Button';
import { Badge } from '../../src/components/ui/Badge';
import { ErrorState, Loader } from '../../src/components/ui/States';
import { DoctorCard, Row, SectionHead } from '../../src/components/app/cards';
import { clinicApi, doctorApi } from '../../src/services';
import { colors, font } from '../../src/lib/theme';
import { getErr, idOf, to12h } from '../../src/lib/utils';

export default function ClinicScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [clinic, setClinic] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([clinicApi.get(id), doctorApi.list().catch(() => [])])
      .then(([c, d]) => {
        setClinic(c);
        setDoctors((d || []).filter((doc) => (doc.clinics || []).some((x) => idOf(x) === id)));
      })
      .catch((e) => setError(getErr(e)));
  }, [id]);

  if (error) return <ErrorState message={error} />;
  if (!clinic) return <Loader label="Loading clinic" />;

  const a = clinic.address || {};
  const line = [a.line1, a.line2, a.city, a.state, a.pincode].filter(Boolean).join(', ');

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <Header title={clinic.name} subtitle={a.city} />
      <Screen contentStyle={{ paddingTop: 4 }}>
        <Card>
          <Text style={font.h2}>{clinic.name}</Text>
          <Text style={[font.body, { marginTop: 6 }]}>{line || 'Address on request'}</Text>

          <View style={{ marginTop: 12 }}>
            {!!clinic.timings?.openTime && (
              <Row label="Open" value={`${to12h(clinic.timings.openTime)} – ${to12h(clinic.timings.closeTime)}`} />
            )}
            {!!clinic.phone && <Row label="Phone" value={clinic.phone} />}
            {!!clinic.email && <Row label="Email" value={clinic.email} last />}
          </View>

          <View style={{ flexDirection: 'row', gap: 10, marginTop: 14 }}>
            {!!clinic.phone && (
              <Button
                title="Call"
                variant="outline"
                size="sm"
                icon={<Ionicons name="call-outline" size={15} color={colors.ink} />}
                onPress={() => Linking.openURL(`tel:${clinic.phone}`)}
              />
            )}
            <Button
              title="Directions"
              variant="outline"
              size="sm"
              icon={<Ionicons name="navigate-outline" size={15} color={colors.ink} />}
              onPress={() => Linking.openURL(`https://maps.google.com/?q=${encodeURIComponent(`${clinic.name} ${line}`)}`)}
            />
          </View>
        </Card>

        {(clinic.specialities || []).length > 0 && (
          <Card style={{ marginTop: 14 }}>
            <Text style={font.h3}>Specialities here</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 10 }}>
              {clinic.specialities.map((s) => (
                <Badge key={idOf(s)} label={s.name || 'Speciality'} />
              ))}
            </View>
          </Card>
        )}

        <SectionHead title="Doctors at this clinic" />
        <View style={{ gap: 12 }}>
          {doctors.map((d) => <DoctorCard key={d._id} doctor={d} wide />)}
          {doctors.length === 0 && <Text style={font.small}>No doctors listed here yet.</Text>}
        </View>

        <Button title="Book an appointment" onPress={() => router.push('/book')} full style={{ marginTop: 20 }} />
      </Screen>
    </View>
  );
}

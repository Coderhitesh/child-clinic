import { useEffect, useState } from 'react';
import { Linking, Text, View } from 'react-native';
import Screen from '../src/components/ui/Screen';
import Header from '../src/components/ui/Header';
import Card from '../src/components/ui/Card';
import Button from '../src/components/ui/Button';
import Chip from '../src/components/ui/Chip';
import { EmptyState, Loader } from '../src/components/ui/States';
import { useToast } from '../src/components/ui/Toast';
import AuthGate from '../src/components/app/AuthGate';
import { patientApi, prescriptionApi } from '../src/services';
import { useAuthStore } from '../src/store/authStore';
import { colors, font, radius } from '../src/lib/theme';
import { getErr, prettyDate, prettyDateTime } from '../src/lib/utils';

export default function PrescriptionsScreen() {
  const toast = useToast();
  const user = useAuthStore((s) => s.user);
  const [patients, setPatients] = useState(null);
  const [patientId, setPatientId] = useState('');
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) { setPatients([]); return; }
    patientApi.list()
      .then((list) => {
        setPatients(list || []);
        if (list?.length) setPatientId(list[0]._id);
      })
      .catch((e) => { setPatients([]); toast.show(getErr(e), 'error'); });
  }, [user, toast]);

  useEffect(() => {
    if (!patientId) return;
    setLoading(true);
    prescriptionApi.listByPatient(patientId)
      .then((d) => setRows(d || []))
      .catch((e) => toast.show(getErr(e), 'error'))
      .finally(() => setLoading(false));
  }, [patientId, toast]);

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <Header title="Prescriptions" subtitle="Everything your doctors have written" />
      <Screen contentStyle={{ gap: 14, paddingTop: 4 }}>
        <AuthGate description="Prescriptions are tied to your patient records. Verify your number to see them.">
          {patients === null ? (
            <Loader />
          ) : patients.length === 0 ? (
            <EmptyState
              icon="document-text-outline"
              title="No patient records yet"
              description="Book a visit, or add a family member, and prescriptions will appear here."
            />
          ) : (
            <>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                {patients.map((p) => (
                  <Chip key={p._id} label={p.name} active={patientId === p._id} onPress={() => setPatientId(p._id)} />
                ))}
              </View>

              {loading ? (
                <Loader />
              ) : rows.length === 0 ? (
                <EmptyState
                  icon="document-text-outline"
                  title="No prescriptions yet"
                  description="They show up here right after a consultation."
                />
              ) : (
                rows.map((p) => (
                  <Card key={p._id}>
                    <Text style={font.h3}>{p.diagnosis || 'Consultation'}</Text>
                    <Text style={font.small}>
                      {[p.doctor?.name, prettyDateTime(p.createdAt)].filter(Boolean).join(' · ')}
                    </Text>

                    <View style={{ gap: 8, marginTop: 12 }}>
                      {(p.medicines || []).map((m, i) => (
                        <View key={i} style={{ padding: 10, borderRadius: radius.md, backgroundColor: colors.bg }}>
                          <Text style={font.label}>{m.name}</Text>
                          <Text style={font.small}>
                            {[m.dosage, m.frequency, m.durationDays && `${m.durationDays} days`].filter(Boolean).join(' · ')}
                            {m.instructions ? ` — ${m.instructions}` : ''}
                          </Text>
                        </View>
                      ))}
                    </View>

                    {!!p.generalInstructions && (
                      <Text style={[font.body, { marginTop: 10 }]}>{p.generalInstructions}</Text>
                    )}
                    {!!p.followUpDate && (
                      <Text style={[font.small, { marginTop: 6 }]}>Follow-up: {prettyDate(p.followUpDate)}</Text>
                    )}
                    {!!p.pdfUrl && (
                      <Button
                        title="Open PDF"
                        variant="outline"
                        size="sm"
                        style={{ marginTop: 12 }}
                        onPress={() => Linking.openURL(p.pdfUrl)}
                      />
                    )}
                  </Card>
                ))
              )}
            </>
          )}
        </AuthGate>
      </Screen>
    </View>
  );
}

import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Screen from '../src/components/ui/Screen';
import Header from '../src/components/ui/Header';
import Card from '../src/components/ui/Card';
import Button from '../src/components/ui/Button';
import { SectionHead } from '../src/components/app/cards';
import { clinicApi, doctorApi, specialityApi } from '../src/services';
import { useUiStore } from '../src/store/uiStore';
import { colors, font, radius } from '../src/lib/theme';

const VALUES = [
  { icon: 'heart-outline', title: 'Unhurried care', body: 'Real consultation time, not a five-minute queue.' },
  { icon: 'people-outline', title: 'Whole family', body: 'One account covers children, parents and everyone between.' },
  { icon: 'shield-checkmark-outline', title: 'Records that last', body: 'Prescriptions and reports stay with you, not in a drawer.' },
  { icon: 'wallet-outline', title: 'Clear pricing', body: 'You see the consultation fee before you book. No surprises.' },
];

export default function AboutScreen() {
  const router = useRouter();
  const settings = useUiStore((s) => s.settings);
  const [stats, setStats] = useState({ clinics: 0, doctors: 0, specialities: 0 });

  useEffect(() => {
    Promise.all([
      clinicApi.list().catch(() => []),
      doctorApi.list().catch(() => []),
      specialityApi.list().catch(() => []),
    ]).then(([c, d, s]) =>
      setStats({ clinics: c.length, doctors: d.length, specialities: s.length })
    );
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <Header title="About us" subtitle={settings?.tagline || 'Care today. A healthier tomorrow.'} />
      <Screen contentStyle={{ paddingTop: 4 }}>
        <Card>
          <Text style={font.h2}>{settings?.siteName || 'HealthBridge'}</Text>
          <Text style={[font.body, { marginTop: 8, lineHeight: 22 }]}>
            We run neighbourhood clinics with doctors who know their patients by name. Booking should be the
            easiest part of getting better — pick a time that works, bring whoever needs care, and keep every
            prescription in one place.
          </Text>
        </Card>

        <View style={styles.stats}>
          {[
            { n: stats.clinics, l: 'Clinics' },
            { n: stats.doctors, l: 'Doctors' },
            { n: stats.specialities, l: 'Specialities' },
          ].map((s) => (
            <View key={s.l} style={styles.stat}>
              <Text style={styles.statNum}>{s.n}</Text>
              <Text style={font.small}>{s.l}</Text>
            </View>
          ))}
        </View>

        <SectionHead title="What we care about" />
        <View style={{ gap: 12 }}>
          {VALUES.map((v) => (
            <Card key={v.title}>
              <View style={{ flexDirection: 'row', gap: 12 }}>
                <View style={styles.icon}>
                  <Ionicons name={v.icon} size={18} color={colors.brand600} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={font.h3}>{v.title}</Text>
                  <Text style={[font.small, { marginTop: 2 }]}>{v.body}</Text>
                </View>
              </View>
            </Card>
          ))}
        </View>

        <Button title="Book an appointment" onPress={() => router.push('/book')} full style={{ marginTop: 22 }} />
        <Button title="Contact us" variant="outline" onPress={() => router.push('/contact')} full style={{ marginTop: 10 }} />
      </Screen>
    </View>
  );
}

const styles = StyleSheet.create({
  stats: { flexDirection: 'row', gap: 10, marginTop: 14 },
  stat: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 16,
    borderRadius: radius.lg,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
  },
  statNum: { fontSize: 22, fontWeight: '800', color: colors.brand700 },
  icon: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: colors.brand50, alignItems: 'center', justifyContent: 'center',
  },
});

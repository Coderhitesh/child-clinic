import { useCallback, useEffect, useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Screen from '../../src/components/ui/Screen';
import Card from '../../src/components/ui/Card';
import Button from '../../src/components/ui/Button';
import Avatar from '../../src/components/ui/Avatar';
import { Loader } from '../../src/components/ui/States';
import { SectionHead, DoctorCard, ClinicCard, SpecialityTile, BlogCard } from '../../src/components/app/cards';
import {
  specialityApi, doctorApi, clinicApi, blogApi, bannerApi, testimonialApi, appointmentApi,
} from '../../src/services';
import { useAuthStore } from '../../src/store/authStore';
import { useUiStore } from '../../src/store/uiStore';
import { colors, font, radius } from '../../src/lib/theme';
import { prettyDate, to12h } from '../../src/lib/utils';

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const user = useAuthStore((s) => s.user);
  const settings = useUiStore((s) => s.settings);

  const [data, setData] = useState(null);
  const [next, setNext] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    const [specialities, doctors, clinics, blogs, banners, testimonials] = await Promise.all([
      specialityApi.list().catch(() => []),
      doctorApi.list().catch(() => []),
      clinicApi.list().catch(() => []),
      blogApi.list().catch(() => []),
      bannerApi.active({ placement: 'home_hero' }).catch(() => []),
      testimonialApi.list().catch(() => []),
    ]);
    setData({ specialities, doctors, clinics, blogs, banners, testimonials });
  }, []);

  useEffect(() => { load(); }, [load]);

  // the next visit strip only makes sense once someone is signed in
  useEffect(() => {
    if (!user) { setNext(null); return; }
    const todayKey = new Date().toISOString().slice(0, 10);
    appointmentApi.list()
      .then((list) => {
        const upcoming = (list || [])
          .filter((a) => a.date >= todayKey && ['pending', 'confirmed'].includes(a.status))
          .sort((a, b) => (a.date + a.startTime).localeCompare(b.date + b.startTime));
        setNext(upcoming[0] || null);
      })
      .catch(() => {});
  }, [user]);

  const refresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  if (!data) return <Loader label="Loading your clinic" />;

  const hero = data.banners?.[0];

  return (
    <Screen refreshing={refreshing} onRefresh={refresh} padded={false}>
      <LinearGradient colors={['#e8f7f5', colors.bg]} style={{ paddingTop: insets.top + 12 }}>
        <View style={styles.topRow}>
          <View style={{ flex: 1 }}>
            <Text style={font.small}>{settings?.tagline || 'Care today. A healthier tomorrow.'}</Text>
            <Text style={font.h1}>
              {user ? `Hello, ${user.name.split(' ')[0]}` : settings?.siteName || 'HealthBridge'}
            </Text>
          </View>
          <Pressable onPress={() => router.push(user ? '/(tabs)/profile' : '/otp')}>
            <Avatar name={user?.name || 'Guest'} size={44} />
          </Pressable>
        </View>

        <Pressable style={styles.search} onPress={() => router.push('/(tabs)/doctors')}>
          <Ionicons name="search" size={18} color={colors.muted} />
          <Text style={{ color: colors.muted, fontSize: 14.5 }}>Search doctors, clinics, specialities</Text>
        </Pressable>

        {!!hero && (
          <Pressable style={styles.hero} onPress={() => router.push('/(tabs)/doctors')}>
            {!!hero.image && <Image source={{ uri: hero.image }} style={styles.heroImg} />}
            <View style={styles.heroBody}>
              <Text style={styles.heroTitle} numberOfLines={2}>{hero.title || 'Book your next visit'}</Text>
              <Text style={styles.heroCta}>{hero.buttonText || 'Find a doctor'} →</Text>
            </View>
          </Pressable>
        )}

        {!!next && (
          <Card style={styles.nextCard} onPress={() => router.push(`/appointment/${next._id}`)}>
            <Text style={[font.small, { color: colors.brand700, fontWeight: '700' }]}>YOUR NEXT VISIT</Text>
            <Text style={[font.h3, { marginTop: 4 }]}>{next.doctor?.name}</Text>
            <Text style={font.small}>
              {prettyDate(next.date)} · {to12h(next.startTime)} · {next.clinic?.name}
            </Text>
          </Card>
        )}
      </LinearGradient>

      <View style={{ paddingHorizontal: 16 }}>
        <SectionHead
          title="Specialities"
          subtitle="Pick the kind of care you need"
          actionLabel="See all"
          onAction={() => router.push('/specialities')}
        />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10 }}>
          {data.specialities.slice(0, 10).map((s) => (
            <SpecialityTile key={s._id} speciality={s} />
          ))}
        </ScrollView>

        <SectionHead
          title="Our doctors"
          subtitle="Experienced, and free this week"
          actionLabel="See all"
          onAction={() => router.push('/(tabs)/doctors')}
        />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12, paddingBottom: 4 }}>
          {data.doctors.slice(0, 8).map((d) => (
            <DoctorCard key={d._id} doctor={d} />
          ))}
        </ScrollView>

        <View style={styles.band}>
          <View style={{ flex: 1 }}>
            <Text style={[font.h3, { color: colors.white }]}>Booking for someone else?</Text>
            <Text style={{ color: '#d6edf3', fontSize: 13, marginTop: 4 }}>
              Add your children or parents once and book for them in two taps.
            </Text>
          </View>
          <Button title="Family" variant="coral" size="sm" onPress={() => router.push('/family')} />
        </View>

        <SectionHead
          title="Our clinics"
          actionLabel="See all"
          onAction={() => router.push('/clinics')}
        />
        <View style={{ gap: 12 }}>
          {data.clinics.slice(0, 3).map((c) => (
            <ClinicCard key={c._id} clinic={c} />
          ))}
        </View>

        {data.testimonials.length > 0 && (
          <>
            <SectionHead title="What patients say" />
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12 }}>
              {data.testimonials.slice(0, 6).map((t) => (
                <Card key={t._id} style={{ width: 260 }}>
                  <View style={{ flexDirection: 'row', gap: 4, marginBottom: 8 }}>
                    {[...Array(t.rating || 5)].map((_, i) => (
                      <Ionicons key={i} name="star" size={13} color="#f5a623" />
                    ))}
                  </View>
                  <Text style={[font.body, { minHeight: 60 }]} numberOfLines={4}>{t.message}</Text>
                  <Text style={[font.label, { marginTop: 10 }]}>{t.name}</Text>
                  {!!t.designation && <Text style={font.small}>{t.designation}</Text>}
                </Card>
              ))}
            </ScrollView>
          </>
        )}

        {data.blogs.length > 0 && (
          <>
            <SectionHead
              title="Health reads"
              actionLabel="All articles"
              onAction={() => router.push('/blogs')}
            />
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12 }}>
              {data.blogs.slice(0, 6).map((b) => (
                <BlogCard key={b._id} blog={b} />
              ))}
            </ScrollView>
          </>
        )}

        <Card style={{ marginTop: 26, alignItems: 'center', paddingVertical: 24 }}>
          <Text style={[font.h2, { textAlign: 'center' }]}>Ready when you are</Text>
          <Text style={[font.body, { textAlign: 'center', marginTop: 6 }]}>
            Pick a doctor, choose a time, and pay at the clinic if you prefer.
          </Text>
          <Button title="Book an appointment" onPress={() => router.push('/book')} style={{ marginTop: 16 }} />
        </Card>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  topRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16 },
  search: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginHorizontal: 16,
    marginTop: 16,
    height: 48,
    paddingHorizontal: 14,
    borderRadius: radius.pill,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
  },
  hero: {
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: radius.lg,
    overflow: 'hidden',
    backgroundColor: colors.ink,
  },
  heroImg: { width: '100%', height: 140 },
  heroBody: { padding: 14 },
  heroTitle: { color: colors.white, fontSize: 16, fontWeight: '800' },
  heroCta: { color: '#9fe0d9', fontWeight: '700', marginTop: 6, fontSize: 13 },
  nextCard: { marginHorizontal: 16, marginTop: 16, borderColor: colors.brand200 },
  band: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.ink,
    borderRadius: radius.lg,
    padding: 18,
    marginTop: 26,
  },
});

import { useCallback, useState } from 'react';
import { Text, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Screen from '../../src/components/ui/Screen';
import Chip from '../../src/components/ui/Chip';
import Button from '../../src/components/ui/Button';
import AuthGate from '../../src/components/app/AuthGate';
import { AppointmentCard } from '../../src/components/app/cards';
import { EmptyState, Loader } from '../../src/components/ui/States';
import { useToast } from '../../src/components/ui/Toast';
import { appointmentApi } from '../../src/services';
import { useAuthStore } from '../../src/store/authStore';
import { font } from '../../src/lib/theme';
import { getErr, toDateKey } from '../../src/lib/utils';

export default function AppointmentsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const toast = useToast();
  const user = useAuthStore((s) => s.user);

  const [rows, setRows] = useState(null);
  const [tab, setTab] = useState('upcoming');
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    if (!user) { setRows([]); return; }
    try {
      const list = await appointmentApi.list();
      setRows(list || []);
    } catch (e) {
      setRows([]);
      toast.show(getErr(e), 'error');
    }
  }, [user, toast]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const refresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const today = toDateKey(new Date());
  const upcoming = (rows || [])
    .filter((a) => a.date >= today && ['pending', 'confirmed'].includes(a.status))
    .sort((a, b) => (a.date + a.startTime).localeCompare(b.date + b.startTime));
  const past = (rows || [])
    .filter((a) => !upcoming.includes(a))
    .sort((a, b) => (b.date + b.startTime).localeCompare(a.date + a.startTime));

  const list = tab === 'upcoming' ? upcoming : past;

  return (
    <Screen refreshing={refreshing} onRefresh={user ? refresh : undefined} contentStyle={{ paddingTop: insets.top + 12 }}>
      <Text style={font.h1}>My visits</Text>
      <Text style={[font.body, { marginTop: 2 }]}>Everything booked under your number, family included.</Text>

      <AuthGate description="Your appointments live against your mobile number. Verify it to see them.">
        {rows === null ? (
          <Loader />
        ) : (
          <>
            <View style={{ flexDirection: 'row', gap: 8, marginTop: 16, marginBottom: 14 }}>
              <Chip label={`Upcoming (${upcoming.length})`} active={tab === 'upcoming'} onPress={() => setTab('upcoming')} />
              <Chip label={`History (${past.length})`} active={tab === 'past'} onPress={() => setTab('past')} />
            </View>

            <View style={{ gap: 12 }}>
              {list.map((a) => <AppointmentCard key={a._id} appointment={a} />)}
              {list.length === 0 && (
                <EmptyState
                  icon="calendar-outline"
                  title={tab === 'upcoming' ? 'Nothing booked yet' : 'No past visits'}
                  description={
                    tab === 'upcoming'
                      ? 'Find a doctor and pick a time that suits you.'
                      : 'Completed and cancelled visits show up here.'
                  }
                  actionTitle={tab === 'upcoming' ? 'Book a visit' : undefined}
                  onAction={() => router.push('/book')}
                />
              )}
            </View>

            {list.length > 0 && tab === 'upcoming' && (
              <Button
                title="Book another visit"
                variant="outline"
                onPress={() => router.push('/book')}
                full
                style={{ marginTop: 16 }}
              />
            )}
          </>
        )}
      </AuthGate>
    </Screen>
  );
}

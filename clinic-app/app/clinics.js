import { useEffect, useMemo, useState } from 'react';
import { Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Screen from '../src/components/ui/Screen';
import Header from '../src/components/ui/Header';
import Card from '../src/components/ui/Card';
import Button from '../src/components/ui/Button';
import { ClinicCard } from '../src/components/app/cards';
import { EmptyState, Loader } from '../src/components/ui/States';
import { useToast } from '../src/components/ui/Toast';
import { clinicApi } from '../src/services';
import { useUiStore } from '../src/store/uiStore';
import { requestLocation, distanceKm, clinicCoords } from '../src/lib/location';
import { colors, font } from '../src/lib/theme';

export default function ClinicsScreen() {
  const toast = useToast();
  const { location, setLocation } = useUiStore();
  const [rows, setRows] = useState(null);
  const [asking, setAsking] = useState(false);

  useEffect(() => {
    clinicApi.list().then((d) => setRows(d || [])).catch(() => setRows([]));
  }, []);

  const allowLocation = async () => {
    setAsking(true);
    try {
      const res = await requestLocation();
      if (res.granted && res.coords) {
        setLocation(res.coords);
        toast.show('Showing the nearest clinics first', 'success');
      } else {
        toast.show('No problem — clinics stay in their usual order', 'info');
      }
    } finally {
      setAsking(false);
    }
  };

  // nearest first, but only for clinics that actually carry coordinates
  const sorted = useMemo(() => {
    if (!rows) return null;
    if (!location) return rows;
    return [...rows]
      .map((c) => ({ ...c, _km: distanceKm(location, clinicCoords(c)) }))
      .sort((a, b) => (a._km ?? 1e9) - (b._km ?? 1e9));
  }, [rows, location]);

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <Header title="Our clinics" subtitle="Where we see patients" />
      <Screen contentStyle={{ gap: 12, paddingTop: 4 }}>
        {!location && (
          <Card style={{ backgroundColor: colors.brand50, borderColor: colors.brand200 }}>
            <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
              <Ionicons name="location-outline" size={20} color={colors.brand600} />
              <Text style={[font.body, { flex: 1 }]}>
                Allow location and we will put the closest clinic at the top.
              </Text>
            </View>
            <Button title="Use my location" size="sm" onPress={allowLocation} loading={asking} style={{ marginTop: 12 }} />
          </Card>
        )}

        {sorted === null ? (
          <Loader />
        ) : sorted.length === 0 ? (
          <EmptyState icon="business-outline" title="No clinics listed yet" />
        ) : (
          sorted.map((c) => (
            <View key={c._id}>
              <ClinicCard clinic={c} />
              {typeof c._km === 'number' && (
                <Text style={[font.small, { marginTop: 4, marginLeft: 4 }]}>{c._km} km away</Text>
              )}
            </View>
          ))
        )}
      </Screen>
    </View>
  );
}

import { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import Screen from '../src/components/ui/Screen';
import Header from '../src/components/ui/Header';
import Card from '../src/components/ui/Card';
import { EmptyState, Loader } from '../src/components/ui/States';
import { specialityApi } from '../src/services';
import { colors, font } from '../src/lib/theme';

export default function SpecialitiesScreen() {
  const router = useRouter();
  const [rows, setRows] = useState(null);

  useEffect(() => {
    specialityApi.list().then((d) => setRows(d || [])).catch(() => setRows([]));
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <Header title="Specialities" subtitle="The kinds of care we offer" />
      <Screen contentStyle={{ gap: 12, paddingTop: 4 }}>
        {rows === null ? (
          <Loader />
        ) : rows.length === 0 ? (
          <EmptyState icon="medkit-outline" title="Nothing listed yet" />
        ) : (
          rows.map((s) => (
            <Card key={s._id} onPress={() => router.push(`/speciality/${s.slug || s._id}`)}>
              <Text style={font.h3}>{s.name}</Text>
              {!!s.description && (
                <Text style={[font.small, { marginTop: 4 }]} numberOfLines={2}>{s.description}</Text>
              )}
            </Card>
          ))
        )}
      </Screen>
    </View>
  );
}

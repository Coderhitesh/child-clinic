import { useEffect, useState } from 'react';
import { Image, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import Screen from '../src/components/ui/Screen';
import Header from '../src/components/ui/Header';
import Card from '../src/components/ui/Card';
import { EmptyState, Loader } from '../src/components/ui/States';
import { blogApi } from '../src/services';
import { colors, font } from '../src/lib/theme';
import { prettyDate } from '../src/lib/utils';

export default function BlogsScreen() {
  const router = useRouter();
  const [rows, setRows] = useState(null);

  useEffect(() => {
    blogApi.list().then((d) => setRows(d || [])).catch(() => setRows([]));
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <Header title="Health articles" subtitle="Written by our doctors" />
      <Screen contentStyle={{ gap: 12, paddingTop: 4 }}>
        {rows === null ? (
          <Loader />
        ) : rows.length === 0 ? (
          <EmptyState icon="newspaper-outline" title="No articles yet" />
        ) : (
          rows.map((b) => (
            <Card key={b._id} padded={false} style={{ overflow: 'hidden' }} onPress={() => router.push(`/blog/${b.slug}`)}>
              {!!b.coverImage && <Image source={{ uri: b.coverImage }} style={{ width: '100%', height: 150 }} />}
              <View style={{ padding: 14 }}>
                <Text style={font.h3}>{b.title}</Text>
                {!!b.excerpt && <Text style={[font.small, { marginTop: 4 }]} numberOfLines={2}>{b.excerpt}</Text>}
                {!!b.publishedAt && <Text style={[font.small, { marginTop: 8 }]}>{prettyDate(b.publishedAt)}</Text>}
              </View>
            </Card>
          ))
        )}
      </Screen>
    </View>
  );
}

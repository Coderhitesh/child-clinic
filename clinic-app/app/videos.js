import { useEffect, useState } from 'react';
import { Image, Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Screen from '../src/components/ui/Screen';
import Header from '../src/components/ui/Header';
import Card from '../src/components/ui/Card';
import { Badge } from '../src/components/ui/Badge';
import { EmptyState, Loader } from '../src/components/ui/States';
import { useToast } from '../src/components/ui/Toast';
import AuthGate from '../src/components/app/AuthGate';
import { patientApi, videoApi } from '../src/services';
import { useAuthStore } from '../src/store/authStore';
import { colors, font, radius } from '../src/lib/theme';
import { getErr, titleCase } from '../src/lib/utils';

const youtubeId = (url = '') => {
  const m = String(url).match(/(?:youtu\.be\/|v=|embed\/)([A-Za-z0-9_-]{6,})/);
  return m ? m[1] : null;
};

export default function VideosScreen() {
  const toast = useToast();
  const user = useAuthStore((s) => s.user);
  const [rows, setRows] = useState(null);

  useEffect(() => {
    if (!user) { setRows([]); return; }
    // only what a doctor actually assigned to one of this account's patients
    patientApi.list()
      .then((patients) => {
        const ids = (patients || []).map((p) => p._id);
        if (!ids.length) return [];
        return videoApi.list({ patients: ids.join(',') });
      })
      .then((d) => setRows(d || []))
      .catch((e) => { setRows([]); toast.show(getErr(e), 'error'); });
  }, [user, toast]);

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <Header title="Care videos" subtitle="Guidance your doctor has shared" />
      <Screen contentStyle={{ gap: 14, paddingTop: 4 }}>
        <AuthGate description="Videos are assigned to you after a consultation. Verify your number to see them.">
          {rows === null ? (
            <Loader />
          ) : rows.length === 0 ? (
            <EmptyState
              icon="play-circle-outline"
              title="Nothing shared yet"
              description="Videos your doctor assigns after a visit will appear here."
            />
          ) : (
            rows.map((v) => {
              const vid = youtubeId(v.youtubeUrl);
              return (
                <Card key={v._id} padded={false} style={{ overflow: 'hidden' }}>
                  <Pressable onPress={() => Linking.openURL(v.youtubeUrl)}>
                    <View>
                      {!!vid && (
                        <Image
                          source={{ uri: `https://img.youtube.com/vi/${vid}/hqdefault.jpg` }}
                          style={{ width: '100%', height: 170 }}
                        />
                      )}
                      <View style={styles.play}>
                        <Ionicons name="play" size={22} color={colors.white} />
                      </View>
                    </View>
                  </Pressable>
                  <View style={{ padding: 14 }}>
                    <Badge label={titleCase(v.category || 'general')} />
                    <Text style={[font.h3, { marginTop: 8 }]}>{v.title}</Text>
                    {!!v.description && (
                      <Text style={[font.small, { marginTop: 4 }]} numberOfLines={3}>{v.description}</Text>
                    )}
                  </View>
                </Card>
              );
            })
          )}
        </AuthGate>
      </Screen>
    </View>
  );
}

const styles = StyleSheet.create({
  play: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    alignItems: 'center', justifyContent: 'center',
  },
});

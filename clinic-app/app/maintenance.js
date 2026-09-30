import { Linking, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Button from '../src/components/ui/Button';
import { useUiStore } from '../src/store/uiStore';
import { colors, font } from '../src/lib/theme';
import { prettyDateTime } from '../src/lib/utils';

/**
 * Hard wall shown when the server reports maintenance mode. Nothing else in the app
 * renders behind it, and the only way out is a retry that re-reads the config.
 */
export default function MaintenanceScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { appConfig, refreshAppConfig } = useUiStore();
  const m = appConfig?.maintenance || {};
  const support = appConfig?.support || {};

  const retry = async () => {
    const fresh = await refreshAppConfig?.();
    if (!fresh?.maintenance?.enabled) router.replace('/(tabs)');
  };

  return (
    <View style={[styles.root, { paddingTop: insets.top + 40, paddingBottom: insets.bottom + 24 }]}>
      <View style={styles.icon}>
        <Ionicons name="construct-outline" size={40} color={colors.brand600} />
      </View>

      <Text style={styles.title}>{m.title || 'We will be right back'}</Text>
      <Text style={styles.body}>
        {m.message || 'The app is down for scheduled maintenance. Please try again shortly.'}
      </Text>

      {!!m.until && (
        <Text style={[font.small, { marginTop: 14 }]}>Expected back by {prettyDateTime(m.until)}</Text>
      )}

      <View style={{ gap: 10, marginTop: 30, alignSelf: 'stretch', paddingHorizontal: 32 }}>
        <Button title="Try again" onPress={retry} size="lg" full />
        {!!support.phone && (
          <Button
            title={`Call ${support.phone}`}
            variant="outline"
            full
            onPress={() => Linking.openURL(`tel:${support.phone}`)}
          />
        )}
        {!!support.email && (
          <Button
            title="Email support"
            variant="ghost"
            full
            onPress={() => Linking.openURL(`mailto:${support.email}`)}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.white, alignItems: 'center', paddingHorizontal: 28 },
  icon: {
    width: 110, height: 110, borderRadius: 55,
    backgroundColor: colors.brand50, alignItems: 'center', justifyContent: 'center', marginBottom: 28,
  },
  title: { fontSize: 24, fontWeight: '800', color: colors.ink, textAlign: 'center' },
  body: { fontSize: 15, lineHeight: 23, color: colors.inkSoft, textAlign: 'center', marginTop: 10, maxWidth: 330 },
});

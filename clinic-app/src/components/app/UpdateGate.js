import { useState } from 'react';
import { Linking, Modal, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Button from '../ui/Button';
import { useUiStore } from '../../store/uiStore';
import { colors, font, radius } from '../../lib/theme';
import { currentVersion } from '../../lib/version';

/**
 * Update prompt driven entirely by the server.
 *
 * - installed version below `minSupportedVersion` → blocking, no dismiss
 * - below `latestVersion` → dismissible "there's a new version" sheet, once per launch
 */
export default function UpdateGate() {
  const appConfig = useUiStore((s) => s.appConfig);
  const [dismissed, setDismissed] = useState(false);

  const v = appConfig?.version;
  if (!v) return null;

  const required = Boolean(v.updateRequired);
  const available = Boolean(v.updateAvailable);
  if (!required && (!available || dismissed)) return null;

  const openStore = () => {
    const url =
      v.storeUrl ||
      (Platform.OS === 'ios'
        ? 'https://apps.apple.com'
        : 'https://play.google.com/store/apps/details?id=com.healthbridge.app');
    Linking.openURL(url).catch(() => {});
  };

  return (
    <Modal visible transparent animationType="fade" onRequestClose={() => !required && setDismissed(true)}>
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <View style={styles.icon}>
            <Ionicons name={required ? 'alert-circle-outline' : 'arrow-up-circle-outline'} size={30} color={colors.brand600} />
          </View>

          <Text style={styles.title}>
            {required ? 'Update required' : 'A new version is out'}
          </Text>
          <Text style={styles.body}>
            {required
              ? `This version of the app (${currentVersion}) is no longer supported. Update to ${v.latestVersion} to keep booking appointments.`
              : `Version ${v.latestVersion} is available. You are on ${currentVersion}.`}
          </Text>

          {!!v.releaseNotes && (
            <View style={styles.notes}>
              <Text style={[font.label, { marginBottom: 4 }]}>What is new</Text>
              <Text style={font.small}>{v.releaseNotes}</Text>
            </View>
          )}

          <Button title="Update now" onPress={openStore} size="lg" full style={{ marginTop: 20 }} />
          {!required && (
            <Pressable onPress={() => setDismissed(true)} style={{ paddingVertical: 12 }}>
              <Text style={styles.later}>Maybe later</Text>
            </Pressable>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(15,61,86,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  sheet: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: colors.white,
    borderRadius: radius.xl,
    padding: 24,
    alignItems: 'center',
  },
  icon: {
    width: 64, height: 64, borderRadius: 32,
    backgroundColor: colors.brand50, alignItems: 'center', justifyContent: 'center', marginBottom: 16,
  },
  title: { fontSize: 20, fontWeight: '800', color: colors.ink, textAlign: 'center' },
  body: { fontSize: 14.5, lineHeight: 21, color: colors.inkSoft, textAlign: 'center', marginTop: 8 },
  notes: {
    alignSelf: 'stretch',
    marginTop: 16,
    padding: 12,
    borderRadius: radius.md,
    backgroundColor: colors.bg,
  },
  later: { color: colors.muted, fontWeight: '600', fontSize: 13.5 },
});

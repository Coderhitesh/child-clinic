import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, font, radius } from '../../lib/theme';
import Button from './Button';

export function Loader({ label }) {
  return (
    <View style={styles.center}>
      <ActivityIndicator color={colors.brand500} />
      {!!label && <Text style={[font.small, { marginTop: 10 }]}>{label}</Text>}
    </View>
  );
}

export function EmptyState({ icon = 'calendar-outline', title, description, actionTitle, onAction }) {
  return (
    <View style={styles.empty}>
      <View style={styles.icon}>
        <Ionicons name={icon} size={24} color={colors.brand600} />
      </View>
      <Text style={[font.h3, { textAlign: 'center' }]}>{title}</Text>
      {!!description && (
        <Text style={[font.body, { textAlign: 'center', marginTop: 4 }]}>{description}</Text>
      )}
      {!!actionTitle && <Button title={actionTitle} onPress={onAction} style={{ marginTop: 16 }} />}
    </View>
  );
}

export function ErrorState({ message, onRetry }) {
  return (
    <EmptyState
      icon="cloud-offline-outline"
      title="Could not load this"
      description={message}
      actionTitle={onRetry ? 'Try again' : undefined}
      onAction={onRetry}
    />
  );
}

const styles = StyleSheet.create({
  center: { paddingVertical: 40, alignItems: 'center', justifyContent: 'center' },
  empty: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 36,
    paddingHorizontal: 24,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.border,
    backgroundColor: colors.white,
  },
  icon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.brand50,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
});

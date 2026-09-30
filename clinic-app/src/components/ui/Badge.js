import { StyleSheet, Text, View } from 'react-native';
import { colors, radius } from '../../lib/theme';
import { STATUS_TONE } from '../../lib/constants';
import { titleCase } from '../../lib/utils';

export function Badge({ label, bg = colors.brand50, fg = colors.brand700, style }) {
  return (
    <View style={[styles.badge, { backgroundColor: bg }, style]}>
      <Text style={{ color: fg, fontSize: 11, fontWeight: '700' }}>{label}</Text>
    </View>
  );
}

export function StatusBadge({ value, label, style }) {
  if (!value) return null;
  const tone = STATUS_TONE[value] || { bg: colors.bg, fg: colors.muted };
  return <Badge label={titleCase(label || value)} bg={tone.bg} fg={tone.fg} style={style} />;
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.pill,
    alignSelf: 'flex-start',
  },
});

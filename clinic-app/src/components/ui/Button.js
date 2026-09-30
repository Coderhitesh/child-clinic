import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radius } from '../../lib/theme';

const TONES = {
  primary: { bg: colors.brand500, fg: colors.white, border: colors.brand500 },
  coral: { bg: colors.coral, fg: colors.white, border: colors.coral },
  outline: { bg: 'transparent', fg: colors.ink, border: colors.border },
  soft: { bg: colors.brand50, fg: colors.brand700, border: colors.brand50 },
  ghost: { bg: 'transparent', fg: colors.brand700, border: 'transparent' },
  danger: { bg: colors.dangerSoft, fg: colors.danger, border: colors.dangerSoft },
};

const SIZES = {
  sm: { height: 38, px: 14, fs: 13 },
  md: { height: 48, px: 18, fs: 15 },
  lg: { height: 54, px: 22, fs: 16 },
};

export default function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon = null,
  full = false,
  style,
}) {
  const tone = TONES[variant] || TONES.primary;
  const s = SIZES[size] || SIZES.md;
  const off = disabled || loading;

  return (
    <Pressable
      onPress={off ? undefined : onPress}
      style={({ pressed }) => [
        styles.base,
        {
          height: s.height,
          paddingHorizontal: s.px,
          backgroundColor: tone.bg,
          borderColor: tone.border,
          opacity: off ? 0.55 : pressed ? 0.85 : 1,
          alignSelf: full ? 'stretch' : 'flex-start',
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={tone.fg} size="small" />
      ) : (
        <View style={styles.row}>
          {icon}
          <Text style={{ color: tone.fg, fontSize: s.fs, fontWeight: '700' }}>{title}</Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.pill,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
});

import { Pressable, StyleSheet, Text } from 'react-native';
import { colors, radius } from '../../lib/theme';

export default function Chip({ label, active, onPress, disabled, style }) {
  return (
    <Pressable
      onPress={disabled ? undefined : onPress}
      style={[
        styles.chip,
        active && { backgroundColor: colors.brand500, borderColor: colors.brand500 },
        disabled && { opacity: 0.4 },
        style,
      ]}
    >
      <Text style={{ fontSize: 13, fontWeight: '600', color: active ? colors.white : colors.inkSoft }}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
  },
});

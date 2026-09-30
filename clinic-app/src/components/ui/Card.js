import { Pressable, StyleSheet, View } from 'react-native';
import { colors, radius, shadow } from '../../lib/theme';

export default function Card({ children, onPress, style, padded = true }) {
  const content = (
    <View style={[styles.card, padded && { padding: 16 }, style]}>{children}</View>
  );
  if (!onPress) return content;
  return (
    <Pressable onPress={onPress} style={({ pressed }) => ({ opacity: pressed ? 0.9 : 1 })}>
      {content}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadow,
  },
});

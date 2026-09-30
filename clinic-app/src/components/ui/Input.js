import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, font, radius } from '../../lib/theme';

export function Field({ label, hint, error, children, style }) {
  return (
    <View style={[{ gap: 6 }, style]}>
      {!!label && <Text style={font.label}>{label}</Text>}
      {children}
      {!!hint && !error && <Text style={font.small}>{hint}</Text>}
      {!!error && <Text style={[font.small, { color: colors.danger }]}>{error}</Text>}
    </View>
  );
}

export default function Input({
  label,
  hint,
  error,
  secure = false,
  style,
  inputStyle,
  multiline = false,
  ...props
}) {
  const [hidden, setHidden] = useState(secure);

  return (
    <Field label={label} hint={hint} error={error} style={style}>
      <View style={[styles.wrap, multiline && { height: undefined, paddingVertical: 10 }]}>
        <TextInput
          placeholderTextColor={colors.muted}
          secureTextEntry={hidden}
          multiline={multiline}
          style={[styles.input, multiline && { minHeight: 84, textAlignVertical: 'top' }, inputStyle]}
          {...props}
        />
        {secure && (
          <Pressable onPress={() => setHidden((v) => !v)} hitSlop={10}>
            <Ionicons name={hidden ? 'eye-outline' : 'eye-off-outline'} size={18} color={colors.muted} />
          </Pressable>
        )}
      </View>
    </Field>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    height: 50,
    paddingHorizontal: 14,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
  },
  input: { flex: 1, fontSize: 15, color: colors.ink, padding: 0 },
});

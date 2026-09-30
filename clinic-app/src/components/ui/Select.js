import { useState } from 'react';
import { FlatList, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, font, radius } from '../../lib/theme';
import { Field } from './Input';

export default function Select({
  label,
  value,
  onChange,
  options = [],
  placeholder = 'Select',
  allowEmpty = false,
  emptyLabel = 'Any',
  style,
}) {
  const [open, setOpen] = useState(false);
  const selected = options.find((o) => o.value === value);
  const rows = allowEmpty ? [{ value: '', label: emptyLabel }, ...options] : options;

  return (
    <Field label={label} style={style}>
      <Pressable style={styles.trigger} onPress={() => setOpen(true)}>
        <Text style={{ color: selected ? colors.ink : colors.muted, fontSize: 15, flex: 1 }} numberOfLines={1}>
          {selected ? selected.label : placeholder}
        </Text>
        <Ionicons name="chevron-down" size={16} color={colors.muted} />
      </Pressable>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)}>
          <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
            <View style={styles.handle} />
            {!!label && <Text style={[font.h3, { marginBottom: 8 }]}>{label}</Text>}
            <FlatList
              data={rows}
              keyExtractor={(item) => String(item.value)}
              style={{ maxHeight: 360 }}
              renderItem={({ item }) => {
                const active = item.value === value;
                return (
                  <Pressable
                    style={[styles.row, active && { backgroundColor: colors.brand50 }]}
                    onPress={() => { onChange(item.value); setOpen(false); }}
                  >
                    <Text style={{ color: active ? colors.brand700 : colors.ink, fontWeight: active ? '700' : '500' }}>
                      {item.label}
                    </Text>
                    {active && <Ionicons name="checkmark" size={18} color={colors.brand600} />}
                  </Pressable>
                );
              }}
              ListEmptyComponent={<Text style={[font.small, { padding: 16 }]}>Nothing to choose from yet.</Text>}
            />
          </Pressable>
        </Pressable>
      </Modal>
    </Field>
  );
}

const styles = StyleSheet.create({
  trigger: {
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
  backdrop: { flex: 1, backgroundColor: 'rgba(15,61,86,0.35)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: colors.white,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    padding: 16,
    paddingBottom: 28,
  },
  handle: {
    alignSelf: 'center',
    width: 42,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 13,
    paddingHorizontal: 12,
    borderRadius: radius.md,
  },
});

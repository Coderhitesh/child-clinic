import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../../lib/theme';

export default function Screen({
  children,
  scroll = true,
  refreshing = false,
  onRefresh,
  padded = true,
  style,
  contentStyle,
  footer,
}) {
  const insets = useSafeAreaInsets();
  const pad = padded ? { paddingHorizontal: 16 } : null;

  if (!scroll) {
    return (
      <View style={[styles.root, style]}>
        <View style={[{ flex: 1 }, pad, contentStyle]}>{children}</View>
        {footer}
      </View>
    );
  }

  return (
    <View style={[styles.root, style]}>
      <ScrollView
        contentContainerStyle={[{ paddingBottom: insets.bottom + 28 }, pad, contentStyle]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        refreshControl={
          onRefresh ? (
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.brand500} />
          ) : undefined
        }
      >
        {children}
      </ScrollView>
      {footer}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
});

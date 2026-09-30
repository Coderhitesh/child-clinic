import { Image, StyleSheet, Text, View } from 'react-native';
import { colors } from '../../lib/theme';
import { initials } from '../../lib/utils';

export default function Avatar({ name = '', uri, size = 44, style }) {
  const dim = { width: size, height: size, borderRadius: size / 2 };
  if (uri) return <Image source={{ uri }} style={[dim, style]} />;
  return (
    <View style={[styles.fallback, dim, style]}>
      <Text style={{ color: colors.brand700, fontWeight: '800', fontSize: size * 0.36 }}>
        {initials(name) || '?'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  fallback: { backgroundColor: colors.brand100, alignItems: 'center', justifyContent: 'center' },
});

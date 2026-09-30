import { useEffect, useRef, useState } from 'react';
import { Dimensions, FlatList, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Button from '../src/components/ui/Button';
import { useUiStore } from '../src/store/uiStore';
import { onboardingApi } from '../src/services';
import { colors, radius } from '../src/lib/theme';

const { width } = Dimensions.get('window');

const FALLBACK_STEPS = [
  {
    icon: 'search-outline',
    title: 'Find the right doctor',
    body: 'Browse by speciality, clinic, fee or experience — and see exactly who is free today.',
    art: ['#ecfbf9', '#d2f4ef'],
  },
  {
    icon: 'calendar-outline',
    title: 'Book in under a minute',
    body: 'Pick a slot, tell us who the visit is for, and pay at the clinic or online. No forms to sign up first.',
    art: ['#fff1ec', '#ffe3d9'],
  },
  {
    icon: 'people-outline',
    title: 'One account, whole family',
    body: 'Add your children or parents once, then book for them in two taps and keep their records together.',
    art: ['#e8f2fc', '#d8e9fb'],
  },
  {
    icon: 'document-text-outline',
    title: 'Prescriptions that stay put',
    body: 'Every prescription, report and care video your doctor shares lives in the app — no paper to lose.',
    art: ['#ecfbf9', '#d2f4ef'],
  },
];

export default function Onboarding() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const listRef = useRef(null);
  const [index, setIndex] = useState(0);
  const [steps, setSteps] = useState(FALLBACK_STEPS);
  const complete = useUiStore((s) => s.completeOnboarding);

  // the console owns these slides; the bundled ones are the offline fallback
  useEffect(() => {
    onboardingApi.list()
      .then((rows) => {
        if (!rows?.length) return;
        setSteps(
          rows.map((r) => ({
            icon: r.icon || 'sparkles-outline',
            title: r.title,
            body: r.body,
            image: r.image,
            ctaText: r.ctaText,
            art: [r.accentFrom || '#ecfbf9', r.accentTo || '#d2f4ef'],
          }))
        );
      })
      .catch(() => {});
  }, []);

  const finish = async () => {
    await complete();
    router.replace('/(tabs)');
  };

  const next = () => {
    if (index >= steps.length - 1) return finish();
    const to = index + 1;
    listRef.current?.scrollToIndex({ index: to, animated: true });
    setIndex(to);
    return undefined;
  };

  return (
    <View style={[styles.root, { paddingTop: insets.top + 8, paddingBottom: insets.bottom + 20 }]}>
      <View style={styles.topBar}>
        <View style={styles.brandRow}>
          <View style={styles.brandMark}>
            <Ionicons name="heart" size={15} color={colors.white} />
          </View>
          <Text style={styles.brandName}>HealthBridge</Text>
        </View>
        {index < steps.length - 1 && (
          <Pressable onPress={finish} hitSlop={10}>
            <Text style={styles.skip}>Skip</Text>
          </Pressable>
        )}
      </View>

      <FlatList
        ref={listRef}
        data={steps}
        keyExtractor={(item, i) => `${item.title}-${i}`}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(e) => setIndex(Math.round(e.nativeEvent.contentOffset.x / width))}
        getItemLayout={(_, i) => ({ length: width, offset: width * i, index: i })}
        renderItem={({ item }) => (
          <View style={[styles.slide, { width }]}>
            <LinearGradient colors={item.art} style={styles.art}>
              {item.image ? (
                <Image source={{ uri: item.image }} style={styles.artImage} />
              ) : (
                <View style={styles.artInner}>
                  <Ionicons name={item.icon} size={54} color={colors.brand600} />
                </View>
              )}
            </LinearGradient>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.body}>{item.body}</Text>
          </View>
        )}
      />

      <View style={styles.dots}>
        {steps.map((s, i) => (
          <View key={`${s.title}-${i}`} style={[styles.dot, i === index && styles.dotActive]} />
        ))}
      </View>

      <View style={styles.footer}>
        <Button
          title={
            index === steps.length - 1
              ? steps[index]?.ctaText || 'Get started'
              : 'Next'
          }
          onPress={next}
          size="lg"
          full
        />
        <Pressable onPress={finish} style={{ paddingVertical: 12 }}>
          <Text style={styles.browse}>Just browse for now</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.white },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  brandMark: {
    width: 28, height: 28, borderRadius: 9,
    backgroundColor: colors.brand500, alignItems: 'center', justifyContent: 'center',
  },
  brandName: { fontSize: 16, fontWeight: '800', color: colors.brand700 },
  skip: { color: colors.muted, fontWeight: '600', fontSize: 14 },
  slide: { paddingHorizontal: 28, alignItems: 'center', justifyContent: 'center', flexGrow: 1 },
  art: {
    width: 220, height: 220, borderRadius: 110,
    alignItems: 'center', justifyContent: 'center', marginBottom: 34,
  },
  artImage: { width: 220, height: 220, borderRadius: 110 },
  artInner: {
    width: 140, height: 140, borderRadius: 70,
    backgroundColor: colors.white, alignItems: 'center', justifyContent: 'center',
  },
  title: { fontSize: 25, fontWeight: '800', color: colors.ink, textAlign: 'center' },
  body: {
    fontSize: 15, lineHeight: 23, color: colors.inkSoft,
    textAlign: 'center', marginTop: 12, maxWidth: 320,
  },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 6, marginBottom: 22 },
  dot: { width: 7, height: 7, borderRadius: radius.pill, backgroundColor: colors.border },
  dotActive: { width: 22, backgroundColor: colors.brand500 },
  footer: { paddingHorizontal: 24, alignItems: 'center' },
  browse: { color: colors.muted, fontSize: 13.5, fontWeight: '600' },
});

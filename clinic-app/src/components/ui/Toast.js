import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, shadow } from '../../lib/theme';

const ToastContext = createContext({ show: () => {} });

export const useToast = () => useContext(ToastContext);

const TONES = {
  success: { icon: 'checkmark-circle', color: colors.success },
  error: { icon: 'alert-circle', color: colors.danger },
  info: { icon: 'information-circle', color: colors.info },
};

export function ToastProvider({ children }) {
  const insets = useSafeAreaInsets();
  const [toast, setToast] = useState(null);
  const opacity = useRef(new Animated.Value(0)).current;
  const timer = useRef(null);

  const show = useCallback((message, tone = 'info') => {
    if (!message) return;
    setToast({ message, tone });
  }, []);

  useEffect(() => {
    if (!toast) return undefined;
    Animated.timing(opacity, { toValue: 1, duration: 160, useNativeDriver: true }).start();
    clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      Animated.timing(opacity, { toValue: 0, duration: 200, useNativeDriver: true }).start(() =>
        setToast(null)
      );
    }, 2800);
    return () => clearTimeout(timer.current);
  }, [toast, opacity]);

  const tone = TONES[toast?.tone] || TONES.info;

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      {!!toast && (
        <Animated.View
          pointerEvents="none"
          style={[styles.wrap, { opacity, top: insets.top + 8 }]}
        >
          <View style={styles.toast}>
            <Ionicons name={tone.icon} size={18} color={tone.color} />
            <Text style={styles.text} numberOfLines={3}>{toast.message}</Text>
          </View>
        </Animated.View>
      )}
    </ToastContext.Provider>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'absolute', left: 16, right: 16, zIndex: 100 },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.white,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 12,
    paddingHorizontal: 14,
    ...shadow,
  },
  text: { flex: 1, color: colors.ink, fontSize: 13.5, fontWeight: '500' },
});

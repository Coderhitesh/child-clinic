import { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { ToastProvider } from '../src/components/ui/Toast';
import UpdateGate from '../src/components/app/UpdateGate';
import { useAuthStore } from '../src/store/authStore';
import { useUiStore } from '../src/store/uiStore';
import { websiteSettingApi } from '../src/services';
import { setupPush } from '../src/lib/push';
import { requestLocation, getPermissionStatus } from '../src/lib/location';
import { colors } from '../src/lib/theme';

SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  const router = useRouter();
  const segments = useSegments();
  const hydrate = useAuthStore((s) => s.hydrate);
  const hydrated = useAuthStore((s) => s.hydrated);
  const user = useAuthStore((s) => s.user);
  const { onboarded, loadOnboarded, setSettings, appConfig, refreshAppConfig, setLocation, markLocationAsked } = useUiStore();

  useEffect(() => {
    Promise.all([hydrate(), loadOnboarded(), refreshAppConfig()]).finally(() =>
      SplashScreen.hideAsync().catch(() => {})
    );
    websiteSettingApi.get().then(setSettings).catch(() => {});
  }, [hydrate, loadOnboarded, setSettings, refreshAppConfig]);

  // push: channels, permission, token registration and tap routing
  useEffect(() => {
    let dispose;
    setupPush({
      isSignedIn: Boolean(user),
      onOpen: (route) => route && router.push(route),
    })
      .then((fn) => { dispose = fn; })
      .catch(() => {});
    return () => dispose?.();
  }, [user, router]);

  // location: asked once, after onboarding, and entirely optional
  useEffect(() => {
    if (!onboarded) return;
    getPermissionStatus()
      .then(async (status) => {
        if (status === 'granted') {
          const res = await requestLocation();
          if (res.coords) setLocation(res.coords);
        } else {
          markLocationAsked();
        }
      })
      .catch(() => {});
  }, [onboarded, setLocation, markLocationAsked]);

  // the server can take the app offline for a deploy
  useEffect(() => {
    if (!appConfig?.maintenance?.enabled || appConfig.maintenance.allowBrowsing) return;
    if (segments[0] !== 'maintenance') router.replace('/maintenance');
  }, [appConfig, segments, router]);

  // first run goes to the onboarding steps, once
  useEffect(() => {
    if (!hydrated || onboarded === null) return;
    const onOnboarding = segments[0] === 'onboarding';
    if (!onboarded && !onOnboarding) router.replace('/onboarding');
  }, [hydrated, onboarded, segments, router]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ToastProvider>
          <StatusBar style="dark" />
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: colors.bg },
              animation: 'slide_from_right',
            }}
          >
            <Stack.Screen name="onboarding" options={{ animation: 'fade' }} />
            <Stack.Screen name="maintenance" options={{ animation: 'fade', gestureEnabled: false }} />
            <Stack.Screen name="(tabs)" options={{ animation: 'fade' }} />
          </Stack>
          <UpdateGate />
        </ToastProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

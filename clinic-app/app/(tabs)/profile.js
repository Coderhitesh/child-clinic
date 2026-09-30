import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Screen from '../../src/components/ui/Screen';
import Card from '../../src/components/ui/Card';
import Avatar from '../../src/components/ui/Avatar';
import Button from '../../src/components/ui/Button';
import Input from '../../src/components/ui/Input';
import { Badge } from '../../src/components/ui/Badge';
import { useToast } from '../../src/components/ui/Toast';
import { authApi } from '../../src/services';
import { requestPushPermission, getFcmToken, registerDevice } from '../../src/lib/push';
import { requestLocation } from '../../src/lib/location';
import { useAuthStore } from '../../src/store/authStore';
import { useUiStore } from '../../src/store/uiStore';
import { colors, font, radius } from '../../src/lib/theme';
import { currentVersion } from '../../src/lib/version';
import { getErr } from '../../src/lib/utils';

const LINKS = [
  { icon: 'people-outline', label: 'Family members', href: '/family', auth: true },
  { icon: 'document-text-outline', label: 'Prescriptions', href: '/prescriptions', auth: true },
  { icon: 'play-circle-outline', label: 'Care videos', href: '/videos', auth: true },
  { icon: 'business-outline', label: 'Our clinics', href: '/clinics' },
  { icon: 'medkit-outline', label: 'Specialities', href: '/specialities' },
  { icon: 'newspaper-outline', label: 'Health articles', href: '/blogs' },
  { icon: 'help-circle-outline', label: 'FAQs', href: '/faqs' },
  { icon: 'information-circle-outline', label: 'About us', href: '/about' },
  { icon: 'call-outline', label: 'Contact us', href: '/contact' },
  { icon: 'shield-checkmark-outline', label: 'Privacy policy', href: '/page/privacy-policy' },
  { icon: 'reader-outline', label: 'Terms of service', href: '/page/terms-and-conditions' },
];

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const toast = useToast();
  const { user, logout, refreshUser } = useAuthStore();
  const { settings, location, setLocation, appConfig } = useUiStore();

  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', phone: '' });
  const [busy, setBusy] = useState(false);

  const startEdit = () => {
    setForm({ name: user?.name || '', email: user?.email || '', phone: user?.phone || '' });
    setEditing(true);
  };

  const save = async () => {
    setBusy(true);
    try {
      await authApi.updateMe(form);
      await refreshUser();
      setEditing(false);
      toast.show('Profile updated', 'success');
    } catch (e) {
      toast.show(getErr(e), 'error');
    } finally {
      setBusy(false);
    }
  };

  const enableNotifications = async () => {
    const granted = await requestPushPermission();
    if (!granted) return toast.show('Notifications are off in your phone settings', 'info');
    const token = await getFcmToken().catch(() => null);
    if (token && user) await registerDevice(token).catch(() => {});
    toast.show('Notifications on — appointments, reminders and reports', 'success');
    return undefined;
  };

  const enableLocation = async () => {
    const res = await requestLocation();
    if (res.granted && res.coords) {
      setLocation(res.coords);
      toast.show('Location on — nearest clinics first', 'success');
    } else {
      toast.show('Location stays off', 'info');
    }
  };

  const signOut = async () => {
    await logout();
    toast.show('Signed out', 'info');
  };

  return (
    <Screen contentStyle={{ paddingTop: insets.top + 12 }}>
      <Text style={font.h1}>Profile</Text>

      <Card style={{ marginTop: 16 }}>
        {user ? (
          <>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
              <Avatar name={user.name} size={56} />
              <View style={{ flex: 1 }}>
                <Text style={font.h2} numberOfLines={1}>{user.name}</Text>
                <Text style={font.small}>{user.phone || user.email}</Text>
                <Badge label="Patient" style={{ marginTop: 6 }} />
              </View>
              {!editing && (
                <Pressable onPress={startEdit} hitSlop={10}>
                  <Ionicons name="create-outline" size={20} color={colors.brand600} />
                </Pressable>
              )}
            </View>

            {editing && (
              <View style={{ gap: 12, marginTop: 16 }}>
                <Input label="Full name" value={form.name} onChangeText={(v) => setForm((f) => ({ ...f, name: v }))} />
                <Input
                  label="Email"
                  value={form.email}
                  onChangeText={(v) => setForm((f) => ({ ...f, email: v }))}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
                <Input
                  label="Mobile"
                  value={form.phone}
                  onChangeText={(v) => setForm((f) => ({ ...f, phone: v }))}
                  keyboardType="phone-pad"
                />
                <View style={{ flexDirection: 'row', gap: 10 }}>
                  <Button title="Save" onPress={save} loading={busy} />
                  <Button title="Cancel" variant="outline" onPress={() => setEditing(false)} />
                </View>
              </View>
            )}
          </>
        ) : (
          <View style={{ gap: 12 }}>
            <Text style={font.h3}>You are browsing as a guest</Text>
            <Text style={font.body}>
              Verify your mobile number to see your visits, prescriptions and family records. No sign-up form.
            </Text>
            <Button title="Continue with OTP" onPress={() => router.push('/otp')} full />
          </View>
        )}
      </Card>

      <View style={styles.list}>
        <Pressable style={styles.row} onPress={enableNotifications}>
          <View style={styles.rowIcon}><Ionicons name="notifications-outline" size={17} color={colors.brand600} /></View>
          <View style={{ flex: 1 }}>
            <Text style={{ color: colors.ink, fontWeight: '600', fontSize: 14.5 }}>Notifications</Text>
            <Text style={font.small}>Appointments, reminders, payments and reports</Text>
          </View>
          <Ionicons name="chevron-forward" size={17} color={colors.muted} />
        </Pressable>

        <Pressable style={styles.row} onPress={enableLocation}>
          <View style={styles.rowIcon}><Ionicons name="location-outline" size={17} color={colors.brand600} /></View>
          <View style={{ flex: 1 }}>
            <Text style={{ color: colors.ink, fontWeight: '600', fontSize: 14.5 }}>Location</Text>
            <Text style={font.small}>{location ? 'On — nearest clinics first' : 'Off'}</Text>
          </View>
          <Ionicons name="chevron-forward" size={17} color={colors.muted} />
        </Pressable>

        {LINKS.filter((l) => !l.auth || user).map((l, i, arr) => (
          <Pressable
            key={l.href}
            style={[styles.row, i === arr.length - 1 && { borderBottomWidth: 0 }]}
            onPress={() => router.push(l.href)}
          >
            <View style={styles.rowIcon}>
              <Ionicons name={l.icon} size={17} color={colors.brand600} />
            </View>
            <Text style={{ flex: 1, color: colors.ink, fontWeight: '600', fontSize: 14.5 }}>{l.label}</Text>
            <Ionicons name="chevron-forward" size={17} color={colors.muted} />
          </Pressable>
        ))}
      </View>

      {!!user && (
        <Button title="Sign out" variant="danger" onPress={signOut} full style={{ marginTop: 20 }} />
      )}

      <Text style={[font.small, { textAlign: 'center', marginTop: 22 }]}>
        {settings?.siteName || 'HealthBridge'} · v{currentVersion}
        {appConfig?.version?.updateAvailable ? ` · ${appConfig.version.latestVersion} available` : ''}
      </Text>
      <Text style={[font.small, { textAlign: 'center', marginTop: 2 }]}>
        Clinic staff manage bookings from the web console.
      </Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  list: {
    marginTop: 18,
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 13,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  rowIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.brand50,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

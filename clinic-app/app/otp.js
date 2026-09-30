import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Screen from '../src/components/ui/Screen';
import Header from '../src/components/ui/Header';
import Input from '../src/components/ui/Input';
import Button from '../src/components/ui/Button';
import { useToast } from '../src/components/ui/Toast';
import { useAuthStore } from '../src/store/authStore';
import { colors, font, radius } from '../src/lib/theme';
import { getErr } from '../src/lib/utils';

/**
 * The main way in. No account needed up front: the number is verified with a code,
 * and the API creates the patient account on the spot if there isn't one.
 */
export default function OtpScreen() {
  const router = useRouter();
  const toast = useToast();
  const params = useLocalSearchParams();
  const { requestOtp, verifyOtp } = useAuthStore();

  const [identifier, setIdentifier] = useState('');
  const [name, setName] = useState('');
  const [otp, setOtp] = useState('');
  const [stage, setStage] = useState('identify');
  const [accountExists, setAccountExists] = useState(false);
  const [busy, setBusy] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (!cooldown) return undefined;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  const done = () => {
    const next = typeof params.next === 'string' ? params.next : null;
    if (next) router.replace(next);
    else if (router.canGoBack()) router.back();
    else router.replace('/(tabs)');
  };

  const send = async () => {
    const id = identifier.trim();
    if (!id) return toast.show('Enter your mobile number', 'error');
    if (!id.includes('@') && id.replace(/\D/g, '').length < 10) {
      return toast.show('That mobile number looks incomplete', 'error');
    }
    setBusy(true);
    try {
      const res = await requestOtp(id);
      setAccountExists(Boolean(res?.accountExists));
      setStage('code');
      setCooldown(30);
      toast.show(`Code sent to ${id}`, 'success');
    } catch (e) {
      toast.show(getErr(e), 'error');
    } finally {
      setBusy(false);
    }
    return undefined;
  };

  const verify = async () => {
    if (otp.trim().length < 4) return toast.show('Enter the code you received', 'error');
    setBusy(true);
    try {
      const user = await verifyOtp(identifier.trim(), otp.trim(), accountExists ? undefined : name.trim() || undefined);
      toast.show(accountExists ? `Welcome back, ${user.name.split(' ')[0]}` : 'Account created', 'success');
      done();
    } catch (e) {
      toast.show(getErr(e), 'error');
    } finally {
      setBusy(false);
    }
    return undefined;
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <Header title={stage === 'identify' ? 'Continue with OTP' : 'Enter the code'} />
      <Screen contentStyle={{ paddingTop: 8, gap: 18 }}>
        <View style={styles.hero}>
          <View style={styles.heroIcon}>
            <Ionicons name={stage === 'identify' ? 'phone-portrait-outline' : 'shield-checkmark-outline'} size={22} color={colors.brand600} />
          </View>
          <Text style={[font.body, { flex: 1 }]}>
            {stage === 'identify'
              ? 'No account needed. We send a one-time code and your bookings are saved against that number.'
              : accountExists
                ? `This number already has an account — the code signs you in.`
                : 'Almost there. Your account is created once the code checks out.'}
          </Text>
        </View>

        {stage === 'identify' ? (
          <>
            <Input
              label="Mobile number or email"
              value={identifier}
              onChangeText={setIdentifier}
              placeholder="98XXXXXXXX"
              keyboardType="email-address"
              autoCapitalize="none"
              autoFocus
              onSubmitEditing={send}
            />
            <Button title="Send code" onPress={send} loading={busy} size="lg" full />
          </>
        ) : (
          <>
            {!accountExists && (
              <Input
                label="Your name"
                value={name}
                onChangeText={setName}
                placeholder="As it should appear on records"
              />
            )}
            <Input
              label={`Code sent to ${identifier}`}
              value={otp}
              onChangeText={(v) => setOtp(v.replace(/\D/g, '').slice(0, 6))}
              placeholder="6-digit code"
              keyboardType="number-pad"
              autoFocus
              inputStyle={{ letterSpacing: 6, fontSize: 18, fontWeight: '700' }}
            />
            <Button
              title={accountExists ? 'Verify and sign in' : 'Verify and create account'}
              onPress={verify}
              loading={busy}
              size="lg"
              full
            />
            <View style={styles.actions}>
              <Pressable onPress={cooldown ? undefined : send} hitSlop={8}>
                <Text style={[styles.link, cooldown > 0 && { color: colors.muted }]}>
                  {cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend code'}
                </Text>
              </Pressable>
              <Pressable onPress={() => { setStage('identify'); setOtp(''); }} hitSlop={8}>
                <Text style={styles.link}>Use a different number</Text>
              </Pressable>
            </View>
          </>
        )}

        <View style={styles.divider}>
          <View style={styles.line} />
          <Text style={font.small}>or</Text>
          <View style={styles.line} />
        </View>

        <Button
          title="Sign in with a password"
          variant="outline"
          onPress={() => router.push('/login')}
          full
        />
        <Text style={[font.small, { textAlign: 'center' }]}>
          Clinic staff use the web console, not this app.
        </Text>
      </Screen>
    </View>
  );
}

const styles = StyleSheet.create({
  hero: {
    flexDirection: 'row',
    gap: 12,
    padding: 14,
    borderRadius: radius.lg,
    backgroundColor: colors.brand50,
  },
  heroIcon: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: colors.white, alignItems: 'center', justifyContent: 'center',
  },
  actions: { flexDirection: 'row', justifyContent: 'space-between' },
  link: { color: colors.brand700, fontWeight: '700', fontSize: 13 },
  divider: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 6 },
  line: { flex: 1, height: 1, backgroundColor: colors.border },
});

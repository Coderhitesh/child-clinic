import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Card from '../ui/Card';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { useToast } from '../ui/Toast';
import { useAuthStore } from '../../store/authStore';
import { colors, font } from '../../lib/theme';
import { getErr } from '../../lib/utils';

/**
 * Inline "no account needed" step. The visitor proves a number with an OTP and the
 * API creates their patient account, so booking never starts with a sign-up form.
 */
export default function GuestVerify({ onVerified }) {
  const toast = useToast();
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
      const signedIn = await verifyOtp(
        identifier.trim(),
        otp.trim(),
        accountExists ? undefined : name.trim() || undefined
      );
      toast.show(accountExists ? 'Welcome back' : 'Number verified — account created', 'success');
      await onVerified?.(signedIn);
    } catch (e) {
      toast.show(getErr(e), 'error');
    } finally {
      setBusy(false);
    }
    return undefined;
  };

  return (
    <Card style={{ borderColor: colors.brand200, backgroundColor: colors.brand50 }}>
      <View style={{ flexDirection: 'row', gap: 12 }}>
        <View style={styles.icon}>
          <Ionicons
            name={stage === 'identify' ? 'phone-portrait-outline' : 'shield-checkmark-outline'}
            size={18}
            color={colors.brand600}
          />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={font.h3}>
            {stage === 'identify' ? 'Your mobile number' : 'Enter the code'}
          </Text>
          <Text style={[font.small, { marginTop: 2 }]}>
            {stage === 'identify'
              ? 'No account needed — we save the booking against this number.'
              : accountExists
                ? 'This number already has an account. The code signs you in.'
                : 'Your account is created once the code checks out.'}
          </Text>
        </View>
      </View>

      {stage === 'identify' ? (
        <View style={{ gap: 10, marginTop: 14 }}>
          <Input
            value={identifier}
            onChangeText={setIdentifier}
            placeholder="98XXXXXXXX"
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <Button title="Send code" onPress={send} loading={busy} full />
        </View>
      ) : (
        <View style={{ gap: 10, marginTop: 14 }}>
          {!accountExists && (
            <Input label="Your name" value={name} onChangeText={setName} placeholder="As it should appear on records" />
          )}
          <Input
            value={otp}
            onChangeText={(v) => setOtp(v.replace(/\D/g, '').slice(0, 6))}
            placeholder="6-digit code"
            keyboardType="number-pad"
            inputStyle={{ letterSpacing: 5, fontWeight: '700' }}
          />
          <Button title="Verify and continue" onPress={verify} loading={busy} full />
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Pressable onPress={cooldown ? undefined : send} hitSlop={8}>
              <Text style={[styles.link, cooldown > 0 && { color: colors.muted }]}>
                {cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend code'}
              </Text>
            </Pressable>
            <Pressable onPress={() => { setStage('identify'); setOtp(''); }} hitSlop={8}>
              <Text style={styles.link}>Use another number</Text>
            </Pressable>
          </View>
        </View>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  icon: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: colors.white, alignItems: 'center', justifyContent: 'center',
  },
  link: { color: colors.brand700, fontWeight: '700', fontSize: 12.5 },
});

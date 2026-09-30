import { useState } from 'react';
import { Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import Screen from '../src/components/ui/Screen';
import Header from '../src/components/ui/Header';
import Input from '../src/components/ui/Input';
import Button from '../src/components/ui/Button';
import { EmptyState } from '../src/components/ui/States';
import { useToast } from '../src/components/ui/Toast';
import { authApi } from '../src/services';
import { colors, font } from '../src/lib/theme';
import { getErr } from '../src/lib/utils';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const toast = useToast();
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  const submit = async () => {
    if (!email) return toast.show('Enter the email on your account', 'error');
    setBusy(true);
    try {
      await authApi.forgotPassword(email.trim());
      setSent(true);
    } catch (e) {
      toast.show(getErr(e), 'error');
    } finally {
      setBusy(false);
    }
    return undefined;
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <Header title="Reset your password" />
      <Screen contentStyle={{ paddingTop: 8, gap: 16 }}>
        {sent ? (
          <EmptyState
            icon="mail-open-outline"
            title="Check your inbox"
            description={`If ${email} has an account, a reset link is on its way. It expires in 30 minutes.`}
            actionTitle="Back to sign in"
            onAction={() => router.replace('/login')}
          />
        ) : (
          <>
            <Text style={font.body}>
              Enter your email and we will send a link to set a new password. Patients can also just use an OTP.
            </Text>
            <Input
              label="Email"
              value={email}
              onChangeText={setEmail}
              placeholder="you@example.com"
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <Button title="Send reset link" onPress={submit} loading={busy} size="lg" full />
            <Button title="Continue with OTP instead" variant="ghost" onPress={() => router.replace('/otp')} full />
          </>
        )}
      </Screen>
    </View>
  );
}

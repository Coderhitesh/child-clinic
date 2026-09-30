import { useState } from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import Screen from '../src/components/ui/Screen';
import Header from '../src/components/ui/Header';
import Input from '../src/components/ui/Input';
import Button from '../src/components/ui/Button';
import { useToast } from '../src/components/ui/Toast';
import { useAuthStore } from '../src/store/authStore';
import { colors } from '../src/lib/theme';
import { getErr } from '../src/lib/utils';

export default function RegisterScreen() {
  const router = useRouter();
  const toast = useToast();
  const register = useAuthStore((s) => s.register);
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' });
  const [busy, setBusy] = useState(false);

  const set = (patch) => setForm((f) => ({ ...f, ...patch }));

  const submit = async () => {
    if (!form.name || !form.email || !form.phone) return toast.show('Name, email and phone are needed', 'error');
    if (form.password.length < 8) return toast.show('Use at least 8 characters for the password', 'error');
    setBusy(true);
    try {
      await register(form);
      toast.show('Account created', 'success');
      router.replace('/(tabs)');
    } catch (e) {
      toast.show(getErr(e), 'error');
    } finally {
      setBusy(false);
    }
    return undefined;
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <Header title="Create an account" subtitle="Or skip this and just verify your number" />
      <Screen contentStyle={{ paddingTop: 8, gap: 16 }}>
        <Input label="Full name" value={form.name} onChangeText={(v) => set({ name: v })} placeholder="Your name" />
        <Input
          label="Email"
          value={form.email}
          onChangeText={(v) => set({ email: v })}
          placeholder="you@example.com"
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <Input
          label="Mobile number"
          value={form.phone}
          onChangeText={(v) => set({ phone: v })}
          placeholder="98XXXXXXXX"
          keyboardType="phone-pad"
        />
        <Input
          label="Password"
          value={form.password}
          onChangeText={(v) => set({ password: v })}
          secure
          hint="At least 8 characters"
        />
        <Button title="Create account" onPress={submit} loading={busy} size="lg" full />
        <Button title="Continue with OTP instead" variant="ghost" onPress={() => router.replace('/otp')} full />
      </Screen>
    </View>
  );
}

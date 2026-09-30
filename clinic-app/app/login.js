import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Screen from '../src/components/ui/Screen';
import Header from '../src/components/ui/Header';
import Input from '../src/components/ui/Input';
import Button from '../src/components/ui/Button';
import { useToast } from '../src/components/ui/Toast';
import { useAuthStore } from '../src/store/authStore';
import { colors, font } from '../src/lib/theme';
import { getErr } from '../src/lib/utils';

export default function LoginScreen() {
  const router = useRouter();
  const toast = useToast();
  const params = useLocalSearchParams();
  const login = useAuthStore((s) => s.login);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (!email || !password) return toast.show('Email and password are needed', 'error');
    setBusy(true);
    try {
      const user = await login(email.trim(), password);
      toast.show(`Welcome back, ${user.name.split(' ')[0]}`, 'success');
      const next = typeof params.next === 'string' ? params.next : null;
      if (next) router.replace(next);
      else router.replace('/(tabs)');
    } catch (e) {
      toast.show(getErr(e), 'error');
    } finally {
      setBusy(false);
    }
    return undefined;
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <Header title="Sign in" subtitle="With the password on your account" />
      <Screen contentStyle={{ paddingTop: 8, gap: 16 }}>
        <Input
          label="Email"
          value={email}
          onChangeText={setEmail}
          placeholder="you@example.com"
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <Input label="Password" value={password} onChangeText={setPassword} secure placeholder="Your password" />

        <Pressable onPress={() => router.push('/forgot-password')} style={{ alignSelf: 'flex-end' }} hitSlop={8}>
          <Text style={styles.link}>Forgot password?</Text>
        </Pressable>

        <Button title="Sign in" onPress={submit} loading={busy} size="lg" full />

        <View style={styles.foot}>
          <Text style={font.small}>No password, or new here?</Text>
          <Pressable onPress={() => router.replace('/otp')} hitSlop={8}>
            <Text style={styles.link}>Continue with OTP</Text>
          </Pressable>
        </View>
        <View style={styles.foot}>
          <Text style={font.small}>Prefer a full sign-up?</Text>
          <Pressable onPress={() => router.push('/register')} hitSlop={8}>
            <Text style={styles.link}>Create an account</Text>
          </Pressable>
        </View>
      </Screen>
    </View>
  );
}

const styles = StyleSheet.create({
  link: { color: colors.brand700, fontWeight: '700', fontSize: 13.5 },
  foot: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
});

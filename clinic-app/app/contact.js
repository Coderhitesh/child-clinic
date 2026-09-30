import { useState } from 'react';
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Screen from '../src/components/ui/Screen';
import Header from '../src/components/ui/Header';
import Card from '../src/components/ui/Card';
import Input from '../src/components/ui/Input';
import Button from '../src/components/ui/Button';
import { EmptyState } from '../src/components/ui/States';
import { useToast } from '../src/components/ui/Toast';
import { contactApi } from '../src/services';
import { useAuthStore } from '../src/store/authStore';
import { useUiStore } from '../src/store/uiStore';
import { colors, font, radius } from '../src/lib/theme';
import { getErr } from '../src/lib/utils';

export default function ContactScreen() {
  const toast = useToast();
  const user = useAuthStore((s) => s.user);
  const settings = useUiStore((s) => s.settings);

  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    subject: '',
    message: '',
  });
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  const set = (patch) => setForm((f) => ({ ...f, ...patch }));

  const submit = async () => {
    if (!form.name || !form.message) return toast.show('Name and message are needed', 'error');
    if (!form.email && !form.phone) return toast.show('Leave an email or a phone number', 'error');
    setBusy(true);
    try {
      await contactApi.submit(form);
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
      <Header title="Contact us" subtitle="We usually reply the same day" />
      <Screen contentStyle={{ gap: 14, paddingTop: 4 }}>
        <View style={{ flexDirection: 'row', gap: 10 }}>
          {!!settings?.contactPhone && (
            <Pressable style={styles.quick} onPress={() => Linking.openURL(`tel:${settings.contactPhone}`)}>
              <Ionicons name="call-outline" size={18} color={colors.brand600} />
              <Text style={font.label}>Call us</Text>
              <Text style={font.small}>{settings.contactPhone}</Text>
            </Pressable>
          )}
          {!!settings?.contactEmail && (
            <Pressable style={styles.quick} onPress={() => Linking.openURL(`mailto:${settings.contactEmail}`)}>
              <Ionicons name="mail-outline" size={18} color={colors.brand600} />
              <Text style={font.label}>Email us</Text>
              <Text style={font.small} numberOfLines={1}>{settings.contactEmail}</Text>
            </Pressable>
          )}
        </View>

        {sent ? (
          <EmptyState
            icon="checkmark-circle-outline"
            title="Message sent"
            description="Thanks for writing in. Someone from the clinic will get back to you shortly."
          />
        ) : (
          <Card style={{ gap: 12 }}>
            <Text style={font.h3}>Send us a message</Text>
            <Input label="Your name" value={form.name} onChangeText={(v) => set({ name: v })} />
            <Input
              label="Email"
              value={form.email}
              onChangeText={(v) => set({ email: v })}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <Input label="Mobile" value={form.phone} onChangeText={(v) => set({ phone: v })} keyboardType="phone-pad" />
            <Input label="Subject" value={form.subject} onChangeText={(v) => set({ subject: v })} placeholder="What is this about?" />
            <Input
              label="Message"
              value={form.message}
              onChangeText={(v) => set({ message: v })}
              multiline
              placeholder="Tell us how we can help"
            />
            <Button title="Send message" onPress={submit} loading={busy} full />
          </Card>
        )}

        {!!settings?.address && (
          <Card>
            <Text style={font.h3}>Visit us</Text>
            <Text style={[font.body, { marginTop: 6 }]}>{settings.address}</Text>
          </Card>
        )}
      </Screen>
    </View>
  );
}

const styles = StyleSheet.create({
  quick: {
    flex: 1,
    gap: 4,
    padding: 14,
    borderRadius: radius.lg,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
  },
});

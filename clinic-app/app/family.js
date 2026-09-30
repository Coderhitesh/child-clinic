import { useCallback, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Screen from '../src/components/ui/Screen';
import Header from '../src/components/ui/Header';
import Card from '../src/components/ui/Card';
import Avatar from '../src/components/ui/Avatar';
import Button from '../src/components/ui/Button';
import Input from '../src/components/ui/Input';
import Select from '../src/components/ui/Select';
import { EmptyState, Loader } from '../src/components/ui/States';
import { useToast } from '../src/components/ui/Toast';
import AuthGate from '../src/components/app/AuthGate';
import { patientApi } from '../src/services';
import { useAuthStore } from '../src/store/authStore';
import { colors, font, radius } from '../src/lib/theme';
import { GENDERS } from '../src/lib/constants';
import { getErr, prettyDate, titleCase } from '../src/lib/utils';

const blank = {
  name: '', dob: '', age: '', gender: '',
  contact: { phone: '', email: '' },
  guardianDetails: { name: '', relation: '', phone: '' },
  extraDetails: '',
};

export default function FamilyScreen() {
  const router = useRouter();
  const toast = useToast();
  const user = useAuthStore((s) => s.user);

  const [rows, setRows] = useState(null);
  const [form, setForm] = useState(blank);
  const [editing, setEditing] = useState(null);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    if (!user) { setRows([]); return; }
    try { setRows((await patientApi.list()) || []); }
    catch (e) { setRows([]); toast.show(getErr(e), 'error'); }
  }, [user, toast]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const set = (patch) => setForm((f) => ({ ...f, ...patch }));

  const startAdd = () => { setEditing(null); setForm(blank); setOpen(true); };
  const startEdit = (p) => {
    setEditing(p);
    setForm({
      ...blank,
      ...p,
      age: p.age ? String(p.age) : '',
      dob: p.dob ? String(p.dob).slice(0, 10) : '',
      contact: p.contact || blank.contact,
      guardianDetails: p.guardianDetails || blank.guardianDetails,
    });
    setOpen(true);
  };

  const save = async () => {
    if (!form.name) return toast.show('A name is needed', 'error');
    setBusy(true);
    try {
      const payload = { ...form, age: form.age ? Number(form.age) : undefined };
      if (!payload.dob) delete payload.dob;
      if (editing) await patientApi.update(editing._id, payload);
      else await patientApi.create(payload);
      toast.show(editing ? 'Details updated' : 'Family member added', 'success');
      setOpen(false);
      load();
    } catch (e) {
      toast.show(getErr(e), 'error');
    } finally {
      setBusy(false);
    }
    return undefined;
  };

  const remove = (p) => {
    Alert.alert(
      `Remove ${p.name}?`,
      'If they have past visits the record is archived so prescriptions stay intact. Cancel any upcoming appointments first.',
      [
        { text: 'Keep', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              const res = await patientApi.remove(p._id);
              toast.show(res?.archived ? 'Removed — past visits kept on record' : 'Removed', 'success');
              load();
            } catch (e) {
              toast.show(getErr(e), 'error');
            }
          },
        },
      ]
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <Header title="Family members" subtitle="Book for your children, parents or anyone in your care" />
      <Screen contentStyle={{ gap: 14, paddingTop: 4 }}>
        <AuthGate description="Family records sit against your account. Verify your number to manage them.">
          {rows === null ? (
            <Loader />
          ) : open ? (
            <Card style={{ gap: 12 }}>
              <Text style={font.h3}>{editing ? `Edit ${editing.name}` : 'Add a family member'}</Text>
              <Input label="Full name" value={form.name} onChangeText={(v) => set({ name: v })} />
              <View style={{ flexDirection: 'row', gap: 12 }}>
                <Input
                  label="Age"
                  value={form.age}
                  onChangeText={(v) => set({ age: v.replace(/\D/g, '') })}
                  keyboardType="number-pad"
                  style={{ flex: 1 }}
                />
                <Select
                  label="Gender"
                  value={form.gender}
                  onChange={(v) => set({ gender: v })}
                  options={GENDERS.map((g) => ({ value: g, label: titleCase(g) }))}
                  placeholder="Select"
                  style={{ flex: 1 }}
                />
              </View>
              <Input
                label="Mobile"
                value={form.contact.phone}
                onChangeText={(v) => set({ contact: { ...form.contact, phone: v } })}
                keyboardType="phone-pad"
              />
              <Input
                label="Guardian name"
                value={form.guardianDetails.name}
                onChangeText={(v) => set({ guardianDetails: { ...form.guardianDetails, name: v } })}
                placeholder="For a child or dependent"
              />
              <Input
                label="Relation"
                value={form.guardianDetails.relation}
                onChangeText={(v) => set({ guardianDetails: { ...form.guardianDetails, relation: v } })}
                placeholder="Mother, son, spouse…"
              />
              <Input
                label="Anything the doctor should know"
                value={form.extraDetails}
                onChangeText={(v) => set({ extraDetails: v })}
                multiline
                placeholder="Ongoing medication, past surgeries…"
              />
              <View style={{ flexDirection: 'row', gap: 10 }}>
                <Button title={editing ? 'Save changes' : 'Add member'} onPress={save} loading={busy} />
                <Button title="Cancel" variant="outline" onPress={() => setOpen(false)} />
              </View>
            </Card>
          ) : (
            <>
              <Button title="Add a family member" onPress={startAdd} full />
              {rows.map((p) => (
                <Card key={p._id}>
                  <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
                    <Avatar name={p.name} size={46} />
                    <View style={{ flex: 1 }}>
                      <Text style={font.h3}>{p.name}</Text>
                      <Text style={font.small}>
                        {[p.age ? `${p.age} yrs` : p.dob ? prettyDate(p.dob) : null, p.gender && titleCase(p.gender), p.contact?.phone]
                          .filter(Boolean).join(' · ') || '—'}
                      </Text>
                    </View>
                    <Pressable onPress={() => startEdit(p)} hitSlop={10} style={styles.iconBtn}>
                      <Ionicons name="create-outline" size={17} color={colors.brand600} />
                    </Pressable>
                    <Pressable onPress={() => remove(p)} hitSlop={10} style={styles.iconBtn}>
                      <Ionicons name="trash-outline" size={17} color={colors.danger} />
                    </Pressable>
                  </View>
                  <Button
                    title="Book for them"
                    variant="soft"
                    size="sm"
                    style={{ marginTop: 12 }}
                    onPress={() => router.push('/book')}
                  />
                </Card>
              ))}
              {rows.length === 0 && (
                <EmptyState
                  icon="people-outline"
                  title="No family members yet"
                  description="Add someone once, then book visits for them in two taps."
                  actionTitle="Add a member"
                  onAction={startAdd}
                />
              )}
            </>
          )}
        </AuthGate>
      </Screen>
    </View>
  );
}

const styles = StyleSheet.create({
  iconBtn: {
    width: 34, height: 34, borderRadius: radius.pill,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: colors.border, backgroundColor: colors.white,
  },
});

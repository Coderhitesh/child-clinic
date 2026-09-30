import { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Screen from '../../src/components/ui/Screen';
import Input from '../../src/components/ui/Input';
import Chip from '../../src/components/ui/Chip';
import Select from '../../src/components/ui/Select';
import Card from '../../src/components/ui/Card';
import { DoctorCard } from '../../src/components/app/cards';
import { EmptyState, Loader } from '../../src/components/ui/States';
import { doctorApi, specialityApi, clinicApi } from '../../src/services';
import { colors, font, radius } from '../../src/lib/theme';
import { idOf } from '../../src/lib/utils';

const FEE_BANDS = [
  { value: '', label: 'Any fee' },
  { value: '0-500', label: 'Under ₹500' },
  { value: '500-1000', label: '₹500 – ₹1,000' },
  { value: '1000-99999', label: 'Above ₹1,000' },
];

const EXPERIENCE = [
  { value: '', label: 'Any experience' },
  { value: '0', label: 'All doctors' },
  { value: '5', label: '5+ years' },
  { value: '10', label: '10+ years' },
  { value: '15', label: '15+ years' },
];

export default function DoctorsScreen() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams();

  const [doctors, setDoctors] = useState(null);
  const [specialities, setSpecialities] = useState([]);
  const [clinics, setClinics] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const [search, setSearch] = useState('');
  const [speciality, setSpeciality] = useState(typeof params.speciality === 'string' ? params.speciality : '');
  const [clinic, setClinic] = useState('');
  const [fee, setFee] = useState('');
  const [experience, setExperience] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const load = async () => {
    const [d, s, c] = await Promise.all([
      doctorApi.list().catch(() => []),
      specialityApi.list().catch(() => []),
      clinicApi.list().catch(() => []),
    ]);
    setDoctors(d || []);
    setSpecialities(s || []);
    setClinics(c || []);
  };

  useEffect(() => { load(); }, []);

  const refresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const filtered = useMemo(() => {
    if (!doctors) return [];
    const q = search.trim().toLowerCase();
    const [min, max] = fee ? fee.split('-').map(Number) : [];
    return doctors.filter((d) => {
      if (q && ![d.name, d.qualification, d.speciality?.name].filter(Boolean)
        .some((v) => v.toLowerCase().includes(q))) return false;
      if (speciality && idOf(d.speciality) !== speciality) return false;
      if (clinic && !(d.clinics || []).some((c) => idOf(c) === clinic)) return false;
      if (fee) {
        const f = d.consultationFee || 0;
        if (f < min || f > max) return false;
      }
      if (experience && (d.experienceYears || 0) < Number(experience)) return false;
      return true;
    });
  }, [doctors, search, speciality, clinic, fee, experience]);

  const activeFilters = [speciality, clinic, fee, experience].filter(Boolean).length;

  if (!doctors) return <Loader label="Finding doctors" />;

  return (
    <Screen refreshing={refreshing} onRefresh={refresh} padded={false} contentStyle={{ paddingTop: insets.top + 12 }}>
      <View style={{ paddingHorizontal: 16 }}>
        <Text style={font.h1}>Find a doctor</Text>
        <Text style={[font.body, { marginTop: 2 }]}>
          {filtered.length} {filtered.length === 1 ? 'doctor' : 'doctors'} available
        </Text>

        <Input
          value={search}
          onChangeText={setSearch}
          placeholder="Search by name, speciality or qualification"
          style={{ marginTop: 14 }}
        />

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
          <Chip label="All" active={!speciality} onPress={() => setSpeciality('')} />
          {specialities.map((s) => (
            <Chip
              key={s._id}
              label={s.name}
              active={speciality === s._id}
              onPress={() => setSpeciality(speciality === s._id ? '' : s._id)}
            />
          ))}
        </ScrollView>

        <Pressable style={styles.filterToggle} onPress={() => setShowFilters((v) => !v)}>
          <Ionicons name="options-outline" size={16} color={colors.brand700} />
          <Text style={{ color: colors.brand700, fontWeight: '700', fontSize: 13 }}>
            {showFilters ? 'Hide filters' : 'More filters'}
            {activeFilters > 0 ? ` (${activeFilters})` : ''}
          </Text>
        </Pressable>

        {showFilters && (
          <Card style={{ gap: 14, marginBottom: 6 }}>
            <Select
              label="Clinic"
              value={clinic}
              onChange={setClinic}
              allowEmpty
              emptyLabel="Any clinic"
              placeholder="Any clinic"
              options={clinics.map((c) => ({ value: c._id, label: c.name }))}
            />
            <Select label="Consultation fee" value={fee} onChange={setFee} options={FEE_BANDS} placeholder="Any fee" />
            <Select
              label="Experience"
              value={experience}
              onChange={setExperience}
              options={EXPERIENCE}
              placeholder="Any experience"
            />
            <Pressable
              onPress={() => { setClinic(''); setFee(''); setExperience(''); setSpeciality(''); }}
              hitSlop={8}
            >
              <Text style={{ color: colors.muted, fontWeight: '600', fontSize: 13 }}>Clear all filters</Text>
            </Pressable>
          </Card>
        )}

        <View style={{ gap: 12, marginTop: 12 }}>
          {filtered.map((d) => (
            <DoctorCard key={d._id} doctor={d} wide />
          ))}
          {filtered.length === 0 && (
            <EmptyState
              icon="search-outline"
              title="No doctors match that"
              description="Try a different speciality, or clear the filters."
              actionTitle="Clear filters"
              onAction={() => { setSearch(''); setSpeciality(''); setClinic(''); setFee(''); setExperience(''); }}
            />
          )}
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  chipRow: { gap: 8, paddingVertical: 14 },
  filterToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: radius.pill,
    backgroundColor: colors.brand50,
    marginBottom: 12,
  },
});

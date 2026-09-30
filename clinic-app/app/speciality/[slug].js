import { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Screen from '../../src/components/ui/Screen';
import Header from '../../src/components/ui/Header';
import Card from '../../src/components/ui/Card';
import Button from '../../src/components/ui/Button';
import { DoctorCard, SectionHead } from '../../src/components/app/cards';
import { EmptyState, Loader } from '../../src/components/ui/States';
import { specialityApi, doctorApi, faqApi } from '../../src/services';
import { colors, font } from '../../src/lib/theme';
import { idOf } from '../../src/lib/utils';

export default function SpecialityScreen() {
  const { slug } = useLocalSearchParams();
  const router = useRouter();
  const [speciality, setSpeciality] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [faqs, setFaqs] = useState([]);

  useEffect(() => {
    Promise.all([specialityApi.list().catch(() => []), doctorApi.list().catch(() => []), faqApi.list().catch(() => [])])
      .then(([sp, dc, fq]) => {
        const found = (sp || []).find((s) => s.slug === slug || s._id === slug) || null;
        setSpeciality(found);
        setDoctors((dc || []).filter((d) => idOf(d.speciality) === found?._id));
        setFaqs((fq || []).filter((f) => !f.speciality || idOf(f.speciality) === found?._id).slice(0, 6));
      });
  }, [slug]);

  if (speciality === null) return <Loader label="Loading" />;

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <Header title={speciality?.name || 'Speciality'} />
      <Screen contentStyle={{ paddingTop: 4 }}>
        {!speciality ? (
          <EmptyState icon="medkit-outline" title="Speciality not found" />
        ) : (
          <>
            <Card>
              <Text style={font.h2}>{speciality.name}</Text>
              {!!speciality.description && (
                <Text style={[font.body, { marginTop: 8, lineHeight: 21 }]}>{speciality.description}</Text>
              )}
              <Button
                title="Book in this speciality"
                onPress={() => router.push(`/(tabs)/doctors?speciality=${speciality._id}`)}
                style={{ marginTop: 14 }}
              />
            </Card>

            <SectionHead title="Doctors" />
            <View style={{ gap: 12 }}>
              {doctors.map((d) => <DoctorCard key={d._id} doctor={d} wide />)}
              {doctors.length === 0 && <Text style={font.small}>No doctors listed here yet.</Text>}
            </View>

            {faqs.length > 0 && (
              <>
                <SectionHead title="Common questions" />
                <View style={{ gap: 10 }}>
                  {faqs.map((f) => (
                    <Card key={f._id}>
                      <Text style={font.label}>{f.question}</Text>
                      <Text style={[font.body, { marginTop: 6 }]}>{f.answer}</Text>
                    </Card>
                  ))}
                </View>
              </>
            )}
          </>
        )}
      </Screen>
    </View>
  );
}

import { useEffect, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Screen from '../src/components/ui/Screen';
import Header from '../src/components/ui/Header';
import Card from '../src/components/ui/Card';
import { EmptyState, Loader } from '../src/components/ui/States';
import { faqApi } from '../src/services';
import { colors, font } from '../src/lib/theme';

export default function FaqsScreen() {
  const [rows, setRows] = useState(null);
  const [open, setOpen] = useState('');

  useEffect(() => {
    faqApi.list().then((d) => setRows(d || [])).catch(() => setRows([]));
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <Header title="FAQs" subtitle="Answers to the usual questions" />
      <Screen contentStyle={{ gap: 10, paddingTop: 4 }}>
        {rows === null ? (
          <Loader />
        ) : rows.length === 0 ? (
          <EmptyState icon="help-circle-outline" title="No questions yet" />
        ) : (
          rows.map((f) => {
            const expanded = open === f._id;
            return (
              <Card key={f._id} onPress={() => setOpen(expanded ? '' : f._id)}>
                <View style={{ flexDirection: 'row', gap: 10, alignItems: 'flex-start' }}>
                  <Text style={[font.label, { flex: 1 }]}>{f.question}</Text>
                  <Ionicons name={expanded ? 'chevron-up' : 'chevron-down'} size={17} color={colors.muted} />
                </View>
                {expanded && <Text style={[font.body, { marginTop: 10, lineHeight: 21 }]}>{f.answer}</Text>}
              </Card>
            );
          })
        )}
      </Screen>
    </View>
  );
}

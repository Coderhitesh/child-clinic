import { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import Screen from '../../src/components/ui/Screen';
import Header from '../../src/components/ui/Header';
import HtmlContent from '../../src/components/app/HtmlContent';
import { EmptyState, Loader } from '../../src/components/ui/States';
import { cmsPageApi } from '../../src/services';
import { colors, font } from '../../src/lib/theme';
import { titleCase } from '../../src/lib/utils';

export default function CmsPageScreen() {
  const { slug } = useLocalSearchParams();
  const [page, setPage] = useState(undefined);

  useEffect(() => {
    cmsPageApi.bySlug(slug).then(setPage).catch(() => setPage(null));
  }, [slug]);

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <Header title={page?.title || titleCase(String(slug || 'Page'))} />
      <Screen contentStyle={{ paddingTop: 4, gap: 12 }}>
        {page === undefined ? (
          <Loader />
        ) : !page ? (
          <EmptyState
            icon="document-outline"
            title="Page not available"
            description="This page has not been published yet."
          />
        ) : (
          <>
            <Text style={font.h1}>{page.title}</Text>
            <HtmlContent html={page.content} />
          </>
        )}
      </Screen>
    </View>
  );
}

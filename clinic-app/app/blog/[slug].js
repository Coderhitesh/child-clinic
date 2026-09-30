import { useEffect, useState } from 'react';
import { Image, Text, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import Screen from '../../src/components/ui/Screen';
import Header from '../../src/components/ui/Header';
import HtmlContent from '../../src/components/app/HtmlContent';
import { Badge } from '../../src/components/ui/Badge';
import { ErrorState, Loader } from '../../src/components/ui/States';
import { blogApi } from '../../src/services';
import { colors, font, radius } from '../../src/lib/theme';
import { getErr, prettyDate } from '../../src/lib/utils';

export default function BlogScreen() {
  const { slug } = useLocalSearchParams();
  const [blog, setBlog] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    blogApi.bySlug(slug).then(setBlog).catch((e) => setError(getErr(e)));
  }, [slug]);

  if (error) return <ErrorState message={error} />;
  if (!blog) return <Loader label="Loading article" />;

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <Header title="Article" />
      <Screen contentStyle={{ paddingTop: 4, gap: 14 }}>
        {!!blog.coverImage && (
          <Image source={{ uri: blog.coverImage }} style={{ width: '100%', height: 190, borderRadius: radius.lg }} />
        )}
        {!!blog.category?.name && <Badge label={blog.category.name} />}
        <Text style={font.h1}>{blog.title}</Text>
        {!!blog.publishedAt && <Text style={font.small}>{prettyDate(blog.publishedAt)}</Text>}
        {!!blog.excerpt && <Text style={[font.body, { fontStyle: 'italic' }]}>{blog.excerpt}</Text>}
        <HtmlContent html={blog.content} />
      </Screen>
    </View>
  );
}

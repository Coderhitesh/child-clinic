import { View } from 'react-native';
import { useRouter } from 'expo-router';
import Screen from '../src/components/ui/Screen';
import Header from '../src/components/ui/Header';
import { EmptyState } from '../src/components/ui/States';
import { colors } from '../src/lib/theme';

export default function NotFound() {
  const router = useRouter();
  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <Header title="Not found" />
      <Screen>
        <EmptyState
          icon="compass-outline"
          title="That page does not exist"
          description="The link may be old, or the content was removed."
          actionTitle="Go home"
          onAction={() => router.replace('/(tabs)')}
        />
      </Screen>
    </View>
  );
}

import { useRouter } from 'expo-router';
import { View } from 'react-native';
import { useAuthStore } from '../../store/authStore';
import { EmptyState, Loader } from '../ui/States';

/**
 * Wraps the screens that need a session. Nothing is force-redirected — the person
 * sees why they need to sign in and can do it from here, which keeps the browsing
 * parts of the app open to visitors.
 */
export default function AuthGate({ children, title = 'Sign in to continue', description }) {
  const router = useRouter();
  const { user, hydrated } = useAuthStore();

  if (!hydrated) return <Loader label="Loading" />;

  if (!user) {
    return (
      <View style={{ padding: 16 }}>
        <EmptyState
          icon="lock-closed-outline"
          title={title}
          description={description || 'Verify your mobile number — it takes a few seconds and creates your account if you are new.'}
          actionTitle="Continue with OTP"
          onAction={() => router.push('/otp')}
        />
      </View>
    );
  }

  return children;
}

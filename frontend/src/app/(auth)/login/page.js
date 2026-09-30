import { Suspense } from 'react';
import LoginForm from './login-form';
import { PageLoader } from '@/components/ui/spinner';

export const metadata = { title: 'Sign in' };

export default function LoginPage() {
  return (
    <Suspense fallback={<PageLoader label="Loading sign in" />}>
      <LoginForm />
    </Suspense>
  );
}

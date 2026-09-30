import { Suspense } from 'react';
import ResetForm from './reset-form';
import { PageLoader } from '@/components/ui/spinner';

export const metadata = { title: 'Set a new password' };

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<PageLoader label="Checking your link" />}>
      <ResetForm />
    </Suspense>
  );
}

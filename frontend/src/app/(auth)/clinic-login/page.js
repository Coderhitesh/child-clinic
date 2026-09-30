import { Suspense } from 'react';
import ClinicLoginForm from './clinic-login-form';
import { PageLoader } from '@/components/ui/spinner';

export const metadata = { title: 'Clinic & staff sign in' };

export default function ClinicLoginPage() {
  return (
    <Suspense fallback={<PageLoader label="Loading sign in" />}>
      <ClinicLoginForm />
    </Suspense>
  );
}

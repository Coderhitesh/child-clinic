import { Suspense } from 'react';
import BookingWizard from './booking-wizard';
import { PageLoader } from '@/components/ui/spinner';

export const metadata = { title: 'Book your appointment' };

export default function BookPage() {
  return (
    <Suspense fallback={<PageLoader label="Setting up your booking" />}>
      <BookingWizard />
    </Suspense>
  );
}

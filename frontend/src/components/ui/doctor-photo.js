'use client';
import { useEffect, useState } from 'react';
import { cn, initials, fileUrl } from '@/lib/utils';

// Doctor's real photo everywhere; falls back to initials when there is no photo or the file fails to load.
export default function DoctorPhoto({ name, photo, className, textClassName }) {
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [photo]);
  const src = photo ? fileUrl(photo) : '';

  if (src && !failed) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt={name || 'Doctor'} onError={() => setFailed(true)} className={cn('shrink-0 object-cover', className)} />;
  }
  return (
    <div className={cn('flex shrink-0 items-center justify-center bg-brand-100 font-semibold text-brand-700', className, textClassName)}>
      {initials(name || 'Dr')}
    </div>
  );
}

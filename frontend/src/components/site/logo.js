import Link from 'next/link';
import { cn } from '@/lib/utils';

// the real Normal Child Clinic seal, used whenever no logo is set in Website settings
export const DEFAULT_LOGO = '/images/logo.png';

// ignore leftover dummy logos (e.g. from old seed data)
const usable = (url) => (url && !/placeholder\.com/i.test(url) ? url : '');

export function resolveLogo(settings, dark = false) {
  const b = settings?.branding || {};
  const custom = dark
    ? usable(b.logoFooter) || usable(b.logoDark) || usable(b.logoHeader)
    : usable(b.logoHeader) || usable(b.logoMobile);
  return custom || DEFAULT_LOGO;
}

export default function Logo({ dark = false, className, settings, showText = true }) {
  const name = settings?.siteName && settings.siteName !== 'Clinic System' ? settings.siteName : 'Normal Child Clinic';
  const tagline = settings?.tagline || 'Better Care. Brighter Future.';
  const logo = resolveLogo(settings, dark);
  const isDefault = logo === DEFAULT_LOGO;

  return (
    <Link href="/" className={cn('flex items-center gap-1.5 sm:gap-2.5', className)}>
      <img
        src={logo}
        alt={name}
        className={cn(
          isDefault ? 'h-9 w-9 shrink-0 rounded-full bg-white object-cover sm:h-11 sm:w-11' : 'h-7 w-auto sm:h-9',
          dark && isDefault && 'ring-2 ring-white/70'
        )}
      />
      {showText && (
        <span className="leading-tight">
          <span className={cn('block text-sm font-extrabold tracking-tight sm:text-lg', dark ? 'text-white' : 'text-brand-700')}>
            {name}
          </span>
          <span className={cn('hidden text-[10px] font-medium sm:block', dark ? 'text-white/70' : 'text-muted-foreground')}>
            {tagline}
          </span>
        </span>
      )}
    </Link>
  );
}

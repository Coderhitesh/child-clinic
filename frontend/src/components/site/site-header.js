'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Search, MapPin, Menu, X, ArrowRight, LayoutDashboard, LogOut, User } from 'lucide-react';
import Logo from './logo';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SimpleSelect } from '@/components/ui/select';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import { useAuthStore, isStaff, homeFor } from '@/store/authStore';
import { useUiStore } from '@/store/uiStore';
import { initials, cn } from '@/lib/utils';
import { ROLE_LABEL } from '@/lib/constants';
import { LOCATION_CACHE_KEY, ipLocation, nearestClinicCity, reverseGeocodeCity } from '@/lib/location';

const NAV = [
  { href: '/', label: 'Home' },
  { href: '/doctors', label: 'Find Doctors' },
  { href: '/clinics', label: 'Our Clinics' },
  { href: '/about', label: 'About Us' },
  { href: '/contact', label: 'Contact' },
];

export default function SiteHeader({ settings, cities = [], clinicPoints = [] }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [q, setQ] = useState('');
  const { city, setCity, setDetectedCity, setUserPos, setLocationReady } = useUiStore();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  useEffect(() => { setMobileOpen(false); setSearchOpen(false); }, [pathname]);

  // detect the visitor's location once: it sets the header city and the nearest-first clinic order
  useEffect(() => {
    let cancelled = false;
    const clinicList = clinicPoints.map((c) => ({ address: { city: c.city }, location: { coordinates: [c.lng, c.lat] } }));

    const finish = (pos, cityName, save = true) => {
      if (cancelled) return;
      setUserPos({ lat: pos.lat, lng: pos.lng });
      if (cityName) setDetectedCity(cityName);
      setLocationReady(true);
      // only remember a result that has a city, so a failed lookup is retried on the next load
      if (save && cityName) {
        try { sessionStorage.setItem(LOCATION_CACHE_KEY, JSON.stringify({ ...pos, city: cityName })); } catch { /* ignore */ }
      }
    };

    // browser location was blocked/unavailable: fall back to the IP-based city
    const useIp = async () => {
      const ip = await ipLocation();
      if (ip) finish({ lat: ip.lat, lng: ip.lng }, ip.city || nearestClinicCity(clinicList, ip), false);
      else if (!cancelled) setLocationReady(true);
    };

    try {
      const cached = JSON.parse(sessionStorage.getItem(LOCATION_CACHE_KEY) || 'null');
      if (cached?.lat != null && cached?.lng != null && cached?.city) {
        finish(cached, cached.city, false);
        return () => { cancelled = true; };
      }
    } catch { /* ignore */ }

    if (typeof navigator === 'undefined' || !navigator.geolocation) { useIp(); return () => { cancelled = true; }; }

    navigator.geolocation.getCurrentPosition(
      async (p) => {
        const pos = { lat: p.coords.latitude, lng: p.coords.longitude };
        const cityName = (await reverseGeocodeCity(pos)) || nearestClinicCity(clinicList, pos);
        finish(pos, cityName);
      },
      () => { useIp(); },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 10 * 60 * 1000 }
    );
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // the detected city may not have a clinic yet; still show it as an option
  const cityOptions = [...new Set([...(city ? [city] : []), ...cities])].map((c) => ({ value: c, label: c }));

  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-white/95 backdrop-blur">
      <div className="container flex h-16 items-center gap-4">
        <Logo settings={settings} />

        <nav className="ml-4 hidden flex-1 items-center gap-1 lg:flex">
          {NAV.map((item) => {
            const active = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'relative rounded-md px-3 py-2 text-sm font-medium text-ink-soft transition-colors hover:text-brand-700',
                  active && 'text-brand-700 after:absolute after:inset-x-3 after:-bottom-[13px] after:h-0.5 after:rounded-full after:bg-brand-500'
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => setSearchOpen((v) => !v)} aria-label="Search the site">
            <Search className="h-[18px] w-[18px]" />
          </Button>

          <div className="hidden items-center gap-1 rounded-lg border border-border px-2 md:flex">
            <MapPin className="h-4 w-4 text-brand-600" />
            <SimpleSelect
              value={city}
              onChange={setCity}
              options={cityOptions}
              placeholder="Select city"
              className="h-9 w-[130px] border-0 focus:ring-0"
            />
          </div>

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 rounded-full border border-border py-1 pl-1 pr-3 hover:bg-brand-50">
                  <Avatar className="h-7 w-7"><AvatarFallback>{initials(user.name)}</AvatarFallback></Avatar>
                  <span className="hidden text-sm font-medium sm:block">{user.name?.split(' ')[0]}</span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>{ROLE_LABEL[user.role] || user.role}</DropdownMenuLabel>
                <DropdownMenuItem asChild>
                  <Link href={homeFor(user)}>
                    <LayoutDashboard className="h-4 w-4" />
                    {isStaff(user) ? 'Admin panel' : 'My dashboard'}
                  </Link>
                </DropdownMenuItem>
                {!isStaff(user) && (
                  <DropdownMenuItem asChild>
                    <Link href={isStaff(user) ? '/admin/appointments' : '/dashboard/profile'}>
                      <User className="h-4 w-4" />{isStaff(user) ? 'Appointments' : 'Profile'}
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => logout().then(() => window.location.assign('/'))}>
                  <LogOut className="h-4 w-4" />Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button asChild variant="outline" className="hidden sm:inline-flex">
              <Link href="/login">Sign in</Link>
            </Button>
          )}

          <Button asChild className="hidden sm:inline-flex">
            <Link href="/book">Book Appointment <ArrowRight className="h-4 w-4" /></Link>
          </Button>

          <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setMobileOpen((v) => !v)} aria-label="Open menu">
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {searchOpen && (
        <div className="border-t border-border bg-white">
          <form
            className="container flex gap-2 py-3"
            onSubmit={(e) => { e.preventDefault(); window.location.assign(`/doctors?q=${encodeURIComponent(q)}`); }}
          >
            <Input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search doctors, clinics or specialities" />
            <Button type="submit" variant="brand">Search</Button>
          </form>
        </div>
      )}

      {mobileOpen && (
        <div className="border-t border-border bg-white lg:hidden">
          <nav className="container flex flex-col py-2">
            {NAV.map((item) => (
              <Link key={item.href} href={item.href} className="border-b border-border/60 py-3 text-sm font-medium last:border-0">
                {item.label}
              </Link>
            ))}
            {cityOptions.length > 0 && (
              <div className="flex items-center gap-2 border-b border-border/60 py-3">
                <MapPin className="h-4 w-4 text-brand-600" />
                <SimpleSelect value={city} onChange={setCity} options={cityOptions} placeholder="Select city" className="h-9 flex-1" />
              </div>
            )}
            <div className="flex gap-2 py-3">
              <Button asChild className="flex-1"><Link href="/book">Book appointment</Link></Button>
              {!user && <Button asChild variant="outline" className="flex-1"><Link href="/login">Sign in</Link></Button>}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}

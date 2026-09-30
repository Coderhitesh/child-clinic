import SiteHeader from '@/components/site/site-header';
import SiteFooter from '@/components/site/site-footer';
import NotificationBar from '@/components/site/notification-bar';
import SitePopup from '@/components/site/site-popup';
import { sOne, sList } from '@/lib/server-api';
import { getClinicLatLng } from '@/lib/location';

export default async function SiteLayout({ children }) {
  const [settings, clinics] = await Promise.all([
    sOne('/website-settings', { revalidate: 300 }),
    sList('/clinics', { revalidate: 300 }),
  ]);
  const cities = [...new Set(clinics.map((c) => c.address?.city?.trim()).filter(Boolean))];
  const clinicPoints = clinics
    .map((c) => ({ city: c.address?.city || '', ...(getClinicLatLng(c) || {}) }))
    .filter((c) => c.city && c.lat != null);
  return (
    <div className="flex min-h-screen flex-col">
      <div className="relative"><NotificationBar /></div>
      <SiteHeader settings={settings} cities={cities} clinicPoints={clinicPoints} />
      <main className="flex-1">{children}</main>
      <SiteFooter settings={settings} />
      <SitePopup />
    </div>
  );
}

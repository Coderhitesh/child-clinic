import { Phone, Mail, MapPin } from 'lucide-react';
import { sOne, sList } from '@/lib/server-api';
import ContactForm from './contact-form';

export const metadata = { title: 'Contact us' };
export const revalidate = 600;

export default async function ContactPage() {
  const [settings, clinics] = await Promise.all([sOne('/website-settings'), sList('/clinics')]);
  return (
    <>
      <section className="hero-wash border-b border-border">
        <div className="container py-10">
          <h1 className="text-3xl font-extrabold md:text-4xl">Talk to our care team</h1>
          <p className="mt-2 max-w-[60ch] text-sm text-ink-soft">
            Questions about a booking, a prescription or which doctor to see? Send a message and we&apos;ll reply.
          </p>
        </div>
      </section>

      <section className="section container grid gap-8 lg:grid-cols-[1fr_360px]">
        <ContactForm clinics={clinics} />

        <aside className="space-y-4">
          <div className="soft-card p-5">
            <h2 className="font-semibold text-ink">Reach us directly</h2>
            <ul className="mt-4 space-y-3 text-sm">
              {settings?.contactPhone && (
                <li className="flex items-center gap-2"><Phone className="h-4 w-4 text-brand-600" /><a href={`tel:${settings.contactPhone}`}>{settings.contactPhone}</a></li>
              )}
              {settings?.contactEmail && (
                <li className="flex items-center gap-2"><Mail className="h-4 w-4 text-brand-600" /><a href={`mailto:${settings.contactEmail}`}>{settings.contactEmail}</a></li>
              )}
              {settings?.address && (
                <li className="flex items-start gap-2"><MapPin className="mt-0.5 h-4 w-4 text-brand-600" />{settings.address}</li>
              )}
            </ul>
          </div>

          {settings?.googleMapsEmbedUrl && (
            <div className="soft-card overflow-hidden">
              <iframe src={settings.googleMapsEmbedUrl} title="Clinic location" className="h-64 w-full border-0" loading="lazy" />
            </div>
          )}
        </aside>
      </section>
    </>
  );
}

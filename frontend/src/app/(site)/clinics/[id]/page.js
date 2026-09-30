import Link from 'next/link';
import { notFound } from 'next/navigation';
import { MapPin, Phone, Mail, Clock, MessageCircle, Siren, Navigation, CheckCircle2, Wallet, AlertTriangle } from 'lucide-react';
import { sOne, sList } from '@/lib/server-api';
import { DoctorCard, SectionHead, Stars } from '@/components/site/bits';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { getClinicAddress, getClinicTiming } from '@/lib/clinic-utils';
import { buildMetadata } from '@/lib/seo';
import { initials } from '@/lib/utils';

export const revalidate = 300;

const PAYMENT_LABEL = { cash: 'Cash', card: 'Card', upi: 'UPI', online: 'Online', insurance: 'Insurance' };
const digits = (v = '') => String(v).replace(/[^\d]/g, '');

export async function generateMetadata({ params }) {
  const clinic = await sOne(`/clinics/${params.id}`);
  return buildMetadata(clinic?.seo, {
    title: clinic?.name || 'Clinic',
    description: clinic?.shortDescription || `Visit ${clinic?.name} for trusted multi-speciality care.`,
    image: clinic?.coverImage || clinic?.images?.[0],
  });
}

export default async function ClinicPage({ params }) {
  const clinic = await sOne(`/clinics/${params.id}`);
  if (!clinic) notFound();

  const [doctors, reviews] = await Promise.all([
    sList(`/doctors?clinic=${clinic._id}`),
    sList(`/testimonials?clinic=${clinic._id}`),
  ]);

  const settings = clinic.appointmentSettings || {};
  const canBook = clinic.isActive !== false && !clinic.isTemporarilyClosed && settings.enabled !== false && settings.allowOnlineBooking !== false;
  const address = getClinicAddress(clinic);
  const cover = clinic.coverImage || clinic.images?.[0];
  const gallery = (clinic.images || []).filter((img) => img && img !== cover);
  const avg = reviews.length ? reviews.reduce((n, r) => n + (r.rating || 0), 0) / reviews.length : 0;

  return (
    <div className="container py-8">
      <nav className="mb-5 text-xs text-muted-foreground">
        <Link href="/" className="hover:underline">Home</Link> › <Link href="/clinics" className="hover:underline">Our Clinics</Link> › <span className="text-ink">{clinic.name}</span>
      </nav>

      {clinic.isTemporarilyClosed && (
        <div className="mb-5 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>Temporarily closed{clinic.temporaryClosureReason ? ` — ${clinic.temporaryClosureReason}` : ''}</span>
        </div>
      )}

      <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
        <div>
          {cover && (
            <div className="mb-5 overflow-hidden rounded-2xl border border-border bg-slate-50">
              <img src={cover} alt={clinic.name} className="max-h-[360px] w-full object-cover" />
            </div>
          )}

          <div className="flex items-start gap-4">
            {clinic.logo && <img src={clinic.logo} alt="" className="h-14 w-14 shrink-0 rounded-xl border border-border bg-white object-contain p-1" />}
            <div className="min-w-0">
              <h1 className="text-3xl font-extrabold">{clinic.name}</h1>
              {reviews.length > 0 && <div className="mt-1"><Stars value={avg} count={reviews.length} /></div>}
            </div>
          </div>

          <p className="mt-2 flex items-center gap-2 text-sm text-ink-soft">
            <MapPin className="h-4 w-4 shrink-0 text-brand-600" />
            {address || 'Address on request'}
          </p>

          {clinic.shortDescription && <p className="mt-4 max-w-[70ch] text-[15px] font-medium text-ink">{clinic.shortDescription}</p>}
          {clinic.description && <p className="mt-3 max-w-[70ch] whitespace-pre-line text-sm leading-relaxed text-ink-soft">{clinic.description}</p>}

          {clinic.specialities?.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {clinic.specialities.map((s) => (
                <Link key={s._id} href={`/specialities/${s.slug}`}><Badge tone="info">{s.name}</Badge></Link>
              ))}
            </div>
          )}

          {clinic.facilities?.length > 0 && (
            <section className="mt-8">
              <h2 className="section-title text-xl">Facilities</h2>
              <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                {clinic.facilities.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-ink-soft">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />{f}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {gallery.length > 0 && (
            <section className="mt-8">
              <h2 className="section-title text-xl">Gallery</h2>
              <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
                {gallery.map((img) => (
                  <img key={img} src={img} alt={`${clinic.name} photo`} className="aspect-[4/3] w-full rounded-xl border border-border object-cover" />
                ))}
              </div>
            </section>
          )}

          <section className="mt-10">
            <SectionHead title="Doctors at this clinic" sub="Book with any of our consultants here" />
            <div className="grid gap-4 md:grid-cols-2">
              {doctors.map((d) => <DoctorCard key={d._id} doctor={d} compact />)}
              {!doctors.length && (
                <p className="col-span-full rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">
                  No doctors assigned to this clinic yet.
                </p>
              )}
            </div>
          </section>

          {reviews.length > 0 && (
            <section className="mt-10">
              <SectionHead title="What parents say" sub={`${reviews.length} review${reviews.length === 1 ? '' : 's'}`} />
              <div className="grid gap-4 md:grid-cols-2">
                {reviews.map((r) => (
                  <figure key={r._id} className="soft-card p-4">
                    <Stars value={r.rating || 5} />
                    <blockquote className="mt-2 text-sm leading-relaxed text-ink-soft">{r.message}</blockquote>
                    <figcaption className="mt-3 flex items-center gap-2 text-xs">
                      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-100 font-semibold text-brand-700">{initials(r.name)}</span>
                      <span className="font-semibold text-ink">{r.name}</span>
                      {r.designation && <span className="text-muted-foreground">· {r.designation}</span>}
                    </figcaption>
                  </figure>
                ))}
              </div>
            </section>
          )}
        </div>

        <aside className="space-y-4">
          <div className="soft-card p-5">
            <h2 className="font-semibold text-ink">Visit us</h2>
            <ul className="mt-4 space-y-3 text-sm">
              {clinic.address?.landmark && (
                <li className="flex items-start gap-2"><MapPin className="mt-0.5 h-4 w-4 text-brand-600" /><span>Landmark: {clinic.address.landmark}</span></li>
              )}
              {clinic.phone && (
                <li className="flex items-center gap-2"><Phone className="h-4 w-4 text-brand-600" /><a href={`tel:${clinic.phone}`}>{clinic.phone}</a></li>
              )}
              {clinic.alternatePhone && (
                <li className="flex items-center gap-2"><Phone className="h-4 w-4 text-brand-600" /><a href={`tel:${clinic.alternatePhone}`}>{clinic.alternatePhone}</a></li>
              )}
              {clinic.whatsappNumber && (
                <li className="flex items-center gap-2"><MessageCircle className="h-4 w-4 text-brand-600" /><a href={`https://wa.me/${digits(clinic.whatsappNumber)}`} target="_blank" rel="noreferrer">WhatsApp {clinic.whatsappNumber}</a></li>
              )}
              {clinic.emergencyNumber && (
                <li className="flex items-center gap-2"><Siren className="h-4 w-4 text-red-600" /><a href={`tel:${clinic.emergencyNumber}`}>Emergency {clinic.emergencyNumber}</a></li>
              )}
              {clinic.email && (
                <li className="flex items-center gap-2"><Mail className="h-4 w-4 text-brand-600" /><a href={`mailto:${clinic.email}`} className="break-all">{clinic.email}</a></li>
              )}
              <li className="flex items-start gap-2">
                <Clock className="mt-0.5 h-4 w-4 text-brand-600" />
                <span>{getClinicTiming(clinic)}</span>
              </li>
              {clinic.paymentMethods?.length > 0 && (
                <li className="flex items-start gap-2">
                  <Wallet className="mt-0.5 h-4 w-4 text-brand-600" />
                  <span>Pay by {clinic.paymentMethods.map((m) => PAYMENT_LABEL[m] || m).join(', ')}</span>
                </li>
              )}
            </ul>

            {clinic.mapLink && (
              <Button asChild variant="outline" className="mt-5 w-full">
                <a href={clinic.mapLink} target="_blank" rel="noreferrer"><Navigation className="h-4 w-4" />Get directions</a>
              </Button>
            )}
            {canBook ? (
              <Button asChild className="mt-3 w-full"><Link href={`/book?clinic=${clinic._id}`}>Book at this clinic</Link></Button>
            ) : (
              <p className="mt-3 rounded-lg bg-muted px-3 py-2 text-center text-xs text-muted-foreground">
                {clinic.isTemporarilyClosed ? 'Bookings paused while the clinic is closed.' : 'Online booking is not available here. Please call or walk in.'}
              </p>
            )}
            {settings.allowWalkIn && <p className="mt-2 text-center text-xs text-muted-foreground">Walk-ins welcome</p>}
          </div>
        </aside>
      </div>
    </div>
  );
}

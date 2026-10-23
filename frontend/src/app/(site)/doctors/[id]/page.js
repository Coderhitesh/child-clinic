import Link from 'next/link';
import { notFound } from 'next/navigation';
import { MapPin, GraduationCap, Languages, Building2, BadgeCheck } from 'lucide-react';
import { sOne, sList } from '@/lib/server-api';
import { DoctorAvatar, SectionHead, DoctorCard, HandNote } from '@/components/site/bits';
import { buildMetadata } from '@/lib/seo';
import { WEEK_DAYS } from '@/lib/constants';
import { Badge } from '@/components/ui/badge';
import { inr, idOf } from '@/lib/utils';
import DoctorBookingPanel from './booking-panel';

export const revalidate = 120;

export async function generateMetadata({ params }) {
  const doctor = await sOne(`/doctors/${params.id}`);
  if (!doctor) return { title: 'Doctor' };
  return buildMetadata(doctor.seo, {
    title: doctor.name,
    description: doctor.about || `${doctor.name} — ${doctor.speciality?.name || 'Consultant'} at Normal Child Clinic.`,
    image: doctor.photo,
  });
}

export default async function DoctorPage({ params }) {
  const doctor = await sOne(`/doctors/${params.id}`);
  if (!doctor) notFound();

  const related = await sList(`/doctors?speciality=${idOf(doctor.speciality)}`);

  return (
    <div className="container grid gap-8 py-8 lg:grid-cols-[1fr_360px]">
      <div>
        <nav className="mb-5 text-xs text-muted-foreground">
          <Link href="/" className="hover:underline">Home</Link> › <Link href="/doctors" className="hover:underline">Diseases</Link> › <span className="text-ink">{doctor.name}</span>
        </nav>

        <div className="soft-card relative overflow-hidden p-6">
          <div className="flex flex-col gap-6 sm:flex-row">
            <DoctorAvatar name={doctor.name} photo={doctor.photo} className="h-40 w-40 shrink-0 rounded-2xl" />
            <div className="min-w-0 flex-1">
              <h1 className="flex items-center gap-2 text-2xl font-extrabold">
                {doctor.name}
                <BadgeCheck className="h-5 w-5 text-brand-600" />
              </h1>
              {doctor.qualification && <p className="mt-1 text-sm text-ink-soft">{doctor.qualification}</p>}
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <Badge tone="info">{doctor.speciality?.name || 'General'}</Badge>
                {doctor.experienceYears ? <Badge tone="muted">{doctor.experienceYears} years experience</Badge> : null}
                {doctor.isActive ? <Badge tone="success">Accepting patients</Badge> : <Badge tone="danger">Not accepting</Badge>}
              </div>

              <dl className="mt-5 grid gap-3 sm:grid-cols-2">
                <Fact icon={GraduationCap} label="Education" value={doctor.qualification || '—'} />
                <Fact icon={Building2} label="Available at" value={doctor.clinics?.map((c) => c.name).filter(Boolean).join(', ') || '—'} />
                <Fact icon={Languages} label="Consultation" value="In-clinic" />
                <Fact icon={MapPin} label="Fee" value={inr(doctor.consultationFee)} />
              </dl>
            </div>
          </div>
          <HandNote className="pointer-events-none absolute right-6 top-4 hidden rotate-[-5deg] lg:block">
            Healthy children<br />Happier tomorrows
          </HandNote>
        </div>

        <section className="mt-8">
          <h2 className="section-title text-xl">About {doctor.name}</h2>
          <p className="mt-3 max-w-[70ch] text-sm leading-relaxed text-ink-soft">
            {doctor.about || doctor.seo?.metaDescription ||
              `${doctor.name} consults in ${doctor.speciality?.name || 'general medicine'} at our clinics, with ${doctor.experienceYears || 'several'} years of practice. Appointments can be booked online and confirmed instantly.`}
          </p>
        </section>

        {doctor.clinicTimings?.length > 0 && (
          <section className="mt-8">
            <h2 className="section-title text-xl">Clinic timings</h2>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {doctor.clinicTimings.map((t, i) => {
                const clinic = doctor.clinics?.find((c) => idOf(c) === idOf(t.clinic));
                return (
                  <div key={i} className="soft-card p-4">
                    <p className="font-medium text-ink">{clinic?.name || 'Clinic'}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{t.startTime} – {t.endTime}</p>
                    {t.workingDays?.length > 0 && (
                      <p className="mt-1 text-xs text-muted-foreground">{t.workingDays.map((d) => WEEK_DAYS[d]?.label).filter(Boolean).join(', ')}</p>
                    )}
                    <p className="mt-1 text-xs text-muted-foreground">Slot length {t.slotDurationMinutes} min</p>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {related.filter((d) => d._id !== doctor._id).length > 0 && (
          <section className="mt-10">
            <SectionHead title="Related doctors" sub="You may also like these doctors" href="/doctors" />
            <div className="grid gap-4 md:grid-cols-2">
              {related.filter((d) => d._id !== doctor._id).slice(0, 4).map((d) => (
                <DoctorCard key={d._id} doctor={d} compact />
              ))}
            </div>
          </section>
        )}
      </div>

      <aside>
        <DoctorBookingPanel doctor={doctor} />
      </aside>
    </div>
  );
}

function Fact({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-3 rounded-lg border border-border p-3">
      <Icon className="mt-0.5 h-4 w-4 text-brand-600" />
      <div>
        <dt className="text-xs text-muted-foreground">{label}</dt>
        <dd className="text-sm font-medium text-ink">{value}</dd>
      </div>
    </div>
  );
}

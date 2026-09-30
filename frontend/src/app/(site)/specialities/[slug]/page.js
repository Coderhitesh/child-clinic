import Link from 'next/link';
import { notFound } from 'next/navigation';
import { sList } from '@/lib/server-api';
import { DoctorCard, ClinicCard, SectionHead } from '@/components/site/bits';
import FaqList from '@/components/site/faq-list';
import { Button } from '@/components/ui/button';
import { buildMetadata } from '@/lib/seo';

export const revalidate = 300;

async function findSpeciality(slug) {
  const all = await sList('/specialities');
  return all.find((s) => s.slug === slug) || null;
}

export async function generateMetadata({ params }) {
  const s = await findSpeciality(params.slug);
  return buildMetadata(s?.seo, { title: s?.name || 'Speciality', description: s?.description, image: s?.image });
}

export default async function SpecialityPage({ params }) {
  const speciality = await findSpeciality(params.slug);
  if (!speciality) notFound();

  const [doctors, clinics, faqs] = await Promise.all([
    sList(`/doctors?speciality=${speciality._id}`),
    sList(`/clinics?speciality=${speciality._id}`),
    sList(`/faqs?speciality=${speciality._id}`),
  ]);

  return (
    <>
      <section className="hero-wash border-b border-border">
        <div className="container py-10">
          <nav className="mb-4 text-xs text-muted-foreground">
            <Link href="/" className="hover:underline">Home</Link> › <Link href="/specialities" className="hover:underline">Specialities</Link> › <span className="text-ink">{speciality.name}</span>
          </nav>
          <div className="flex items-center gap-3">
            {speciality.image && <img src={speciality.image} alt="" className="h-12 w-12 rounded-xl border border-border bg-white object-contain p-1.5" />}
            <h1 className="text-3xl font-extrabold md:text-4xl">{speciality.name}</h1>
          </div>
          {speciality.description && <p className="mt-2 max-w-[65ch] text-sm text-ink-soft">{speciality.description}</p>}
          <Button asChild className="mt-6"><Link href={`/book?speciality=${speciality._id}`}>Book a {speciality.name.toLowerCase()} appointment</Link></Button>
        </div>
      </section>

      <section className="section container">
        <SectionHead title={`${speciality.name} doctors`} sub={`${doctors.length} available`} href="/doctors" />
        <div className="grid gap-4 md:grid-cols-2">
          {doctors.map((d) => <DoctorCard key={d._id} doctor={d} />)}
          {!doctors.length && (
            <p className="col-span-full rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">
              No doctors listed under this speciality yet.
            </p>
          )}
        </div>
      </section>

      {clinics.length > 0 && (
        <section className="section container">
          <SectionHead title="Clinics offering this speciality" href="/clinics" />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {clinics.map((c) => <ClinicCard key={c._id} clinic={c} />)}
          </div>
        </section>
      )}

      {faqs.length > 0 && (
        <section className="section container">
          <SectionHead title="Questions about this speciality" />
          <FaqList faqs={faqs} />
        </section>
      )}
    </>
  );
}

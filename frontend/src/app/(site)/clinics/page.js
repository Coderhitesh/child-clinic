import { sList } from '@/lib/server-api';
import { SectionHead } from '@/components/site/bits';
import NearbyClinics from '@/components/site/nearby-clinics';

export const metadata = { title: 'Our clinics' };
export const revalidate = 300;

export default async function ClinicsPage() {
  const clinics = await sList('/clinics');
  return (
    <>
      <section className="hero-wash border-b border-border">
        <div className="container py-10">
          <h1 className="text-3xl font-extrabold md:text-4xl">Clinics across the city</h1>
          <p className="mt-2 max-w-[60ch] text-sm text-ink-soft">
            Same standard of care at every location. Walk in or book ahead.
          </p>
        </div>
      </section>
      <section className="section container">
        <SectionHead title={`${clinics.length} clinic${clinics.length === 1 ? '' : 's'}`} />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <NearbyClinics clinics={clinics} limit={clinics.length} />
          {!clinics.length && (
            <p className="col-span-full rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">
              No clinics published yet.
            </p>
          )}
        </div>
      </section>
    </>
  );
}

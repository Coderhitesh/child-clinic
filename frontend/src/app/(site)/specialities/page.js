import Link from 'next/link';
import { Stethoscope } from 'lucide-react';
import { sList } from '@/lib/server-api';

export const metadata = { title: 'Specialities' };
export const revalidate = 300;

export default async function SpecialitiesPage() {
  const specialities = await sList('/specialities');
  return (
    <>
      <section className="hero-wash border-b border-border">
        <div className="container py-10">
          <h1 className="text-3xl font-extrabold md:text-4xl">Care for every stage of life</h1>
          <p className="mt-2 max-w-[60ch] text-sm text-ink-soft">
            Choose a speciality to see the doctors and clinics that cover it.
          </p>
        </div>
      </section>
      <section className="section container">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {specialities.map((s) => (
            <Link key={s._id} href={`/specialities/${s.slug}`} className="soft-card p-5 transition-colors hover:border-brand-300 hover:bg-brand-50/40">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                {s.image ? <img src={s.image} alt="" className="h-6 w-6" /> : <Stethoscope className="h-5 w-5" />}
              </span>
              <p className="mt-4 font-semibold text-ink">{s.name}</p>
              {s.description && <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{s.description}</p>}
            </Link>
          ))}
          {!specialities.length && (
            <p className="col-span-full rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">
              No specialities published yet.
            </p>
          )}
        </div>
      </section>
    </>
  );
}

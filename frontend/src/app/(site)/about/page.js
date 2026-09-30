import Link from 'next/link';
import { Target, Eye, HeartHandshake, Building2, ShieldCheck, Sparkles } from 'lucide-react';
import { sList, sOne } from '@/lib/server-api';
import { SectionHead, StatStrip, HandNote } from '@/components/site/bits';
import TestimonialRail from '@/components/site/testimonial-rail';
import { Button } from '@/components/ui/button';

export const metadata = { title: 'About us' };
export const revalidate = 600;

const TIMELINE = [
  ['2020', 'The beginning', 'Started with our first clinic and a plan to serve families better.'],
  ['2021', 'Expanded services', 'Added more specialities and expert doctors.'],
  ['2023', 'Multi-clinic network', 'Grew to a network of clinics across the city.'],
  ['2025', 'Digital transformation', 'Launched online appointments and digital prescriptions.'],
];

export default async function AboutPage() {
  const [clinics, doctors, testimonials, partners, settings] = await Promise.all([
    sList('/clinics'), sList('/doctors'), sList('/testimonials'), sList('/partners'), sOne('/website-settings'),
  ]);

  return (
    <>
      <section className="hero-wash">
        <div className="container grid items-center gap-8 py-12 lg:grid-cols-2">
          <div>
            <h1 className="text-4xl font-extrabold md:text-5xl">About {settings?.siteName || 'Normal Child Clinic'}</h1>
            <p className="mt-2 text-lg font-semibold text-brand-700">{settings?.tagline || 'Better care. Brighter future.'}</p>
            <p className="mt-4 max-w-[58ch] text-sm text-ink-soft">
              We are on a mission to make quality healthcare accessible, affordable and convenient for every
              family, at every stage of life.
            </p>
            <ul className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm text-ink-soft">
              <li className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-brand-600" />Trusted healthcare</li>
              <li className="flex items-center gap-2"><Building2 className="h-4 w-4 text-brand-600" />Multi-clinic network</li>
              <li className="flex items-center gap-2"><HeartHandshake className="h-4 w-4 text-brand-600" />Patient first, always</li>
            </ul>
          </div>
          <div className="relative">
            <div className="flex h-64 items-center justify-center rounded-3xl border border-white bg-white/70">
              <Sparkles className="h-14 w-14 text-brand-500" />
            </div>
            <HandNote className="absolute -right-1 -top-5 rotate-[-6deg]">Healthy families<br />Happier lives</HandNote>
          </div>
        </div>
      </section>

      <StatStrip
        items={[
          { value: '50,000+', label: 'Happy families' },
          { value: `${clinics.length || 5}+`, label: 'Clinics' },
          { value: `${doctors.length || 100}+`, label: 'Expert doctors' },
          { value: '4.8/5', label: 'Patient satisfaction' },
        ]}
      />

      <section className="section container grid gap-6 md:grid-cols-2">
        <div className="soft-card p-6">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-600"><Target className="h-5 w-5" /></span>
          <h2 className="mt-4 text-lg font-bold">Our mission</h2>
          <p className="mt-2 text-sm text-ink-soft">
            Make high-quality, comprehensive healthcare reachable for every family through technology,
            compassion and a network of trusted clinics and doctors.
          </p>
        </div>
        <div className="soft-card p-6">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-600"><Eye className="h-5 w-5" /></span>
          <h2 className="mt-4 text-lg font-bold">Our vision</h2>
          <p className="mt-2 text-sm text-ink-soft">
            A healthier tomorrow for every individual and community, where world-class healthcare is simple,
            affordable and within everyone&apos;s reach.
          </p>
        </div>
      </section>

      <section className="section container">
        <SectionHead title="Our story" sub="A journey driven by care, trust and innovation" />
        <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {TIMELINE.map(([year, title, text]) => (
            <li key={year} className="soft-card p-5">
              <p className="text-sm font-bold text-brand-700">{year}</p>
              <p className="mt-2 font-semibold text-ink">{title}</p>
              <p className="mt-1 text-xs text-muted-foreground">{text}</p>
            </li>
          ))}
        </ol>
      </section>

      {testimonials.length > 0 && (
        <section className="section container">
          <SectionHead title="What our patients say" sub="Real stories from families who trust us" />
          <TestimonialRail items={testimonials} />
        </section>
      )}

      {partners.length > 0 && (
        <section className="section container">
          <SectionHead title="Our trusted partners" />
          <div className="grid grid-cols-3 gap-3 md:grid-cols-6">
            {partners.map((p) => (
              <div key={p._id} className="soft-card flex h-20 items-center justify-center p-3">
                <img src={p.logo} alt={p.name} className="max-h-10 w-auto object-contain" />
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="container pb-4">
        <div className="flex flex-col items-center justify-between gap-4 rounded-2xl bg-brand-600 px-6 py-8 text-white md:flex-row md:px-10">
          <div>
            <h2 className="text-xl font-bold text-white">Join our journey for a healthier tomorrow</h2>
            <p className="mt-1 text-sm text-white/80">Be part of a community that believes in better care.</p>
          </div>
          <Button asChild size="lg"><Link href="/book">Book an appointment</Link></Button>
        </div>
      </section>
    </>
  );
}

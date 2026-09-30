'use client';
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Search, SlidersHorizontal, Stethoscope } from 'lucide-react';
import { doctorApi } from '@/services';
import { DoctorCard } from '@/components/site/bits';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { getErr, idOf } from '@/lib/utils';

const EXPERIENCE_BANDS = [
  { key: '0-5', label: '0 – 5 years', test: (y) => y <= 5 },
  { key: '6-10', label: '6 – 10 years', test: (y) => y > 5 && y <= 10 },
  { key: '11-20', label: '11 – 20 years', test: (y) => y > 10 && y <= 20 },
  { key: '20+', label: '20+ years', test: (y) => y > 20 },
];

export default function DoctorsBrowser({ specialities, clinics, initial }) {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [q, setQ] = useState(initial.q || '');
  const [speciality, setSpeciality] = useState(initial.speciality || '');
  const [clinic, setClinic] = useState(initial.clinic || '');
  const [maxFee, setMaxFee] = useState(2000);
  const [bands, setBands] = useState([]);
  const [filtersOpen, setFiltersOpen] = useState(false);

  useEffect(() => {
    setLoading(true);
    doctorApi
      .list({ speciality: speciality || undefined, clinic: clinic || undefined })
      .then((d) => { setDoctors(d || []); setError(''); })
      .catch((e) => setError(getErr(e)))
      .finally(() => setLoading(false));
  }, [speciality, clinic]);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return doctors.filter((d) => {
      if (term && !`${d.name} ${d.speciality?.name || ''} ${d.qualification || ''}`.toLowerCase().includes(term)) return false;
      if ((d.consultationFee || 0) > maxFee) return false;
      if (bands.length) {
        const y = d.experienceYears || 0;
        const hit = EXPERIENCE_BANDS.filter((b) => bands.includes(b.key)).some((b) => b.test(y));
        if (!hit) return false;
      }
      return true;
    });
  }, [doctors, q, maxFee, bands]);

  const toggleBand = (key) =>
    setBands((b) => (b.includes(key) ? b.filter((x) => x !== key) : [...b, key]));

  const clearAll = () => { setQ(''); setSpeciality(''); setClinic(''); setMaxFee(2000); setBands([]); };

  return (
    <div className="container grid gap-6 py-8 lg:grid-cols-[260px_1fr]">
      <aside className={`${filtersOpen ? 'block' : 'hidden'} lg:block`}>
        <div className="soft-card sticky top-20 p-5">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-ink">Filters</h2>
            <button onClick={clearAll} className="text-xs font-medium text-brand-700 hover:underline">Clear all</button>
          </div>

          <FilterGroup title="Speciality">
            <ul className="space-y-2">
              {specialities.map((s) => (
                <li key={s._id} className="flex items-center gap-2">
                  <Checkbox
                    id={`sp-${s._id}`}
                    checked={speciality === s._id}
                    onCheckedChange={(v) => setSpeciality(v ? s._id : '')}
                  />
                  <label htmlFor={`sp-${s._id}`} className="cursor-pointer text-sm text-ink-soft">{s.name}</label>
                </li>
              ))}
            </ul>
          </FilterGroup>

          <FilterGroup title="Clinic location">
            <ul className="space-y-2">
              {clinics.map((c) => (
                <li key={c._id} className="flex items-center gap-2">
                  <Checkbox
                    id={`cl-${c._id}`}
                    checked={clinic === c._id}
                    onCheckedChange={(v) => setClinic(v ? c._id : '')}
                  />
                  <label htmlFor={`cl-${c._id}`} className="cursor-pointer text-sm text-ink-soft">{c.name}</label>
                </li>
              ))}
            </ul>
          </FilterGroup>

          <FilterGroup title="Consultation fee">
            <input
              type="range" min={0} max={5000} step={100} value={maxFee}
              onChange={(e) => setMaxFee(Number(e.target.value))}
              className="w-full accent-brand-600"
            />
            <p className="mt-1 text-xs text-muted-foreground">Up to ₹{maxFee.toLocaleString('en-IN')}</p>
          </FilterGroup>

          <FilterGroup title="Experience">
            <ul className="space-y-2">
              {EXPERIENCE_BANDS.map((b) => (
                <li key={b.key} className="flex items-center gap-2">
                  <Checkbox id={`ex-${b.key}`} checked={bands.includes(b.key)} onCheckedChange={() => toggleBand(b.key)} />
                  <label htmlFor={`ex-${b.key}`} className="cursor-pointer text-sm text-ink-soft">{b.label}</label>
                </li>
              ))}
            </ul>
          </FilterGroup>
        </div>
      </aside>

      <section>
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by name or speciality" className="pl-9" />
          </div>
          <Button variant="outline" className="lg:hidden" onClick={() => setFiltersOpen((v) => !v)}>
            <SlidersHorizontal className="h-4 w-4" /> Filters
          </Button>
          <p className="text-sm text-muted-foreground">
            {loading ? 'Searching…' : `${filtered.length} doctor${filtered.length === 1 ? '' : 's'} found`}
          </p>
        </div>

        {error && <p className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}

        {loading ? (
          <div className="space-y-4">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-32 w-full" />)}</div>
        ) : filtered.length ? (
          <div className="space-y-4">
            {filtered.map((d) => (
              <div key={d._id} className="grid gap-0 lg:grid-cols-[1fr_260px]">
                <DoctorCard doctor={d} />
                <div className="soft-card mt-2 flex flex-col justify-between gap-3 p-4 lg:mt-0 lg:ml-[-1px] lg:rounded-l-none">
                  <div>
                    <p className="text-xs font-semibold text-emerald-700">Available for booking</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {d.clinics?.length ? `${d.clinics.length} clinic${d.clinics.length > 1 ? 's' : ''}` : 'Clinic assigned on booking'}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button asChild variant="outline" className="flex-1"><Link href={`/doctors/${d._id}`}>Profile</Link></Button>
                    <Button asChild className="flex-1">
                      <Link href={`/book?doctor=${d._id}&clinic=${idOf(d.clinics?.[0])}&speciality=${idOf(d.speciality)}`}>Book</Link>
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={Stethoscope}
            title="No doctors match these filters"
            description="Try widening the fee range or clearing a filter."
            action="Clear filters"
            onAction={clearAll}
          />
        )}
      </section>
    </div>
  );
}

function FilterGroup({ title, children }) {
  return (
    <div className="mt-5 border-t border-border pt-4 first:border-0">
      <p className="mb-3 text-sm font-semibold text-ink">{title}</p>
      {children}
    </div>
  );
}

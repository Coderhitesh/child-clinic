'use client';
import { useRef } from 'react';
import { ChevronLeft, ChevronRight, Quote } from 'lucide-react';
import { Stars } from './bits';
import { initials } from '@/lib/utils';

const TONES = [
  { accent: '#3973F6', soft: '#E9F2FF', border: 'border-[#CFE0FF]' },
  { accent: '#FF4389', soft: '#FFEAF2', border: 'border-[#FFD7E6]' },
  { accent: '#18A981', soft: '#E7FAF4', border: 'border-[#D0F0E7]' },
  { accent: '#7548EB', soft: '#F1EBFF', border: 'border-[#DED3FF]' },
];

export default function TestimonialRail({ items = [] }) {
  const ref = useRef(null);
  if (!items.length) return null;

  const scroll = (dir) => ref.current?.scrollBy({ left: dir * 340, behavior: 'smooth' });

  return (
    <div className="relative">
      <div ref={ref} className="scrollbar-none flex snap-x gap-4 overflow-x-auto px-1 pb-4 pt-2">
        {items.map((t, i) => {
          const tone = TONES[i % TONES.length];
          return (
            <figure
              key={t._id}
              className={`group relative flex w-[280px] shrink-0 snap-start flex-col overflow-hidden rounded-2xl border bg-white/90 p-5 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:bg-white hover:shadow-[0_12px_28px_rgba(31,73,136,0.10)] sm:w-[330px] ${tone.border}`}
            >
              <span className="absolute inset-x-0 top-0 h-1" style={{ background: tone.accent }} />

              <div className="flex items-start justify-between">
                <span
                  className="flex h-11 w-11 items-center justify-center rounded-2xl transition-transform duration-300 group-hover:scale-105"
                  style={{ background: tone.soft }}
                >
                  <Quote className="h-5 w-5" strokeWidth={2} style={{ color: tone.accent }} />
                </span>
                <Stars value={t.rating || 5} />
              </div>

              <blockquote className="mt-4 line-clamp-6 text-[13px] leading-[1.7] text-slate-600 sm:text-sm">
                {t.message}
              </blockquote>

              <div className="flex-1" />

              <figcaption className="mt-5 flex items-center gap-3 border-t border-slate-100 pt-4">
                {t.photo ? (
                  <img
                    src={t.photo}
                    alt=""
                    className="h-10 w-10 rounded-full object-cover ring-2"
                    style={{ '--tw-ring-color': tone.soft }}
                  />
                ) : (
                  <span
                    className="flex h-10 w-10 items-center justify-center rounded-full text-xs font-bold"
                    style={{ background: tone.soft, color: tone.accent }}
                  >
                    {initials(t.name)}
                  </span>
                )}
                <span className="min-w-0">
                  <span className="block truncate text-sm font-bold text-[#082E70]">{t.name}</span>
                  {t.designation && (
                    <span className="block truncate text-xs text-slate-500">{t.designation}</span>
                  )}
                </span>
              </figcaption>
            </figure>
          );
        })}
      </div>

      <div className="mt-2 flex items-center justify-between gap-3">
        <p className="font-[Caveat,cursive] text-[18px] -rotate-2 text-[#3973F6] sm:text-[22px]">
          Real families, real smiles ♡
        </p>
        <div className="flex gap-2">
          <button
            onClick={() => scroll(-1)}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-brand-100 bg-white text-ink shadow-card transition-colors hover:border-brand-200 hover:text-clinic-500"
            aria-label="Previous reviews"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={() => scroll(1)}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-brand-100 bg-white text-ink shadow-card transition-colors hover:border-brand-200 hover:text-clinic-500"
            aria-label="Next reviews"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
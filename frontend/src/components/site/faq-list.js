'use client';
import { useState } from 'react';
import { Plus, Minus } from 'lucide-react';

const TONES = [
  { accent: '#3973F6', soft: '#E9F2FF', border: 'border-[#CFE0FF]' },
  { accent: '#FF4389', soft: '#FFEAF2', border: 'border-[#FFD7E6]' },
  { accent: '#18A981', soft: '#E7FAF4', border: 'border-[#D0F0E7]' },
  { accent: '#7548EB', soft: '#F1EBFF', border: 'border-[#DED3FF]' },
];

export default function FaqList({ faqs = [] }) {
  const [open, setOpen] = useState(null);
  if (!faqs.length) return null;

  return (
    <div className="space-y-3">
      {faqs.map((f, i) => {
        const isOpen = open === i;
        const tone = TONES[i % TONES.length];
        return (
          <div
            key={f._id || i}
            className={`relative overflow-hidden rounded-2xl border bg-white/90 backdrop-blur-sm transition-all duration-300 ${tone.border} ${
              isOpen ? 'bg-white shadow-[0_12px_28px_rgba(31,73,136,0.10)]' : 'hover:-translate-y-0.5 hover:bg-white'
            }`}
          >
            <span
              className={`absolute inset-y-0 left-0 w-1 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0'}`}
              style={{ background: tone.accent }}
            />
            <button
              onClick={() => setOpen(isOpen ? null : i)}
              className="flex w-full items-center gap-3 px-4 py-3.5 text-left sm:gap-4 sm:px-5 sm:py-4"
              aria-expanded={isOpen}
            >
              <span
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold"
                style={{ background: tone.soft, color: tone.accent }}
              >
                {String(i + 1).padStart(2, '0')}
              </span>
              <span className="flex-1 text-[14px] font-bold leading-snug tracking-[-0.01em] text-[#082E70] sm:text-[15px]">
                {f.question}
              </span>
              <span
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full transition-transform duration-300"
                style={{ background: tone.soft, color: tone.accent }}
              >
                {isOpen ? <Minus className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
              </span>
            </button>

            <div
              className={`grid transition-[grid-template-rows] duration-300 ease-out ${
                isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
              }`}
            >
              <div className="overflow-hidden">
                <p className="px-4 pb-4 pl-[3.75rem] text-[13px] leading-[1.7] text-slate-500 sm:px-5 sm:pb-5 sm:pl-[4.25rem] sm:text-sm">
                  {f.answer}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
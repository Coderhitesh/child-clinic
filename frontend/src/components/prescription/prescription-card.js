'use client';
import { useState } from 'react';
import { Download, Phone, Mail, MapPin, CalendarCheck, Pencil, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { prettyDate, fileUrl } from '@/lib/utils';
import { SLOTS, FOODS } from './shared';

const foodLabel = (k) => FOODS.find((f) => f.key === k)?.label;
const has = (v) => v !== undefined && v !== null && String(v).trim() !== '' && !(typeof v === 'number' && v <= 0);
const ageOf = (pt = {}) => {
  if (pt.dob) {
    const days = Math.floor((Date.now() - new Date(pt.dob)) / 86400000);
    if (Number.isNaN(days) || days < 0) return '';
    if (days >= 365) return `${Math.floor(days / 365.25)} yrs`;
    if (days >= 30) return `${Math.floor(days / 30.4)} months`;
    return days > 0 ? `${days} days` : '';
  }
  return has(pt.age) ? `${pt.age} yrs` : '';
};

async function saveFile(url, name) {
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error('bad');
    const blob = await res.blob();
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = name;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  } catch {
    window.open(url, '_blank', 'noopener');
  }
}

const extOf = (u = '') => (u.split('?')[0].match(/\.(\w{2,4})$/)?.[1] || 'jpg').toLowerCase();

// Full prescription shown inline + PDF download. Works for admin & patient side.
export default function PrescriptionCard({ prescription: p, onEdit }) {
  const [busy, setBusy] = useState(false);
  if (!p) return null;
  const clinic = p.clinic || {};
  const meds = (p.medicines || []).filter((m) => has(m.name) || has(m.dosage) || m.timings?.length || has(m.frequency) || has(m.food));
  const patient = p.patient || {};
  const doctorName = p.doctor?.name ? `Dr. ${String(p.doctor.name).replace(/^dr\.?\s*/i, '')}` : '';
  const addr = [clinic.address?.line1, clinic.address?.line2, clinic.address?.city, clinic.address?.pincode].filter(Boolean).join(', ');

  // uploaded prescription (no typed medicines) -> download the uploaded file itself; typed -> generated PDF
  const uploadedOnly = Boolean(p.images?.length) && !meds.length;
  const base = `prescription-${(patient.name || 'patient').replace(/\s+/g, '-')}`;

  const onDownload = async () => {
    setBusy(true);
    if (uploadedOnly) {
      for (let i = 0; i < p.images.length; i += 1) {
        const u = p.images[i];
        // eslint-disable-next-line no-await-in-loop
        await saveFile(fileUrl(u), `${base}${p.images.length > 1 ? `-${i + 1}` : ''}.${extOf(u)}`);
      }
    } else if (p.pdfUrl) {
      await saveFile(fileUrl(p.pdfUrl), `${base}.pdf`);
    } else {
      toast.error('PDF is not ready yet, try again in a moment');
    }
    setBusy(false);
  };

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-white">
      <div className="flex flex-wrap items-center justify-between gap-3 bg-brand-700 px-5 py-4 text-white">
        <div className="flex items-center gap-3">
          {clinic.logo && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={fileUrl(clinic.logo)} alt="" className="h-12 w-12 rounded-lg bg-white object-contain p-1" />
          )}
          <div>
            <p className="text-lg font-bold leading-tight">{clinic.name || 'Clinic'}</p>
            {addr && <p className="text-xs opacity-80">{addr}</p>}
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {onEdit && (
            <Button onClick={onEdit} variant="outline" className="border-white/40 bg-transparent text-white hover:bg-white/10 hover:text-white">
              <Pencil className="h-4 w-4" /> Edit
            </Button>
          )}
          <Button onClick={onDownload} disabled={busy} className="bg-white text-brand-700 hover:bg-brand-50">
            {busy ? <Spinner /> : <Download className="h-4 w-4" />} {uploadedOnly ? (p.images.length > 1 ? 'Download files' : 'Download') : 'Download PDF'}
          </Button>
        </div>
      </div>

      <div className="space-y-5 p-5 text-sm">
        <div className="grid gap-3 rounded-lg border border-border p-3 sm:grid-cols-3">
          <Info label="Patient" value={patient.name} />
          <Info label="Patient ID" value={patient.patientId} />
          <Info label="Age" value={ageOf(patient)} />
          <Info label="Gender" value={patient.gender} />
          <Info label="Doctor" value={doctorName} />
          <Info label="Date" value={p.createdAt ? prettyDate(p.createdAt) : ''} />
        </div>

        {has(p.diagnosis) && <Info label="Diagnosis" value={p.diagnosis} />}

        {Boolean(p.images?.length) && (
          <div>
            <p className="mb-2 text-xs font-semibold uppercase text-muted-foreground">Uploaded prescription</p>
            <div className="grid gap-3 sm:grid-cols-2">
              {p.images.map((u, i) => {
                const src = fileUrl(u);
                return /\.pdf(\?|$)/i.test(u) ? (
                  <a key={i} href={src} target="_blank" rel="noreferrer" className="flex items-center gap-2 rounded-lg border border-border p-3 text-brand-700 hover:bg-brand-50">
                    <FileText className="h-5 w-5" /> Open PDF {i + 1}
                  </a>
                ) : (
                  <a key={i} href={src} target="_blank" rel="noreferrer" className="block overflow-hidden rounded-lg border border-border">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={src} alt={`Prescription ${i + 1}`} className="max-h-96 w-full bg-slate-50 object-contain" />
                  </a>
                );
              })}
            </div>
          </div>
        )}

        {Boolean(meds.length) && (
        <div>
          <p className="mb-2 text-2xl font-bold text-brand-700">Rx</p>
          <div className="divide-y rounded-xl border border-border">
            {meds.map((m, i) => {
              const hasTimings = m.timings?.length > 0;
              return (
                <div key={i} className="flex flex-wrap items-start justify-between gap-3 px-4 py-3">
                  <div className="min-w-[180px]">
                    <p className="font-semibold text-ink">{i + 1}. {has(m.name) ? m.name : 'Medicine'}</p>
                    {Boolean([m.dosage, foodLabel(m.food), has(m.durationDays) && m.durationDays].filter(has).length) && (
                      <p className="text-xs text-muted-foreground">
                        {[has(m.dosage) && m.dosage, foodLabel(m.food), has(m.durationDays) && `${m.durationDays} days`].filter(Boolean).join(' · ')}
                      </p>
                    )}
                    {has(m.instructions) && <p className="mt-1 text-xs italic text-muted-foreground">Note: {m.instructions}</p>}
                  </div>
                  <div className="flex flex-wrap items-center gap-1.5">
                    {hasTimings
                      ? SLOTS.map((s) => (
                          <span
                            key={s.key}
                            className={`rounded-full border px-2.5 py-1 text-xs ${
                              m.timings.includes(s.key) ? 'border-brand-600 bg-brand-600 font-medium text-white' : 'border-border text-slate-400 line-through'
                            }`}
                          >
                            {s.label}
                          </span>
                        ))
                      : has(m.frequency) && <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs">{m.frequency}</span>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        )}

        {has(p.generalInstructions) && (
          <div className="rounded-lg bg-amber-50 p-3">
            <p className="text-xs font-semibold uppercase text-amber-700">Advice</p>
            <p className="mt-1 whitespace-pre-line text-ink">{p.generalInstructions}</p>
          </div>
        )}

        {p.followUpDate && (
          <p className="flex items-center gap-2 text-ink"><CalendarCheck className="h-4 w-4 text-brand-600" /> Follow-up on <b>{prettyDate(p.followUpDate)}</b></p>
        )}
      </div>

      {Boolean(clinic.phone || clinic.email || addr) && (
      <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-1 border-t border-brand-100 bg-brand-50 px-5 py-3 text-xs text-muted-foreground">
        {clinic.phone && <span className="flex items-center gap-1"><Phone className="h-3 w-3" />{clinic.phone}</span>}
        {clinic.email && <span className="flex items-center gap-1"><Mail className="h-3 w-3" />{clinic.email}</span>}
        {addr && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{addr}</span>}
      </div>
      )}
    </div>
  );
}

function Info({ label, value }) {
  if (value === undefined || value === null || String(value).trim() === '') return null;
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="font-medium capitalize text-ink">{value}</p>
    </div>
  );
}

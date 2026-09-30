import Link from 'next/link';
import {   ArrowRight,
  Clock3,
  MapPin,
  Navigation,
  Phone,
  Star, } from 'lucide-react';
import { cn, inr, initials } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import DoctorPhoto from '@/components/ui/doctor-photo';


import {
  getClinicAddress,
  getClinicHref,
  getClinicImage,
  getClinicSpecialities,
  getClinicTiming,
  getRemainingSpecialitiesCount,
} from "@/lib/clinic-utils";

export function SectionHead({ title, sub, href, linkLabel = 'View all', className }) {
  return (
    <div className={cn('mb-5 flex items-end justify-between gap-4', className)}>
      <div>
        <h2 className="section-title">{title}</h2>
        {sub && <p className="section-sub">{sub}</p>}
      </div>
      {href && (
        <Link href={href} className="shrink-0 text-sm font-medium text-brand-700 hover:underline">
          {linkLabel} <ArrowRight className="inline h-3.5 w-3.5" />
        </Link>
      )}
    </div>
  );
}

export function Stars({ value = 0, count, className }) {
  const full = Math.round(value);
  return (
    <span className={cn('inline-flex items-center gap-1 text-xs', className)}>
      <span className="flex">
        {[1, 2, 3, 4, 5].map((i) => (
          <Star key={i} className={cn('h-3.5 w-3.5', i <= full ? 'fill-amber-400 text-amber-400' : 'text-slate-300')} />
        ))}
      </span>
      <span className="font-medium text-ink">{Number(value).toFixed(1)}</span>
      {count != null && <span className="text-muted-foreground">({count})</span>}
    </span>
  );
}

export function DoctorAvatar({ name, photo, className }) {
  return <DoctorPhoto name={name} photo={photo} className={cn('text-lg', className)} />;
}

export function DoctorCard({ doctor, compact = false }) {
  const spec = doctor.speciality?.name || 'General';
  return (
    <div className="soft-card group flex gap-4 p-4 transition-shadow hover:shadow-md">
      <DoctorAvatar name={doctor.name} photo={doctor.photo} className="h-20 w-20 shrink-0 rounded-xl" />
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <Link href={`/doctors/${doctor._id}`} className="block truncate font-semibold text-ink hover:text-brand-700">
              {doctor.name}
            </Link>
            <div className="mt-1 flex flex-wrap items-center gap-2">
              <Badge tone="info">{spec}</Badge>
              {doctor.experienceYears ? (
                <span className="text-xs text-muted-foreground">{doctor.experienceYears} yrs experience</span>
              ) : null}
            </div>
          </div>
          <div className="shrink-0 text-right">
            <p className="font-semibold text-ink">{inr(doctor.consultationFee)}</p>
            <p className="text-[11px] text-muted-foreground">Consultation fee</p>
          </div>
        </div>

        {doctor.qualification && (
          <p className="mt-2 line-clamp-1 text-xs text-muted-foreground">{doctor.qualification}</p>
        )}

        {!compact && doctor.clinics?.length ? (
          <p className="mt-2 flex items-center gap-1 text-xs text-brand-700">
            <MapPin className="h-3.5 w-3.5" />
            {doctor.clinics.map((c) => c.name || 'Clinic').join(' · ')}
          </p>
        ) : null}
      </div>
    </div>
  );
}

export function ClinicCard({ clinic }) {
  const image = getClinicImage(clinic);
  const fullAddress = getClinicAddress(clinic);
  const timingText = getClinicTiming(clinic);
  const href = getClinicHref(clinic);

  const specialities = getClinicSpecialities(clinic, 4);
  const remainingSpecialities = getRemainingSpecialitiesCount(clinic, 4);

  const bookHref = `/doctors?clinic=${clinic._id}`;

  return (
    <div className="group flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
      
      {/* ==================================================
          IMAGE SECTION
      ================================================== */}
      <Link
        href={href}
        className="relative block aspect-[16/10] overflow-hidden bg-slate-50"
      >
        {/* Blurred background fill */}
        <img
          src={image}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 h-full w-full scale-110 object-cover blur-xl opacity-30"
        />

        <img
          src={image}
          alt={clinic.name || "Clinic"}
          className="relative h-full w-full object-contain p-2 transition-transform duration-500 group-hover:scale-105"
        />

        {clinic.isFeatured && (
          <div className="absolute left-2.5 top-2.5 z-10 flex items-center gap-1 rounded-full bg-[#ff5574] px-2 py-0.5 text-[10px] font-semibold text-white shadow-sm">
            <Star className="h-3 w-3 fill-current" />
            Featured
          </div>
        )}

        <span
          className={`absolute right-2.5 top-2.5 z-10 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold shadow-sm backdrop-blur-md ${
            clinic.isActive
              ? "bg-emerald-50/90 text-emerald-700 border border-emerald-200/50"
              : "bg-red-50/90 text-red-600 border border-red-200/50"
          }`}
        >
          <span
            className={`h-1.5 w-1.5 rounded-full ${
              clinic.isActive ? "bg-emerald-500" : "bg-red-500"
            }`}
          />
          {clinic.isActive ? "Active" : "Inactive"}
        </span>
      </Link>

      {/* ==================================================
          BODY SECTION
      ================================================== */}
      <div className="flex flex-1 flex-col p-3.5 sm:p-4">
        
        <Link href={href}>
          <h3 className="line-clamp-1 text-sm sm:text-base font-bold text-[#103b78] transition-colors hover:text-blue-600">
            {clinic.name}
          </h3>
        </Link>

        {/* Info list with compact spacing */}
        <div className="mt-2 space-y-1.5 text-xs text-slate-500">
          <div className="flex items-start gap-1.5">
            <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-blue-600/80" />
            <p className="line-clamp-2 leading-relaxed">
              {fullAddress || "Address on request"}
            </p>
          </div>

          {clinic.phone && (
            <div className="flex items-center gap-1.5">
              <Phone className="h-3.5 w-3.5 shrink-0 text-blue-600/80" />
              <p>{clinic.phone}</p>
            </div>
          )}

          <div className="flex items-start gap-1.5">
            <Clock3 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-blue-600/80" />
            <p className="line-clamp-1">{timingText}</p>
          </div>
        </div>

        {/* Specialities tags */}
        {specialities.length > 0 && (
          <div className="mt-2.5 flex flex-wrap gap-1">
            {specialities.map((name) => (
              <span
                key={name}
                className="rounded-md bg-blue-50/80 px-2 py-0.5 text-[10px] font-medium text-blue-700"
              >
                {name}
              </span>
            ))}

            {remainingSpecialities > 0 && (
              <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600">
                +{remainingSpecialities}
              </span>
            )}
          </div>
        )}

        {clinic.isTemporarilyClosed && (
          <div className="mt-2.5 rounded-lg bg-amber-50 px-2.5 py-1 text-[10px] font-medium text-amber-700 border border-amber-200/40">
            Temporarily closed
            {clinic.temporaryClosureReason
              ? ` · ${clinic.temporaryClosureReason}`
              : ""}
          </div>
        )}

        {/* ==================================================
            ACTIONS FOOTER
        ================================================== */}
        <div className="mt-auto grid grid-cols-2 gap-2 border-t border-slate-100 pt-3">
          {clinic.mapLink ? (
            <a
              href={clinic.mapLink}
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-9 items-center justify-center gap-1 rounded-xl border border-slate-200 text-xs font-semibold text-blue-700 transition-colors hover:border-blue-200 hover:bg-blue-50"
            >
              <Navigation className="h-3.5 w-3.5" />
              Directions
            </a>
          ) : (
            <span className="inline-flex h-9 items-center justify-center gap-1 rounded-xl border border-slate-100 text-xs font-medium text-slate-400 cursor-not-allowed">
              <Navigation className="h-3.5 w-3.5" />
              Directions
            </span>
          )}

          <Link
            href={bookHref}
            className="inline-flex h-9 items-center justify-center gap-1 rounded-xl bg-[#ff5574] text-xs font-semibold text-white shadow-sm transition-all hover:bg-[#ee4162]"
          >
            Book
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

      </div>
    </div>
  );
}
export function StatStrip({ items }) {
  return (
    <div className="container -mt-8 relative z-10">
      <div className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-border bg-border md:grid-cols-4">
        {items.map((s) => (
          <div key={s.label} className="bg-white px-5 py-6 text-center">
            <p className="text-2xl font-extrabold text-brand-700">{s.value}</p>
            <p className="mt-1 text-xs text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export function HandNote({ children, className }) {
  return <p className={cn('hand-note text-2xl md:text-[28px]', className)}>{children}</p>;
}

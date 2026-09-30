"use client";

import { useMemo } from "react";
import { Navigation } from "lucide-react";
import { ClinicCard } from "@/components/site/bits";
import { useUiStore } from "@/store/uiStore";
import { formatDistance, sortClinicsByProximity } from "@/lib/location";

// Clinics nearest to the visitor first, then the rest. Location itself is detected once in the site header.
export default function NearbyClinics({ clinics = [], limit = 4 }) {
  const userPos = useUiStore((s) => s.userPos);
  const city = useUiStore((s) => s.city);
  const cityManual = useUiStore((s) => s.cityManual);

  const ordered = useMemo(
    () => sortClinicsByProximity(clinics, { userPos, city, cityManual }),
    [clinics, userPos, city, cityManual]
  );

  return (
    <>
      {ordered.slice(0, limit).map(({ clinic, km }) => (
        <div key={clinic._id} className="relative h-full">
          {km != null && (
            <span className="pointer-events-none absolute right-2.5 top-10 z-20 inline-flex items-center gap-1 rounded-full bg-white/95 px-2 py-0.5 text-[10px] font-semibold text-[#0C3177] shadow-sm">
              <Navigation className="h-3 w-3 text-[#3973F6]" />
              {formatDistance(km)}
            </span>
          )}
          <ClinicCard clinic={clinic} />
        </div>
      ))}
    </>
  );
}

"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  Search,
  Stethoscope,
  MapPin,
  UserRound,
  CalendarDays,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { SimpleSelect } from "@/components/ui/select";

const selectCls =
  "h-[52px] w-full justify-between gap-2 border-0 bg-transparent p-0 " +
  "text-sm font-medium text-ink-soft shadow-none " +
  "focus:ring-0 focus-visible:ring-0 " +
  "[&>span]:truncate " +
  "[&>svg]:shrink-0 " +
  "[&>svg]:text-ink-soft " +
  "[&>svg]:opacity-70";

export default function HeroSearch({
  specialities = [],
  clinics = [],
  doctors = [],
}) {
  const router = useRouter();

  const [clinic, setClinic] = useState("");
  const [speciality, setSpeciality] = useState("");
  const [doctor, setDoctor] = useState("");
  const [date, setDate] = useState("");

  const search = () => {
    const qs = new URLSearchParams();
    if (date) qs.set("date", date);

    if (doctor) {
      const query = qs.toString();
      router.push(query ? `/doctors/${doctor}?${query}` : `/doctors/${doctor}`);
      return;
    }

    if (speciality) qs.set("speciality", speciality);
    if (clinic) qs.set("clinic", clinic);

    const query = qs.toString();
    router.push(query ? `/doctors?${query}` : "/doctors");
  };

  return (
    <div className="w-full">
      {/* ==================================================
          HEADING — no card, sits directly on the hero
      ================================================== */}

      <div className="relative inline-block">
        <h2 className="text-2xl font-extrabold tracking-tight text-ink md:text-[28px]">
          Find a Pediatrician
        </h2>

        {/* little spark accent */}
        <svg
          viewBox="0 0 40 40"
          className="pointer-events-none absolute -right-9 top-0 hidden h-7 w-7 text-clinic-500 md:block"
        >
          <path
            d="M36 20H26M32 9l-7 7M32 31l-7-7"
            stroke="currentColor"
            strokeWidth="4"
            strokeLinecap="round"
          />
        </svg>
      </div>

      <p className="mt-1.5 text-sm font-medium text-black md:text-[15px]">
        Search and book an appointment in seconds
      </p>

      {/* ==================================================
          FIELDS
      ================================================== */}

      <div className="mt-5 space-y-3">
        <SearchField icon={MapPin}>
          <SimpleSelect
            value={clinic}
            onChange={setClinic}
            allowEmpty
            emptyLabel="Choose a location"
            placeholder="Choose a location"
            options={clinics.map((item) => ({
              value: item._id,
              label: item.name,
            }))}
            className={selectCls}
          />
        </SearchField>

        <SearchField icon={Stethoscope}>
          <SimpleSelect
            value={speciality}
            onChange={setSpeciality}
            allowEmpty
            emptyLabel="Choose a speciality"
            placeholder="Choose a speciality"
            options={specialities.map((item) => ({
              value: item._id,
              label: item.name,
            }))}
            className={selectCls}
          />
        </SearchField>

        <SearchField icon={UserRound}>
          <SimpleSelect
            value={doctor}
            onChange={setDoctor}
            allowEmpty
            emptyLabel="Any doctor"
            placeholder="Any doctor"
            options={doctors.map((item) => ({
              value: item._id,
              label: item.name,
            }))}
            className={selectCls}
          />
        </SearchField>

        <SearchField icon={CalendarDays}>
          <input
            type="date"
            value={date}
            min={new Date().toISOString().split("T")[0]}
            onChange={(e) => setDate(e.target.value)}
            className="
              h-[52px] w-full border-0 bg-transparent p-0
              text-sm font-medium text-ink-soft outline-none
              focus:ring-0
              [&::-webkit-calendar-picker-indicator]:cursor-pointer
              [&::-webkit-calendar-picker-indicator]:opacity-50
            "
          />
        </SearchField>
      </div>

      {/* ==================================================
          BUTTON
      ================================================== */}

      <Button
        onClick={search}
        className="
          mt-4 h-[56px] w-full rounded-2xl
          bg-clinic-500 text-[15px] font-semibold text-white
          shadow-clinic transition-all duration-300
          hover:-translate-y-0.5 hover:bg-clinic-600 hover:shadow-lg
          focus-visible:ring-2 focus-visible:ring-clinic-300 focus-visible:ring-offset-2
        "
      >
        <Search className="mr-2 h-[18px] w-[18px]" />
        Search Doctor
      </Button>
    </div>
  );
}

/* ======================================================
   FIELD — floating white pill
====================================================== */

function SearchField({ icon: Icon, children }) {
  return (
    <div
      className="
        group flex min-w-0 items-center gap-3
        rounded-2xl border border-white bg-white px-4
        shadow-lg transition-all duration-200
        focus-within:border-clinic-200 focus-within:shadow-lg
        hover:shadow-lg
      "
    >
      <Icon className="h-[18px] w-[18px] shrink-0 text-ink" strokeWidth={2} />
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
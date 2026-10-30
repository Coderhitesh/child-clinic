"use client";

import React from "react";
import Link from "next/link";
import {
  ArrowRight,
  Heart,
  ShieldCheck,
} from "lucide-react";

const SiteSpeciality = ({
  specialities = [],
}) => {
  return (
    <section className="relative overflow-hidden bg-[#F8FCFF] py-8 ">

      {/* =====================================================
          DECORATIVE BACKGROUND
      ===================================================== */}

      <div className="pointer-events-none absolute -left-20 top-20 h-64 w-64 rounded-full bg-brand-50/80 blur-3xl" />

      <div className="pointer-events-none absolute -right-20 top-0 h-72 w-72 rounded-full bg-clinic-50/80 blur-3xl" />

      <div className="pointer-events-none absolute bottom-0 left-1/3 h-56 w-56 rounded-full bg-brand-50/60 blur-3xl" />

      {/* =====================================================
          CONTENT
      ===================================================== */}

      <div className="container relative z-10">

        {/* =====================================================
            SECTION HEADER
        ===================================================== */}

        <div className="mx-auto mb-5 max-w-3xl text-center md:mb-14">

          {/* Small badge */}
          <div
            className="
              mb-2
              inline-flex
              items-center
              gap-1
              rounded-full
              border
              border-brand-100
              bg-brand-50
              px-2.5
              py-1
              text-[10px]
              font-bold
              uppercase
              tracking-[0.1em]
              text-brand-700

              sm:mb-4
              sm:gap-2
              sm:px-4
              sm:py-2
              sm:text-xs
              sm:tracking-[0.12em]
            "
          >
            <Heart
              className="h-3.5 w-3.5 text-clinic-500 sm:h-4 sm:w-4"
              strokeWidth={2}
            />

            Specialised Care
          </div>

          {/* Main title */}
          <h2
            className="
              text-2xl
              font-extrabold
              tracking-[-0.03em]
              text-ink
              sm:text-4xl
              md:text-5xl
            "
          >
            Our{" "}
            <span className="text-clinic-500">
              Speciality
            </span>
          </h2>

          {/* Subtitle */}
          <p
            className="
              mx-auto
              mt-2
              max-w-2xl
              text-xs
              leading-5
              text-ink-soft
              sm:mt-4
              sm:text-base
              sm:leading-6
              md:text-lg
            "
          >
            Compassionate, expert care for every child&apos;s
            unique needs.
          </p>

          {/* underline */}
          <div className="mx-auto mt-3 h-1 w-14 rounded-full bg-brand-600 sm:mt-5 sm:w-20" />
        </div>

        {/* =====================================================
            SPECIALITY GRID
        ===================================================== */}

        {specialities.length ? (
          <>
            <div
              className="
                grid
                grid-cols-2
                gap-2
                sm:gap-3
                md:grid-cols-4
                lg:grid-cols-4
                lg:gap-4
              "
            >
              {specialities.slice(0, 8).map((speciality, index) => (
                <SpecialityCard
                  key={speciality._id}
                  speciality={speciality}
                  index={index}
                />
              ))}
            </div>

            {/* =================================================
                VIEW ALL BUTTON
            ================================================= */}

            <div className="mt-5 flex justify-center md:mt-12">
              <Link
                href="/specialities"
                className="
                  group
                  inline-flex
                  min-h-[46px]
                  items-center
                  justify-center
                  gap-2
                  rounded-full
                  bg-brand-600
                  px-6
                  text-xs
                  font-semibold
                  text-white
                  shadow-brand

                  transition-all
                  duration-300

                  hover:-translate-y-0.5
                  hover:bg-brand-700
                  hover:shadow-lg

                  sm:min-h-[52px]
                  sm:px-7
                  sm:text-sm
                "
              >
                View All Specialities

                <ArrowRight
                  className="
                    h-4
                    w-4
                    transition-transform
                    duration-300
                    group-hover:translate-x-1
                  "
                />
              </Link>
            </div>
          </>
        ) : (
          <EmptySpeciality />
        )}

        {/* =====================================================
            DECORATIVE TEXT
        ===================================================== */}

        <div
          className="
            pointer-events-none
            absolute
            -left-2
            top-24
            hidden
            rotate-[-8deg]
            font-hand
            text-xl
            leading-snug
            text-brand-500/65
            xl:block
          "
        >
          Every Child
          <br />
          Matters
          <Heart className="ml-1 inline h-5 w-5 text-clinic-400" />
        </div>

        <div
          className="
            pointer-events-none
            absolute
            -right-1
            top-24
            hidden
            rotate-[7deg]
            text-right
            font-hand
            text-xl
            leading-snug
            text-brand-500/65
            xl:block
          "
        >
          Brighter Futures
          <br />
          Together
          <Heart className="ml-1 inline h-5 w-5 text-clinic-400" />
        </div>
      </div>

      {/* =====================================================
          BOTTOM WAVES
      ===================================================== */}

      <BottomWaves />
    </section>
  );
};

export default SiteSpeciality;


/* =========================================================
   SPECIALITY CARD
========================================================= */

function SpecialityCard({
  speciality,
  index,
  className = "",
}) {
  const colors = [
    {
      bg: "bg-brand-50",
      arrow: "bg-brand-50 text-brand-600",
      hover: "group-hover:border-brand-200",
    },
    {
      bg: "bg-[#ECFAF5]",
      arrow: "bg-[#E4F8F0] text-[#16A085]",
      hover: "group-hover:border-[#BCEADB]",
    },
    {
      bg: "bg-clinic-50",
      arrow: "bg-clinic-50 text-clinic-500",
      hover: "group-hover:border-clinic-200",
    },
    {
      bg: "bg-[#F4F0FF]",
      arrow: "bg-[#F0EAFF] text-[#7C6AD6]",
      hover: "group-hover:border-[#D9CCFF]",
    },
    {
      bg: "bg-brand-50",
      arrow: "bg-brand-50 text-brand-600",
      hover: "group-hover:border-brand-200",
    },
    {
      bg: "bg-[#FFF7E8]",
      arrow: "bg-[#FFF2D5] text-[#F59E0B]",
      hover: "group-hover:border-[#FFE0A0]",
    },
    {
      bg: "bg-[#EAFBF7]",
      arrow: "bg-[#E0F7F1] text-[#16A085]",
      hover: "group-hover:border-[#B9EBDD]",
    },
    {
      bg: "bg-[#FFF7E8]",
      arrow: "bg-[#FFF2D5] text-[#F59E0B]",
      hover: "group-hover:border-[#FFE0A0]",
    },
    {
      bg: "bg-clinic-50",
      arrow: "bg-clinic-50 text-clinic-500",
      hover: "group-hover:border-clinic-200",
    },
  ];

  const color = colors[index % colors.length];

  return (
    <Link
      href={`/specialities/${speciality.slug}`}
      className={`
        group
        relative
        flex
        flex-col
        items-center
        gap-1.5
        overflow-hidden
        rounded-lg

        border
        border-[#E6EEF5]
        bg-white

        p-2
        text-center
        shadow-[0_8px_30px_rgba(23,58,120,0.05)]

        transition-all
        duration-300

        hover:-translate-y-1
        hover:shadow-[0_16px_40px_rgba(23,58,120,0.10)]

        sm:gap-2
        sm:rounded-xl
        sm:p-3

        ${color.hover}
        ${className}
      `}
    >
      {/* Image */}
      <div
        className={`
          relative
          flex
          h-[56px]
          w-[56px]
          shrink-0
          items-center
          justify-center
          overflow-hidden
          rounded-full

          sm:h-[76px]
          sm:w-[76px]

          ${color.bg}
        `}
      >
        {speciality.image ? (
          <img
            src={speciality.image}
            alt={speciality.name}
            className="
              h-full
              w-full
              object-cover
              transition-transform
              duration-500
              group-hover:scale-105
            "
          />
        ) : (
          <ShieldCheck
            className="h-6 w-6 text-brand-600 sm:h-8 sm:w-8"
            strokeWidth={1.5}
          />
        )}

        <div className="pointer-events-none absolute inset-0 rounded-full ring-1 ring-inset ring-white/60" />
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1">

        <h3
          className="
            text-[11px]
            font-bold
            leading-tight
            text-ink
            transition-colors
            group-hover:text-brand-700

            sm:text-sm
          "
        >
          {speciality.name}
        </h3>

        <p
          className="
            mt-0.5
            line-clamp-1
            text-[9px]
            leading-[12px]
            text-ink-soft

            sm:line-clamp-2
            sm:text-xs
            sm:leading-4
          "
        >
          {speciality.description ||
            getSpecialityDescription(speciality.name)}
        </p>
      </div>
    </Link>
  );
}


/* =========================================================
   FALLBACK DESCRIPTION
========================================================= */

function getSpecialityDescription(name = "") {
  const descriptions = {
    "Autism & ADHD":
      "Support for better focus, learning and behaviour.",

    "Cerebral Palsy":
      "Helping children move, learn and achieve independence.",

    "Down Syndrome":
      "Individualised care for a brighter tomorrow.",

    "Epilepsy & Seizures":
      "Expert care for safer, brighter days.",

    "Genetic Syndrome":
      "Personalised support for unique genetic conditions.",

    "Hearing Problem":
      "Better hearing support for a brighter world.",

    "Hyperactivity & Behavioural Concerns":
      "Guidance for calmer behaviour and better development.",

    "Intellectual Disability & Developmental Delay":
      "Early support for development and greater possibilities.",

    "Speech Delay":
      "Helping every child communicate and find their voice.",
  };

  return (
    descriptions[name] ||
    "Compassionate specialist care tailored to your child's needs."
  );
}


/* =========================================================
   EMPTY STATE
========================================================= */

function EmptySpeciality() {
  return (
    <div
      className="
        mx-auto
        flex
        max-w-xl
        flex-col
        items-center
        justify-center

        rounded-3xl
        border
        border-dashed
        border-brand-200

        bg-white
        px-6
        py-12
        text-center
      "
    >
      <div
        className="
          mb-4
          flex
          h-14
          w-14
          items-center
          justify-center
          rounded-full
          bg-brand-50
        "
      >
        <ShieldCheck className="h-7 w-7 text-brand-600" />
      </div>

      <h3 className="text-lg font-bold text-ink">
        Specialities coming soon
      </h3>

      <p className="mt-2 text-sm leading-6 text-ink-soft">
        Specialities will appear here once they are added from
        the admin panel.
      </p>
    </div>
  );
}


/* =========================================================
   DECORATIVE WAVES
========================================================= */

function BottomWaves() {
  return (
    <svg
      viewBox="0 0 1440 130"
      preserveAspectRatio="none"
      className="
        pointer-events-none
        absolute
        inset-x-0
        bottom-0
        -z-0
        h-20
        w-full
        md:h-28
      "
    >
      <path
        d="M0 70C230 20 440 125 730 90S1180 35 1440 75V130H0Z"
        className="fill-brand-50"
        opacity=".8"
      />

      <path
        d="M0 100C300 65 520 135 820 105S1220 70 1440 100V130H0Z"
        className="fill-clinic-50"
        opacity=".65"
      />
    </svg>
  );
}
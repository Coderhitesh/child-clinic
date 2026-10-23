"use client";

import { useEffect, useState } from "react";
import {
  CalendarCheck,
  ShieldCheck,
  Users,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  HeartHandshake,
} from "lucide-react";

import HeroSearch from "@/components/site/hero-search";

const HERO_FALLBACK = "/images/hero-doctor-child.jpg";

/* ======================================================
   TRUST ITEM
====================================================== */

function TrustItem({ icon: Icon, label, description, accent = "brand" }) {
  const tone = {
    brand: "bg-brand-50 text-brand-600 ring-brand-100",
    clinic: "bg-clinic-50 text-clinic-500 ring-clinic-100",
    mint: "bg-emerald-50 text-emerald-600 ring-emerald-100",
  }[accent];

  return (
    <div className="flex items-center gap-2.5">
      <div
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ring-1 ${tone}`}
      >
        <Icon className="h-[18px] w-[18px]" strokeWidth={2.2} />
      </div>

      <div className="leading-tight">
        <p className="text-[13px] font-bold text-ink">{label}</p>
        {description && (
          <p className="text-[12px] font-medium text-ink-soft">{description}</p>
        )}
      </div>
    </div>
  );
}

/* ======================================================
   COPY (shared by mobile + desktop)
====================================================== */

function HeroCopy({ hero, compact = false }) {
  return (
    <>
      <div className="flex items-center gap-2.5">
        <span className="h-[3px] w-6 rounded-full bg-clinic-500" />
        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-ink-soft sm:text-[11px] lg:text-xs">
          Only Medicine • No Therapy • No Exercise
        </p>
      </div>

      <h1
        className={`
          mt-3 font-extrabold leading-[1.08] tracking-[-0.03em] text-ink
          ${
            compact
              ? "max-w-[280px] text-[24px] sm:max-w-[340px] sm:text-[28px]"
              : "max-w-[560px] text-[44px] lg:text-[52px]"
          }
        `}
      >
        <span className="block text-[#0C3177]">Only Medicine</span>
        <span className="block text-[#FF4389]">No Therapy</span>
        <span className="block text-clinic-500">No Exercise</span>
      </h1>

      <p
        className={`
          mt-2 text-sm leading-6 text-ink-soft
          ${
            compact
              ? "line-clamp-2 max-w-[250px] text-[12px] leading-5 sm:max-w-[340px] sm:text-[13px]"
              : "mt-4 max-w-[460px] md:text-base md:leading-8"
          }
        `}
      >
        {hero?.subtitle || "Dedicated medical care providing results through medication alone, with zero therapy and zero exercise."}
      </p>

      {hero?.buttonText && hero?.link ? (
        <div className={compact ? "mt-3.5" : "mt-6"}>
          <a
            href={hero.link}
            className="
              group inline-flex items-center justify-center gap-2
              rounded-xl bg-clinic-500 px-5 py-2.5
              text-[13px] font-semibold text-white shadow-clinic
              md:py-3.5
              transition-all duration-300
              hover:-translate-y-0.5 hover:bg-clinic-600 hover:shadow-lg
              focus:outline-none focus:ring-2 focus:ring-clinic-300 focus:ring-offset-2
              md:px-7 md:text-base
            "
          >
            {hero.buttonText}
            <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
          </a>
        </div>
      ) : (
        <div className={compact ? "mt-3.5" : "mt-6"}>
          <a
            href="/clinics"
            className="
              group inline-flex items-center justify-center gap-2
              rounded-xl bg-clinic-500 px-5 py-2.5
              text-[13px] font-semibold text-white shadow-clinic
              md:py-3.5
              transition-all duration-300
              hover:-translate-y-0.5 hover:bg-clinic-600 hover:shadow-lg
              focus:outline-none focus:ring-2 focus:ring-clinic-300 focus:ring-offset-2
              md:px-7 md:text-base
            "
          >
            Explore Clinics
            <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
          </a>
        </div>
      )}
    </>
  );
}

/* ======================================================
   TRUST ROW
====================================================== */

function TrustRow({ className = "" }) {
  return (
    <div className={`flex flex-wrap items-center gap-x-6 gap-y-4 ${className}`}>
      <TrustItem
        icon={CalendarCheck}
        label="Instant Booking"
        description="Zero wait time"
        accent="clinic"
      />
      <TrustItem
        icon={ShieldCheck}
        label="Verified Doctors"
        description="100% certified"
      />
      <TrustItem
        icon={Users}
        label="Child-Friendly"
        description="Care environment"
        accent="mint"
      />
      <TrustItem
        icon={HeartHandshake}
        label="Personalized Care"
        description="Every child matters"
        accent="mint"
      />
    </div>
  );
}

/* ======================================================
   DOTS
====================================================== */

function Dots({ slides, activeIndex, setActiveIndex, className = "" }) {
  if (slides.length <= 1) return null;

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {slides.map((slide, index) => (
        <button
          key={slide._id}
          type="button"
          onClick={() => setActiveIndex(index)}
          aria-label={`Go to hero ${index + 1}`}
          className={`
            h-2.5 rounded-full transition-all duration-300
            ${
              index === activeIndex
                ? "w-7 bg-clinic-500"
                : "w-2.5 bg-brand-200 hover:bg-brand-300"
            }
          `}
        />
      ))}
    </div>
  );
}

/* ======================================================
   DECOR
====================================================== */

function HeroDecor() {
  return (
    <>
      <svg
        viewBox="0 0 100 90"
        fill="none"
        className="pointer-events-none absolute -left-8 -top-6 hidden h-40 w-40 text-clinic-100 lg:block"
      >
        <path
          d="M50 82S8 56 8 30A22 22 0 0 1 50 20 22 22 0 0 1 92 30c0 26-42 52-42 52Z"
          stroke="currentColor"
          strokeWidth="4"
        />
      </svg>

      <svg
        viewBox="0 0 100 100"
        className="pointer-events-none absolute right-6 top-8 hidden h-14 w-14 text-brand-200 lg:block"
      >
        <path
          d="M38 8h24v30h30v24H62v30H38V62H8V38h30V8Z"
          fill="currentColor"
          opacity=".7"
        />
      </svg>

      <div className="pointer-events-none absolute -bottom-24 -left-24 hidden h-64 w-64 rounded-full bg-brand-100/50 lg:block" />

      <svg
        viewBox="0 0 120 120"
        fill="none"
        className="pointer-events-none absolute bottom-6 right-10 hidden h-28 w-28 text-emerald-200 lg:block"
      >
        <path
          d="M60 110C60 70 80 40 112 26 108 70 92 100 60 110Z"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          d="M58 110C52 74 34 48 8 38 12 76 28 100 58 110Z"
          stroke="currentColor"
          strokeWidth="4"
        />
      </svg>
    </>
  );
}

/* ======================================================
   HERO
====================================================== */

export default function Hero({
  heroes = [],
  specialities = [],
  clinics = [],
  doctors = [],
}) {
  const [activeIndex, setActiveIndex] = useState(0);

  const fallbackSlide = {
    _id: "default-hero-slide",
    title: "Only Medicine",
    eyebrow: "Only Medicine • No Therapy • No Exercise",
    subtitle: "Dedicated medical care providing results through medication alone, with zero therapy and zero exercise.",
    image: HERO_FALLBACK,
    mobileImage: HERO_FALLBACK,
    link: "/clinics",
    buttonText: "Explore Clinics",
    placement: "home_hero",
    isActive: true,
  };

  const rawSlides = heroes
    .filter(
      (hero) => hero?.placement === "home_hero" && hero?.isActive === true,
    )
    .sort((a, b) => (a?.order || 0) - (b?.order || 0));

  const slides = rawSlides.length ? rawSlides : [fallbackSlide];

  useEffect(() => {
    if (slides.length <= 1) return;

    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % slides.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [slides.length]);

  const hero = slides[activeIndex];

  const prev = () =>
    setActiveIndex((i) => (i - 1 + slides.length) % slides.length);

  const next = () => setActiveIndex((i) => (i + 1) % slides.length);

  return (
    <section className="relative isolate overflow-hidden bg-surface-soft">
      <HeroDecor />

      {/* ==================================================
          MOBILE / TABLET  — copy over image
      ================================================== */}

      <div className="lg:hidden">
        <div className="relative h-[300px] overflow-hidden">
          {/* image slider */}
          {slides.map((slide, index) => (
            <img
              key={slide._id}
              src={slide.mobileImage || slide.image || HERO_FALLBACK}
              alt={slide.title || "Normal Child Clinic"}
              className={`
                absolute inset-0 h-full w-full object-cover object-[78%_center]
                transition-opacity duration-[1200ms] ease-in-out
                ${index === activeIndex ? "opacity-100" : "opacity-0"}
              `}
            />
          ))}

          {/* readability overlay — keeps left side clean, image visible right */}
          <div className="absolute inset-0 bg-gradient-to-r from-surface-soft via-surface-soft/45 to-transparent" />
          <div className="absolute inset-x-0 top-0 h-12 bg-gradient-to-b from-surface-soft to-transparent" />
          <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-surface-soft via-surface-soft/80 to-transparent" />

          {/* copy */}
          <div className="container relative z-10 flex h-[300px] flex-col justify-center py-6">
            <HeroCopy hero={hero} compact />
          </div>

          <Dots
            slides={slides}
            activeIndex={activeIndex}
            setActiveIndex={setActiveIndex}
            className="absolute bottom-3 left-1/2 z-20 -translate-x-1/2"
          />
        </div>

        {/* trust + search below image */}
        <div className="container relative z-10 pb-12 pt-2">
          <TrustRow className="justify-between" />

          <div className="mt-8">
            <HeroSearch
              specialities={specialities}
              clinics={clinics}
              doctors={doctors}
            />
          </div>
        </div>
      </div>

      {/* ==================================================
          DESKTOP — center clear image slider
      ================================================== */}

      <div
        className="
          pointer-events-none absolute inset-y-0 left-1/2 -z-0 hidden
          w-[42%] -translate-x-1/2
          [mask-image:linear-gradient(to_right,transparent_0%,black_16%,black_84%,transparent_100%)]
          [-webkit-mask-image:linear-gradient(to_right,transparent_0%,black_16%,black_84%,transparent_100%)]
          lg:block
        "
      >
        {slides.map((slide, index) => (
          <img
            key={slide._id}
            src={slide.image || HERO_FALLBACK}
            alt={slide.title || "Normal Child Clinic"}
            className={`
              absolute inset-0 h-full w-full object-cover object-center
              transition-opacity duration-[1200ms] ease-in-out
              ${index === activeIndex ? "opacity-100" : "opacity-0"}
            `}
          />
        ))}

        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-surface-soft to-transparent" />
      </div>

      {/* arrows — desktop only */}
      {slides.length > 1 && (
        <>
          <button
            type="button"
            onClick={prev}
            aria-label="Previous slide"
            className="
              absolute left-6 top-1/2 z-30 hidden h-11 w-11 -translate-y-1/2
              items-center justify-center rounded-full border border-brand-100
              bg-white text-ink shadow-card transition-colors duration-300
              hover:border-brand-200 hover:text-clinic-500
              lg:flex
            "
          >
            <ChevronLeft className="h-5 w-5" />
          </button>

          <button
            type="button"
            onClick={next}
            aria-label="Next slide"
            className="
              absolute right-6 top-1/2 z-30 hidden h-11 w-11 -translate-y-1/2
              items-center justify-center rounded-full border border-brand-100
              bg-white text-ink shadow-card transition-colors duration-300
              hover:border-brand-200 hover:text-clinic-500
              lg:flex
            "
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </>
      )}

      <div className="container relative z-10 hidden lg:block">
        <div className="grid min-h-[660px] grid-cols-[1fr_0.7fr_1fr] items-center gap-6 py-14">
          {/* left */}
          <div className="w-full">
            <HeroCopy hero={hero} />
            <TrustRow className="mt-8" />
          </div>

          {/* spacer — image sits behind */}
          <div />

          {/* right */}
          <div className="w-full">
            <HeroSearch
              specialities={specialities}
              clinics={clinics}
              doctors={doctors}
            />
          </div>
        </div>

        <Dots
          slides={slides}
          activeIndex={activeIndex}
          setActiveIndex={setActiveIndex}
          className="absolute bottom-5 left-1/2 -translate-x-1/2"
        />
      </div>
    </section>
  );
}

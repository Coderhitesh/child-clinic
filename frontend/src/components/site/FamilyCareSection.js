import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  MessageCircle,
  Brain,
  Accessibility,
  UsersRound,
} from "lucide-react";
import DecorativeText from "../ui/DecorativeText";


const familyServices = [
  {
    title: "Speech Delay",
    description: "Support for speech & language development",
    icon: MessageCircle,
    iconClass: "bg-blue-50 text-blue-600",
  },
  {
    title: "Autism & ADHD",
    description: "Specialized care & developmental support",
    icon: Brain,
    iconClass: "bg-pink-50 text-pink-500",
  },
  {
    title: "Cerebral Palsy",
    description: "Comprehensive care & rehabilitation support",
    icon: Accessibility,
    iconClass: "bg-emerald-50 text-emerald-600",
  },
  {
    title: "Epilepsy / Seizure",
    description: "Diagnosis, treatment & seizure management",
    icon: Accessibility,
    iconClass: "bg-violet-50 text-violet-600",
  },
];

export function FamilyCareSection() {
  return (
    <section className="container relative overflow-hidden xl:overflow-visible py-6 md:py-10">

      {/* =====================================================
          DECORATIVE HANDWRITTEN TEXTS
      ===================================================== */}

      {/* Left Top */}
      <DecorativeText
        text={"Healthy Families\nHappier Lives ♡"}
        top="35px"
        left="-125px"
        rotate={-9}
        color="#4F8DF7"
        size={23}
        className="hidden xl:block"
      />

    



      {/* Right Bottom */}
      <DecorativeText
        text={"Better Care\nBrighter Future ♡"}
        bottom="35px"
        right="-130px"
        rotate={9}
        color="#4285F4"
        size={23}
        className="hidden xl:block"
      />

      {/* =====================================================
          MAIN FAMILY CARE CARD
      ===================================================== */}

      <div className="relative overflow-hidden rounded-3xl border border-blue-100/50 bg-gradient-to-br from-[#eaf2ff] via-[#f4f8ff] to-[#edf5ff] px-5 py-6 shadow-sm sm:px-8 md:py-8 lg:px-10">

        {/* Ambient blobs */}
        <div className="pointer-events-none absolute -left-10 -top-10 h-32 w-32 rounded-full bg-blue-200/30 blur-2xl" />

        <div className="pointer-events-none absolute -bottom-10 -right-10 h-32 w-32 rounded-full bg-pink-200/30 blur-2xl" />

        {/* Small premium dotted decoration */}
        <div className="pointer-events-none absolute left-5 top-5 grid grid-cols-3 gap-1 opacity-30">
          {Array.from({ length: 9 }).map((_, i) => (
            <span
              key={i}
              className="h-1 w-1 rounded-full bg-blue-500"
            />
          ))}
        </div>

        <div className="relative z-10 grid items-center gap-6 lg:grid-cols-[1.1fr_0.75fr_1.15fr] lg:gap-6">

          {/* =================================================
              LEFT CONTENT
          ================================================= */}

          <div className="relative z-20 flex flex-col items-start">

            <span className="mb-2.5 inline-block rounded-full bg-blue-100/70 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-blue-700">
              Healthy families, brighter tomorrows
            </span>

            <h2 className="text-2xl font-bold leading-tight tracking-tight text-gray-900 sm:text-3xl lg:text-[32px]">
              Comprehensive treatment for every matter of your children
            </h2>

            {/* <p className="mt-2.5 max-w-md text-xs leading-relaxed text-gray-600 sm:text-sm">
              From routine checkups to specialized treatment, our
              clinics look after children, parents and grandparents
              under one roof.
            </p> */}

            <Link
              href="/specialities"
              className="mt-5 inline-flex h-10 items-center gap-2.5 rounded-xl bg-[#ff5574] px-5 text-xs font-semibold text-white shadow-[0_6px_20px_rgba(255,85,116,0.3)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#ef4164] active:translate-y-0 sm:text-sm"
            >
              See all services

              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {/* =================================================
              DOCTOR + CHILD
          ================================================= */}

          <div className="relative hidden h-full min-h-[240px] items-end justify-center lg:flex">

            <div className="absolute -bottom-8 h-[290px] w-[280px]">
              <Image
                src="/images/liittle-kid-with-orange-dress.png"
                alt="Doctor caring for a child"
                fill
                className="object-contain object-bottom drop-shadow-md"
                sizes="300px"
              />
            </div>

            {/* Heart */}
            <div className="absolute left-2 top-2 flex h-8 w-8 animate-pulse items-center justify-center rounded-full bg-pink-100 text-pink-500 shadow-sm">
              ♥
            </div>

            {/* Decorative block */}
            <div className="absolute bottom-6 right-2 h-12 w-8 rotate-12 rounded-lg bg-emerald-100/80 shadow-sm" />

          </div>

          {/* =================================================
              SERVICES
          ================================================= */}

          <div className="relative z-20 grid grid-cols-1 gap-2.5 sm:grid-cols-2">

            {familyServices.map(
              ({
                title,
                description,
                icon: Icon,
                iconClass,
              }) => (
                <Link
                  key={title}
                  href="/specialities"
                  className="group flex items-center gap-3 rounded-2xl border border-white/80 bg-white/90 p-3.5 shadow-[0_4px_20px_rgba(40,75,130,0.04)] backdrop-blur-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-blue-200 hover:bg-white hover:shadow-[0_8px_25px_rgba(40,75,130,0.08)]"
                >
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-transform duration-200 group-hover:scale-105 ${iconClass}`}
                  >
                    <Icon className="h-5 w-5" />
                  </div>

                  <div className="min-w-0 flex-1">

                    <p className="truncate text-xs font-bold text-gray-900 transition-colors group-hover:text-blue-600 sm:text-sm">
                      {title}
                    </p>

                    <p className="mt-0.5 truncate text-[11px] leading-snug text-gray-500">
                      {description}
                    </p>

                  </div>

                  <ArrowRight className="h-3.5 w-3.5 shrink-0 text-gray-300 transition-all group-hover:translate-x-0.5 group-hover:text-blue-500" />

                </Link>
              )
            )}

          </div>
        </div>
      </div>
    </section>
  );
}
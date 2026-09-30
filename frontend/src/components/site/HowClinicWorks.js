import Image from "next/image";
import {
  Stethoscope,
  Building2,
  CalendarDays,
  ClipboardCheck,
  ArrowRight,
} from "lucide-react";

const steps = [
  {
    number: "1",
    title: "Choose a speciality",
    description: "Select the care you need",
    extra: "Pediatrics • Vaccination • Development",
    icon: Stethoscope,
    accent: "#3973F6",
    circle: "bg-[#EAF2FF]",
    tag: "bg-[#E9F1FF] text-[#3973F6]",
    border: "border-[#CBDCFF]",
  },
  {
    number: "2",
    title: "Pick a clinic",
    description: "Find a nearby location",
    extra: "Multiple locations • Easy access",
    icon: Building2,
    accent: "#FF3D91",
    circle: "bg-[#FFF0F7]",
    tag: "bg-[#FFF0F7] text-[#E93D8F]",
    border: "border-[#FFD7E8]",
  },
  {
    number: "3",
    title: "Pick a Date & Time",
    description: "Select your suitable date and time",
    extra: "Flexible slots • Minimal wait time",
    icon: CalendarDays,
    accent: "#43AF8A",
    circle: "bg-[#EBFBF5]",
    tag: "bg-[#E9F9F4] text-[#329878]",
    border: "border-[#D1F1E6]",
  },
  {
    number: "4",
    title: "Confirm booking",
    description: "Pay at the clinic during your visit",
    extra: "Quick & secure • Instant confirmation",
    icon: ClipboardCheck,
    accent: "#7548EB",
    circle: "bg-[#F2EDFF]",
    tag: "bg-[#F0EBFF] text-[#6E46DF]",
    border: "border-[#DDD0FF]",
  },
];

function CurvedArrow({ className = "" }) {
  return (
    <svg viewBox="0 0 100 44" fill="none" className={`pointer-events-none ${className}`}>
      <path
        d="M5 30C30 5 67 5 88 25"
        stroke="#6B92FF"
        strokeWidth="2"
        strokeLinecap="round"
        strokeDasharray="5 6"
      />
      <path
        d="M81 20L90 26L84 34"
        stroke="#6B92FF"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function HowClinicWorks() {
  return (
    <section className="bg-white py-6 sm:py-8 lg:py-10">
      <div className="mx-auto w-full container px-4 sm:px-6 lg:px-8">
        <div
          className="
            relative overflow-hidden rounded-2xl border border-blue-100/70
            bg-gradient-to-br from-[#F8FBFF] via-white to-[#EFF6FF]
            px-4 py-5 shadow-[0_12px_40px_rgba(58,99,165,0.08)]
            sm:px-6 sm:py-6
            lg:px-8 lg:py-8
            2xl:pr-[220px]
          "
        >
          {/* BACKGROUND */}
          <div className="pointer-events-none absolute -left-16 -top-16 h-52 w-52 rounded-full bg-cyan-100/40 blur-3xl" />
          <div className="pointer-events-none absolute -right-20 -top-16 h-64 w-64 rounded-full bg-blue-100/50 blur-3xl" />
          <div className="pointer-events-none absolute bottom-0 left-0 h-[100px] w-full sm:h-[130px]">
            <svg viewBox="0 0 1600 220" preserveAspectRatio="none" className="h-full w-full">
              <path
                d="M0 100C220 150 310 210 520 170C760 125 870 225 1100 180C1310 138 1420 78 1600 105V220H0Z"
                fill="#EDF6FF"
                fillOpacity="0.9"
              />
              <path
                d="M0 145C180 180 340 130 530 175C730 220 890 150 1090 185C1300 220 1450 145 1600 160V220H0Z"
                fill="#E4F0FF"
                fillOpacity="0.7"
              />
            </svg>
          </div>

          {/* HEADER */}
          <div className="relative z-20">
            <span className="inline-flex items-center rounded-full bg-[#E7F0FF] px-3 py-1 text-[9px] font-bold uppercase tracking-[0.12em] text-[#2870EE] sm:px-3.5 sm:py-1.5 sm:text-[10px]">
              Simple steps, better care
            </span>

            <h2 className="mt-2 max-w-[700px] text-[22px] font-bold leading-[1.15] tracking-[-0.03em] text-[#0C3177] sm:text-[28px] md:text-[32px] lg:text-[36px]">
              How <span className="text-[#286BE9]">Normal Child Clinic</span> works
            </h2>

            <p className="mt-1.5 text-[13px] leading-relaxed text-slate-500 sm:text-[14px] lg:text-[15px]">
              Get the best care in a few simple steps
            </p>
          </div>

          {/* DESKTOP HANDWRITTEN TEXT */}
          <div
            className="
              pointer-events-none absolute right-[10%] top-6 z-10 hidden
              -rotate-6 whitespace-pre-line text-center font-[cursive]
              text-[18px] leading-[1.1] text-[#3973F6]
              xl:block
              2xl:right-[16%]
            "
          >
            {"Healthy Children\nHappier Tomorrows ♡"}
          </div>

          {/* MOBILE DECORATIVE TEXT */}
          <div className="relative z-20 mt-3 -rotate-2 text-right font-[cursive] text-[13px] leading-tight text-[#3973F6] sm:hidden">
            Healthy Children, Happier Tomorrows ♡
          </div>

          {/* STEPS */}
          <div className="relative z-20 mt-5 grid grid-cols-1 gap-4 sm:mt-6 sm:grid-cols-2 sm:gap-4 xl:grid-cols-4">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <div
                  key={step.number}
                  className={`
                    group relative flex min-h-[190px] flex-col rounded-2xl
                    border bg-white/90 p-4 backdrop-blur-sm
                    transition-all duration-300
                    hover:-translate-y-1 hover:bg-white hover:shadow-[0_12px_28px_rgba(31,73,136,0.10)]
                    sm:min-h-[200px] sm:p-4
                    lg:p-5
                    ${step.border}
                  `}
                >
                  {/* Top */}
                  <div className="flex items-start justify-between gap-3">
                    <div
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white shadow-[0_4px_10px_rgba(0,0,0,0.08)] sm:h-10 sm:w-10"
                      style={{ background: `linear-gradient(135deg, ${step.accent}, ${step.accent}cc)` }}
                    >
                      {step.number}
                    </div>

                    <div
                      className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl transition-transform duration-300 group-hover:scale-105 sm:h-16 sm:w-16 ${step.circle}`}
                    >
                      <Icon className="h-6 w-6 sm:h-7 sm:w-7" strokeWidth={1.8} style={{ color: step.accent }} />
                    </div>
                  </div>

                  {/* Text */}
                  <div className="mt-3">
                    <h3 className="text-[14px] font-bold tracking-[-0.02em] text-[#082D70] sm:text-[15px]">
                      {step.title}
                    </h3>
                    <p className="mt-1 text-[12px] leading-[1.5] text-slate-500 sm:text-[13px]">
                      {step.description}
                    </p>
                  </div>

                  <div className="flex-1" />

                  {/* Bottom tag */}
                  <div className="mt-3">
                    <span className={`inline-flex max-w-full rounded-full px-2.5 py-1 text-[10px] font-medium leading-tight sm:text-[11px] ${step.tag}`}>
                      {step.extra}
                    </span>
                  </div>

                  {/* Desktop arrows */}
                  {index < steps.length - 1 && (
                    <CurvedArrow className="absolute -right-[44px] -top-[20px] z-30 hidden h-[36px] w-[78px] xl:block" />
                  )}

                  {/* Mobile next indicator */}
                  {index < steps.length - 1 && (
                    <div className="absolute -bottom-[23px] left-1/2 z-30 flex h-7 w-7 -translate-x-1/2 items-center justify-center rounded-full border border-blue-100 bg-white text-blue-500 shadow-sm sm:hidden">
                      <ArrowRight className="h-3.5 w-3.5 rotate-90" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* BOTTOM DECORATION */}
          <div className="relative z-20 mt-5 flex items-end gap-3 sm:mt-6">
            <div className="relative h-[52px] w-[52px] shrink-0 sm:h-[70px] sm:w-[70px] lg:h-[84px] lg:w-[84px]">
              <Image
                src="/images/teddy-bear.png"
                alt="Teddy bear"
                fill
                className="object-contain object-bottom"
                sizes="(max-width: 640px) 52px, (max-width: 1024px) 70px, 84px"
              />
            </div>

            <div className="pb-1.5 -rotate-3 whitespace-pre-line font-[cursive] text-[14px] leading-[1.1] text-[#3973F6] sm:text-[17px] lg:text-[19px]">
              {"Small Steps\nBrighter Futures ♡"}
            </div>
          </div>

          {/* CHILD IMAGE — only on very large screens, scales with viewport instead of a fixed box */}
          <div className="pointer-events-none absolute bottom-0 right-0 z-10 hidden h-[85%] w-[35%] max-w-[460px] 2xl:block">
            <div className="absolute -bottom-16 -right-16 h-[380px] w-[380px] rounded-full bg-[#D8E9FF]/70" />
            <Image
              src="/images/how-clinic-works-child.png"
              alt="Happy child holding teddy bear"
              fill
              className="object-contain object-bottom drop-shadow-[0_10px_12px_rgba(25,67,120,0.10)]"
              sizes="260px"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
import Image from "next/image";
import {
  Building2,
  ShieldCheck,
  Clock3,
  FileText,
  ArrowRight,
  UsersRound,
  Star,
  Heart,
} from "lucide-react";

const features = [
  {
    title: "Multi-clinic network",
    description: "Access trusted clinics across the city",
    icon: Building2,
    accent: "#3973F6",
    iconBg: "bg-[#E9F2FF]",
    border: "border-[#CFE0FF]",
    arrowBg: "bg-[#E5EFFF]",
  },
  {
    title: "Verified doctors",
    description: "Qualified specialists you can trust",
    icon: ShieldCheck,
    accent: "#FF4389",
    iconBg: "bg-[#FFEAF2]",
    border: "border-[#FFD7E6]",
    arrowBg: "bg-[#FFE5EF]",
  },
  {
    title: "Quick booking",
    description: "Book in minutes, anytime",
    icon: Clock3,
    accent: "#18A981",
    iconBg: "bg-[#E7FAF4]",
    border: "border-[#D0F0E7]",
    arrowBg: "bg-[#DDF8F0]",
  },
  // {
  //   title: "Digital prescriptions",
  //   description: "Records available in your account",
  //   icon: FileText,
  //   accent: "#7548EB",
  //   iconBg: "bg-[#F1EBFF]",
  //   border: "border-[#DED3FF]",
  //   arrowBg: "bg-[#EBE4FF]",
  // },
];

const stats = [
  {
    value: "15,000+",
    label: "Happy Families",
    icon: UsersRound,
    bg: "bg-pink-100",
    color: "text-pink-500",
  },
  {
    value: "4.8/5",
    label: "Patient Satisfaction",
    icon: Star,
    bg: "bg-cyan-100",
    color: "text-cyan-500",
  },
  {
    value: "10+",
    label: "Years of Trusted Care",
    icon: Heart,
    bg: "bg-violet-100",
    color: "text-violet-500",
  },
];

function DecorativeText({ children, className = "", color = "#3973F6" }) {
  return (
    <div
      className={`pointer-events-none absolute whitespace-pre-line font-[cursive] leading-[0.95] ${className}`}
      style={{ color }}
    >
      {children}
    </div>
  );
}

export default function WhyFamiliesChooseUs() {
  return (
    <section className="bg-white py-6 sm:py-8 lg:py-10">
      <div className="mx-auto w-full container px-4 sm:px-6 lg:px-8">
        <div
          className="
            relative overflow-hidden rounded-2xl border border-blue-100/60
            bg-gradient-to-br from-[#F8FBFF] via-[#FFFDFC] to-[#EFF7FF]
            shadow-[0_14px_45px_rgba(48,86,145,0.08)]
            sm:rounded-[26px]
          "
        >
          {/* AMBIENT BACKGROUND */}
          <div className="pointer-events-none absolute -left-20 -top-16 h-56 w-56 rounded-full bg-blue-100/40 blur-3xl" />
          <div className="pointer-events-none absolute right-[2%] top-[5%] h-[320px] w-[320px] rounded-full bg-blue-100/40 blur-3xl" />
          <div className="pointer-events-none absolute right-[4%] top-[28%] h-[210px] w-[210px] rounded-full bg-pink-100/50 blur-3xl" />

          {/* Cloud */}
          <div className="pointer-events-none absolute left-[42%] top-6 hidden opacity-60 xl:block">
            <div className="relative h-12 w-28">
              <div className="absolute bottom-0 left-0 h-6 w-28 rounded-full bg-blue-50" />
              <div className="absolute bottom-2 left-4 h-9 w-10 rounded-full bg-blue-50" />
              <div className="absolute bottom-2 left-12 h-12 w-12 rounded-full bg-blue-50" />
            </div>
          </div>

          {/* MAIN CONTENT */}
          <div className="relative z-20 px-4 pb-5 pt-6 sm:px-6 sm:pb-6 sm:pt-7 md:px-8 lg:px-9 xl:px-10 xl:pb-5">
            {/* TOP AREA */}
            <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_360px] 2xl:grid-cols-[minmax(0,1fr)_420px]">
              {/* LEFT */}
              <div className="relative">
                <div className="inline-flex items-center gap-1.5 rounded-full bg-[#E8F0FF] px-3 py-1.5 text-[9px] font-bold uppercase tracking-[0.08em] text-[#286BE9] sm:text-[11px]">
                  <Heart className="h-3 w-3 fill-pink-400 text-pink-400" />
                  Trusted by families
                </div>

                <h2 className="mt-3 max-w-[600px] text-[26px] font-bold leading-[1.05] tracking-[-0.04em] text-[#0C3478] sm:text-[33px] md:text-[40px] lg:text-[46px]">
                  Why families
                  <br className="hidden sm:block" />{" "}
                  <span className="text-[#2870EE]">choose us</span>
                </h2>

                <p className="mt-2.5 max-w-[600px] text-[13px] leading-relaxed text-slate-500 sm:text-[14px] lg:text-[16px]">
                  Compassionate care. Modern facilities. Healthier tomorrows.
                </p>

                {/* Mobile visual */}
                <div className="relative mx-auto mt-5 h-[210px] max-w-[320px] xl:hidden">
                  <div className="absolute bottom-4 left-1/2 h-[175px] w-[260px] -translate-x-1/2 rounded-[45%_55%_50%_50%] bg-gradient-to-br from-[#CDE5FF] to-[#EAF4FF]" />
                  <Image
                    src="/images/why-families-doctor-child.png"
                    alt="Doctor caring for a happy child"
                    fill
                    className="relative z-10 object-contain object-bottom"
                    sizes="320px"
                  />
                </div>

                {/* FEATURE CARDS */}
                <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-3.5 lg:grid-cols-3 xl:mt-6">
                  {features.map(({ title, description, icon: Icon, accent, iconBg, border, arrowBg }) => (
                    <div
                      key={title}
                      className={`
                        group relative flex min-h-[165px] flex-col rounded-2xl
                        border bg-white/90 p-4 backdrop-blur-md
                        transition-all duration-300
                        hover:-translate-y-1 hover:bg-white hover:shadow-[0_12px_28px_rgba(20,58,115,0.10)]
                        sm:min-h-[180px]
                        ${border}
                      `}
                    >
                      <div className={`flex h-12 w-12 items-center justify-center rounded-2xl transition-transform duration-300 group-hover:scale-105 ${iconBg}`}>
                        <Icon className="h-6 w-6" strokeWidth={2} style={{ color: accent }} />
                      </div>

                      <h3 className="mt-3 text-[15px] font-bold leading-tight tracking-[-0.02em] text-[#082E70] sm:text-[16px]">
                        {title}
                      </h3>

                      <p className="mt-1 max-w-[200px] text-[12px] leading-[1.5] text-slate-500 sm:text-[13px]">
                        {description}
                      </p>

                      <div className="flex-1" />

                      <div className="mt-3 flex justify-end">
                        <div className={`flex h-7 w-7 items-center justify-center rounded-full transition-all duration-300 group-hover:translate-x-1 ${arrowBg}`}>
                          <ArrowRight className="h-3.5 w-3.5" style={{ color: accent }} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* DESKTOP DOCTOR / CHILD */}
              <div className="relative hidden min-h-[440px] items-end justify-center xl:flex">
                <div className="absolute right-[-30px] top-[10px] h-[400px] w-[380px] rounded-[47%_53%_45%_55%] bg-gradient-to-br from-[#CBE5FF] via-[#B8DCFF] to-[#DCEEFF]" />
                <div className="absolute right-[-80px] top-[125px] h-[200px] w-[200px] rounded-full bg-pink-100/70" />

                <Image
                  src="/images/why-families-doctor-child.png"
                  alt="Doctor with a happy child"
                  fill
                  priority={false}
                  className="relative z-10 object-contain object-bottom drop-shadow-[0_14px_16px_rgba(20,60,110,0.10)]"
                  sizes="400px"
                />

                <DecorativeText className="left-[-65px] top-[8px] z-20 -rotate-6 text-[20px] text-center">
                  {"Growing\nBrighter\nTogether ♡"}
                </DecorativeText>

                <div className="pointer-events-none absolute right-[75px] top-[90px] z-20 rotate-12 font-[cursive] text-4xl text-pink-400">
                  ♡
                </div>

                {/* Speech bubble */}
                <div className="absolute right-[-5px] top-[-8px] z-20 hidden h-[130px] w-[145px] rounded-[50%] bg-pink-100/80 2xl:flex items-center justify-center text-center">
                  <div className="-rotate-3 font-[cursive] text-[16px] leading-[1] text-pink-500">
                    Care Today
                    <br />
                    Brighter
                    <br />
                    Tomorrows ♡
                  </div>
                </div>
              </div>
            </div>

            {/* STATS */}
            <div className="relative z-30 mt-5 grid grid-cols-1 gap-3 border-t border-blue-100 pt-4 sm:grid-cols-3 sm:gap-0 lg:max-w-[780px] xl:mt-5">
              {stats.map(({ value, label, icon: Icon, bg, color }, index) => (
                <div
                  key={label}
                  className={`
                    flex items-center gap-3 rounded-2xl bg-white/60 px-3 py-2.5
                    sm:rounded-none sm:bg-transparent sm:px-4
                    ${index !== 0 ? "sm:border-l sm:border-blue-100" : ""}
                  `}
                >
                  <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${bg} ${color}`}>
                    <Icon className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <p className="text-[16px] font-bold leading-none text-[#0C3478] sm:text-[19px]">
                      {value}
                    </p>
                    <p className="mt-1 text-[11px] text-slate-500 sm:text-xs">{label}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* LEFT HANDWRITING */}
          <DecorativeText className="bottom-[200px] left-5 z-10 hidden -rotate-6 text-[18px] xl:block">
            {"Healthy\nFamilies\nHappier Lives ♡"}
          </DecorativeText>

          {/* TEDDY */}
          <div className="pointer-events-none absolute bottom-[36px] left-4 z-10 hidden h-[120px] w-[120px] xl:block 2xl:h-[135px] 2xl:w-[135px]">
            <Image
              src="/images/teddy-bear.png"
              alt="Teddy bear"
              fill
              className="object-contain object-bottom"
              sizes="135px"
            />
          </div>

          {/* BOTTOM WAVES */}
          <div className="pointer-events-none absolute bottom-0 left-0 z-0 h-[110px] w-full">
            <svg viewBox="0 0 1600 220" preserveAspectRatio="none" className="h-full w-full">
              <path
                d="M0 90C170 125 270 185 440 165C630 140 720 205 900 170C1070 135 1180 190 1320 170C1450 150 1520 125 1600 135V220H0Z"
                fill="#EAF4FF"
              />
              <path
                d="M0 155C190 175 340 145 520 175C710 208 820 155 1010 185C1210 215 1400 160 1600 175V220H0Z"
                fill="#F4F9FF"
              />
            </svg>
          </div>

          {/* DESKTOP YELLOW NOTE */}
          <div className="pointer-events-none absolute bottom-[28px] right-[13%] z-30 hidden -rotate-3 rounded-[45%_55%_48%_52%] bg-[#FFE59D] px-6 py-3 font-[cursive] text-[16px] leading-[0.95] text-[#3973F6] 2xl:block">
            Because
            <br />
            they deserve the best ♡
          </div>
        </div>
      </div>
    </section>
  );
}
import Link from "next/link";
import Image from "next/image";
import {
  Home,
  UserCheck,
  Calendar,
  CalendarDays,
  ShieldCheck,
  Play,
  ArrowRight,
  Clock,
  Users,
  Wallet,
  Video,
  MessageSquare,
  FileText,
} from "lucide-react";

export const metadata = {
  title: "Online Treatment — Expert Child Care From Anywhere",
  description:
    "Consult with our pediatric specialists online and get the right advice for your child from the comfort of your home. Safe, convenient and child-friendly treatment, wherever you are.",
};

export const revalidate = 600;

export default function OnlineTreatmentPage() {
  return (
    <>
      <section className="hero-wash border-b border-border">
        <div className="container py-10">
          <h1 className="text-3xl font-extrabold md:text-4xl">
            Online Treatment
          </h1>
          <p className="mt-2 max-w-[60ch] text-sm text-ink-soft">
            Get expert pediatric treatment from the comfort of your home with secure
            online consultations, expert guidance and follow-up support.
          </p>
        </div>
      </section>

      <div className="min-h-screen bg-[#FDFEFE] text-slate-800 overflow-x-hidden">
        {/* ========================================================
          1. HERO SECTION
      ======================================================== */}
        <section className="relative pt-8 pb-12 sm:pt-12 sm:pb-16 lg:pt-14 lg:pb-20 overflow-hidden bg-gradient-to-b from-[#F6F9FF] via-white to-white">
          {/* Soft background ambient blurs */}
          <div className="pointer-events-none absolute -left-20 top-10 h-72 w-72 rounded-full bg-pink-100/40 blur-3xl" />
          <div className="pointer-events-none absolute right-0 top-0 h-96 w-96 rounded-full bg-blue-100/35 blur-3xl" />
          <div className="pointer-events-none absolute left-1/2 top-40 h-80 w-80 -translate-x-1/2 rounded-full bg-emerald-50/40 blur-3xl" />

          <div className="container relative z-10 px-4 sm:px-6 lg:px-8">
            <div className="grid items-center gap-10 lg:grid-cols-12 lg:gap-8">
              {/* ----------------- LEFT COLUMN: TEXT & ACTIONS ----------------- */}
              <div className="lg:col-span-6 xl:col-span-6">
                {/* Eyebrow badge */}
                <div className="inline-flex items-center gap-2">
                  <span className="text-[11px] sm:text-xs font-bold uppercase tracking-[0.16em] text-[#ff5d80]">
                    Online Treatment
                  </span>
                  <span className="h-[2px] w-12 rounded-full bg-[#ff5d80]" />
                </div>

                {/* Main Heading */}
                <div className="relative mt-3 sm:mt-4">
                  {/* Hand-drawn heart doodle */}
                  <svg
                    className="pointer-events-none absolute -top-8 right-6 sm:right-16 h-8 w-8 text-pink-400 opacity-80"
                    viewBox="0 0 40 40"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M20 32C12 24 5 18 5 12a7 7 0 0 1 12-4.5L20 10l3-2.5A7 7 0 0 1 35 12c0 6-7 12-15 20z" />
                  </svg>

                  <h1 className="text-2xl sm:text-3xl lg:text-[34px] font-extrabold tracking-[-0.03em] text-[#0C3177] leading-[1.12]">
                    Expert Child Treatment <br />
                    From <span className="text-[#ff5d80]">Anywhere</span>
                  </h1>
                </div>

                {/* Subtitle */}
                <p className="mt-4 max-w-[500px] text-sm sm:text-base leading-relaxed text-slate-500 font-normal">
                  Consult with our pediatric specialists online and get the
                  right advice for your child from the comfort of your home.
                  Safe, convenient and child-friendly treatment, wherever you are.
                </p>

                {/* CTA Buttons */}
                <div className="mt-6 sm:mt-8 flex flex-wrap items-center gap-3 sm:gap-4">
                  <Link
                    href="/book"
                    className="group inline-flex items-center justify-center gap-2 rounded-full bg-[#ff5d80] px-6 py-3 sm:px-7 sm:py-3.5 text-xs sm:text-sm font-semibold text-white shadow-[0_8px_22px_rgba(255,45,85,0.28)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#EA1942] hover:shadow-[0_12px_26px_rgba(255,45,85,0.36)]"
                  >
                    <span>Book Online Consultation</span>
                    <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                  </Link>

                  <a
                    href="#how-it-works"
                    className="group inline-flex items-center justify-center gap-2.5 rounded-full border border-blue-200/90 bg-white px-5 py-3 sm:px-6 sm:py-3.5 text-xs sm:text-sm font-semibold text-[#0C3177] shadow-[0_4px_14px_rgba(12,49,119,0.05)] transition-all duration-300 hover:border-blue-300 hover:bg-blue-50/60"
                  >
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#2F4CC8] text-white">
                      <Play className="h-2.5 w-2.5 fill-current ml-0.5" />
                    </span>
                    <span>How It Works</span>
                  </a>
                </div>

                {/* 4 Feature Badges Under CTA */}
                <div className="mt-8 sm:mt-10 pt-6 border-t border-slate-100/90 grid grid-cols-2 gap-4 sm:grid-cols-4 sm:gap-3">
                  <div className="flex flex-col items-center text-center">
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#FFF0F4] text-[#ff5d80] shadow-sm">
                      <Home className="h-5 w-5" strokeWidth={2.2} />
                    </div>
                    <span className="mt-2 text-xs font-bold text-[#0C3177] leading-tight">
                      Consult <br className="hidden sm:inline" />
                      from Home
                    </span>
                  </div>

                  <div className="flex flex-col items-center text-center">
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#EEF2FF] text-[#2F4CC8] shadow-sm">
                      <UserCheck className="h-5 w-5" strokeWidth={2.2} />
                    </div>
                    <span className="mt-2 text-xs font-bold text-[#0C3177] leading-tight">
                      Expert <br className="hidden sm:inline" />
                      Guidance
                    </span>
                  </div>

                  <div className="flex flex-col items-center text-center">
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#EBFBF5] text-[#10B981] shadow-sm">
                      <CalendarDays className="h-5 w-5" strokeWidth={2.2} />
                    </div>
                    <span className="mt-2 text-xs font-bold text-[#0C3177] leading-tight">
                      Flexible <br className="hidden sm:inline" />
                      Timings
                    </span>
                  </div>

                  <div className="flex flex-col items-center text-center">
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#FFF8E7] text-[#F59E0B] shadow-sm">
                      <ShieldCheck className="h-5 w-5" strokeWidth={2.2} />
                    </div>
                    <span className="mt-2 text-xs font-bold text-[#0C3177] leading-tight">
                      Safe &amp; <br className="hidden sm:inline" />
                      Secure
                    </span>
                  </div>
                </div>
              </div>

              {/* ----------------- RIGHT COLUMN: IMAGE & FLOATING TAGS ----------------- */}
              <div className="lg:col-span-6 xl:col-span-6 relative mt-4 lg:mt-0 flex items-center justify-center">
                {/* Background circular glow */}
                <div className="pointer-events-none absolute h-[320px] w-[320px] sm:h-[420px] sm:w-[420px] rounded-full bg-gradient-to-tr from-blue-100/60 via-pink-100/40 to-transparent blur-2xl" />

                {/* Doodles: Paper Airplane (top right) */}
                <div className="pointer-events-none absolute -top-4 right-4 sm:right-10 z-20">
                  <svg
                    className="h-12 w-12 text-[#2F4CC8] opacity-80"
                    viewBox="0 0 60 60"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path
                      d="M50 10L10 28l16 6 6 16 18-40z"
                      fill="#EEF2FF"
                      fillOpacity="0.5"
                    />
                    <path d="M26 34l24-24" />
                    <path
                      d="M12 44c4 2 10 1 12-3"
                      strokeDasharray="3 3"
                      opacity="0.6"
                    />
                  </svg>
                </div>

                {/* Doodles: Decorative Burst Marks */}
                <div className="pointer-events-none absolute -right-2 top-24 z-20 hidden sm:block">
                  <svg
                    className="h-6 w-6 text-pink-400 opacity-70"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M12 2L13 8L19 9L13 10L12 16L11 10L5 9L11 8L12 2Z" />
                  </svg>
                </div>

                {/* The main cutout image */}
                <div className="relative z-10 w-full max-w-[500px] lg:max-w-none">
                  <Image
                    src="/images/online-treatment.png"
                    alt="Mother and son having online doctor consultation"
                    width={680}
                    height={480}
                    priority
                    className="w-full h-auto object-contain drop-shadow-[0_16px_28px_rgba(12,49,119,0.10)]"
                  />

                  {/* --- Floating Badge 1: Choose Date & Time (Top Left) --- */}
                  <div className="absolute -top-3 left-2 sm:left-4 z-20 flex items-center gap-2 sm:gap-2.5 rounded-2xl border border-white/90 bg-white/95 px-3 py-2 sm:px-3.5 sm:py-2.5 shadow-[0_8px_24px_rgba(23,58,120,0.12)] backdrop-blur-md transition-transform duration-300 hover:scale-105">
                    <div className="flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-xl bg-[#FFF0F4] text-[#ff5d80]">
                      <Calendar
                        className="h-4 w-4 sm:h-4.5 sm:w-4.5"
                        strokeWidth={2.2}
                      />
                    </div>
                    <div className="leading-tight text-left">
                      <p className="text-[10px] sm:text-[11px] font-semibold text-slate-500">
                        Choose
                      </p>
                      <p className="text-[11px] sm:text-xs font-extrabold text-[#0C3177]">
                        Date &amp; Time
                      </p>
                    </div>
                  </div>

                  {/* --- Floating Badge 2: Video Consultation (Middle Left near tablet) --- */}
                  <div className="absolute top-[42%] -left-3 sm:-left-6 z-20 flex items-center gap-2 sm:gap-2.5 rounded-2xl border border-white/90 bg-white/95 px-3 py-2 sm:px-3.5 sm:py-2.5 shadow-[0_8px_24px_rgba(23,58,120,0.12)] backdrop-blur-md transition-transform duration-300 hover:scale-105">
                    <div className="flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-xl bg-[#EEF2FF] text-[#2F4CC8]">
                      <Video
                        className="h-4 w-4 sm:h-4.5 sm:w-4.5"
                        strokeWidth={2.2}
                      />
                    </div>
                    <div className="leading-tight text-left">
                      <p className="text-[10px] sm:text-[11px] font-semibold text-slate-500">
                        Video
                      </p>
                      <p className="text-[11px] sm:text-xs font-extrabold text-[#0C3177]">
                        Consultation
                      </p>
                    </div>
                  </div>

                  {/* --- Floating Badge 3: Get Prescription (Top Right) --- */}
                  <div className="absolute top-4 right-0 sm:right-4 z-20 flex items-center gap-2 sm:gap-2.5 rounded-2xl border border-white/90 bg-white/95 px-3 py-2 sm:px-3.5 sm:py-2.5 shadow-[0_8px_24px_rgba(23,58,120,0.12)] backdrop-blur-md transition-transform duration-300 hover:scale-105">
                    <div className="flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-xl bg-[#EBFBF5] text-[#10B981]">
                      <FileText
                        className="h-4 w-4 sm:h-4.5 sm:w-4.5"
                        strokeWidth={2.2}
                      />
                    </div>
                    <div className="leading-tight text-left">
                      <p className="text-[10px] sm:text-[11px] font-semibold text-slate-500">
                        Get
                      </p>
                      <p className="text-[11px] sm:text-xs font-extrabold text-[#0C3177]">
                        Prescription
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================
          2. WHY CHOOSE ONLINE TREATMENT? (FLOATING CARD BAR)
      ======================================================== */}
        <section className="relative z-20 -mt-6 sm:-mt-8 lg:-mt-10 px-4 sm:px-6 lg:px-8">
          <div className="container mx-auto">
            <div className="relative overflow-hidden rounded-[24px] sm:rounded-[28px] border border-blue-100/70 bg-white/95 p-5 sm:p-6 lg:p-7 shadow-[0_12px_40px_rgba(31,73,136,0.08)] backdrop-blur-md">
              <div className="grid items-center gap-6 lg:grid-cols-12">
                {/* Title Block */}
                <div className="lg:col-span-3 lg:border-r lg:border-slate-100 lg:pr-6">
                  <div className="relative inline-block">
                    {/* Pink Sparkle Accent */}
                    <svg
                      className="pointer-events-none absolute -right-6 -top-2 h-5 w-5 text-pink-400"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                    >
                      <path d="M12 3v4M12 17v4M3 12h4M17 12h4" />
                    </svg>

                    <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-[#0C3177] leading-tight">
                      Why Choose <br />
                      Online <span className="text-[#ff5d80]">Treatment?</span>
                    </h2>
                  </div>
                </div>

                {/* 4 Feature Items */}
                <div className="lg:col-span-9 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
                  {/* 1. Save Time */}
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#FFF0F4] text-[#ff5d80]">
                      <Clock className="h-5 w-5" strokeWidth={2.2} />
                    </div>
                    <div>
                      <h3 className="text-sm sm:text-[15px] font-bold text-[#0C3177]">
                        Save Time
                      </h3>
                      <p className="mt-0.5 text-xs text-slate-500 leading-snug">
                        No travel, no waiting at clinic
                      </p>
                    </div>
                  </div>

                  {/* 2. Child-Friendly Care */}
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#EEF2FF] text-[#2F4CC8]">
                      <Users className="h-5 w-5" strokeWidth={2.2} />
                    </div>
                    <div>
                      <h3 className="text-sm sm:text-[15px] font-bold text-[#0C3177]">
                        Child-Friendly Care
                      </h3>
                      <p className="mt-0.5 text-xs text-slate-500 leading-snug">
                        Comfortable consultation from home
                      </p>
                    </div>
                  </div>

                  {/* 3. Affordable Care */}
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#EBFBF5] text-[#10B981]">
                      <Wallet className="h-5 w-5" strokeWidth={2.2} />
                    </div>
                    <div>
                      <h3 className="text-sm sm:text-[15px] font-bold text-[#0C3177]">
                        Affordable Care
                      </h3>
                      <p className="mt-0.5 text-xs text-slate-500 leading-snug">
                        Quality treatment at lower cost
                      </p>
                    </div>
                  </div>

                  {/* 4. Trusted Specialists */}
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#F3F0FF] text-[#7C6AD6]">
                      <ShieldCheck className="h-5 w-5" strokeWidth={2.2} />
                    </div>
                    <div>
                      <h3 className="text-sm sm:text-[15px] font-bold text-[#0C3177]">
                        Trusted Specialists
                      </h3>
                      <p className="mt-0.5 text-xs text-slate-500 leading-snug">
                        Experienced pediatric team
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================
          3. HOW ONLINE CONSULTATION WORKS?
      ======================================================== */}
        <section id="how-it-works" className="py-14 sm:py-16 lg:py-20">
          <div className="container px-4 sm:px-6 lg:px-8">
            {/* Section Header */}
            <div className="text-left">
              <h2 className="text-2xl sm:text-3xl lg:text-[34px] font-extrabold tracking-tight text-[#0C3177]">
                How Online Consultation{" "}
                <span className="text-[#ff5d80]">Works?</span>
              </h2>
              <p className="mt-1.5 text-sm sm:text-base text-slate-500">
                Simple steps to get expert treatment for your child
              </p>
            </div>

            {/* 4 Cards Row */}
            <div className="relative mt-8 sm:mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {/* Step 01 */}
              <div className="group relative flex flex-col rounded-2xl border border-pink-100/90 bg-gradient-to-b from-[#FFF7FA] to-white p-5 sm:p-6 shadow-[0_6px_24px_rgba(255,45,85,0.04)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_28px_rgba(255,45,85,0.10)]">
                {/* Header inside card: Big 01 + Icon */}
                <div className="flex items-center justify-between">
                  <span className="text-3xl sm:text-4xl font-extrabold text-[#FFA8BD]">
                    01
                  </span>
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#FFF0F4] text-[#ff5d80] shadow-sm">
                    <Calendar className="h-5 w-5" strokeWidth={2.2} />
                  </div>
                </div>

                <h3 className="mt-5 text-base sm:text-lg font-bold text-[#0C3177]">
                  Book Appointment
                </h3>
                <p className="mt-2 text-xs sm:text-[13px] leading-relaxed text-slate-500">
                  Choose a convenient date &amp; time for your online
                  consultation.
                </p>

                {/* Connecting dashed arrow (desktop only) */}
                <div className="pointer-events-none absolute -right-3 top-1/2 -translate-y-1/2 z-20 hidden lg:block text-slate-300">
                  <ArrowRight className="h-4 w-4" strokeWidth={2.5} />
                </div>
              </div>

              {/* Step 02 */}
              <div className="group relative flex flex-col rounded-2xl border border-blue-100/90 bg-gradient-to-b from-[#F6F9FF] to-white p-5 sm:p-6 shadow-[0_6px_24px_rgba(47,76,200,0.04)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_28px_rgba(47,76,200,0.10)]">
                <div className="flex items-center justify-between">
                  <span className="text-3xl sm:text-4xl font-extrabold text-[#9BB3F7]">
                    02
                  </span>
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#EEF2FF] text-[#2F4CC8] shadow-sm">
                    <Video className="h-5 w-5" strokeWidth={2.2} />
                  </div>
                </div>

                <h3 className="mt-5 text-base sm:text-lg font-bold text-[#0C3177]">
                  Join Consultation
                </h3>
                <p className="mt-2 text-xs sm:text-[13px] leading-relaxed text-slate-500">
                  Connect with our pediatric specialist via secure video call
                  from anywhere.
                </p>

                <div className="pointer-events-none absolute -right-3 top-1/2 -translate-y-1/2 z-20 hidden lg:block text-slate-300">
                  <ArrowRight className="h-4 w-4" strokeWidth={2.5} />
                </div>
              </div>

              {/* Step 03 */}
              <div className="group relative flex flex-col rounded-2xl border border-emerald-100/90 bg-gradient-to-b from-[#F2FBF7] to-white p-5 sm:p-6 shadow-[0_6px_24px_rgba(16,185,129,0.04)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_28px_rgba(16,185,129,0.10)]">
                <div className="flex items-center justify-between">
                  <span className="text-3xl sm:text-4xl font-extrabold text-[#7FE2C3]">
                    03
                  </span>
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#EBFBF5] text-[#10B981] shadow-sm">
                    <MessageSquare className="h-5 w-5" strokeWidth={2.2} />
                  </div>
                </div>

                <h3 className="mt-5 text-base sm:text-lg font-bold text-[#0C3177]">
                  Discuss Your Concern
                </h3>
                <p className="mt-2 text-xs sm:text-[13px] leading-relaxed text-slate-500">
                  Share your child&apos;s symptoms, medical history and get
                  expert advice.
                </p>

                <div className="pointer-events-none absolute -right-3 top-1/2 -translate-y-1/2 z-20 hidden lg:block text-slate-300">
                  <ArrowRight className="h-4 w-4" strokeWidth={2.5} />
                </div>
              </div>

              {/* Step 04 */}
              <div className="group relative flex flex-col rounded-2xl border border-purple-100/90 bg-gradient-to-b from-[#F9F7FF] to-white p-5 sm:p-6 shadow-[0_6px_24px_rgba(124,106,214,0.04)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_28px_rgba(124,106,214,0.10)]">
                <div className="flex items-center justify-between">
                  <span className="text-3xl sm:text-4xl font-extrabold text-[#CBB9FF]">
                    04
                  </span>
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#F3F0FF] text-[#7C6AD6] shadow-sm">
                    <FileText className="h-5 w-5" strokeWidth={2.2} />
                  </div>
                </div>

                <h3 className="mt-5 text-base sm:text-lg font-bold text-[#0C3177]">
                  Get Guidance &amp; Follow-Up
                </h3>
                <p className="mt-2 text-xs sm:text-[13px] leading-relaxed text-slate-500">
                  Receive prescription and personalized treatment plan with follow-up
                  support.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================
          4. BOTTOM CTA BANNER
      ======================================================== */}
        <section className="pb-0">
          <div className="container px-4 sm:px-6 lg:px-8">
            <div className="relative overflow-hidden rounded-[24px] sm:rounded-[28px] border border-pink-100/80 bg-gradient-to-r from-[#FFF5F8] via-white to-[#F2F6FF] px-6 py-6 sm:px-8 sm:py-8 shadow-[0_10px_35px_rgba(255,45,85,0.06)]">
              {/* Doodles: Cute small heart */}
              <div className="pointer-events-none absolute left-3 top-3 hidden sm:block">
                <svg
                  className="h-6 w-6 text-pink-400 opacity-60"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                </svg>
              </div>

              <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between relative z-10">
                {/* Text */}
                <div>
                  <h3 className="text-lg sm:text-xl md:text-2xl font-extrabold text-[#0C3177]">
                    Care for your child,{" "}
                    <span className="text-[#ff5d80]">wherever you are.</span>
                  </h3>
                  <p className="mt-1 text-xs sm:text-sm text-slate-500">
                    Expert pediatric consultation is just a click away.
                  </p>
                </div>

                {/* Action Button & Sun Doodle */}
                <div className="flex items-center gap-4 sm:gap-6 shrink-0">
                  <Link
                    href="/book"
                    className="group inline-flex items-center justify-center gap-2 rounded-full bg-[#ff5d80] px-6 py-3 text-xs sm:text-sm font-semibold text-white shadow-[0_6px_20px_rgba(255,45,85,0.25)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#EA1942] hover:shadow-[0_10px_24px_rgba(255,45,85,0.32)]"
                  >
                    <span>Book Online Consultation</span>
                    <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                  </Link>

                  {/* Sun Doodle on the right end */}
                  <div className="pointer-events-none hidden md:block text-[#F59E0B]">
                    <svg
                      className="h-10 w-10 animate-spin-slow opacity-85"
                      viewBox="0 0 60 60"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                    >
                      <circle cx="30" cy="30" r="12" fill="#FEF3C7" />
                      {/* Smiling face */}
                      <path
                        d="M26 28a1 1 0 1 0 0-2 1 1 0 0 0 0 2zM34 28a1 1 0 1 0 0-2 1 1 0 0 0 0 2z"
                        fill="#D97706"
                      />
                      <path d="M26 33c1.5 2 6.5 2 8 0" stroke="#D97706" />
                      {/* Sun rays */}
                      <path d="M30 6v6M30 48v6M6 30h6M48 30h6M13 13l4.5 4.5M42.5 42.5L47 47M13 47l4.5-4.5M42.5 17.5L47 13" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}

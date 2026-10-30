import Link from "next/link";
import {
  ArrowRight,
  Smartphone,
  Building2,
  ShieldCheck,
  Clock3,
  FileText,
  Heart,
  CalendarCheck,
  Video,
  HeartHandshake,
  HelpCircle,
  Headphones,
  Phone,
  Stethoscope,
  CheckCircle2,
} from "lucide-react";

import { sList, sOne } from "@/lib/server-api";
import Hero from "@/components/site/hero";
import TestimonialRail from "@/components/site/testimonial-rail";
import FaqList from "@/components/site/faq-list";
import {
  SectionHead,
  DoctorCard,
  ClinicCard,
  StatStrip,
} from "@/components/site/bits";
import { Button } from "@/components/ui/button";
import { prettyDate } from "@/lib/utils";
import SiteSpeciality from "@/components/site/site-speciality";
import NearbyClinics from "@/components/site/nearby-clinics";
import { FamilyCareSection } from "@/components/site/FamilyCareSection";
import DecorativeText from "@/components/ui/DecorativeText";
import HowClinicWorks from "@/components/site/HowClinicWorks";
import WhyFamiliesChooseUs from "@/components/site/WhyFamiliesChooseUs";

export const revalidate = 120;

const whyItems = [
  {
    title: "Multi-clinic network",
    description: "Access trusted clinics across the city",
    tag: "Multiple locations",
    icon: Building2,
    accent: "#3973F6",
    iconBg: "bg-[#E9F2FF]",
    border: "border-[#CFE0FF]",
    tagCls: "bg-[#E9F1FF] text-[#3973F6]",
  },
  {
    title: "Verified doctors",
    description: "Qualified specialists you can trust",
    tag: "100% certified",
    icon: ShieldCheck,
    accent: "#FF4389",
    iconBg: "bg-[#FFEAF2]",
    border: "border-[#FFD7E6]",
    tagCls: "bg-[#FFF0F7] text-[#E93D8F]",
  },
  {
    title: "Quick booking",
    description: "Book in minutes, anytime",
    tag: "Zero wait time",
    icon: Clock3,
    accent: "#18A981",
    iconBg: "bg-[#E7FAF4]",
    border: "border-[#D0F0E7]",
    tagCls: "bg-[#E9F9F4] text-[#329878]",
  },
];

export default async function HomePage() {
  const [
    specialities,
    clinics,
    doctors,
    testimonials,
    faqs,
    blogs,
    partners,
    banners,
    settings,
  ] = await Promise.all([
    sList("/specialities"),
    sList("/clinics"),
    sList("/doctors"),
    sList("/testimonials"),
    sList("/faqs"),
    sList("/blogs"),
    sList("/partners"),
    sList("/banners/active?placement=home_hero"),
    sOne("/website-settings"),
  ]);
  const heroes = banners
    .filter((p) => p.placement === "home_hero" && p.isActive === true)
    .sort((a, b) => (a.order || 0) - (b.order || 0));
  return (
    <>
      <Hero
        heroes={heroes}
        specialities={specialities}
        clinics={clinics}
        doctors={doctors}
      />

      {/* Specialities */}
      <SiteSpeciality specialities={specialities} />

      {/* Clinics */}
      <section className="section container relative overflow-hidden xl:overflow-visible">
        <SectionHead
          title="Our clinics near you"
          sub="Same great treatment at every location"
          href="/clinics"
        />

        {/* Left top */}
        <DecorativeText
          text={"Great Care\nBrighter Futures ♡"}
          top="120px"
          left="-130px"
          rotate={-10}
          color="#4F8DF7"
          size={23} className="hidden xl:block"
        />

        {/* Right top */}
        <DecorativeText
          text={"Healthy Children\nHappier Tomorrows ♡"}
          top="40px"
          right="-110px"
          rotate={8}
          color="#F06292" className="hidden xl:block"
          size={22}
        />

        {/* Right middle */}
        <DecorativeText
          text={"Same Care\nEverywhere ♡"}
          top="240px"
          right="-140px"
          rotate={10}
          color="#4F8DF7"
          size={24} className="hidden xl:block"
        />

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {/* nearest to the visitor first, then by distance */}
          <NearbyClinics clinics={clinics} limit={5} />

          {!clinics.length && <EmptyLine text="No clinics published yet." />}
        </div>
      </section>
      {/* Family care band */}

      <FamilyCareSection />

      {/* Doctors */}
      {/* <section className="section container">
        <SectionHead
          title="Meet our top doctors"
          sub="Experienced. Caring. Committed to your health."
          href="/doctors"
        />
        <div className="grid gap-4 md:grid-cols-2">
          {doctors.slice(0, 4).map((d) => (
            <DoctorCard key={d._id} doctor={d} />
          ))}
          {!doctors.length && (
            <EmptyLine text="Doctors will be listed here once added." />
          )}
        </div>
      </section> */}

      {/* How it works */}

      <HowClinicWorks />
      <WhyFamiliesChooseUs />

      {/* Why choose */}
      <section className="bg-white py-6 sm:py-8 lg:py-10">
        <div className="mx-auto w-full container px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-2xl border border-pink-100/70 bg-gradient-to-br from-[#FFF7FA] via-white to-[#F1F6FF] px-4 pb-14 pt-5 shadow-[0_12px_40px_rgba(58,99,165,0.08)] sm:px-6 sm:pt-6 lg:px-8 lg:pt-8">
            {/* bg */}
            <div className="pointer-events-none absolute -left-16 -top-16 h-52 w-52 rounded-full bg-pink-100/50 blur-3xl" />
            <div className="pointer-events-none absolute -right-20 -top-16 h-64 w-64 rounded-full bg-blue-100/50 blur-3xl" />
            <div className="pointer-events-none absolute bottom-0 left-0 h-[90px] w-full sm:h-[110px]">
              <svg
                viewBox="0 0 1600 220"
                preserveAspectRatio="none"
                className="h-full w-full"
              >
                <path
                  d="M0 100C220 150 310 210 520 170C760 125 870 225 1100 180C1310 138 1420 78 1600 105V220H0Z"
                  fill="#FFF0F5"
                  fillOpacity="0.8"
                />
                <path
                  d="M0 145C180 180 340 130 530 175C730 220 890 150 1090 185C1300 220 1450 145 1600 160V220H0Z"
                  fill="#EAF2FF"
                  fillOpacity="0.8"
                />
              </svg>
            </div>

            {/* header */}
            <div className="relative z-20 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#FFE9F1] px-3 py-1 text-[9px] font-bold uppercase tracking-[0.12em] text-[#E93D8F] sm:px-3.5 sm:py-1.5 sm:text-[10px]">
                  <Heart className="h-3 w-3 fill-pink-400 text-pink-400" />
                  Why choose us
                </span>
                <h2 className="mt-2 max-w-[700px] text-[22px] font-bold leading-[1.15] tracking-[-0.03em] text-[#0C3177] sm:text-[28px] md:text-[32px] lg:text-[36px]">
                  Why families <span className="text-[#FF4389]">choose us</span>
                </h2>
                <p className="mt-1.5 text-[13px] leading-relaxed text-slate-500 sm:text-[14px] lg:text-[15px]">
                  Everything your family needs, in one trusted place
                </p>
              </div>
              <Link
                href="/book"
                className="group inline-flex h-10 w-fit items-center gap-2.5 rounded-xl bg-[#ff5574] px-5 text-xs font-semibold text-white shadow-[0_6px_20px_rgba(255,85,116,0.3)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#ef4164] sm:text-sm"
              >
                Book an appointment
                <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
              </Link>
            </div>

            {/* cards */}
            <div className="relative z-20 mt-5 grid grid-cols-1 gap-3 sm:mt-6 sm:grid-cols-3 sm:gap-4 lg:grid-cols-3">
              {whyItems.map(
                (
                  {
                    title,
                    description,
                    tag,
                    icon: Icon,
                    accent,
                    iconBg,
                    border,
                    tagCls,
                  },
                  i,
                ) => (
                  <div
                    key={title}
                    className={`group relative flex min-h-[190px] flex-col overflow-hidden rounded-2xl border bg-white/90 p-4 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:bg-white hover:shadow-[0_12px_28px_rgba(31,73,136,0.10)] lg:p-5 ${border}`}
                  >
                    <span
                      className="absolute inset-x-0 top-0 h-1"
                      style={{ background: accent }}
                    />
                    <span
                      className="pointer-events-none absolute right-3 top-2 select-none text-[56px] font-extrabold leading-none opacity-[0.07]"
                      style={{ color: accent }}
                    >
                      0{i + 1}
                    </span>

                    <div
                      className={`flex h-14 w-14 items-center justify-center rounded-2xl transition-transform duration-300 group-hover:scale-105 ${iconBg}`}
                    >
                      <Icon
                        className="h-6 w-6 sm:h-7 sm:w-7"
                        strokeWidth={1.8}
                        style={{ color: accent }}
                      />
                    </div>

                    <h3 className="mt-3 text-[15px] font-bold leading-tight tracking-[-0.02em] text-[#082E70] sm:text-[16px]">
                      {title}
                    </h3>
                    <p className="mt-1 text-[12px] leading-[1.5] text-slate-500 sm:text-[13px]">
                      {description}
                    </p>

                    <div className="flex-1" />
                    <div className="mt-3">
                      <span
                        className={`inline-flex max-w-full rounded-full px-2.5 py-1 text-[10px] font-medium leading-tight sm:text-[11px] ${tagCls}`}
                      >
                        {tag}
                      </span>
                    </div>
                  </div>
                ),
              )}
            </div>

            {/* handwritten note */}
            <DecorativeText
              text={"Care you can trust ♡"}
              bottom="14px"
              right="28px"
              rotate={-4}
              color="#FF4389"
              size={22}
              className="hidden md:block"
            />
          </div>
        </div>
      </section>

      {/* Testimonials */}
      {testimonials.length > 0 && (
        <section className="bg-white py-6 sm:py-8 lg:py-10">
          <div className="mx-auto w-full container px-4 sm:px-6 lg:px-8">
            <div className="relative overflow-hidden rounded-2xl border border-blue-100/70 bg-gradient-to-br from-[#F8FBFF] via-white to-[#FFF6F9] px-4 py-5 shadow-[0_12px_40px_rgba(58,99,165,0.08)] sm:px-6 sm:py-6 lg:px-8 lg:py-8">
              {/* bg */}
              <div className="pointer-events-none absolute -left-16 -top-16 h-52 w-52 rounded-full bg-cyan-100/40 blur-3xl" />
              <div className="pointer-events-none absolute -right-20 -top-16 h-64 w-64 rounded-full bg-pink-100/50 blur-3xl" />
              <div className="pointer-events-none absolute bottom-0 left-0 h-[90px] w-full sm:h-[110px]">
                <svg
                  viewBox="0 0 1600 220"
                  preserveAspectRatio="none"
                  className="h-full w-full"
                >
                  <path
                    d="M0 100C220 150 310 210 520 170C760 125 870 225 1100 180C1310 138 1420 78 1600 105V220H0Z"
                    fill="#EDF6FF"
                    fillOpacity="0.9"
                  />
                  <path
                    d="M0 145C180 180 340 130 530 175C730 220 890 150 1090 185C1300 220 1450 145 1600 160V220H0Z"
                    fill="#FFF0F5"
                    fillOpacity="0.8"
                  />
                </svg>
              </div>

              {/* header */}
              <div className="relative z-20">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#E7F0FF] px-3 py-1 text-[9px] font-bold uppercase tracking-[0.12em] text-[#2870EE] sm:px-3.5 sm:py-1.5 sm:text-[10px]">
                  <Heart className="h-3 w-3 fill-pink-400 text-pink-400" />
                  Happy families
                </span>
                <h2 className="mt-2 max-w-[700px] text-[22px] font-bold leading-[1.15] tracking-[-0.03em] text-[#0C3177] sm:text-[28px] md:text-[32px] lg:text-[36px]">
                  What our <span className="text-[#FF4389]">patients say</span>
                </h2>
                <p className="mt-1.5 text-[13px] leading-relaxed text-slate-500 sm:text-[14px] lg:text-[15px]">
                  Real stories from families who trust us
                </p>
              </div>

              <div className="relative z-20 mt-5 sm:mt-6">
                <TestimonialRail items={testimonials} />
              </div>
            </div>
          </div>
        </section>
      )}

      {/* App band */}
      {/* <section className="bg-white py-6 sm:py-8 lg:py-10">
        <div className="mx-auto w-full container px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-2xl border border-blue-100/70 bg-gradient-to-br from-[#F8FBFF] via-white to-[#FFF6F9] px-4 py-6 shadow-[0_12px_40px_rgba(58,99,165,0.08)] sm:px-6 sm:py-8 lg:px-10 lg:py-10">
            <div className="pointer-events-none absolute -left-16 -top-16 h-52 w-52 rounded-full bg-cyan-100/40 blur-3xl" />
            <div className="pointer-events-none absolute -right-20 -top-16 h-64 w-64 rounded-full bg-pink-100/50 blur-3xl" />
            <div className="pointer-events-none absolute bottom-0 left-0 h-[90px] w-full sm:h-[110px]">
              <svg viewBox="0 0 1600 220" preserveAspectRatio="none" className="h-full w-full">
                <path d="M0 100C220 150 310 210 520 170C760 125 870 225 1100 180C1310 138 1420 78 1600 105V220H0Z" fill="#EDF6FF" fillOpacity="0.9" />
                <path d="M0 145C180 180 340 130 530 175C730 220 890 150 1090 185C1300 220 1450 145 1600 160V220H0Z" fill="#FFF0F5" fillOpacity="0.8" />
              </svg>
            </div>

            <div className="relative z-20 grid items-center gap-8 md:grid-cols-[1.15fr_0.85fr]">
              <div>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#E7F0FF] px-3 py-1 text-[9px] font-bold uppercase tracking-[0.12em] text-[#2870EE] sm:px-3.5 sm:py-1.5 sm:text-[10px]">
                  <Smartphone className="h-3 w-3" />
                  Mobile app
                </span>

                <h2 className="mt-2 max-w-[520px] text-[22px] font-bold leading-[1.15] tracking-[-0.03em] text-[#0C3177] sm:text-[28px] md:text-[32px] lg:text-[36px]">
                  Healthcare in <span className="text-[#FF4389]">your pocket</span>
                </h2>

                <p className="mt-2 max-w-[48ch] text-[13px] leading-relaxed text-slate-500 sm:text-[14px] lg:text-[15px]">
                  Book appointments, open prescriptions and watch care videos from your phone.
                </p>

                <div className="mt-5 flex flex-wrap gap-2.5">
                  {[
                    [CalendarCheck, "Book appointments", "#3973F6", "bg-[#E9F2FF]"],
                    [FileText, "Open prescriptions", "#FF4389", "bg-[#FFEAF2]"],
                    [Video, "Watch care videos", "#7548EB", "bg-[#F1EBFF]"],
                  ].map(([Icon, label, accent, bg]) => (
                    <span
                      key={label}
                      className="inline-flex items-center gap-2 rounded-full border border-white bg-white/90 py-1.5 pl-1.5 pr-3.5 text-[12px] font-semibold text-[#082E70] shadow-[0_4px_14px_rgba(40,75,130,0.06)]"
                    >
                      <span className={`flex h-7 w-7 items-center justify-center rounded-full ${bg}`}>
                        <Icon className="h-3.5 w-3.5" style={{ color: accent }} />
                      </span>
                      {label}
                    </span>
                  ))}
                </div>

                <div className="mt-6 flex flex-wrap gap-3">
                  {settings?.appStoreUrl && (
                    <a
                      href={settings.appStoreUrl}
                      className="inline-flex h-11 items-center gap-2 rounded-xl bg-[#0C3177] px-5 text-xs font-semibold text-white shadow-[0_6px_20px_rgba(12,49,119,0.25)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#082E70] sm:text-sm"
                    >
                      App Store
                    </a>
                  )}
                  {settings?.playStoreUrl && (
                    <a
                      href={settings.playStoreUrl}
                      className="inline-flex h-11 items-center gap-2 rounded-xl bg-[#ff5574] px-5 text-xs font-semibold text-white shadow-[0_6px_20px_rgba(255,85,116,0.3)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#ef4164] sm:text-sm"
                    >
                      Google Play
                    </a>
                  )}
                  {!settings?.appStoreUrl && !settings?.playStoreUrl && (
                    <Link
                      href="/book"
                      className="group inline-flex h-11 items-center gap-2.5 rounded-xl bg-[#ff5574] px-5 text-xs font-semibold text-white shadow-[0_6px_20px_rgba(255,85,116,0.3)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#ef4164] sm:text-sm"
                    >
                      Book on the web
                      <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
                    </Link>
                  )}
                </div>
              </div>

              <div className="relative mx-auto flex h-[340px] w-full max-w-[320px] items-center justify-center">
                <div className="absolute h-[260px] w-[260px] rounded-full bg-gradient-to-br from-[#CBE5FF] via-[#B8DCFF] to-[#DCEEFF]" />
                <div className="absolute right-0 top-10 h-[120px] w-[120px] rounded-full bg-pink-100/80" />

                <div className="relative h-[310px] w-[165px] rounded-[30px] border-[6px] border-[#0C3177] bg-white shadow-[0_20px_40px_rgba(31,73,136,0.25)] sm:h-[330px] sm:w-[180px]">
                  <span className="absolute left-1/2 top-1.5 h-1.5 w-12 -translate-x-1/2 rounded-full bg-[#0C3177]" />
                  <div className="flex h-full flex-col gap-2.5 px-3 pb-3 pt-6">
                    <div className="rounded-2xl bg-gradient-to-br from-[#2F4CC8] to-[#5367E3] p-3 text-white">
                      <p className="text-[9px] font-medium text-white/80">Upcoming visit</p>
                      <p className="mt-0.5 text-[12px] font-bold">Tomorrow · 10:30 AM</p>
                      <span className="mt-2 inline-block rounded-full bg-white/20 px-2 py-0.5 text-[8px] font-semibold">Confirmed</span>
                    </div>

                    {[
                      [FileText, "#FF4389", "bg-[#FFEAF2]"],
                      [Video, "#7548EB", "bg-[#F1EBFF]"],
                      [CalendarCheck, "#18A981", "bg-[#E7FAF4]"],
                    ].map(([Icon, accent, bg], i) => (
                      <div key={i} className="flex items-center gap-2 rounded-xl border border-slate-100 p-2">
                        <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${bg}`}>
                          <Icon className="h-4 w-4" style={{ color: accent }} />
                        </span>
                        <span className="flex-1 space-y-1">
                          <span className="block h-1.5 w-4/5 rounded-full bg-slate-200" />
                          <span className="block h-1.5 w-3/5 rounded-full bg-slate-100" />
                        </span>
                      </div>
                    ))}

                    <div className="mt-auto flex justify-center gap-1.5">
                      <span className="h-1.5 w-5 rounded-full bg-[#FF4389]" />
                      <span className="h-1.5 w-1.5 rounded-full bg-slate-200" />
                      <span className="h-1.5 w-1.5 rounded-full bg-slate-200" />
                    </div>
                  </div>
                </div>

                <div className="absolute -left-1 top-14 flex items-center gap-1.5 rounded-full border border-blue-100 bg-white px-3 py-1.5 text-[10px] font-semibold text-[#082E70] shadow-card sm:-left-4">
                  <span className="flex h-4 w-4 items-center justify-center rounded-full bg-emerald-100 text-[9px] text-emerald-600">✓</span>
                  Booked
                </div>
                <div className="absolute -right-1 bottom-16 flex h-10 w-10 animate-pulse items-center justify-center rounded-full bg-pink-100 text-pink-500 shadow-sm sm:-right-3">
                  ♥
                </div>

                <DecorativeText
                  text={"Care on\nthe go ♡"}
                  top="0px"
                  right="10px"
                  rotate={8}
                  color="#3973F6"
                  size={20}
                  className="hidden md:block"
                />
              </div>
            </div>
          </div>
        </div >
      </section > */}

      {/* Blogs */}
      {blogs.length > 0 && (
        <section className="section container">
          <SectionHead
            title="Latest health tips"
            sub="Expert advice for a healthier tomorrow"
            href="/blogs"
          />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {blogs.slice(0, 4).map((b) => (
              <Link
                key={b._id}
                href={`/blogs/${b.slug}`}
                className="soft-card overflow-hidden transition-shadow hover:shadow-md"
              >
                {b.coverImage ? (
                  <img
                    src={b.coverImage}
                    alt=""
                    className="h-36 w-full object-cover"
                  />
                ) : (
                  <div className="h-36 w-full bg-brand-50" />
                )}
                <div className="p-4">
                  <p className="line-clamp-2 text-sm font-semibold text-ink">
                    {b.title}
                  </p>
                  <p className="mt-2 text-xs text-muted-foreground">
                    {prettyDate(b.publishedAt || b.createdAt)}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Partners */}
      {partners.length > 0 && (
        <section className="bg-white py-6 sm:py-8 lg:py-10">
          <div className="mx-auto w-full container px-4 sm:px-6 lg:px-8">
            <div className="relative overflow-hidden rounded-2xl border border-blue-100/70 bg-gradient-to-br from-[#F8FBFF] via-white to-[#FFF6F9] px-4 pb-14 pt-5 shadow-[0_12px_40px_rgba(58,99,165,0.08)] sm:px-6 sm:pt-6 lg:px-8 lg:pt-8">
              {/* bg */}
              <div className="pointer-events-none absolute -left-16 -top-16 h-52 w-52 rounded-full bg-cyan-100/40 blur-3xl" />
              <div className="pointer-events-none absolute -right-20 -top-16 h-64 w-64 rounded-full bg-pink-100/50 blur-3xl" />
              <div className="pointer-events-none absolute bottom-0 left-0 h-[90px] w-full sm:h-[110px]">
                <svg
                  viewBox="0 0 1600 220"
                  preserveAspectRatio="none"
                  className="h-full w-full"
                >
                  <path
                    d="M0 100C220 150 310 210 520 170C760 125 870 225 1100 180C1310 138 1420 78 1600 105V220H0Z"
                    fill="#EDF6FF"
                    fillOpacity="0.9"
                  />
                  <path
                    d="M0 145C180 180 340 130 530 175C730 220 890 150 1090 185C1300 220 1450 145 1600 160V220H0Z"
                    fill="#FFF0F5"
                    fillOpacity="0.8"
                  />
                </svg>
              </div>

              {/* header */}
              <div className="relative z-20 text-center">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#E7F0FF] px-3 py-1 text-[9px] font-bold uppercase tracking-[0.12em] text-[#2870EE] sm:px-3.5 sm:py-1.5 sm:text-[10px]">
                  <HeartHandshake className="h-3 w-3" />
                  Our network
                </span>
                <h2 className="mx-auto mt-2 max-w-[700px] text-[22px] font-bold leading-[1.15] tracking-[-0.03em] text-[#0C3177] sm:text-[28px] md:text-[32px] lg:text-[36px]">
                  Our trusted <span className="text-[#FF4389]">partners</span>
                </h2>
                <p className="mt-1.5 text-[13px] leading-relaxed text-slate-500 sm:text-[14px] lg:text-[15px]">
                  Collaborating for a healthier community
                </p>
              </div>

              {/* logos */}
              <div className="relative z-20 mt-5 grid grid-cols-2 gap-3 sm:mt-6 sm:grid-cols-3 sm:gap-4 lg:grid-cols-6">
                {partners.map((p) => (
                  <div
                    key={p._id}
                    className="group flex h-24 items-center justify-center rounded-2xl border border-[#CFE0FF] bg-white/90 p-4 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-[#FFC2D1] hover:bg-white hover:shadow-[0_12px_28px_rgba(31,73,136,0.10)]"
                  >
                    {p.logo ? (
                      <img
                        src={p.logo}
                        alt={p.name}
                        className="max-h-12 w-auto max-w-full object-contain opacity-80 grayscale transition-all duration-300 group-hover:scale-105 group-hover:opacity-100 group-hover:grayscale-0"
                      />
                    ) : (
                      <span className="text-center text-sm font-bold text-[#082E70]">
                        {p.name}
                      </span>
                    )}
                  </div>
                ))}
              </div>

              {/* handwritten note */}
              <DecorativeText
                text={"Stronger together ♡"}
                bottom="14px"
                right="28px"
                rotate={-4}
                color="#FF4389"
                size={22}
                className="hidden md:block"
              />
            </div>
          </div>
        </section>
      )}

      {/* FAQ */}
      {faqs.length > 0 && (
        <section className="bg-white py-6 sm:py-8 lg:py-10">
          <div className="mx-auto w-full container px-4 sm:px-6 lg:px-8">
            <div className="relative overflow-hidden rounded-2xl border border-blue-100/70 bg-gradient-to-br from-[#F8FBFF] via-white to-[#FFF6F9] px-4 pb-12 pt-5 shadow-[0_12px_40px_rgba(58,99,165,0.08)] sm:px-6 sm:pt-6 lg:px-8 lg:pt-8">
              {/* bg */}
              <div className="pointer-events-none absolute -left-16 -top-16 h-52 w-52 rounded-full bg-cyan-100/40 blur-3xl" />
              <div className="pointer-events-none absolute -right-20 -top-16 h-64 w-64 rounded-full bg-pink-100/50 blur-3xl" />
              <div className="pointer-events-none absolute bottom-0 left-0 h-[90px] w-full sm:h-[110px]">
                <svg
                  viewBox="0 0 1600 220"
                  preserveAspectRatio="none"
                  className="h-full w-full"
                >
                  <path
                    d="M0 100C220 150 310 210 520 170C760 125 870 225 1100 180C1310 138 1420 78 1600 105V220H0Z"
                    fill="#EDF6FF"
                    fillOpacity="0.9"
                  />
                  <path
                    d="M0 145C180 180 340 130 530 175C730 220 890 150 1090 185C1300 220 1450 145 1600 160V220H0Z"
                    fill="#FFF0F5"
                    fillOpacity="0.8"
                  />
                </svg>
              </div>

              {/* header */}
              <div className="relative z-20 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-[#E7F0FF] px-3 py-1 text-[9px] font-bold uppercase tracking-[0.12em] text-[#2870EE] sm:px-3.5 sm:py-1.5 sm:text-[10px]">
                    <HelpCircle className="h-3 w-3" />
                    Got questions?
                  </span>
                  <h2 className="mt-2 max-w-[700px] text-[22px] font-bold leading-[1.15] tracking-[-0.03em] text-[#0C3177] sm:text-[28px] md:text-[32px] lg:text-[36px]">
                    Frequently asked{" "}
                    <span className="text-[#FF4389]">questions</span>
                  </h2>
                  <p className="mt-1.5 text-[13px] leading-relaxed text-slate-500 sm:text-[14px] lg:text-[15px]">
                    Quick answers to what families ask us most
                  </p>
                </div>
                <Link
                  href="/faqs"
                  className="group inline-flex w-fit items-center gap-2 text-sm font-semibold text-[#2870EE] hover:text-[#FF4389]"
                >
                  All FAQs
                  <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
                </Link>
              </div>

              {/* body */}
              <div className="relative z-20 mt-5 grid items-start gap-5 sm:mt-6 lg:grid-cols-[1.4fr_0.6fr] lg:gap-6">
                <FaqList faqs={faqs.slice(0, 6)} />

                {/* help card */}
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#2F4CC8] to-[#5367E3] p-6 text-white shadow-[0_14px_34px_rgba(47,76,200,0.25)]">
                  <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10" />
                  <div className="pointer-events-none absolute -bottom-10 -left-6 h-28 w-28 rounded-full bg-pink-400/20" />

                  <span className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 ring-1 ring-white/20">
                    <Headphones className="h-6 w-6" />
                  </span>

                  <p className="relative mt-4 text-lg font-bold">Need help?</p>
                  <p className="relative mt-1 text-[13px] text-white/80">
                    We&apos;re here for you
                  </p>

                  {(settings?.supportPhone || settings?.contactPhone) && (
                    <a
                      href={`tel:${settings.supportPhone || settings.contactPhone}`}
                      className="relative mt-4 flex items-center gap-2 text-xl font-bold hover:underline"
                    >
                      <Phone className="h-4 w-4 shrink-0" />
                      {settings.supportPhone || settings.contactPhone}
                    </a>
                  )}

                  <Link
                    href="/contact"
                    className="group relative mt-5 inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-white text-sm font-semibold text-[#2F4CC8] shadow-[0_6px_20px_rgba(0,0,0,0.12)] transition-all duration-200 hover:-translate-y-0.5"
                  >
                    Contact us
                    <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
                  </Link>
                </div>
              </div>

              {/* handwritten note */}
              <DecorativeText
                text={"Ask us anything ♡"}
                bottom="14px"
                right="28px"
                rotate={-4}
                color="#FF4389"
                size={22}
                className="hidden md:block"
              />
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      {/* CTA */}
      <section className="bg-white py-6 sm:py-8 lg:py-10">
        <div className="mx-auto w-full container px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#2F4CC8] via-[#3D57D6] to-[#5367E3] px-5 py-8 text-white shadow-[0_18px_44px_rgba(47,76,200,0.28)] sm:px-8 sm:py-10 lg:px-12 lg:py-12">
            {/* bg decor */}
            <div className="pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full bg-white/10" />
            <div className="pointer-events-none absolute -bottom-24 left-[35%] h-64 w-64 rounded-full bg-pink-400/20 blur-2xl" />
            <div className="pointer-events-none absolute -left-16 bottom-0 h-44 w-44 rounded-full bg-white/[0.07]" />
            <div className="pointer-events-none absolute right-8 top-6 hidden grid-cols-4 gap-1.5 opacity-30 md:grid">
              {Array.from({ length: 16 }).map((_, i) => (
                <span key={i} className="h-1 w-1 rounded-full bg-white" />
              ))}
            </div>
            <Heart
              className="pointer-events-none absolute bottom-6 right-[30%] hidden h-14 w-14 rotate-12 text-white/10 lg:block"
              strokeWidth={3}
            />

            <div className="relative z-10 flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
              {/* LEFT */}
              <div className="max-w-[560px]">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-[9px] font-bold uppercase tracking-[0.12em] text-white ring-1 ring-white/20 sm:px-3.5 sm:py-1.5 sm:text-[10px]">
                  <Heart className="h-3 w-3 fill-pink-300 text-pink-300" />
                  Book in minutes
                </span>

                <h2 className="mt-3 text-[24px] font-bold leading-[1.15] tracking-[-0.03em] text-white sm:text-[30px] lg:text-[38px]">
                  Ready when <span className="text-[#FFB3C6]">your family</span>{" "}
                  needs us
                </h2>

                <p className="mt-2 text-[13px] leading-relaxed text-white/80 sm:text-[14px] lg:text-[15px]">
                  Pick a doctor, choose a slot and you&apos;re done.
                </p>

                {/* mini steps */}
                <div className="mt-5 flex flex-wrap items-center gap-2">
                  {[
                    [Stethoscope, "Pick a doctor"],
                    [CalendarCheck, "Choose a slot"],
                    [CheckCircle2, "You're done"],
                  ].map(([Icon, label], i, arr) => (
                    <div key={label} className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-2 rounded-full bg-white/15 py-1.5 pl-2 pr-3.5 text-[12px] font-semibold text-white ring-1 ring-white/20 backdrop-blur-sm">
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white text-[#2F4CC8]">
                          <Icon className="h-3.5 w-3.5" />
                        </span>
                        {label}
                      </span>
                      {i < arr.length - 1 && (
                        <ArrowRight className="h-3.5 w-3.5 text-white/50" />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* RIGHT */}
              <div className="relative flex flex-col gap-3 sm:flex-row sm:items-center lg:flex-col lg:items-stretch xl:flex-row xl:items-center">
                <Link
                  href="/book"
                  className="group inline-flex h-12 items-center justify-center gap-2.5 rounded-xl bg-[#ff5574] px-7 text-sm font-semibold text-white shadow-[0_8px_24px_rgba(255,85,116,0.45)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#ef4164] sm:text-base"
                >
                  Book an appointment
                  <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
                </Link>

                <Link
                  href="/contact"
                  className="inline-flex h-12 items-center justify-center rounded-xl border border-white/30 bg-white/10 px-6 text-sm font-semibold text-white backdrop-blur-sm transition-all duration-200 hover:bg-white/20 sm:text-base"
                >
                  Contact us
                </Link>

                <DecorativeText
                  text={"Healthy kids,\nhappy families ♡"}
                  top="-44px"
                  right="0px"
                  rotate={-5}
                  color="#FFD1DC"
                  size={22}
                  className="hidden text-center xl:block"
                />
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

function EmptyLine({ text }) {
  return (
    <p className="col-span-full rounded-xl border border-dashed border-border px-4 py-8 text-center text-sm text-muted-foreground">
      {text}
    </p>
  );
}

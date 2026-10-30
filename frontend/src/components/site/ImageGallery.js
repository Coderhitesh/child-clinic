"use client";

import React, { useRef, useState, useEffect } from "react";
import Link from "next/link";
import {
  Camera,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  X,
  Heart,
} from "lucide-react";

const GALLERY_IMAGES = [
  {
    id: 1,
    src: "/images/gallery/gal-1.jpeg",
    alt: "Happy child at clinic",
  },
  {
    id: 2,
    src: "/images/gallery/gal-2.jpeg",
    alt: "Pediatric treatment and therapy",
  },
  {
    id: 3,
    src: "/images/gallery/gal-3.jpeg",
    alt: "Child therapy activity",
  },
  {
    id: 4,
    src: "/images/gallery/gal-4.jpeg",
    alt: "Child during consultation",
  },
  {
    id: 5,
    src: "/images/gallery/gal-5.jpeg",
    alt: "Child participating in therapy",
  },
  {
    id: 6,
    src: "/images/gallery/gal-6.jpeg",
    alt: "Child development activity",
  },
  {
    id: 7,
    src: "/images/gallery/gal-7.jpeg",
    alt: "Child balance and walking therapy",
  },
  {
    id: 8,
    src: "/images/gallery/gal-8.jpeg",
    alt: "Child motor skills activity",
  },
  {
    id: 9,
    src: "/images/gallery/gal-9.jpeg",
    alt: "Child treatment and development",
  },
  {
    id: 10,
    src: "/images/gallery/gal-10.jpeg",
    alt: "Pediatric therapy session",
  },
];
export default function ImageGallery() {
  const scrollRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
  const [selectedImage, setSelectedImage] = useState(null);

  const checkScroll = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setCanScrollLeft(scrollLeft > 10);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 10);

    // Calculate approximate active page dot (5 dots total)
    const maxScroll = scrollWidth - clientWidth;
    if (maxScroll > 0) {
      const progress = scrollLeft / maxScroll;
      const dotIndex = Math.min(4, Math.max(0, Math.round(progress * 4)));
      setActiveIndex(dotIndex);
    }
  };

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    checkScroll();
    el.addEventListener("scroll", checkScroll, { passive: true });
    window.addEventListener("resize", checkScroll);
    return () => {
      el.removeEventListener("scroll", checkScroll);
      window.removeEventListener("resize", checkScroll);
    };
  }, []);

  const scroll = (direction) => {
    if (!scrollRef.current) return;
    const scrollAmount = scrollRef.current.clientWidth * 0.75;
    scrollRef.current.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  const scrollToDot = (dotIndex) => {
    if (!scrollRef.current) return;
    const { scrollWidth, clientWidth } = scrollRef.current;
    const maxScroll = scrollWidth - clientWidth;
    scrollRef.current.scrollTo({
      left: (maxScroll * dotIndex) / 4,
      behavior: "smooth",
    });
    setActiveIndex(dotIndex);
  };

  return (
    <section className="relative overflow-hidden bg-white py-10 sm:py-14 lg:py-16">
      {/* Soft background ambient blurs */}
      <div className="pointer-events-none absolute -left-16 -top-16 h-64 w-64 rounded-full bg-blue-100/40 blur-3xl" />
      <div className="pointer-events-none absolute -right-20 top-10 h-72 w-72 rounded-full bg-pink-100/40 blur-3xl" />

      <div className="container relative z-10 px-4 sm:px-6 lg:px-8">
        {/* =========================================================
            HEADER & DECORATIONS
        ========================================================= */}
        <div className="relative mb-8 sm:mb-10 lg:mb-12">
          {/* Top-Left Handwritten Doodle */}
          <div className="pointer-events-none absolute -top-0 -left-40 hidden -rotate-6 font-hand text-[17px] sm:text-[20px] leading-tight text-[#FF4389] xl:block">
            <span>Happy Children</span>
            <br />
            <span>Brighter Tomorrows ♡</span>
            {/* Curved dashed arrow / swirl */}
            <svg
              className="absolute -right-10 top-3 h-8 w-12 text-pink-300 opacity-80"
              viewBox="0 0 50 30"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeDasharray="4 4"
            >
              <path d="M5 25C18 5 35 5 45 18" strokeLinecap="round" />
            </svg>
          </div>

          {/* Top-Right Handwritten Doodle with Smiling Sun */}
          <div className="pointer-events-none absolute -top-6 -right-40 hidden font-hand text-right text-[17px] sm:text-[19px] leading-tight text-[#3973F6] xl:block">
            {/* Smiling Sun Doodle */}
            <div className="inline-block text-[#F59E0B] -rotate-12 mb-0.5">
              <svg
                className="h-9 w-9"
                viewBox="0 0 60 60"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
              >
                <circle cx="30" cy="30" r="10" fill="#FEF3C7" />
                <path
                  d="M26 28a1 1 0 1 0 0-2 1 1 0 0 0 0 2zM34 28a1 1 0 1 0 0-2 1 1 0 0 0 0 2z"
                  fill="#D97706"
                />
                <path d="M26 33c1.5 2 6.5 2 8 0" stroke="#D97706" />
                <path d="M30 8v5M30 47v5M8 30h5M47 30h5M14 14l4 4M42 42l4 4M14 46l4-4M42 18l4-4" />
              </svg>
            </div>
            <p className="-rotate-3">
              Care Play
              <br />
              Learn Grow ♡
            </p>
          </div>
          <div className="text-center">
            <span className="inline-flex items-center justify-center gap-1.5 rounded-full bg-[#FFE9F1] px-3 py-1 text-[9px] font-bold uppercase tracking-[0.12em] text-[#E93D8F] sm:px-3.5 sm:py-1.5 sm:text-[10px]">
              <Camera className="h-3 w-3 fill-pink-400 text-pink-400" />
              Gallery
            </span>

            <h2 className="mt-2 mx-auto max-w-[700px] text-[22px] font-bold leading-[1.15] tracking-[-0.03em] text-[#0C3177] sm:text-[28px] md:text-[32px] lg:text-[36px]">
              Moments of{" "}
              <span className="text-[#FF4389]">Treatment and Progress</span>
            </h2>

            <p className="mt-1.5 mx-auto max-w-[700px] text-[13px] leading-relaxed text-slate-500 sm:text-[14px] lg:text-[15px]">
              A glimpse into the happy moments, therapies, activities and
              facilities at our clinic.
            </p>
          </div>

          {/* "View All Photos" Button (Top Right on desktop / responsive center) */}
          {/* <div className="mt-4 flex justify-center xl:absolute xl:right-0 xl:top-7 xl:mt-0">
            <Link
              href="/gallery"
              className="group inline-flex items-center gap-1.5 rounded-full border border-blue-600/80 bg-white px-5 py-2 text-xs sm:text-sm font-semibold text-[#2F4CC8] shadow-sm transition-all duration-200 hover:border-blue-700 hover:bg-blue-50/70"
            >
              <span>View All Photos</span>
              <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-1" />
            </Link>
          </div> */}
        </div>

        {/* =========================================================
            CAROUSEL ROW WITH LEFT/RIGHT NAVIGATION ARROWS
        ========================================================= */}
        <div className="relative group/carousel">
          {/* Left Arrow Button */}
          <button
            type="button"
            onClick={() => scroll("left")}
            disabled={!canScrollLeft}
            aria-label="Previous photos"
            className={`absolute -left-2 sm:-left-4 top-1/2 z-30 flex h-10 w-10 sm:h-11 sm:w-11 -translate-y-1/2 items-center justify-center rounded-full border border-slate-200/90 bg-white text-[#0C3177] shadow-[0_6px_20px_rgba(23,58,120,0.12)] transition-all duration-200 ${
              canScrollLeft
                ? "hover:scale-110 hover:border-blue-300 hover:bg-blue-50/50 cursor-pointer opacity-100"
                : "opacity-40 cursor-not-allowed"
            }`}
          >
            <ChevronLeft className="h-5 w-5 sm:h-6 sm:w-6" strokeWidth={2.4} />
          </button>

          {/* Right Arrow Button */}
          <button
            type="button"
            onClick={() => scroll("right")}
            disabled={!canScrollRight}
            aria-label="Next photos"
            className={`absolute -right-2 sm:-right-4 top-1/2 z-30 flex h-10 w-10 sm:h-11 sm:w-11 -translate-y-1/2 items-center justify-center rounded-full border border-slate-200/90 bg-white text-[#0C3177] shadow-[0_6px_20px_rgba(23,58,120,0.12)] transition-all duration-200 ${
              canScrollRight
                ? "hover:scale-110 hover:border-blue-300 hover:bg-blue-50/50 cursor-pointer opacity-100"
                : "opacity-40 cursor-not-allowed"
            }`}
          >
            <ChevronRight className="h-5 w-5 sm:h-6 sm:w-6" strokeWidth={2.4} />
          </button>

          {/* Scrollable Gallery Images Container */}
          <div
            ref={scrollRef}
            className="flex gap-3 sm:gap-3.5 lg:gap-4 overflow-x-auto scroll-smooth pb-2 pt-1 scrollbar-none px-1"
            style={{ scrollSnapType: "x mandatory" }}
          >
            {GALLERY_IMAGES.map((img) => (
              <div
                key={img.id}
                onClick={() => setSelectedImage(img)}
                style={{ scrollSnapAlign: "start" }}
                className="group relative h-[155px] w-[120px] sm:h-[165px] sm:w-[130px] md:h-[175px] md:w-[140px] lg:h-[185px] lg:w-[150px] shrink-0 cursor-pointer overflow-hidden rounded-lg border border-slate-100 bg-slate-50 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_18px_rgba(31,73,136,0.16)]"
              >
                {/* Image */}
                <img
                  src={img.src}
                  alt={img.alt}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                  loading="lazy"
                />

                {/* Subtle Hover Gradient Overlay */}
                {/* <div className="absolute inset-0 bg-gradient-to-t from-[#0C3177]/70 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100 flex items-end p-2.5">
                  <span className="text-[11px] font-semibold text-white truncate drop-shadow-sm">
                    {img.title}
                  </span>
                </div> */}
              </div>
            ))}
          </div>
        </div>

        {/* =========================================================
            PAGINATION INDICATOR DOTS
        ========================================================= */}
        <div className="mt-6 sm:mt-7 flex items-center justify-center gap-2">
          {[0, 1, 2, 3, 4].map((dot) => (
            <button
              key={dot}
              type="button"
              onClick={() => scrollToDot(dot)}
              aria-label={`Go to slide ${dot + 1}`}
              className={`h-2 sm:h-2.5 rounded-full transition-all duration-300 ${
                activeIndex === dot
                  ? "w-7 bg-[#FF2D55]"
                  : "w-2 sm:w-2.5 bg-blue-100 hover:bg-blue-200"
              }`}
            />
          ))}
        </div>
      </div>

      {/* =========================================================
          IMAGE PREVIEW LIGHTBOX MODAL
      ========================================================= */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm transition-all"
          onClick={() => setSelectedImage(null)}
        >
          <div
            className="relative max-w-2xl w-full overflow-hidden rounded-3xl bg-white shadow-2xl animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
            <img
              src={selectedImage.src}
              alt={selectedImage.alt}
              className="max-h-[70vh] w-full object-cover"
            />
            <div className="p-4 sm:p-5">
              <span className="inline-block rounded-full bg-[#E8F2FF] px-2.5 py-0.5 text-[11px] font-bold text-[#2F4CC8] uppercase tracking-wider">
                {selectedImage.category}
              </span>
              <h3 className="mt-1 text-lg font-bold text-[#0C3177]">
                {selectedImage.title}
              </h3>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

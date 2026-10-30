"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Play, Clock, ArrowRight, X } from "lucide-react";

const VIDEOS = [
  {
    id: "1",
    title: "Speech Development Activities for Kids",
    duration: "6:24",
    videoUrl: "https://www.youtube.com/watch?v=PICXVRQ9frM&t=94s",
  },
  {
    id: "2",
    title: "Occupational Therapy for Better Growth",
    duration: "5:18",
    videoUrl: "https://www.youtube.com/watch?v=bNlaphK8pig",
  },
  {
    id: "3",
    title: "Autism Therapy Activities",
    duration: "7:02",
    videoUrl: "https://www.youtube.com/watch?v=hxFvd28QNL0",
  },
  {
    id: "4",
    title: "Physical Therapy for Children",
    duration: "4:56",
    videoUrl: "https://www.youtube.com/watch?v=xqt21H64WgQ",
  },
  {
    id: "5",
    title: "Parent Tips for Child Development",
    duration: "6:30",
    videoUrl: "https://www.youtube.com/watch?v=E189B9ftQQI",
  },
  {
    id: "6",
    title: "Sensory Activities at Home",
    duration: "5:12",
    videoUrl: "https://www.youtube.com/watch?v=E189B9ftQQI",
  },
  {
    id: "7",
    title: "Success Story Our Little Champion",
    duration: "4:28",
    videoUrl: "https://www.youtube.com/watch?v=5ipnl5jNRgY",
  },
  {
    id: "8",
    title: "Behavioral Therapy Techniques",
    duration: "5:40",
    videoUrl: "https://www.youtube.com/watch?v=p2GiPaYjf0Q",
  },
];

const getYoutubeVideoId = (url) => {
  try {
    const parsedUrl = new URL(url);

    if (parsedUrl.hostname.includes("youtube.com")) {
      return parsedUrl.searchParams.get("v");
    }

    if (parsedUrl.hostname === "youtu.be") {
      return parsedUrl.pathname.slice(1).split("?")[0];
    }

    return null;
  } catch {
    return null;
  }
};

const getYoutubeStartTime = (url) => {
  try {
    const parsedUrl = new URL(url);
    const value = parsedUrl.searchParams.get("t");

    if (!value) return 0;

    // Supports values such as 94s, 1m34s and plain seconds.
    if (/^\d+$/.test(value)) return Number(value);

    let seconds = 0;
    const hours = value.match(/(\d+)h/);
    const minutes = value.match(/(\d+)m/);
    const secs = value.match(/(\d+)s/);

    if (hours) seconds += Number(hours[1]) * 3600;
    if (minutes) seconds += Number(minutes[1]) * 60;
    if (secs) seconds += Number(secs[1]);

    return seconds;
  } catch {
    return 0;
  }
};

const getYoutubeEmbedUrl = (url) => {
  const videoId = getYoutubeVideoId(url);

  if (!videoId) return url;

  const start = getYoutubeStartTime(url);
  const params = new URLSearchParams({
    autoplay: "1",
    rel: "0",
    modestbranding: "1",
    playsinline: "1",
  });

  if (start > 0) {
    params.set("start", String(start));
  }

  return `https://www.youtube.com/embed/${videoId}?${params.toString()}`;
};

const getYoutubeThumbnail = (url) => {
  const videoId = getYoutubeVideoId(url);

  if (!videoId) return "";

  // hqdefault is much lighter than loading a YouTube iframe/player.
  return `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
};

export default function VideoGallery() {
  const [activeVideo, setActiveVideo] = useState(null);

  const closeVideo = () => {
    setActiveVideo(null);
  };

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-[#F5F8FF]/80 via-white to-white py-10 sm:py-14 lg:py-16">
      {/* Lightweight decorative backgrounds */}
      <div className="pointer-events-none absolute -left-14 -top-10 h-72 w-72 rounded-full bg-pink-100/35 blur-3xl" />
      <div className="pointer-events-none absolute -right-16 top-20 h-80 w-80 rounded-full bg-blue-100/35 blur-3xl" />

      <div className="container relative z-10 px-4 sm:px-6 lg:px-8">
        {/* HEADER */}
        <div className="relative mb-8 sm:mb-10 lg:mb-12">
          {/* Top-left decoration */}
          <div className="pointer-events-none absolute -top-5 -left-40 hidden xl:block">
            <div className="mb-1 flex gap-1 -rotate-12 text-lg font-bold text-[#FF2D55]">
              <span>\</span>
              <span>\</span>
            </div>

            <p className="-rotate-6 font-hand text-[18px] leading-tight text-[#3973F6] sm:text-[20px]">
              Small Steps
              <br />
              Big Progress ♡
            </p>
          </div>

          {/* Top-right decoration */}
          <div className="pointer-events-none absolute -top-5 right-2 hidden xl:block">
            <div className="flex gap-1 rotate-12 text-lg font-bold text-[#FF2D55]">
              <span>\</span>
              <span>\</span>
            </div>
          </div>

          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#FFE9F1] px-3 py-1 text-[9px] font-bold uppercase tracking-[0.12em] text-[#E93D8F] sm:px-3.5 sm:py-1.5 sm:text-[10px]">
              <Play className="h-3 w-3 fill-pink-400 text-pink-400" />
              Video
            </span>

            <h2 className="mt-2 max-w-[700px] text-[22px] font-bold leading-[1.15] tracking-[-0.03em] text-[#0C3177] sm:text-[28px] md:text-[32px] lg:text-[36px]">
              Watch Our <span className="text-[#FF4389]"> Videos</span>
            </h2>

            <p className="mt-1.5 text-[13px] leading-relaxed text-slate-500 sm:text-[14px] lg:text-[15px]">
              Helpful videos on child development, therapies, expert advice and
              success stories.
            </p>
          </div>

          {/* Subscribe */}
          <div className="mt-4 flex justify-center xl:absolute xl:right-0 xl:top-7 xl:mt-0">
            <a
              href="https://www.youtube.com/@normalchildclinic7288"
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-2 rounded-full bg-[#FF2D55] px-5 py-2.5 text-xs font-semibold text-white shadow-[0_6px_20px_rgba(255,45,85,0.25)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#EA1942] hover:shadow-[0_10px_24px_rgba(255,45,85,0.32)] sm:text-sm"
            >
              <div className="flex h-5 w-6 items-center justify-center rounded-md bg-white text-[#FF2D55] shadow-xs">
                <Play className="ml-0.5 h-3 w-3 fill-current" />
              </div>

              <span>Subscribe to Our Channel</span>

              <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-1" />
            </a>
          </div>
        </div>

        {/* VIDEO GRID
            IMPORTANT:
            No YouTube iframe is rendered here.
            Only a lightweight thumbnail + play button is rendered.
            The actual YouTube iframe loads only after the user clicks.
        */}
        <div className="grid grid-cols-2 gap-3.5 sm:gap-4 md:grid-cols-4">
          {VIDEOS.map((video) => {
            const thumbnail = getYoutubeThumbnail(video.videoUrl);

            return (
              <button
                key={video.id}
                type="button"
                onClick={() => setActiveVideo(video)}
                className="group relative aspect-video overflow-hidden rounded-2xl border border-slate-100 bg-slate-100 text-left shadow-sm outline-none transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md focus-visible:ring-2 focus-visible:ring-[#3973F6] focus-visible:ring-offset-2"
                aria-label={`Play ${video.title}`}
              >
                {/* Facade thumbnail.
                    loading="lazy" keeps thumbnails from competing with
                    above-the-fold page resources. */}
                {thumbnail ? (
                  <img
                    src={thumbnail}
                    alt=""
                    loading="lazy"
                    decoding="async"
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                  />
                ) : (
                  <div className="absolute inset-0 bg-slate-200" />
                )}

                {/* Dark overlay */}
                <span className="absolute inset-0 bg-black/10 transition-colors duration-200 group-hover:bg-black/20" />

                {/* Play button */}
                <span className="absolute inset-0 flex items-center justify-center">
                  <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white/95 text-[#FF2D55] shadow-[0_6px_20px_rgba(0,0,0,0.18)] transition-transform duration-200 group-hover:scale-110 sm:h-12 sm:w-12">
                    <Play className="ml-0.5 h-5 w-5 fill-current sm:h-5 sm:w-5" />
                  </span>
                </span>

                {/* Duration */}
                <span className="absolute bottom-2 right-2 inline-flex items-center gap-1 rounded-md bg-black/70 px-2 py-1 text-[10px] font-semibold text-white backdrop-blur-sm">
                  <Clock className="h-3 w-3" />
                  {video.duration}
                </span>
              </button>
            );
          })}
        </div>

        {/* VIEW ALL */}
        {/* <div className="mt-8 flex justify-center sm:mt-10 lg:mt-12">
          <Link
            href="/videos"
            className="group inline-flex items-center gap-1.5 rounded-full border border-blue-600/80 bg-white px-6 py-2.5 text-xs font-semibold text-[#2F4CC8] shadow-sm transition-all duration-200 hover:border-blue-700 hover:bg-blue-50/70 sm:text-sm"
          >
            <span>View All Videos</span>
            <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-1" />
          </Link>
        </div> */}
      </div>

      {/* VIDEO MODAL
          The FIRST YouTube iframe is created only after a video is clicked. */}
      {activeVideo && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm"
          onClick={closeVideo}
          role="dialog"
          aria-modal="true"
          aria-label={activeVideo.title}
        >
          <div
            className="relative w-full max-w-3xl overflow-hidden rounded-3xl bg-black shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close */}
            <button
              type="button"
              onClick={closeVideo}
              className="absolute right-4 top-4 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-black/45 text-white transition-colors hover:bg-black/70"
              aria-label="Close video"
            >
              <X className="h-5 w-5" />
            </button>

            {/* YouTube loads ONLY here */}
            <div className="relative aspect-video w-full">
              <iframe
                src={getYoutubeEmbedUrl(activeVideo.videoUrl)}
                title={activeVideo.title}
                className="h-full w-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between bg-[#0C3177] p-4 text-white sm:p-5">
              <div>
                <p className="text-xs text-white/70">
                  Normal Child Clinic Video
                </p>

                <h3 className="mt-0.5 text-sm font-bold sm:text-base">
                  {activeVideo.title}
                </h3>
              </div>

              <span className="inline-flex shrink-0 items-center gap-1 rounded-md bg-white/10 px-2 py-1 text-xs font-semibold text-white">
                <Clock className="h-3 w-3" />
                {activeVideo.duration}
              </span>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

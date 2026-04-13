'use client';

import { useEffect, useRef } from 'react';

export default function Home() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const progressBarRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Fallback for Chrome iOS: only call play() if the video didn't auto-start.
    // Waiting a tick lets the native autoplay attribute fire first.
    const timer = window.setTimeout(() => {
      if (video.paused) {
        video.play().catch(() => {
          // If still blocked, retry on first user touch
          const onInteraction = () => {
            video.play().catch(() => {});
          };
          document.addEventListener('touchstart', onInteraction, { once: true });
          document.addEventListener('click', onInteraction, { once: true });
        });
      }
    }, 300);

    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    const progressBar = progressBarRef.current;
    if (!video || !progressBar) return;

    let rafId: number;

    const updateProgress = () => {
      if (video.duration && isFinite(video.duration) && video.duration > 0) {
        const progress = (video.currentTime / video.duration) * 100;
        progressBar.style.width = `${progress}%`;
      }
      rafId = requestAnimationFrame(updateProgress);
    };

    const handleCanPlay = () => {
      rafId = requestAnimationFrame(updateProgress);
    };

    video.addEventListener('loadedmetadata', handleCanPlay);
    video.addEventListener('canplay', handleCanPlay);

    if (video.readyState >= 2) {
      handleCanPlay();
    }

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      video.removeEventListener('loadedmetadata', handleCanPlay);
      video.removeEventListener('canplay', handleCanPlay);
    };
  }, []);

  return (
    <div className="relative h-[100dvh] w-full bg-black overflow-hidden flex flex-col sm:block">
      {/* Video Container */}
      <div className="relative w-full h-auto sm:h-full pt-12 sm:pt-0 shrink-0">
        <video
          ref={videoRef}
          src="/launch1.mp4"
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-auto object-contain sm:h-full sm:object-cover sm:object-center"
        >
          Your browser does not support the video tag.
        </video>
        
        {/* Video progress bar */}
        <div className="absolute bottom-0 left-0 w-full h-[1.5px] bg-white/8 z-20">
          <div
            ref={progressBarRef}
            className="h-full bg-white/40"
            style={{ width: '0%' }}
          />
        </div>
      </div>

      {/* Gradient vignette */}
      <div className="absolute inset-0 pointer-events-none bg-linear-to-t from-black/65 via-black/10 to-transparent" />

      {/* Content Overlay */}
      <div className="relative sm:absolute mt-12 sm:mt-0 sm:bottom-14 left-0 w-full px-6 sm:px-0 sm:left-1/2 sm:-translate-x-1/2 z-10 flex flex-col gap-8 sm:gap-0 sm:items-center">
        
        {/* Mobile Info Text */}
        <div className="flex flex-col sm:hidden" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
          <div className="flex items-baseline gap-3">
            <h1 className="text-[24px] font-medium text-white leading-none tracking-tight">Friday</h1>
            <span className="text-[12px] text-white/50 font-normal">by Numerize.ai</span>
          </div>
          
          <div className="h-px w-full bg-white/10 my-6" />
          
          <p className="text-[14px] leading-[20px] text-white/60 font-normal max-w-[376px]">
            Friday is an AI-powered Command Center for F&B businesses, designed to provide real-time visibility and control across sales, costs, and operations. It sits above existing systems and acts as a single operating layer, helping teams identify issues early and make better day-to-day decisions.
          </p>
        </div>

        {/* CTA */}
        <div style={{ fontFamily: 'var(--font-dm-sans)' }}>
          <a
            href="http://34.180.54.148:8080/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center px-5 py-2 text-[12px] font-medium tracking-[0.08em] uppercase rounded-lg text-white/88 border border-white/14 bg-white/7 backdrop-blur-md hover:bg-white/12 hover:border-white/22 hover:text-white active:scale-[0.98] transition-all duration-150 ease-out cursor-pointer whitespace-nowrap select-none"
            style={{ boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.07), 0 2px 16px rgba(0,0,0,0.4)' }}
          >
            Try for free
          </a>
        </div>
      </div>

    </div>
  );
}

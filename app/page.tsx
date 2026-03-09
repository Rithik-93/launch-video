'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

export default function Home() {
  const [activeModal, setActiveModal] = useState<'waitlist' | 'demo' | null>(null);
  const [isModalMounted, setIsModalMounted] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);

  const firstInputRef = useRef<HTMLInputElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const progressBarRef = useRef<HTMLDivElement | null>(null);

  // Shared fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  // Demo-only optional field
  const [referrer, setReferrer] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const isValidEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
  const isFormReady = name.trim().length >= 2 && isValidEmail(email.trim()) && (activeModal !== 'demo' || referrer.trim().length >= 2);

  const resetForm = useCallback(() => {
    setName('');
    setEmail('');
    setReferrer('');
    setSubmitError(null);
    setSubmitSuccess(false);
    setIsSubmitting(false);
  }, []);

  const closeModal = useCallback(() => {
    setIsModalVisible(false);
    window.setTimeout(() => {
      setIsModalMounted(false);
      setActiveModal(null);
    }, 120);
  }, []);

  const openWaitlistModal = useCallback(() => {
    resetForm();
    setActiveModal('waitlist');
    setIsModalMounted(true);
    requestAnimationFrame(() => setIsModalVisible(true));
  }, [resetForm]);

  const openDemoModal = useCallback(() => {
    resetForm();
    setActiveModal('demo');
    setIsModalMounted(true);
    requestAnimationFrame(() => setIsModalVisible(true));
  }, [resetForm]);

  useEffect(() => {
    if (!isModalMounted) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeModal();
    };

    window.addEventListener('keydown', onKeyDown);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.setTimeout(() => firstInputRef.current?.focus(), 60);

    return () => {
      window.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [closeModal, isModalMounted]);

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

  const modalTitle =
    activeModal === 'demo' ? 'Request a demo' : 'Join the waiting list';

  return (
    <div className="relative h-[100dvh] w-full bg-black overflow-hidden">
      {/* Video Container */}
      <div className="relative w-full h-[45dvh] sm:h-full pt-26 sm:pt-0">
        <video
          ref={videoRef}
          src="/launch1.mp4"
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-contain sm:object-cover sm:object-center"
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
      <div className="absolute top-[45dvh] mt-[56px] sm:mt-0 sm:top-auto sm:bottom-14 left-0 w-full px-6 sm:px-0 sm:left-1/2 sm:-translate-x-1/2 z-10 flex flex-col gap-8 sm:gap-0 sm:items-center">
        
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

        {/* CTA group */}
        <div
          className="flex flex-row items-end justify-center gap-5 sm:gap-8 text-center"
          style={{ fontFamily: 'var(--font-dm-sans)' }}
        >
        {/* Early Access Section */}
        <div className="flex flex-col items-center gap-2">
          <p className="text-[9px] sm:text-[10px] uppercase tracking-[0.2em] text-white/65 font-medium select-none">
            Early access
          </p>
          <button
            onClick={openWaitlistModal}
            className="px-4 sm:px-5 py-2 text-[11px] sm:text-[12px] font-semibold tracking-wide rounded-lg border border-white/10 bg-white/6 shadow-[0_0_0_1px_rgba(255,255,255,0.04),0_20px_60px_rgba(0,0,0,0.7)] hover:bg-white/15 hover:border-white/20 active:scale-[0.98] transition-all duration-150 ease-out cursor-pointer text-white whitespace-nowrap"
          >
            Join the waiting list
          </button>
        </div>

        {/* Vertical divider */}
        <div
          className="self-stretch w-px mx-1 rounded-full"
          style={{ background: 'linear-gradient(to bottom, transparent, rgba(255,255,255,0.08) 8%, rgba(255,255,255,0.08) 88%, transparent)' }}
          aria-hidden="true"
        />

        {/* Referral Section */}
        <div className="flex flex-col items-center gap-2">
          <p className="text-[9px] sm:text-[10px] uppercase tracking-[0.2em] text-white/65 font-medium select-none">
            Have a referral?
          </p>
          <button
            onClick={openDemoModal}
            className="px-4 sm:px-5 py-2 text-[11px] sm:text-[12px] font-semibold tracking-wide rounded-lg border border-white/10 bg-white/6 shadow-[0_0_0_1px_rgba(255,255,255,0.04),0_20px_60px_rgba(0,0,0,0.7)] hover:bg-white/15 hover:border-white/20 active:scale-[0.98] transition-all duration-150 ease-out cursor-pointer text-white whitespace-nowrap"
          >
            Request a demo
          </button>
        </div>
      </div>
      </div>

      {/* Modal */}
      {isModalMounted && (
        <div
          className={[
            'fixed inset-0 z-50 flex items-center justify-center p-4',
            'transition-opacity duration-100 ease-out cursor-pointer',
            isModalVisible ? 'opacity-100' : 'opacity-0',
          ].join(' ')}
          onClick={closeModal}
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
        >
          <div className="absolute inset-0 bg-black/65 backdrop-blur-md" aria-hidden="true" />

          <div
            onClick={(e) => e.stopPropagation()}
            className={[
              'relative w-full max-w-sm rounded-2xl',
              'border border-white/10',
              'shadow-[0_32px_96px_rgba(0,0,0,0.85),inset_0_1px_0_rgba(50, 43, 43, 0.09)]',
              'p-5 cursor-default',
              'transition-all duration-100 ease-out will-change-transform',
              isModalVisible
                ? 'translate-y-0 scale-100 opacity-100'
                : 'translate-y-3 scale-[0.98] opacity-0',
            ].join(' ')}
            style={{
              fontFamily: 'var(--font-dm-sans)',
              background: 'linear-gradient(160deg, #151f38 0%, #0c0e18 60%)',
            }}
          >
            {/* Close */}
            <button
              onClick={closeModal}
              className="absolute top-3 right-3 inline-flex h-8 w-8 items-center justify-center rounded-full text-white/35 hover:text-white/75 hover:bg-white/8 transition cursor-pointer text-sm"
              aria-label="Close"
              type="button"
            >
              &#x2715;
            </button>

            {/* Header */}
            <div className="mb-4">
              <h2
                id="modal-title"
                className="text-[15px] font-semibold tracking-tight text-white"
              >
                {modalTitle}
              </h2>
              {activeModal !== 'demo' && (
                <p className="mt-1 text-[11px] text-white/35 tracking-wide">
                  Spots are limited. We select carefully.
                </p>
              )}
            </div>

            {submitSuccess ? (
              <div className="flex flex-col items-center gap-3 py-4 text-center">
                <div className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/8 text-white text-lg">
                  ✓
                </div>
                <div>
                  <p className="text-[15px] font-semibold text-white tracking-tight">
                    {activeModal === 'demo' ? "Request received" : "You're on the list"}
                  </p>
                  <p className="mt-1.5 text-[12px] text-white/45 leading-relaxed">
                    {activeModal === 'demo'
                      ? "We'll be in touch if it's a fit."
                      : "We'll reach out selectively."}
                  </p>
                </div>
              </div>
            ) : (
            <form
              className="flex flex-col gap-3"
              onSubmit={async (e) => {
                e.preventDefault();
                if (isSubmitting || !activeModal) return;

                setSubmitError(null);
                setIsSubmitting(true);

                try {
                  const res = await fetch('/api/waitlist', {
                    method: 'POST',
                    headers: { 'content-type': 'application/json' },
                    body: JSON.stringify({
                      type: activeModal,
                      name,
                      email,
                      ...(activeModal === 'demo' ? { referrer } : {}),
                    }),
                  });

                  const data = (await res.json().catch(() => null)) as
                    | { ok?: boolean; error?: string }
                    | null;

                  if (!res.ok || !data?.ok) {
                    setSubmitError(data?.error ?? 'Something went wrong. Please try again.');
                    return;
                  }

                  setSubmitSuccess(true);
                  window.setTimeout(() => closeModal(), 2200);
                } catch {
                  setSubmitError('Network error. Please try again.');
                } finally {
                  setIsSubmitting(false);
                }
              }}
            >
              {/* Name */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-semibold text-white/45 uppercase tracking-widest">
                  Name
                </label>
                <input
                  ref={firstInputRef}
                  type="text"
                  placeholder="Your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  autoComplete="name"
                  className="w-full px-3.5 py-2.5 rounded-lg bg-white/5 border border-white/8 text-[13px] text-white placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-white/20 focus:border-white/25 transition"
                />
              </div>

              {/* Email */}
              <div className="flex flex-col gap-1.5 pb-5">
                <label className="text-[11px] font-semibold text-white/45 uppercase tracking-widest">
                  Email
                </label>
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  className="w-full px-3.5 py-2.5 rounded-lg bg-white/5 border border-white/8 text-[13px] text-white placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-white/20 focus:border-white/25 transition"
                />
              </div>

              {/* Referrer — demo only, optional */}
              {activeModal === 'demo' && (
                <div className="flex flex-col gap-1 pb-5">
                  <label className="flex items-center gap-2 text-[11px] font-semibold text-white/45 uppercase tracking-widest">
                    Referred by
                    
                  </label>
                  <input
                    type="text"
                    placeholder="Name of the person who referred you"
                    value={referrer}
                    onChange={(e) => setReferrer(e.target.value)}
                    autoComplete="off"
                    className="w-full px-3.5 py-2.5 rounded-lg bg-white/3 border border-white/6 text-[13px] text-white placeholder:text-white/15 focus:outline-none focus:ring-1 focus:ring-white/15 focus:border-white/20 transition"
                  />
                </div>
              )}

              {/* Error */}
              {submitError && (
                <p className="text-[11px] text-red-300/75 px-0.5">{submitError}</p>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={isSubmitting || !isFormReady}
                className={[
                  ' mx-auto py-3 px-10   rounded-lg text-[13px] font-semibold tracking-wide border transition-all duration-200',
                  isSubmitting
                    ? 'opacity-50 cursor-not-allowed bg-white/7 border-white/10 text-white'
                    : isFormReady
                      ? 'bg-white/90 border-white/80 text-black hover:bg-white active:scale-[0.99] cursor-pointer shadow-[0_0_24px_rgba(255,255,255,0.12)]'
                      : 'bg-white/6 border-white/8 text-white/30 cursor-not-allowed',
                ].join(' ')}
              >
                {isSubmitting ? 'Submitting...' : activeModal === 'demo' ? 'Request private demo' : 'Request access'}
              </button>

              {/* <p className="text-center text-[10px] text-white/22 tracking-wide">
                {activeModal === 'demo' ? "We'll be in touch if it's a fit." : "We'll reach out selectively."}
              </p> */}
            </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

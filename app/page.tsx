'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

export default function Home() {
  const [activeModal, setActiveModal] = useState<'waitlist' | 'demo' | null>(null);
  const [isModalMounted, setIsModalMounted] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);

  const firstInputRef = useRef<HTMLInputElement | null>(null);

  // Shared fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  // Demo-only optional field
  const [referrer, setReferrer] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

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

  const modalTitle =
    activeModal === 'demo' ? 'Request a private demo' : 'Join the waiting list';

  return (
    <div className="relative h-screen w-screen bg-black overflow-hidden">
      <video
        src="/launch.mp4"
        autoPlay
        loop
        muted
        className="w-full h-full object-cover"
      >
        Your browser does not support the video tag.
      </video>

      {/* Gradient vignette */}
      <div className="absolute inset-0 pointer-events-none bg-linear-to-t from-black/85 via-black/20 to-transparent" />

      {/* CTA group */}
      <div
        className="absolute bottom-14 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-4 text-center"
        style={{ fontFamily: 'var(--font-dm-sans)' }}
      >
        <p className="text-[11px] uppercase tracking-[0.2em] text-white/35 font-medium select-none">
          Early access
        </p>

        <button
          onClick={openWaitlistModal}
          className="px-7 py-3 text-[13px] font-semibold tracking-wide rounded-lg border border-white/10 shadow-[0_0_0_1px_rgba(255,255,255,0.04),0_20px_60px_rgba(0,0,0,0.7)] hover:bg-white/10 active:scale-[0.98] transition-all duration-150 ease-out cursor-pointer"
          style={{ backgroundColor: 'rgba(255,255,255,0.06)', color: '#fff' }}
        >
          Join the waiting list
        </button>

        <button
          type="button"
          onClick={openDemoModal}
          className="group cursor-pointer flex flex-col items-center gap-0.5"
        >
          <span className="text-[11px] text-white/30 tracking-wide">
            Have a referral?
          </span>
          <span className="inline-flex items-center gap-1 text-[12px] text-white/55 group-hover:text-white/85 transition-colors duration-150">
            <span className="border-b border-white/18 group-hover:border-white/45 transition-colors duration-150 pb-px">
              Request a private demo
            </span>
            <span
              className="inline-block transition-transform duration-150 ease-out group-hover:translate-x-0.5"
              aria-hidden="true"
            >
              &rarr;
            </span>
          </span>
        </button>
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
            <div className="mb-5">
              <h2
                id="modal-title"
                className="text-[15px] font-semibold tracking-tight text-white"
              >
                {modalTitle}
              </h2>
              <p className="mt-1 text-[11px] text-white/35 tracking-wide">
                {activeModal === 'demo'
                  ? 'Referred users get priority review.'
                  : 'Spots are limited. We select carefully.'}
              </p>
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
              <div className="flex flex-col gap-1.5">
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
                <div className="flex flex-col gap-1.5">
                  <label className="flex items-center gap-2 text-[11px] font-semibold text-white/45 uppercase tracking-widest">
                    Referred by
                    <span className="text-[9px] normal-case tracking-normal font-normal text-white/25 border border-white/12 rounded px-1 py-px">
                      optional
                    </span>
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
                disabled={isSubmitting}
                className={[
                  'mt-1 w-full py-3 rounded-lg text-[13px] font-semibold tracking-wide border border-white/10 transition-all duration-150',
                  isSubmitting
                    ? 'opacity-50 cursor-not-allowed'
                    : 'hover:bg-white/12 active:scale-[0.99] cursor-pointer',
                ].join(' ')}
                style={{ backgroundColor: 'rgba(255,255,255,0.07)', color: '#fff' }}
              >
                {isSubmitting ? 'Submitting...' : activeModal === 'demo' ? 'Request private demo' : 'Request access'}
              </button>

              <p className="text-center text-[10px] text-white/22 tracking-wide">
                {activeModal === 'demo' ? "We'll be in touch if it's a fit." : "We'll reach out selectively."}
              </p>
            </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

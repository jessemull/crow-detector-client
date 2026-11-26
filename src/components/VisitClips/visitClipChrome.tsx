'use client';

import React, { useEffect, useRef, useState } from 'react';

export const clipCardClassName =
  'overflow-hidden rounded-[24px] bg-white shadow-[0_12px_40px_-16px_rgba(0,0,0,0.18)]';

export const clipCardMetaClassName =
  'flex items-baseline justify-between gap-3 px-5 py-4 md:px-6 md:py-5';

/** Same type as the Shelter Cam / Feeder Cam blurbs. */
export const statusLineClassName =
  'mx-auto mb-6 max-w-xl text-center font-urbanist text-base font-medium leading-relaxed tracking-[-0.32px] text-cc-ink/70 md:text-lg';

const recordedAtFormat: Intl.DateTimeFormatOptions = {
  weekday: 'long',
  month: 'short',
  day: 'numeric',
  hour: 'numeric',
  minute: '2-digit',
};

/** Browser-local clock. Omitting timeZone is what makes that happen. */
export const formatRecordedAt = (value: string): string => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return date.toLocaleString('en-US', recordedAtFormat);
};

type LazyClipVideoProps = {
  src: string;
  ariaLabel: string;
  /** Load immediately (latest visit) instead of waiting for scroll. */
  eager?: boolean;
  onPlaybackError?: (src: string) => void;
};

export const LazyClipVideo: React.FC<LazyClipVideoProps> = ({
  src,
  ariaLabel,
  eager = false,
  onPlaybackError,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const failureRef = useRef<HTMLParagraphElement>(null);
  const [shouldLoad, setShouldLoad] = useState(eager);
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const failed = failedSrc === src;

  useEffect(() => {
    if (failed) {
      failureRef.current?.focus();
    }
  }, [failed]);

  useEffect(() => {
    if (shouldLoad) {
      return;
    }

    const node = containerRef.current;
    if (!node || typeof IntersectionObserver === 'undefined') {
      setShouldLoad(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setShouldLoad(true);
          observer.disconnect();
        }
      },
      { rootMargin: '240px 0px' }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [shouldLoad]);

  return (
    <div ref={containerRef} className="bg-black">
      {failed ? (
        <p
          ref={failureRef}
          tabIndex={-1}
          role="alert"
          className="flex aspect-video w-full items-center justify-center px-6 text-center text-sm text-white/80"
        >
          This visit can’t be played. It will be replaced on the next refresh.
        </p>
      ) : (
        // Wildlife clips have no speech, so a caption track does not apply.

        <video
          className="aspect-video w-full bg-black"
          controls
          playsInline
          preload="none"
          src={shouldLoad ? src : undefined}
          aria-label={ariaLabel}
          onError={() => {
            setFailedSrc(src);
            onPlaybackError?.(src);
          }}
        >
          Your browser does not support video playback.
        </video>
      )}
    </div>
  );
};

/** Same footprint as a loaded visit card so the list does not jump. */
export const ClipCardSkeleton: React.FC = () => (
  <article className={clipCardClassName} aria-hidden="true">
    <div className="aspect-video w-full animate-pulse bg-black/[0.06] motion-reduce:animate-none" />
    <div className={clipCardMetaClassName}>
      <div className="h-5 w-44 animate-pulse rounded-md bg-black/[0.06] motion-reduce:animate-none md:h-6 md:w-52" />
    </div>
  </article>
);

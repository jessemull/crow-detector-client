'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';

export type PorchClip = {
  name: string;
  recordedAt: string;
  playbackUrl: string;
  expiresAt: string;
};

/** How often to re-fetch while the tab is visible. */
const POLL_INTERVAL_MS = 45_000;

/** Refresh a still-visible clip’s signed URL before CloudFront rejects it. */
const URL_REFRESH_BUFFER_MS = 60_000;

const clipCardClassName =
  'overflow-hidden rounded-[24px] bg-white shadow-[0_12px_40px_-16px_rgba(0,0,0,0.18)]';

const clipCardMetaClassName =
  'flex items-baseline justify-between gap-3 px-5 py-4 md:px-6 md:py-5';

const getApiBaseUrl = (): string =>
  (process.env.NEXT_PUBLIC_API_BASE_URL || '').replace(/\/$/, '');

const formatRecordedAt = (value: string): string => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return date.toLocaleString(undefined, {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
};

const sameClipIdentity = (a: PorchClip, b: PorchClip): boolean =>
  a.name === b.name && a.recordedAt === b.recordedAt;

/**
 * Keep prior signed URLs when the clip set is unchanged so every <video>
 * does not remount and re-download on each poll.
 */
const mergeClipsForPlayback = (
  previous: PorchClip[],
  next: PorchClip[],
  nowMs: number
): PorchClip[] => {
  if (
    previous.length === next.length &&
    previous.every((clip, index) => sameClipIdentity(clip, next[index]))
  ) {
    return previous.map((clip, index) => {
      const expiresAtMs = Date.parse(clip.expiresAt);
      const needsFreshUrl =
        !Number.isFinite(expiresAtMs) ||
        expiresAtMs - nowMs < URL_REFRESH_BUFFER_MS;
      return needsFreshUrl ? next[index] : clip;
    });
  }

  return next;
};

type LazyClipVideoProps = {
  src: string;
  ariaLabel: string;
  /** Load immediately (latest visit) instead of waiting for scroll. */
  eager?: boolean;
};

const LazyClipVideo: React.FC<LazyClipVideoProps> = ({
  src,
  ariaLabel,
  eager = false,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [shouldLoad, setShouldLoad] = useState(eager);

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
      <video
        key={src}
        className="aspect-video w-full bg-black"
        controls
        playsInline
        preload="none"
        src={shouldLoad ? src : undefined}
        aria-label={ariaLabel}
      >
        Your browser does not support video playback.
      </video>
    </div>
  );
};

/** Same footprint as a loaded visit card so the list does not jump. */
const ClipCardSkeleton: React.FC = () => (
  <article className={clipCardClassName} aria-hidden="true">
    <div className="aspect-video w-full animate-pulse bg-black/[0.06]" />
    <div className={clipCardMetaClassName}>
      <div className="h-5 w-44 animate-pulse rounded-md bg-black/[0.06] md:h-6 md:w-52" />
    </div>
  </article>
);

const PorchClips: React.FC = () => {
  const [clips, setClips] = useState<PorchClip[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  /** Background poll failed while an older list is still on screen. */
  const [refreshWarning, setRefreshWarning] = useState<string | null>(null);

  const loadClips = useCallback(async (options?: { silent?: boolean }) => {
    const silent = options?.silent ?? false;
    const apiBaseUrl = getApiBaseUrl();
    if (!apiBaseUrl) {
      setError('Shelter Cam is not configured for this build.');
      setClips([]);
      setRefreshWarning(null);
      setLoading(false);
      return;
    }

    if (!silent) {
      setLoading(true);
      setError(null);
      setRefreshWarning(null);
    }

    try {
      const response = await fetch(`${apiBaseUrl}/porch/clips`);
      if (!response.ok) {
        throw new Error(`Could not load visits (${response.status})`);
      }
      const data = (await response.json()) as PorchClip[];
      const next = Array.isArray(data) ? data : [];
      setClips((previous) =>
        silent ? mergeClipsForPlayback(previous, next, Date.now()) : next
      );
      setError(null);
      setRefreshWarning(null);
    } catch (loadError) {
      // Keep the last good list on background polls so the page does not flash empty.
      if (!silent) {
        setClips([]);
        setError(
          loadError instanceof Error
            ? loadError.message
            : 'Could not load Shelter Cam visits'
        );
        setRefreshWarning(null);
      } else {
        setRefreshWarning(
          'Could not refresh visits. Showing the last loaded list.'
        );
      }
    } finally {
      if (!silent) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    const run = (silent: boolean) => {
      if (cancelled) {
        return;
      }
      void loadClips({ silent });
    };

    // Defer the first fetch so setState does not run synchronously inside the effect.
    const initialTimer = window.setTimeout(() => {
      run(false);
    }, 0);

    const intervalId = window.setInterval(() => {
      if (document.visibilityState === 'visible') {
        run(true);
      }
    }, POLL_INTERVAL_MS);

    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        run(true);
      }
    };
    document.addEventListener('visibilitychange', onVisibilityChange);

    return () => {
      cancelled = true;
      window.clearTimeout(initialTimer);
      window.clearInterval(intervalId);
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, [loadClips]);

  const clipCountLabel =
    clips.length === 1 ? '1 visit' : `${clips.length} visits`;

  return (
    <section className="min-h-screen bg-cc-canvas">
      <div className="mx-auto max-w-3xl px-6 pb-16 pt-28 md:px-10 md:pb-24 md:pt-32">
        <div className="mb-10 text-center md:mb-14">
          <h1 className="mb-4 font-urbanist text-4xl font-medium leading-tight tracking-[-0.04em] text-cc-ink md:text-5xl md:leading-[1.05] lg:text-[56px] lg:tracking-[-1.12px]">
            Shelter Cam
          </h1>
          <p className="mx-auto max-w-xl font-urbanist text-base font-medium leading-relaxed tracking-[-0.32px] text-cc-ink/70 md:text-lg">
            Short visits to the heated porch shelter, newest first. The list
            updates on its own. Playback links expire after a few minutes.
          </p>
        </div>

        <p
          className="mb-6 text-center font-urbanist text-sm font-medium tracking-[-0.28px] text-cc-ink/50"
          aria-live="polite"
        >
          {loading ? 'Loading…' : error ? 'Unavailable' : clipCountLabel}
        </p>

        {!loading && !error && refreshWarning ? (
          <p
            className="mb-6 text-center font-urbanist text-sm font-medium tracking-[-0.28px] text-cc-ink/55"
            role="status"
          >
            {refreshWarning}
          </p>
        ) : null}

        {loading ? (
          <div
            className="space-y-8 md:space-y-10"
            role="status"
            aria-label="Loading Shelter Cam"
          >
            <ClipCardSkeleton />
            <ClipCardSkeleton />
          </div>
        ) : null}

        {!loading && error ? (
          <div
            className="rounded-[24px] border border-red-200 bg-white px-5 py-8 text-center shadow-[0_12px_40px_-16px_rgba(0,0,0,0.12)]"
            role="alert"
          >
            <p className="font-urbanist text-sm font-medium text-red-700">
              {error}
            </p>
            <p className="mt-2 font-urbanist text-xs font-medium text-cc-ink/50">
              We will keep trying while this page is open.
            </p>
          </div>
        ) : null}

        {!loading && !error && clips.length === 0 ? (
          <div className="rounded-[24px] border border-dashed border-black/10 bg-white px-5 py-16 text-center shadow-[0_12px_40px_-16px_rgba(0,0,0,0.12)]">
            <p className="font-urbanist text-base font-medium text-cc-ink">
              No visits yet.
            </p>
            <p className="mt-2 font-urbanist text-sm font-medium text-cc-ink/50">
              When someone stops by the shelter, it will show up here.
            </p>
          </div>
        ) : null}

        {!loading && !error && clips.length > 0 ? (
          <ul className="space-y-8 md:space-y-10">
            {clips.map((clip, index) => {
              const recordedLabel = formatRecordedAt(clip.recordedAt);
              return (
                <li key={`${clip.name}-${clip.recordedAt}`}>
                  <article className={clipCardClassName}>
                    <LazyClipVideo
                      src={clip.playbackUrl}
                      ariaLabel={`Shelter visit recorded ${recordedLabel}`}
                      eager={index === 0}
                    />
                    <div className={clipCardMetaClassName}>
                      <h2 className="font-urbanist text-base font-semibold tracking-[-0.32px] text-cc-ink md:text-lg">
                        {recordedLabel}
                      </h2>
                      {index === 0 ? (
                        <span className="rounded-full bg-cc-ink px-2.5 py-0.5 font-urbanist text-[0.65rem] font-medium uppercase tracking-[0.16em] text-white">
                          Latest
                        </span>
                      ) : null}
                    </div>
                  </article>
                </li>
              );
            })}
          </ul>
        ) : null}
      </div>
    </section>
  );
};

export default PorchClips;

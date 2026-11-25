'use client';

import * as Sentry from '@sentry/nextjs';
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

/** Give up on a hung porch request so a later poll can replace it. */
const FETCH_TIMEOUT_MS = 15_000;

const MISSING_API_MESSAGE =
  'Shelter Cam is not configured yet. Visits will show up after the camera service is connected.';

const clipCardClassName =
  'overflow-hidden rounded-[24px] bg-white shadow-[0_12px_40px_-16px_rgba(0,0,0,0.18)]';

const clipCardMetaClassName =
  'flex items-baseline justify-between gap-3 px-5 py-4 md:px-6 md:py-5';

/** Same type as the Shelter Cam blurb. */
const statusLineClassName =
  'mx-auto mb-6 max-w-xl text-center font-urbanist text-base font-medium leading-relaxed tracking-[-0.32px] text-cc-ink/70 md:text-lg';

const getApiBaseUrl = (): string =>
  (process.env.NEXT_PUBLIC_API_BASE_URL || '').replace(/\/$/, '');

const formatRecordedAt = (value: string): string => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return date.toLocaleString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    timeZone: 'UTC',
  });
};

const isHttpsUrl = (value: string): boolean => {
  try {
    return new URL(value).protocol === 'https:';
  } catch {
    return false;
  }
};

const isPorchClip = (value: unknown): value is PorchClip => {
  if (!value || typeof value !== 'object') {
    return false;
  }
  const clip = value as Record<string, unknown>;
  return (
    typeof clip.name === 'string' &&
    clip.name.length > 0 &&
    typeof clip.recordedAt === 'string' &&
    typeof clip.playbackUrl === 'string' &&
    isHttpsUrl(clip.playbackUrl) &&
    typeof clip.expiresAt === 'string'
  );
};

/** Reject anything that is not a list of playable clips. */
const parsePorchClips = (value: unknown): PorchClip[] | null => {
  if (!Array.isArray(value) || !value.every(isPorchClip)) {
    return null;
  }
  return value;
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
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const failed = failedSrc === src;

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
        <p className="flex aspect-video w-full items-center justify-center px-6 text-center text-sm text-white/80">
          This visit can’t be played. It will be replaced on the next refresh.
        </p>
      ) : (
        <video
          className="aspect-video w-full bg-black"
          controls
          playsInline
          preload="none"
          src={shouldLoad ? src : undefined}
          aria-label={ariaLabel}
          onError={() => setFailedSrc(src)}
        >
          Your browser does not support video playback.
        </video>
      )}
    </div>
  );
};

/** Same footprint as a loaded visit card so the list does not jump. */
const ClipCardSkeleton: React.FC = () => (
  <article className={clipCardClassName} aria-hidden="true">
    <div className="aspect-video w-full animate-pulse bg-black/[0.06] motion-reduce:animate-none" />
    <div className={clipCardMetaClassName}>
      <div className="h-5 w-44 animate-pulse rounded-md bg-black/[0.06] motion-reduce:animate-none md:h-6 md:w-52" />
    </div>
  </article>
);

const PorchClips: React.FC = () => {
  const [clips, setClips] = useState<PorchClip[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  /** Background poll failed while an older list is still on screen. */
  const [refreshWarning, setRefreshWarning] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const generationRef = useRef(0);

  const loadClips = useCallback(async (options?: { silent?: boolean }) => {
    const silent = options?.silent ?? false;
    const apiBaseUrl = getApiBaseUrl();
    if (!apiBaseUrl) {
      setError(MISSING_API_MESSAGE);
      setClips([]);
      setRefreshWarning(null);
      setLoading(false);
      return;
    }

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    const generation = generationRef.current + 1;
    generationRef.current = generation;
    const timeoutId = window.setTimeout(
      () => controller.abort(),
      FETCH_TIMEOUT_MS
    );

    if (!silent) {
      setLoading(true);
      setError(null);
      setRefreshWarning(null);
    }

    try {
      const response = await fetch(`${apiBaseUrl}/porch/clips`, {
        cache: 'no-store',
        signal: controller.signal,
      });
      if (generation !== generationRef.current) {
        return;
      }
      if (!response.ok) {
        throw new Error('Could not load visits');
      }
      const next = parsePorchClips(await response.json());
      if (generation !== generationRef.current) {
        return;
      }
      if (!next) {
        throw new Error('Porch clips response had an unexpected shape');
      }
      setClips((previous) =>
        silent ? mergeClipsForPlayback(previous, next, Date.now()) : next
      );
      setError(null);
      setRefreshWarning(null);
    } catch (error) {
      if (generation !== generationRef.current) {
        return;
      }
      if (error instanceof DOMException && error.name === 'AbortError') {
        return;
      }
      Sentry.captureException(error);
      // Keep the last good list on background polls so the page does not flash empty.
      if (!silent) {
        setClips([]);
        setError("Can't load visits right now.");
        setRefreshWarning(null);
      } else {
        setRefreshWarning(
          'Could not refresh visits. Showing the last loaded list.'
        );
      }
    } finally {
      window.clearTimeout(timeoutId);
      if (!silent && generation === generationRef.current) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    const run = (silent: boolean) => {
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
      window.clearTimeout(initialTimer);
      window.clearInterval(intervalId);
      document.removeEventListener('visibilitychange', onVisibilityChange);
      abortRef.current?.abort();
    };
  }, [loadClips]);

  const clipCountLabel =
    clips.length === 1 ? '1 visit' : `${clips.length} visits`;
  const hasCards = loading || (!error && clips.length > 0);

  return (
    <section className="min-h-screen bg-cc-canvas">
      <div className="mx-auto max-w-3xl px-6 pb-16 pt-28 md:px-10 md:pb-24 md:pt-32">
        <div className={`text-center ${hasCards ? 'mb-10 md:mb-14' : 'mb-4'}`}>
          <h1 className="mb-4 font-urbanist text-4xl font-medium leading-tight tracking-[-0.04em] text-cc-ink md:text-5xl md:leading-[1.05] lg:text-[56px] lg:tracking-[-1.12px]">
            Shelter Cam
          </h1>
          <p className="mx-auto max-w-xl font-urbanist text-base font-medium leading-relaxed tracking-[-0.32px] text-cc-ink/70 md:text-lg">
            Short visits to the heated porch shelter, newest first. The list
            updates on its own. Playback links expire after a few minutes.
          </p>
        </div>

        <p className={statusLineClassName} aria-live="polite">
          {loading
            ? 'Loading…'
            : error
              ? error
              : clips.length === 0
                ? 'No visits yet.'
                : clipCountLabel}
          {!loading && !error && refreshWarning ? ` ${refreshWarning}` : ''}
        </p>

        {loading ? (
          <div className="space-y-8 md:space-y-10" aria-hidden="true">
            <ClipCardSkeleton />
            <ClipCardSkeleton />
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

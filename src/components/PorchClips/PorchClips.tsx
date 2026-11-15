'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { PageShell } from '@components/PageShell';

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
    <div
      ref={containerRef}
      className="overflow-hidden rounded-2xl border border-white/10 bg-black shadow-[0_20px_50px_-28px_rgba(0,0,0,0.85)]"
    >
      <video
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

const PorchClips: React.FC = () => {
  const [clips, setClips] = useState<PorchClip[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const loadClips = useCallback(async (options?: { silent?: boolean }) => {
    const silent = options?.silent ?? false;
    const apiBaseUrl = getApiBaseUrl();
    if (!apiBaseUrl) {
      setError('Shelter Cam is not configured for this build.');
      setClips([]);
      setLoading(false);
      return;
    }

    if (!silent) {
      setLoading(true);
      setError(null);
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
    } catch (loadError) {
      // Keep the last good list on background polls so the page does not flash empty.
      if (!silent) {
        setClips([]);
        setError(
          loadError instanceof Error
            ? loadError.message
            : 'Could not load Shelter Cam visits'
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
    <PageShell>
      <div className="mx-auto max-w-3xl">
        <div className="mb-8 text-center md:mb-10">
          <p className="mb-2 text-[0.65rem] font-medium uppercase tracking-[0.35em] text-cc-amber/80 md:text-xs">
            Critter Canteen
          </p>
          <h1 className="mb-3 text-xl font-light tracking-wide text-cc-amber md:text-2xl lg:text-4xl">
            Shelter Cam
          </h1>
          <p className="mx-auto max-w-xl text-xs font-light leading-relaxed text-cc-cream-muted md:text-sm">
            A heated little house on the porch for any animal that stops by.
            Short visits, newest first. The list updates on its own; playback
            links expire after a few minutes.
          </p>
        </div>

        <p className="mb-6 text-xs text-stone-400" aria-live="polite">
          {loading ? 'Loading…' : error ? 'Unavailable' : clipCountLabel}
        </p>

        {loading ? (
          <div
            className="flex min-h-[12rem] items-center justify-center rounded-2xl border border-dashed border-white/15 bg-stone-950/50"
            role="status"
          >
            <p className="text-sm text-stone-400">Loading Shelter Cam…</p>
          </div>
        ) : null}

        {error ? (
          <div
            className="rounded-2xl border border-red-900/60 bg-red-950/30 px-5 py-8 text-center"
            role="alert"
          >
            <p className="text-sm text-red-200">{error}</p>
            <p className="mt-2 text-xs text-stone-400">
              We will keep trying while this page is open.
            </p>
          </div>
        ) : null}

        {!loading && !error && clips.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/15 bg-stone-950/50 px-5 py-16 text-center">
            <p className="text-base font-light text-cc-cream">No visits yet.</p>
            <p className="mt-2 text-xs text-stone-500">
              When someone stops by the shelter, it will show up here.
            </p>
          </div>
        ) : null}

        {!loading && !error && clips.length > 0 ? (
          <ul className="space-y-10">
            {clips.map((clip, index) => {
              const recordedLabel = formatRecordedAt(clip.recordedAt);
              return (
                <li key={`${clip.name}-${clip.recordedAt}`}>
                  <article>
                    <div className="mb-3 flex items-baseline justify-between gap-3">
                      <h2 className="text-sm font-medium tracking-wide text-cc-amber md:text-base">
                        {recordedLabel}
                      </h2>
                      {index === 0 ? (
                        <span className="rounded-full border border-white/15 bg-white/5 px-2.5 py-0.5 text-[0.65rem] uppercase tracking-[0.2em] text-stone-400">
                          Latest
                        </span>
                      ) : null}
                    </div>
                    <LazyClipVideo
                      src={clip.playbackUrl}
                      ariaLabel={`Shelter visit recorded ${recordedLabel}`}
                      eager={index === 0}
                    />
                  </article>
                </li>
              );
            })}
          </ul>
        ) : null}
      </div>
    </PageShell>
  );
};

export default PorchClips;

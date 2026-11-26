'use client';

import * as Sentry from '@sentry/nextjs';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ClipCardSkeleton,
  LazyClipVideo,
  clipCardClassName,
  clipCardMetaClassName,
  formatRecordedAt,
  statusLineClassName,
} from '@components/VisitClips';
import { isAllowedPlaybackUrl } from '@utils/playbackUrl';

export type PorchClip = {
  name: string;
  recordedAt: string;
  playbackUrl: string;
  expiresAt: string;
};

/** How often to re-fetch while the tab is visible and the last poll succeeded. */
const POLL_INTERVAL_MS = 45_000;

/** Cap the wait after repeated failures so a down API is not polled every 45s. */
const MAX_POLL_INTERVAL_MS = 6 * 60_000;

/** Refresh a still-visible clip’s signed URL before CloudFront rejects it. */
const URL_REFRESH_BUFFER_MS = 60_000;

/** Give up on a hung porch request so a later poll can replace it. */
const FETCH_TIMEOUT_MS = 15_000;

const MISSING_API_MESSAGE =
  'Shelter Cam is not configured yet. Visits will show up after the camera service is connected.';

const getApiBaseUrl = (): string =>
  (process.env.NEXT_PUBLIC_API_BASE_URL || '').replace(/\/$/, '');

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
    isAllowedPlaybackUrl(clip.playbackUrl) &&
    typeof clip.expiresAt === 'string'
  );
};

/** Reject anything that is not a list of playable clips. */
const parsePorchClips = (value: unknown): PorchClip[] | null => {
  if (!Array.isArray(value) || !value.every(isPorchClip)) {
    return null;
  }
  return [...value].sort(
    (a, b) => Date.parse(b.recordedAt) - Date.parse(a.recordedAt)
  );
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
  nowMs: number,
  failedPlaybackUrls: Set<string>
): PorchClip[] => {
  if (
    previous.length === next.length &&
    previous.every((clip, index) => sameClipIdentity(clip, next[index]))
  ) {
    const merged = previous.map((clip, index) => {
      const expiresAtMs = Date.parse(clip.expiresAt);
      const needsFreshUrl =
        !Number.isFinite(expiresAtMs) ||
        expiresAtMs - nowMs < URL_REFRESH_BUFFER_MS ||
        failedPlaybackUrls.has(clip.playbackUrl);
      if (failedPlaybackUrls.has(clip.playbackUrl)) {
        failedPlaybackUrls.delete(clip.playbackUrl);
      }
      return needsFreshUrl ? next[index] : clip;
    });
    if (merged.every((clip, index) => clip === previous[index])) {
      return previous;
    }
    return merged;
  }

  return next;
};

const PorchClips: React.FC = () => {
  const [clips, setClips] = useState<PorchClip[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  /** Background poll failed while an older list is still on screen. */
  const [refreshWarning, setRefreshWarning] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const generationRef = useRef(0);
  const failureStreakRef = useRef(0);
  const failedPlaybackUrlsRef = useRef(new Set<string>());
  const loadedOnceRef = useRef(false);

  const loadClips = useCallback(async (options?: { silent?: boolean }) => {
    const silent = options?.silent ?? false;
    const apiBaseUrl = getApiBaseUrl();
    if (!apiBaseUrl) {
      if (!silent) {
        Sentry.captureException(
          new Error('NEXT_PUBLIC_API_BASE_URL is not set')
        );
      }
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
      () => controller.abort('timeout'),
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
        silent
          ? mergeClipsForPlayback(
              previous,
              next,
              Date.now(),
              failedPlaybackUrlsRef.current
            )
          : next
      );
      loadedOnceRef.current = true;
      setError(null);
      setRefreshWarning(null);
      failureStreakRef.current = 0;
    } catch (error) {
      if (generation !== generationRef.current) {
        return;
      }
      const timedOut = controller.signal.reason === 'timeout';
      if (
        !timedOut &&
        error instanceof DOMException &&
        error.name === 'AbortError'
      ) {
        return;
      }
      failureStreakRef.current += 1;
      if (!timedOut) {
        Sentry.captureException(error);
      }

      // Keep the last good list on background polls so the page does not flash empty.

      if (!silent || !loadedOnceRef.current) {
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

      // Silent refresh can replace the first request. Clear loading for that generation too.

      if (generation === generationRef.current) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    let pollTimer = 0;

    const delayAfter = () => {
      const streak = failureStreakRef.current;
      if (streak === 0) {
        return POLL_INTERVAL_MS;
      }
      return Math.min(
        POLL_INTERVAL_MS * 2 ** (streak - 1),
        MAX_POLL_INTERVAL_MS
      );
    };

    const schedule = () => {
      window.clearTimeout(pollTimer);
      pollTimer = window.setTimeout(() => {
        if (cancelled) {
          return;
        }
        if (document.visibilityState !== 'visible') {
          schedule();
          return;
        }
        void loadClips({ silent: true }).finally(() => {
          if (!cancelled) {
            schedule();
          }
        });
      }, delayAfter());
    };

    // Defer the first fetch so setState does not run synchronously inside the effect.

    let initialSettled = false;
    const initialTimer = window.setTimeout(() => {
      void loadClips({ silent: false }).finally(() => {
        initialSettled = true;
        if (!cancelled) {
          schedule();
        }
      });
    }, 0);

    const onVisibilityChange = () => {
      if (
        !initialSettled ||
        document.visibilityState !== 'visible' ||
        cancelled
      ) {
        return;
      }
      window.clearTimeout(pollTimer);
      void loadClips({ silent: true }).finally(() => {
        if (!cancelled) {
          schedule();
        }
      });
    };
    document.addEventListener('visibilitychange', onVisibilityChange);

    return () => {
      cancelled = true;
      generationRef.current += 1;
      window.clearTimeout(initialTimer);
      window.clearTimeout(pollTimer);
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
                      onPlaybackError={(url) => {
                        failedPlaybackUrlsRef.current.add(url);
                      }}
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

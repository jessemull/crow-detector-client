'use client';

import * as Sentry from '@sentry/nextjs';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import FeedButton from '@components/FeedButton/FeedButton';
import {
  ClipCardSkeleton,
  LazyClipVideo,
  clipCardClassName,
  clipCardMetaClassName,
  formatRecordedAt,
  statusLineClassName,
} from '@components/VisitClips';
import { isAllowedPlaybackUrl } from '@utils/playbackUrl';

export type FeederClip = {
  id: string;
  recordedAt: string;
  animalCount: number;
  crowCount: number;
  playbackUrl: string;
  expiresAt: string;
};

export type FeederFeedProof = {
  playbackUrl: string;
  expiresAt: string;
};

export type FeederFeed = {
  id: string;
  fedAt: string;
  proof: FeederFeedProof | null;
  visits: FeederClip[];
};

export type FeederFeedsPayload = {
  feeds: FeederFeed[];
  ungroupedVisits: FeederClip[];
};

/** How often to re-fetch while the tab is visible and the last poll succeeded. */
const POLL_INTERVAL_MS = 45_000;

/** Cap the wait after repeated failures so a down API is not polled every 45s. */
const MAX_POLL_INTERVAL_MS = 6 * 60_000;

/** Refresh a still-visible clip’s signed URL before it expires. */
const URL_REFRESH_BUFFER_MS = 60_000;

/** Give up on a hung feeder request so a later poll can replace it. */
const FETCH_TIMEOUT_MS = 15_000;

const MISSING_API_MESSAGE =
  'Feeder Cam is not configured yet. Visits will show up after the camera service is connected.';

const getApiBaseUrl = (): string =>
  (process.env.NEXT_PUBLIC_API_BASE_URL || '').replace(/\/$/, '');

const isFeederClip = (value: unknown): value is FeederClip => {
  if (!value || typeof value !== 'object') {
    return false;
  }
  const clip = value as Record<string, unknown>;
  return (
    typeof clip.id === 'string' &&
    clip.id.length > 0 &&
    typeof clip.recordedAt === 'string' &&
    typeof clip.animalCount === 'number' &&
    Number.isFinite(clip.animalCount) &&
    typeof clip.crowCount === 'number' &&
    Number.isFinite(clip.crowCount) &&
    typeof clip.playbackUrl === 'string' &&
    isAllowedPlaybackUrl(clip.playbackUrl) &&
    typeof clip.expiresAt === 'string'
  );
};

const isFeederFeedProof = (value: unknown): value is FeederFeedProof => {
  if (!value || typeof value !== 'object') {
    return false;
  }
  const proof = value as Record<string, unknown>;
  return (
    typeof proof.playbackUrl === 'string' &&
    isAllowedPlaybackUrl(proof.playbackUrl) &&
    typeof proof.expiresAt === 'string'
  );
};

const isFeederFeed = (value: unknown): value is FeederFeed => {
  if (!value || typeof value !== 'object') {
    return false;
  }
  const feed = value as Record<string, unknown>;
  return (
    typeof feed.id === 'string' &&
    feed.id.length > 0 &&
    typeof feed.fedAt === 'string' &&
    (feed.proof === null || isFeederFeedProof(feed.proof)) &&
    Array.isArray(feed.visits) &&
    feed.visits.every(isFeederClip)
  );
};

/** Reject anything that is not a feeds payload with playable URLs. */
const parseFeederFeeds = (value: unknown): FeederFeedsPayload | null => {
  if (!value || typeof value !== 'object') {
    return null;
  }
  const payload = value as Record<string, unknown>;
  if (
    !Array.isArray(payload.feeds) ||
    !Array.isArray(payload.ungroupedVisits)
  ) {
    return null;
  }
  if (
    !payload.feeds.every(isFeederFeed) ||
    !payload.ungroupedVisits.every(isFeederClip)
  ) {
    return null;
  }
  return {
    feeds: [...payload.feeds].sort(
      (a, b) => Date.parse(b.fedAt) - Date.parse(a.fedAt)
    ),
    ungroupedVisits: [...payload.ungroupedVisits].sort(
      (a, b) => Date.parse(b.recordedAt) - Date.parse(a.recordedAt)
    ),
  };
};

const sameClipIdentity = (a: FeederClip, b: FeederClip): boolean =>
  a.id === b.id && a.recordedAt === b.recordedAt;

const mergeClipList = (
  previous: FeederClip[],
  next: FeederClip[],
  nowMs: number,
  failedPlaybackUrls: Set<string>
): FeederClip[] => {
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

const mergeProof = (
  previous: FeederFeedProof | null,
  next: FeederFeedProof | null,
  nowMs: number,
  failedPlaybackUrls: Set<string>
): FeederFeedProof | null => {
  if (!previous || !next) {
    return next;
  }
  if (previous.playbackUrl === next.playbackUrl) {
    const expiresAtMs = Date.parse(previous.expiresAt);
    const needsFreshUrl =
      !Number.isFinite(expiresAtMs) ||
      expiresAtMs - nowMs < URL_REFRESH_BUFFER_MS ||
      failedPlaybackUrls.has(previous.playbackUrl);
    if (failedPlaybackUrls.has(previous.playbackUrl)) {
      failedPlaybackUrls.delete(previous.playbackUrl);
    }
    return needsFreshUrl ? next : previous;
  }
  return next;
};

/**
 * Keep prior signed URLs when the feed set is unchanged so every <video>
 * does not remount and re-download on each poll.
 */
const mergeFeedsForPlayback = (
  previous: FeederFeedsPayload,
  next: FeederFeedsPayload,
  nowMs: number,
  failedPlaybackUrls: Set<string>
): FeederFeedsPayload => {
  if (
    previous.feeds.length === next.feeds.length &&
    previous.feeds.every((feed, index) => feed.id === next.feeds[index].id) &&
    previous.ungroupedVisits.length === next.ungroupedVisits.length &&
    previous.ungroupedVisits.every((clip, index) =>
      sameClipIdentity(clip, next.ungroupedVisits[index])
    )
  ) {
    return {
      feeds: previous.feeds.map((feed, index) => ({
        id: feed.id,
        fedAt: next.feeds[index].fedAt,
        proof: mergeProof(
          feed.proof,
          next.feeds[index].proof,
          nowMs,
          failedPlaybackUrls
        ),
        visits: mergeClipList(
          feed.visits,
          next.feeds[index].visits,
          nowMs,
          failedPlaybackUrls
        ),
      })),
      ungroupedVisits: mergeClipList(
        previous.ungroupedVisits,
        next.ungroupedVisits,
        nowMs,
        failedPlaybackUrls
      ),
    };
  }
  return next;
};

const VisitCard: React.FC<{
  clip: FeederClip;
  eager?: boolean;
  badge?: string;
  onPlaybackError: (url: string) => void;
}> = ({ clip, eager = false, badge, onPlaybackError }) => {
  const recordedLabel = formatRecordedAt(clip.recordedAt);
  return (
    <article className={clipCardClassName}>
      <LazyClipVideo
        src={clip.playbackUrl}
        ariaLabel={`Feeder visit recorded ${recordedLabel}`}
        eager={eager}
        onPlaybackError={onPlaybackError}
      />
      <div className={clipCardMetaClassName}>
        <h3 className="font-urbanist text-base font-semibold tracking-[-0.32px] text-cc-ink md:text-lg">
          {recordedLabel}
        </h3>
        {badge ? (
          <span className="rounded-full bg-cc-ink px-2.5 py-0.5 font-urbanist text-[0.65rem] font-medium uppercase tracking-[0.16em] text-white">
            {badge}
          </span>
        ) : null}
      </div>
    </article>
  );
};

const ProofCard: React.FC<{
  proof: FeederFeedProof;
  fedAt: string;
  eager?: boolean;
  onPlaybackError: (url: string) => void;
}> = ({ proof, fedAt, eager = false, onPlaybackError }) => {
  const fedLabel = formatRecordedAt(fedAt);
  return (
    <article className={clipCardClassName}>
      <LazyClipVideo
        src={proof.playbackUrl}
        ariaLabel={`Feed recorded ${fedLabel}`}
        eager={eager}
        onPlaybackError={onPlaybackError}
      />
      <div className={clipCardMetaClassName}>
        <h3 className="font-urbanist text-base font-semibold tracking-[-0.32px] text-cc-ink md:text-lg">
          {fedLabel}
        </h3>
        <span className="rounded-full bg-cc-ink px-2.5 py-0.5 font-urbanist text-[0.65rem] font-medium uppercase tracking-[0.16em] text-white">
          Feed
        </span>
      </div>
    </article>
  );
};

const FeederClips: React.FC = () => {
  const [payload, setPayload] = useState<FeederFeedsPayload>({
    feeds: [],
    ungroupedVisits: [],
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  /** Background poll failed while an older list is still on screen. */
  const [refreshWarning, setRefreshWarning] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const generationRef = useRef(0);
  const failureStreakRef = useRef(0);
  const failedPlaybackUrlsRef = useRef(new Set<string>());
  const loadedOnceRef = useRef(false);

  const loadFeeds = useCallback(async (options?: { silent?: boolean }) => {
    const silent = options?.silent ?? false;
    const apiBaseUrl = getApiBaseUrl();
    if (!apiBaseUrl) {
      if (!silent) {
        Sentry.captureException(
          new Error('NEXT_PUBLIC_API_BASE_URL is not set')
        );
      }
      setError(MISSING_API_MESSAGE);
      setPayload({ feeds: [], ungroupedVisits: [] });
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
      const response = await fetch(`${apiBaseUrl}/feeder/feeds`, {
        cache: 'no-store',
        signal: controller.signal,
      });
      if (generation !== generationRef.current) {
        return;
      }
      if (!response.ok) {
        throw new Error('Could not load feeds');
      }
      const next = parseFeederFeeds(await response.json());
      if (generation !== generationRef.current) {
        return;
      }
      if (!next) {
        throw new Error('Feeder feeds response had an unexpected shape');
      }
      setPayload((previous) =>
        silent
          ? mergeFeedsForPlayback(
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
        setPayload({ feeds: [], ungroupedVisits: [] });
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
        void loadFeeds({ silent: true }).finally(() => {
          if (!cancelled) {
            schedule();
          }
        });
      }, delayAfter());
    };

    // Defer the first fetch so setState does not run synchronously inside the effect.

    let initialSettled = false;
    const initialTimer = window.setTimeout(() => {
      void loadFeeds({ silent: false }).finally(() => {
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
      void loadFeeds({ silent: true }).finally(() => {
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
  }, [loadFeeds]);

  const hasContent =
    payload.feeds.length > 0 || payload.ungroupedVisits.length > 0;
  const statusLabel = loading
    ? 'Loading…'
    : error
      ? error
      : !hasContent
        ? 'No feeds yet.'
        : refreshWarning
          ? refreshWarning
          : null;

  const onPlaybackError = (url: string) => {
    failedPlaybackUrlsRef.current.add(url);
  };

  return (
    <section className="min-h-screen bg-cc-canvas">
      <div className="mx-auto max-w-3xl px-6 pb-16 pt-28 md:px-10 md:pb-24 md:pt-32">
        <div className="mb-10 text-center md:mb-14">
          <h1 className="mb-4 font-urbanist text-4xl font-medium leading-tight tracking-[-0.04em] text-cc-ink md:text-5xl md:leading-[1.05] lg:text-[56px] lg:tracking-[-1.12px]">
            Feeder Cam
          </h1>
          <p className="mx-auto mb-8 max-w-xl font-urbanist text-base font-medium leading-relaxed tracking-[-0.32px] text-cc-ink/70 md:text-lg">
            Press Feed to drop food, watch the clip, then see who showed up
            afterward. The gallery updates on its own.
          </p>
          <div className="mb-8 flex flex-col items-center md:mb-10">
            <FeedButton
              onFeedReady={() => {
                void loadFeeds({ silent: true });
              }}
            />
            {statusLabel ? (
              <p className={`mt-4 ${statusLineClassName}`} aria-live="polite">
                {statusLabel}
              </p>
            ) : null}
          </div>
          <ol className="mx-auto w-fit max-w-xl list-none space-y-4 text-left font-urbanist md:text-base">
            {(
              [
                {
                  title: 'Trigger the Feeder',
                  body: 'Press the button to dispense food.',
                },
                {
                  title: 'Detect Wildlife',
                  body: 'Motion triggers video, image recognition identifies critters.',
                },
                {
                  title: 'Watch the Visitors',
                  body: 'Recorded critter videos appear below.',
                },
              ] as const
            ).map((step, index) => (
              <li key={step.title} className="flex items-start gap-3">
                <span
                  className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-cc-ink font-urbanist text-xs font-semibold text-white md:h-7 md:w-7 md:text-sm"
                  aria-hidden="true"
                >
                  {index + 1}
                </span>
                <div className="min-w-0">
                  <p className="font-semibold tracking-[-0.28px] text-cc-ink">
                    {step.title}
                  </p>
                  <p className="mt-0.5 text-sm font-medium leading-relaxed tracking-[-0.28px] text-cc-ink/70 md:text-base">
                    {step.body}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>

        {loading ? (
          <div className="space-y-8 md:space-y-10" aria-hidden="true">
            <ClipCardSkeleton />
            <ClipCardSkeleton />
          </div>
        ) : null}

        {!loading && !error && hasContent ? (
          <div className="space-y-12 md:space-y-16">
            {payload.feeds.map((feed, feedIndex) => {
              const fedLabel = formatRecordedAt(feed.fedAt);
              return (
                <section
                  key={feed.id}
                  aria-labelledby={`feed-${feed.id}-heading`}
                  className="space-y-6 md:space-y-8"
                >
                  <h2
                    id={`feed-${feed.id}-heading`}
                    className="font-urbanist text-xl font-medium tracking-[-0.04em] text-cc-ink md:text-2xl"
                  >
                    Fed {fedLabel}
                  </h2>
                  <ul className="space-y-8 md:space-y-10">
                    {feed.proof ? (
                      <li key={`${feed.id}-proof`}>
                        <ProofCard
                          proof={feed.proof}
                          fedAt={feed.fedAt}
                          eager={feedIndex === 0}
                          onPlaybackError={onPlaybackError}
                        />
                      </li>
                    ) : null}
                    {feed.visits.map((clip, index) => (
                      <li key={`${clip.id}-${clip.recordedAt}`}>
                        <VisitCard
                          clip={clip}
                          eager={feedIndex === 0 && !feed.proof && index === 0}
                          onPlaybackError={onPlaybackError}
                        />
                      </li>
                    ))}
                  </ul>
                </section>
              );
            })}

            {payload.ungroupedVisits.length > 0 ? (
              <section
                aria-labelledby="ungrouped-visits-heading"
                className="space-y-6 md:space-y-8"
              >
                <h2
                  id="ungrouped-visits-heading"
                  className="font-urbanist text-xl font-medium tracking-[-0.04em] text-cc-ink md:text-2xl"
                >
                  Other visits
                </h2>
                <ul className="space-y-8 md:space-y-10">
                  {payload.ungroupedVisits.map((clip) => (
                    <li key={`${clip.id}-${clip.recordedAt}`}>
                      <VisitCard
                        clip={clip}
                        onPlaybackError={onPlaybackError}
                      />
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}
          </div>
        ) : null}
      </div>
    </section>
  );
};

export default FeederClips;

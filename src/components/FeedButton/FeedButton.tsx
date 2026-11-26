'use client';

import React, { useCallback, useEffect, useState } from 'react';

const getApiBaseUrl = (): string =>
  (process.env.NEXT_PUBLIC_API_BASE_URL || '').replace(/\/$/, '');

type FeederStatus = {
  canFeed: boolean;
  cooldownEndsAt: string | null;
};

type DispenseCreateResponse = {
  id: string;
  status: string;
  cooldownEndsAt?: string;
};

type DispenseStatusResponse = {
  id: string;
  status: string;
  proofClipUrl?: string;
};

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const readJsonBody = async (
  response: Response
): Promise<Record<string, unknown>> => {
  try {
    const body = (await response.json()) as unknown;
    if (body && typeof body === 'object') {
      return body as Record<string, unknown>;
    }
  } catch {
    // Empty or non-JSON body.
  }
  return {};
};

const readErrorMessage = (
  body: Record<string, unknown>,
  fallback: string
): string => {
  if (typeof body.message === 'string' && body.message.trim().length > 0) {
    return body.message;
  }
  return fallback;
};

const parseCooldownEndsAt = (value: unknown): string | null => {
  if (typeof value !== 'string' || value.length === 0) {
    return null;
  }
  const ms = Date.parse(value);
  if (!Number.isFinite(ms)) {
    return null;
  }
  return new Date(ms).toISOString();
};

/** mm:ss remaining until endsAt, or null when elapsed. */
export const formatCountdown = (
  endsAtIso: string,
  nowMs = Date.now()
): string | null => {
  const endsAt = Date.parse(endsAtIso);
  if (!Number.isFinite(endsAt)) {
    return null;
  }
  const remainingMs = endsAt - nowMs;
  if (remainingMs <= 0) {
    return null;
  }
  const totalSeconds = Math.ceil(remainingMs / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

type FeedButtonProps = {
  /** Called after a dispense reaches ready so the gallery can refresh. */
  onFeedReady?: () => void;
};

/**
 * Asks the API for a dispense. The feeder host records a short clip.
 * Lives on Feeder Cam; the home hero only links here.
 */
const FeedButton: React.FC<FeedButtonProps> = ({ onFeedReady }) => {
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [cooldownEndsAt, setCooldownEndsAt] = useState<string | null>(null);
  const [nowMs, setNowMs] = useState(() => Date.now());
  const [statusLoaded, setStatusLoaded] = useState(false);

  const refreshStatus = useCallback(async () => {
    const apiBase = getApiBaseUrl();
    if (!apiBase) {
      setStatusLoaded(true);
      return;
    }
    try {
      const response = await fetch(`${apiBase}/feeder/status`, {
        cache: 'no-store',
      });
      if (!response.ok) {
        return;
      }
      const body = (await response.json()) as FeederStatus;
      if (body.canFeed) {
        setCooldownEndsAt(null);
      } else {
        setCooldownEndsAt(parseCooldownEndsAt(body.cooldownEndsAt));
      }
    } catch {
      // Keep the last known cooldown when status cannot be reached.
    } finally {
      setStatusLoaded(true);
    }
  }, []);

  useEffect(() => {
    // Defer so setState does not run synchronously inside the effect.
    const timer = window.setTimeout(() => {
      void refreshStatus();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [refreshStatus]);

  useEffect(() => {
    if (!cooldownEndsAt) {
      return;
    }
    const tick = window.setInterval(() => {
      const now = Date.now();
      setNowMs(now);
      if (Date.parse(cooldownEndsAt) <= now) {
        setCooldownEndsAt(null);
        void refreshStatus();
      }
    }, 1000);
    return () => window.clearInterval(tick);
  }, [cooldownEndsAt, refreshStatus]);

  const countdown = cooldownEndsAt
    ? formatCountdown(cooldownEndsAt, nowMs)
    : null;
  const coolingDown = countdown !== null;
  const disabled = busy || coolingDown;

  const onClick = async () => {
    const apiBase = getApiBaseUrl();
    if (!apiBase) {
      setMessage('Feeder is not configured.');
      return;
    }
    if (coolingDown) {
      return;
    }
    setBusy(true);
    setMessage(null);
    try {
      const created = await fetch(`${apiBase}/feeder/dispense`, {
        method: 'POST',
      });
      const createdBody = await readJsonBody(created);
      if (!created.ok) {
        const conflictCooldown = parseCooldownEndsAt(
          createdBody.cooldownEndsAt
        );
        if (
          (created.status === 409 || created.status === 400) &&
          conflictCooldown
        ) {
          setCooldownEndsAt(conflictCooldown);
          setNowMs(Date.now());
        }
        setMessage(
          readErrorMessage(
            createdBody,
            created.status === 409 || created.status === 400
              ? 'The feeder was just used. Try again in a few minutes.'
              : 'The feeder could not start.'
          )
        );
        return;
      }
      const body = createdBody as unknown as DispenseCreateResponse;
      if (typeof body.id !== 'string' || body.id.length === 0) {
        setMessage('The feeder could not start.');
        return;
      }
      const createdCooldown = parseCooldownEndsAt(body.cooldownEndsAt);
      if (createdCooldown) {
        setCooldownEndsAt(createdCooldown);
        setNowMs(Date.now());
      }
      const deadline = Date.now() + 60_000;
      while (Date.now() < deadline) {
        await sleep(2000);
        const statusResponse = await fetch(
          `${apiBase}/feeder/dispense/${body.id}`
        );
        if (!statusResponse.ok) {
          continue;
        }
        const status = (await statusResponse.json()) as DispenseStatusResponse;
        if (status.status === 'ready') {
          setMessage('Food dropped. The clip is in the feed below.');
          onFeedReady?.();
          return;
        }
        if (status.status === 'failed') {
          setMessage('The feeder could not record that drop.');
          return;
        }
      }
      setMessage(
        'Still waiting on the camera. Check the feed below in a moment.'
      );
      onFeedReady?.();
    } catch {
      setMessage('The feeder could not be reached.');
    } finally {
      setBusy(false);
    }
  };

  const label = busy
    ? 'Feeding…'
    : coolingDown && countdown
      ? `Feed Again in ${countdown}`
      : 'Feed the Critters';

  return (
    <div className="flex w-full flex-col items-center gap-4">
      <button
        type="button"
        onClick={() => {
          void onClick();
        }}
        disabled={disabled || !statusLoaded}
        className="feed-plunger"
        aria-label={label}
        aria-disabled={disabled || !statusLoaded}
      >
        <span className="feed-plunger__dome" aria-hidden="true">
          <span className="feed-plunger__label">
            {/* Keep width stable across idle / Feeding… / cooldown labels. */}
            <span className="feed-plunger__label-sizer" aria-hidden="true">
              Feed Again in 99:99
            </span>
            <span className="feed-plunger__label-text">{label}</span>
          </span>
        </span>
      </button>
      {message ? (
        <p
          className="max-w-md text-center font-urbanist text-base font-medium text-cc-ink"
          role="status"
        >
          {message}
        </p>
      ) : null}
    </div>
  );
};

export default FeedButton;

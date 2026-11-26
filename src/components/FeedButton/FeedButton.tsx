'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';

const getApiBaseUrl = (): string =>
  (process.env.NEXT_PUBLIC_API_BASE_URL || '').replace(/\/$/, '');

/** Give up on hung feeder status/dispense requests. */
const FETCH_TIMEOUT_MS = 15_000;

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
};

const sleep = (ms: number, signal?: AbortSignal) =>
  new Promise<void>((resolve, reject) => {
    if (signal?.aborted) {
      reject(new DOMException('The operation was aborted.', 'AbortError'));
      return;
    }
    const timer = window.setTimeout(() => resolve(), ms);
    const onAbort = () => {
      window.clearTimeout(timer);
      reject(new DOMException('The operation was aborted.', 'AbortError'));
    };
    signal?.addEventListener('abort', onAbort, { once: true });
  });

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

const parseFeederStatus = (value: unknown): FeederStatus | null => {
  if (!value || typeof value !== 'object') {
    return null;
  }
  const body = value as Record<string, unknown>;
  if (typeof body.canFeed !== 'boolean') {
    return null;
  }
  if (body.cooldownEndsAt !== null && typeof body.cooldownEndsAt !== 'string') {
    return null;
  }
  return {
    canFeed: body.canFeed,
    cooldownEndsAt: parseCooldownEndsAt(body.cooldownEndsAt),
  };
};

const parseDispenseCreate = (
  value: Record<string, unknown>
): DispenseCreateResponse | null => {
  if (typeof value.id !== 'string' || value.id.length === 0) {
    return null;
  }
  return {
    id: value.id,
    status: typeof value.status === 'string' ? value.status : 'requested',
    cooldownEndsAt:
      typeof value.cooldownEndsAt === 'string'
        ? value.cooldownEndsAt
        : undefined,
  };
};

const parseDispenseStatus = (value: unknown): DispenseStatusResponse | null => {
  if (!value || typeof value !== 'object') {
    return null;
  }
  const body = value as Record<string, unknown>;
  if (typeof body.id !== 'string' || typeof body.status !== 'string') {
    return null;
  }
  return { id: body.id, status: body.status };
};

const fetchWithTimeout = async (
  input: string,
  init: RequestInit | undefined,
  timeoutMs: number,
  externalSignal?: AbortSignal
): Promise<Response> => {
  const controller = new AbortController();
  const onExternalAbort = () => controller.abort(externalSignal?.reason);
  if (externalSignal) {
    if (externalSignal.aborted) {
      controller.abort(externalSignal.reason);
    } else {
      externalSignal.addEventListener('abort', onExternalAbort, { once: true });
    }
  }
  const timeoutId = window.setTimeout(
    () => controller.abort('timeout'),
    timeoutMs
  );
  try {
    return await fetch(input, {
      ...init,
      signal: controller.signal,
    });
  } finally {
    window.clearTimeout(timeoutId);
    externalSignal?.removeEventListener('abort', onExternalAbort);
  }
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
  /** True only after a successful /feeder/status parse (fail closed otherwise). */
  const [statusOk, setStatusOk] = useState(false);
  const statusAbortRef = useRef<AbortController | null>(null);
  const dispenseAbortRef = useRef<AbortController | null>(null);

  const refreshStatus = useCallback(async () => {
    const apiBase = getApiBaseUrl();
    if (!apiBase) {
      setStatusOk(false);
      setStatusLoaded(true);
      return;
    }
    statusAbortRef.current?.abort();
    const controller = new AbortController();
    statusAbortRef.current = controller;
    try {
      const response = await fetchWithTimeout(
        `${apiBase}/feeder/status`,
        { cache: 'no-store' },
        FETCH_TIMEOUT_MS,
        controller.signal
      );
      if (!response.ok) {
        setStatusOk(false);
        return;
      }
      const body = parseFeederStatus(await response.json());
      if (!body) {
        setStatusOk(false);
        return;
      }
      if (body.canFeed) {
        setCooldownEndsAt(null);
      } else {
        setCooldownEndsAt(body.cooldownEndsAt);
      }
      setStatusOk(true);
    } catch (error) {
      // Unmount aborts our controller; fetchWithTimeout timeouts do not.
      if (
        error instanceof DOMException &&
        error.name === 'AbortError' &&
        controller.signal.aborted
      ) {
        return;
      }
      // Fail closed: do not enable the plunger without a known status.
      setStatusOk(false);
    } finally {
      if (statusAbortRef.current === controller) {
        setStatusLoaded(true);
      }
    }
  }, []);

  useEffect(() => {
    // Defer so setState does not run synchronously inside the effect.
    const timer = window.setTimeout(() => {
      void refreshStatus();
    }, 0);
    return () => {
      window.clearTimeout(timer);
      statusAbortRef.current?.abort();
      dispenseAbortRef.current?.abort();
    };
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
  const apiConfigured = Boolean(getApiBaseUrl());
  const disabled =
    busy || coolingDown || (apiConfigured && (!statusLoaded || !statusOk));

  const onClick = async () => {
    const apiBase = getApiBaseUrl();
    if (!apiBase) {
      setMessage('Feeder is not configured.');
      return;
    }
    if (coolingDown || !statusOk) {
      return;
    }
    dispenseAbortRef.current?.abort();
    const controller = new AbortController();
    dispenseAbortRef.current = controller;
    setBusy(true);
    setMessage(null);
    try {
      const created = await fetchWithTimeout(
        `${apiBase}/feeder/dispense`,
        { method: 'POST' },
        FETCH_TIMEOUT_MS,
        controller.signal
      );
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
      const body = parseDispenseCreate(createdBody);
      if (!body) {
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
        await sleep(2000, controller.signal);
        const statusResponse = await fetchWithTimeout(
          `${apiBase}/feeder/dispense/${body.id}`,
          undefined,
          FETCH_TIMEOUT_MS,
          controller.signal
        );
        if (!statusResponse.ok) {
          continue;
        }
        const status = parseDispenseStatus(await statusResponse.json());
        if (!status) {
          continue;
        }
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
    } catch (error) {
      // Unmount aborts our controller; fetchWithTimeout timeouts do not.
      if (
        error instanceof DOMException &&
        error.name === 'AbortError' &&
        controller.signal.aborted
      ) {
        return;
      }
      setMessage('The feeder could not be reached.');
    } finally {
      if (dispenseAbortRef.current === controller) {
        setBusy(false);
      }
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
        disabled={disabled}
        className="feed-plunger"
        aria-label={label}
        aria-busy={busy}
        aria-disabled={disabled}
      >
        <span className="feed-plunger__dome" aria-hidden="true">
          <span className="feed-plunger__label">
            {/* Keep width stable across idle / Feeding… / cooldown labels. */}
            <span className="feed-plunger__label-sizer">
              <span className="feed-plunger__spinner" />
              Feed Again in 99:99
            </span>
            <span className="feed-plunger__label-text">
              {busy ? <span className="feed-plunger__spinner" /> : null}
              {label}
            </span>
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

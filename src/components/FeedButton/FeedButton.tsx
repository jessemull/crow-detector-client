'use client';

import React, { useState } from 'react';

const getApiBaseUrl = (): string =>
  (process.env.NEXT_PUBLIC_API_BASE_URL || '').replace(/\/$/, '');

type DispenseResponse = {
  id: string;
  status: string;
  proofClipUrl?: string;
};

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Asks the API for a dispense. The feeder host records a short proof clip.
 * This does not list animal visits.
 */
const FeedButton: React.FC = () => {
  const [message, setMessage] = useState<string | null>(null);
  const [clipUrl, setClipUrl] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const onClick = async () => {
    const apiBase = getApiBaseUrl();
    if (!apiBase) {
      setMessage('Feeder is not configured.');
      return;
    }
    setBusy(true);
    setClipUrl(null);
    setMessage('Asking the feeder…');
    try {
      const created = await fetch(`${apiBase}/feeder/dispense`, {
        method: 'POST',
      });
      if (!created.ok) {
        setMessage(
          created.status === 400
            ? 'The feeder was just used. Try again in a few minutes.'
            : 'The feeder could not start.'
        );
        return;
      }
      const body = (await created.json()) as DispenseResponse;
      const deadline = Date.now() + 60_000;
      while (Date.now() < deadline) {
        await sleep(2000);
        const statusResponse = await fetch(
          `${apiBase}/feeder/dispense/${body.id}`
        );
        if (!statusResponse.ok) {
          continue;
        }
        const status = (await statusResponse.json()) as DispenseResponse;
        if (status.proofClipUrl) {
          setClipUrl(status.proofClipUrl);
          setMessage(null);
          return;
        }
        if (status.status === 'failed') {
          setMessage('The feeder could not record that drop.');
          return;
        }
      }
      setMessage('Still waiting on the camera. Check Feeder Cam in a moment.');
    } catch {
      setMessage('The feeder could not be reached.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex flex-col items-start gap-3">
      <button
        type="button"
        onClick={() => {
          void onClick();
        }}
        disabled={busy}
        className="inline-flex items-center justify-center rounded-full border border-white/35 bg-white/10 px-8 py-3 text-sm font-medium text-cc-cream backdrop-blur-sm transition-colors hover:bg-white/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cc-cream disabled:cursor-wait disabled:opacity-70"
      >
        {busy ? 'Feeding…' : 'Feeder'}
      </button>
      {message ? (
        <p className="max-w-xs text-sm text-cc-cream-muted" role="status">
          {message}
        </p>
      ) : null}
      {clipUrl ? (
        <video
          className="max-w-xs rounded-2xl"
          src={clipUrl}
          controls
          autoPlay
          playsInline
        />
      ) : null}
    </div>
  );
};

export default FeedButton;

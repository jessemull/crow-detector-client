'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { PageShell } from '@components/PageShell';

export type PorchClip = {
  name: string;
  recordedAt: string;
  playbackUrl: string;
  expiresAt: string;
};

const getApiBaseUrl = (): string =>
  (process.env.NEXT_PUBLIC_API_BASE_URL || '').replace(/\/$/, '');

const formatRecordedAt = (value: string): string => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return date.toLocaleString();
};

const PorchClips: React.FC = () => {
  const [clips, setClips] = useState<PorchClip[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const loadClips = useCallback(async () => {
    const apiBaseUrl = getApiBaseUrl();
    if (!apiBaseUrl) {
      setError('Porch clips are not configured for this build.');
      setClips([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${apiBaseUrl}/porch/clips`);
      if (!response.ok) {
        throw new Error(`Could not load clips (${response.status})`);
      }
      const data = (await response.json()) as PorchClip[];
      setClips(Array.isArray(data) ? data : []);
    } catch (loadError) {
      setClips([]);
      setError(
        loadError instanceof Error
          ? loadError.message
          : 'Could not load porch clips'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Defer so the initial fetch does not setState synchronously inside the effect.
    const timer = window.setTimeout(() => {
      void loadClips();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [loadClips]);

  return (
    <PageShell>
      <div className="text-center mb-6 lg:mb-8">
        <h1 className="text-xl md:text-2xl lg:text-4xl font-light text-amber-400 mb-3 tracking-wide">
          Porch Clips
        </h1>
        <p className="text-xs md:text-sm text-white max-w-3xl mx-auto leading-relaxed font-light">
          Short visits recorded by the porch camera. Playback links expire after
          a few minutes — refresh the list when a clip stops playing.
        </p>
      </div>

      <div className="flex justify-center mb-6">
        <button
          type="button"
          onClick={() => void loadClips()}
          className="bg-stone-800 text-amber-400 border border-amber-400 font-medium py-2 px-6 rounded-lg hover:bg-stone-700 focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-amber-400"
        >
          Refresh clips
        </button>
      </div>

      {loading ? (
        <p className="text-center text-sm text-gray-300" role="status">
          Loading porch clips…
        </p>
      ) : null}

      {error ? (
        <p className="text-center text-sm text-red-300" role="alert">
          {error}
        </p>
      ) : null}

      {!loading && !error && clips.length === 0 ? (
        <p className="text-center text-sm text-gray-300">No porch clips yet.</p>
      ) : null}

      <ul className="space-y-8">
        {clips.map((clip) => (
          <li
            key={`${clip.name}-${clip.recordedAt}`}
            className="rounded-lg border border-stone-700 bg-stone-900/60 p-4"
          >
            <div className="mb-3 text-left">
              <h2 className="text-sm font-medium text-amber-400">
                {clip.name}
              </h2>
              <p className="text-xs text-gray-300">
                Recorded {formatRecordedAt(clip.recordedAt)}
              </p>
            </div>
            <video
              className="w-full rounded-md bg-black"
              controls
              playsInline
              preload="metadata"
              src={clip.playbackUrl}
              aria-label={`Porch clip ${clip.name}`}
            >
              Your browser does not support video playback.
            </video>
          </li>
        ))}
      </ul>
    </PageShell>
  );
};

export default PorchClips;

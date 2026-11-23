'use client';

import React, { useEffect, useState } from 'react';

type FeederClip = {
  id: string;
  recordedAt: string;
  animalCount: number;
  crowCount: number;
  playbackUrl: string;
  expiresAt: string;
};

const getApiBaseUrl = (): string =>
  (process.env.NEXT_PUBLIC_API_BASE_URL || '').replace(/\/$/, '');

const FeederClips: React.FC = () => {
  const [clips, setClips] = useState<FeederClip[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);
  const apiBase = getApiBaseUrl();

  useEffect(() => {
    if (!apiBase) {
      return;
    }
    let cancelled = false;
    const load = async () => {
      try {
        const response = await fetch(`${apiBase}/feeder/clips`);
        if (!response.ok) {
          throw new Error('list failed');
        }
        const body = (await response.json()) as FeederClip[];
        if (!cancelled) {
          setClips(body);
          setError(null);
          setLoaded(true);
        }
      } catch {
        if (!cancelled) {
          setError('Feeder Cam could not load.');
          setLoaded(true);
        }
      }
    };
    void load();
    return () => {
      cancelled = true;
    };
  }, [apiBase]);

  return (
    <section className="mx-auto w-full max-w-3xl px-6 py-16">
      <h1 className="mb-3 text-3xl font-light tracking-wide text-cc-ink">
        Feeder Cam
      </h1>
      <p className="mb-8 max-w-xl text-sm leading-relaxed text-cc-ink/70">
        Visits at the feeder. Playback links expire after a few minutes.
      </p>
      {!apiBase ? <p role="status">Feeder Cam is not configured.</p> : null}
      {apiBase && error ? <p role="status">{error}</p> : null}
      {apiBase && loaded && !error && clips.length === 0 ? (
        <p role="status">No feeder visits yet.</p>
      ) : null}
      <ul className="flex flex-col gap-8">
        {clips.map((clip) => (
          <li key={clip.id}>
            <video
              className="w-full rounded-[24px] bg-black"
              src={clip.playbackUrl}
              controls
              playsInline
              preload="none"
            />
          </li>
        ))}
      </ul>
    </section>
  );
};

export default FeederClips;

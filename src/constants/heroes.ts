export type HeroCandidate = {
  id: string;
  src: string;
  objectPosition: string;
  credit: string;
};

export const HERO_CANDIDATES: HeroCandidate[] = [
  {
    id: 'glen',
    src: '/images/hero/glen.jpg',
    objectPosition: '50% 40%',
    credit: 'Glen Carrie',
  },
  {
    id: 'imdad',
    src: '/images/hero/imdad.jpg',
    objectPosition: '50% 50%',
    credit: 'Imdad Jayd',
  },
  {
    id: 'jj',
    src: '/images/hero/jj.jpg',
    objectPosition: '50% 45%',
    credit: 'JJ Shev',
  },
  {
    id: 'luca',
    src: '/images/hero/luca.jpg',
    objectPosition: '50% 50%',
    credit: 'Luca Bravo',
  },
  {
    id: 'markus',
    src: '/images/hero/markus.jpg',
    objectPosition: '50% 40%',
    credit: 'Markus Gempeler',
  },
  {
    id: 'martine',
    src: '/images/hero/martine.jpg',
    objectPosition: '50% 50%',
    credit: 'Martine Mussies',
  },
  {
    id: 'mia',
    src: '/images/hero/mia.jpg',
    objectPosition: '50% 45%',
    credit: 'Mia',
  },
  {
    id: 'narubono',
    src: '/images/hero/narubono.jpg',
    objectPosition: '50% 50%',
    credit: 'Narubono',
  },
  {
    id: 'spencer',
    src: '/images/hero/spencer.jpg',
    objectPosition: '55% 30%',
    credit: 'Spencer Vandermeer',
  },
  {
    id: 'zachary',
    src: '/images/hero/zachary.jpg',
    objectPosition: '50% 45%',
    credit: 'Zachary Kyra-Derksen',
  },
  {
    id: 'zoha',
    src: '/images/hero/zoha.jpg',
    objectPosition: '50% 50%',
    credit: 'Zoha Gohar',
  },
];

/** Default home splash after review; override with ?hero= during local review. */
export const ACTIVE_HERO_ID = 'spencer';

/** Secondary splash for About; own framing from the same set. */
export const ABOUT_IMAGE_ID = 'mia';

const POSITION_PRESETS: Record<string, string> = {
  left: '20% 50%',
  center: '50% 50%',
  right: '80% 50%',
  top: '50% 20%',
  bottom: '50% 80%',
};

export const getHeroById = (id: string): HeroCandidate | undefined =>
  HERO_CANDIDATES.find((hero) => hero.id === id);

export const getHeroByIndex = (index: number): HeroCandidate => {
  const length = HERO_CANDIDATES.length;
  const normalized = ((index % length) + length) % length;
  return HERO_CANDIDATES[normalized];
};

export const getActiveHero = (): HeroCandidate =>
  getHeroById(ACTIVE_HERO_ID) ?? HERO_CANDIDATES[0];

export const getAboutImage = (): HeroCandidate =>
  getHeroById(ABOUT_IMAGE_ID) ?? getActiveHero();

/**
 * Resolve a hero from query-style values: id, numeric index, or "next"/"prev"
 * relative to the active default.
 */
export const resolveHeroQuery = (
  heroParam: string | null | undefined,
  currentId: string = ACTIVE_HERO_ID
): HeroCandidate => {
  if (!heroParam) {
    return getHeroById(currentId) ?? getActiveHero();
  }

  const trimmed = heroParam.trim().toLowerCase();
  if (trimmed === 'next' || trimmed === 'prev') {
    const currentIndex = HERO_CANDIDATES.findIndex((h) => h.id === currentId);
    const base = currentIndex >= 0 ? currentIndex : 0;
    const delta = trimmed === 'next' ? 1 : -1;
    return getHeroByIndex(base + delta);
  }

  const asNumber = Number.parseInt(trimmed, 10);
  if (!Number.isNaN(asNumber) && String(asNumber) === trimmed) {
    return getHeroByIndex(asNumber);
  }

  return getHeroById(trimmed) ?? getActiveHero();
};

/** Map ?pos= presets or `30%_70%` / `30% 70%` into CSS object-position. */
export const resolveObjectPosition = (
  posParam: string | null | undefined,
  fallback: string
): string => {
  if (!posParam) {
    return fallback;
  }

  const trimmed = posParam.trim().toLowerCase();
  if (POSITION_PRESETS[trimmed]) {
    return POSITION_PRESETS[trimmed];
  }

  const normalized = trimmed.replace(/_/g, ' ');
  if (/^\d{1,3}%\s+\d{1,3}%$/.test(normalized)) {
    return normalized;
  }

  return fallback;
};

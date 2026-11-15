export type HeroImage = {
  id: string;
  src: string;
  objectPosition: string;
};

const HERO_IMAGES: Record<string, HeroImage> = {
  spencer: {
    id: 'spencer',
    src: '/images/hero/spencer.jpg',
    objectPosition: '55% 30%',
  },
  narubono: {
    id: 'narubono',
    src: '/images/hero/narubono.jpg',
    objectPosition: '50% 50%',
  },
};

/** Locked home splash. */
export const ACTIVE_HERO_ID = 'spencer';

/** Locked About splash. */
export const ABOUT_IMAGE_ID = 'narubono';

export const getActiveHero = (): HeroImage => HERO_IMAGES[ACTIVE_HERO_ID];

export const getAboutImage = (): HeroImage => HERO_IMAGES[ABOUT_IMAGE_ID];

export type SplashVariant = {
  width: number;
  height: number;
  webp: string;
  jpeg: string;
};

export type HeroImage = {
  id: string;
  /** Desktop / default `object-position` for cover crops. */
  objectPosition: string;
  /**
   * Narrow-viewport cover crop. Landscape heroes need a tighter focal point on
   * phones or the subject rides the edge under `object-cover`.
   */
  objectPositionMobile?: string;
  variants: SplashVariant[];
};

/**
 * Widths encoded ahead of time.
 * Static export leaves `images.unoptimized` on, so the browser must choose among real files.
 */
const HERO_IMAGES = {
  spencer: {
    id: 'spencer',
    objectPosition: '55% 30%',
    variants: [
      {
        width: 640,
        height: 960,
        webp: '/images/hero/spencer-640.webp',
        jpeg: '/images/hero/spencer-640.jpg',
      },
      {
        width: 960,
        height: 1440,
        webp: '/images/hero/spencer-960.webp',
        jpeg: '/images/hero/spencer-960.jpg',
      },
      {
        width: 1280,
        height: 1920,
        webp: '/images/hero/spencer-1280.webp',
        jpeg: '/images/hero/spencer-1280.jpg',
      },
    ],
  },
  narubono: {
    id: 'narubono',
    objectPosition: '50% 50%',
    // Phone cover: pin to upper sky so birds/branches fall under the copy, not through it.
    objectPositionMobile: '48% 8%',
    variants: [
      {
        width: 640,
        height: 427,
        webp: '/images/hero/narubono-640.webp',
        jpeg: '/images/hero/narubono-640.jpg',
      },
      {
        width: 960,
        height: 640,
        webp: '/images/hero/narubono-960.webp',
        jpeg: '/images/hero/narubono-960.jpg',
      },
      {
        width: 1280,
        height: 853,
        webp: '/images/hero/narubono-1280.webp',
        jpeg: '/images/hero/narubono-1280.jpg',
      },
      {
        width: 1920,
        height: 1280,
        webp: '/images/hero/narubono-1920.webp',
        jpeg: '/images/hero/narubono-1920.jpg',
      },
    ],
  },
} satisfies Record<string, HeroImage>;

export const SPLASH_SIZES = '100vw';

/** Locked home splash. */
export const ACTIVE_HERO_ID = 'spencer' satisfies keyof typeof HERO_IMAGES;

/** Locked About splash. */
export const ABOUT_IMAGE_ID = 'narubono' satisfies keyof typeof HERO_IMAGES;

export const getActiveHero = (): HeroImage => HERO_IMAGES[ACTIVE_HERO_ID];

export const getAboutImage = (): HeroImage => HERO_IMAGES[ABOUT_IMAGE_ID];

export const splashSrcSet = (image: HeroImage, kind: 'webp' | 'jpeg'): string =>
  image.variants
    .map((variant) => `${variant[kind]} ${variant.width}w`)
    .join(', ');

export const splashFallback = (image: HeroImage): SplashVariant =>
  image.variants[image.variants.length - 1];

/** True when the request finished and the decoder produced no bitmap. */
export const splashImageMissing = (image: {
  complete: boolean;
  naturalWidth: number;
}): boolean => image.complete && image.naturalWidth === 0;

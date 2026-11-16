import {
  ACTIVE_HERO_ID,
  ABOUT_IMAGE_ID,
  getActiveHero,
  getAboutImage,
  splashFallback,
  splashImageMissing,
  splashSrcSet,
} from './heroes';

describe('heroes', () => {
  it('defaults ACTIVE_HERO_ID to spencer', () => {
    const hero = getActiveHero();
    expect(ACTIVE_HERO_ID).toBe('spencer');
    expect(hero.id).toBe('spencer');
    expect(splashFallback(hero).jpeg).toBe('/images/hero/spencer-1280.jpg');
    expect(splashSrcSet(hero, 'webp')).toContain(
      '/images/hero/spencer-640.webp 640w'
    );
  });

  it('resolves about image separately', () => {
    const aboutImage = getAboutImage();
    expect(ABOUT_IMAGE_ID).toBe('narubono');
    expect(aboutImage.id).toBe('narubono');
    expect(splashFallback(aboutImage).jpeg).toBe(
      '/images/hero/narubono-1920.jpg'
    );
    expect(splashSrcSet(aboutImage, 'webp')).toContain(
      '/images/hero/narubono-1920.webp 1920w'
    );
  });

  it('treats a finished decode with no bitmap as missing', () => {
    expect(splashImageMissing({ complete: true, naturalWidth: 0 })).toBe(true);
    expect(splashImageMissing({ complete: true, naturalWidth: 1280 })).toBe(
      false
    );
    expect(splashImageMissing({ complete: false, naturalWidth: 0 })).toBe(
      false
    );
  });
});

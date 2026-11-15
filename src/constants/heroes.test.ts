import {
  ACTIVE_HERO_ID,
  ABOUT_IMAGE_ID,
  getActiveHero,
  getAboutImage,
} from './heroes';

describe('heroes', () => {
  it('defaults ACTIVE_HERO_ID to spencer', () => {
    expect(ACTIVE_HERO_ID).toBe('spencer');
    expect(getActiveHero().id).toBe('spencer');
    expect(getActiveHero().src).toBe('/images/hero/spencer.jpg');
  });

  it('resolves about image separately', () => {
    expect(ABOUT_IMAGE_ID).toBe('narubono');
    expect(getAboutImage().id).toBe('narubono');
    expect(getAboutImage().src).toBe('/images/hero/narubono.jpg');
  });
});

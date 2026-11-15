import {
  ACTIVE_HERO_ID,
  getActiveHero,
  getAboutImage,
  resolveHeroQuery,
  resolveObjectPosition,
} from './heroes';

describe('heroes', () => {
  it('defaults ACTIVE_HERO_ID to spencer', () => {
    expect(ACTIVE_HERO_ID).toBe('spencer');
    expect(getActiveHero().id).toBe('spencer');
  });

  it('resolves about image separately', () => {
    expect(getAboutImage().id).toBe('mia');
  });

  it('resolves hero by id, index, and next/prev', () => {
    expect(resolveHeroQuery('luca').id).toBe('luca');
    expect(resolveHeroQuery('0').id).toBe('glen');
    expect(resolveHeroQuery('next', 'mia').id).toBe('narubono');
    expect(resolveHeroQuery('prev', 'mia').id).toBe('martine');
  });

  it('falls back to active hero for unknown ids', () => {
    expect(resolveHeroQuery('nope').id).toBe('spencer');
  });

  it('resolves object-position presets and percent pairs', () => {
    expect(resolveObjectPosition('left', '50% 50%')).toBe('20% 50%');
    expect(resolveObjectPosition('30%_70%', '50% 50%')).toBe('30% 70%');
    expect(resolveObjectPosition(null, '40% 60%')).toBe('40% 60%');
    expect(resolveObjectPosition('nonsense', '40% 60%')).toBe('40% 60%');
  });
});

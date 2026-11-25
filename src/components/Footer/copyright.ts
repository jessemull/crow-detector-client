/**
 * Baked by `next.config.ts` at build time so the static HTML and the client
 * render the same year.
 */
export const COPYRIGHT_YEAR = Number(
  process.env.NEXT_PUBLIC_COPYRIGHT_YEAR || '2026'
);

export const copyrightLine = (year: number = COPYRIGHT_YEAR) =>
  `© ${year} Critter Canteen. All rights reserved.`;

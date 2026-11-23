---
name: performance
description: >-
  Protect Critter Canteen Lighthouse thresholds and the static-export payload.
  Use when changing images, bundles, fonts, or Lighthouse config.
---

# Performance

Read `docs/PERFORMANCE.md` and `.lighthouserc.js`.

Thresholds (do not lower them to go green):

| Category                           | Production  | Test        |
| ---------------------------------- | ----------- | ----------- |
| Performance                        | ≥ 0.8 error | ≥ 0.6 warn  |
| Accessibility, SEO, best practices | ≥ 0.9 error | ≥ 0.9 error |

- Merge/deploy can roll back on a Lighthouse failure
- `images.unoptimized: true` — size files in `public/` before adding them
- Keep the first viewport to brand, short copy, and the primary CTA
- Investigate bundle growth with `ENABLE_ANALYZER=true npm run build`
- `@lhci/cli` and direct `lighthouse` stay on the same major (see `docs/DEPENDENCIES.md`)

Verify with `make build`. Run `make lighthouse` when the change can move a category score.

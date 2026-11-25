---
name: performance
description: >-
  Protect Critter Canteen Lighthouse thresholds and the static-export payload.
  Use when changing images, bundles, fonts, or Lighthouse config.
---

# Performance

Read `docs/PERFORMANCE.md` and `.lighthouserc.js`. Review criteria: `docs/review/performance.md` (PERF), plus NET-04, NET-09, INF-05, and DEP-10.

Thresholds (do not lower them to go green):

| Category                           | Production  | Test        |
| ---------------------------------- | ----------- | ----------- |
| Performance                        | ≥ 0.8 error | ≥ 0.6 warn  |
| Accessibility, SEO, best practices | ≥ 0.9 error | ≥ 0.9 error |

- Merge/deploy can roll back on a Lighthouse failure
- `images.unoptimized: true` — size files in `public/` before adding them
- Keep the first viewport to brand, short copy, and the primary CTA
- Investigate bundle growth with `ENABLE_ANALYZER=true npm run build`; the webpack analyzer may not report Turbopack builds, so also compare `out/_next/static` sizes before and after
- Polling and media must not reload unchanged content: PorchClips keeps the previous clip object across polls when the signed URL is still fresh. The video element has no `key`.
- Hashed `/_next/static/` assets can be cached for a year; HTML must be short-lived or invalidated on deploy
- `@lhci/cli` and direct `lighthouse` stay on the same major (see `docs/DEPENDENCIES.md`)

Verify with `make build`. Run `make lighthouse` when the change can move a category score. Inside a review, record each PERF criterion in the ledger.

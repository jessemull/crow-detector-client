# Performance (PERF)

**Review kinds:** pr, repo
**Applies when:** components, images, video, fonts, scripts, dependencies, CSS, `next.config.ts`, cache settings, or `.lighthouserc.js` are in scope.
**Policy:** `docs/PERFORMANCE.md`, `.lighthouserc.js`. **Procedure:** the `performance` skill.
**References:** web.dev Core Web Vitals (LCP, INP, CLS), web.dev image and font guidance.

## How to review

Identify the largest contentful element on each affected page (the hero image on Home and About, the first clip on `/porch`), how it is loaded, and what competes with it. Then check what JavaScript the change adds to the client, what it does on interaction, and whether anything re-renders or reloads on a timer. Lighthouse thresholds are a floor, not the review.

## Criteria

- **PERF-01** (SHOULD) The LCP element is preloaded with the right `type`, `imageSrcSet`, and `sizes`, has explicit dimensions, and uses modern formats with a fallback. Verify: read the `preload()` calls and `<picture>` markup.
- **PERF-02** (SHOULD) Layout does not shift: images, videos, skeletons, and fonts reserve space. Verify: read dimensions and aspect-ratio styles in scope.
- **PERF-03** (SHOULD) Interactions stay responsive: handlers are light and heavy work is deferred. Verify: read each handler and effect triggered by input.
- **PERF-04** (SHOULD) Images in `public/` are sized and compressed for their display size (`images.unoptimized` means nothing resizes them). Verify: `ls -la` the files in scope and compare with display sizes.
- **PERF-05** (SHOULD) Video loads only what is needed: `preload="none"` or `metadata`, lazy loading off screen, and no remount of a playing video on data refresh. Verify: read the video component and its keys.
- **PERF-06** (SHOULD) Fonts load only used weights and subsets with a non-blocking display strategy. Verify: read `next/font` calls.
- **PERF-07** (SHOULD) Third-party and observability code is deferred and sized (GA on idle, Sentry integrations only as needed); new client dependencies are justified. Verify: read the script loading and SDK setup.
- **PERF-08** (SHOULD) The client component boundary stays small; layout-level and static content stays server-rendered. Verify: list `'use client'` files in scope.
- **PERF-09** (SHOULD) Cache headers fit the asset: hashed `/_next/static/` immutable and long-lived, HTML revalidated or invalidated (see INF-05). Verify: read the cache-header steps and policy.
- **PERF-10** (MUST) Lighthouse thresholds are not lowered and Lighthouse runs against a representative build. Verify: read `.lighthouserc.js` and the CI steps.
- **PERF-11** (SHOULD) Polling and timers do not re-render or reload unchanged content. Verify: read the update path for unchanged data.
- **PERF-12** (NICE) Bundle changes are measured when dependencies or large components are added (the webpack analyzer may not work under Turbopack; compare `out/_next/static` sizes instead). Verify: record before and after sizes.

## Automatic-fail signals

- A lowered Lighthouse threshold or a removed performance gate.
- A playing video that reloads on every data refresh.

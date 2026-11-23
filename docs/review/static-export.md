# Next.js 16 static export (NEXT)

**Review kinds:** pr, repo
**Applies when:** anything under `src/app/`, `next.config.ts`, `next-sitemap.config.js`, `src/instrumentation*.ts`, or any import from `next/*` is in scope.
**Policy:** `CONTEXT.md` (Platform & build), `docs/ARCHITECTURE.md`, `AGENTS.md` ("This is NOT the Next.js you know"). **Procedure:** the `static-export` skill.
**References:** the installed docs, `node_modules/next/dist/docs/01-app/02-guides/static-exports.md` and the API reference beside it. Do not rely on memory for Next APIs; this version has breaking changes.

## How to review

For every Next API, file convention, or config option in scope, open the installed doc page and check that it is supported by `output: 'export'` and used as the current version documents it. Build with `make build` and inspect `out/`: every route should exist as an HTML file and match what CloudFront and the proxy serve. Anything computed during render in a server component, and the first render of a client component, is frozen into the HTML at build time; treat that as a correctness question, not a detail.

## Criteria

- **NEXT-01** (MUST) No feature from the installed docs' unsupported list: `cookies()`, `headers()`, draft mode, `rewrites`/`redirects`/`headers` in `next.config`, `proxy.ts`/middleware, Server Actions, ISR or `revalidate`, route handlers that read `Request`, the default image loader, dynamic routes without `generateStaticParams` or with `dynamicParams: true`. Verify: read `static-exports.md#unsupported-features` and search the changed files for each.
- **NEXT-02** (MUST) `make build` emits the expected files: each route as `<route>.html` (no `trailingSlash`), `404.html`, sitemap and robots; new routes are served by both the proxy rewrite and CloudFront (see INF-03). Verify: `make build` and `ls out`.
- **NEXT-03** (SHOULD) `'use client'` appears only where hooks or browser APIs require it; server components do not import client-only modules, and client components do not pull server-only code or large dependencies across the boundary. Verify: read each directive and the import graph of changed components.
- **NEXT-04** (MUST) Build-time evaluation is intended: dates, env reads, and random values in server components or in a client component's first render are frozen into the HTML, and client hydration does not compute a different value (for example the copyright year after New Year). Verify: list render-time `Date`, `Math.random`, and env reads in scope.
- **NEXT-05** (SHOULD) Metadata is correct per page: title, description, canonical, Open Graph, Twitter, and robots; page overrides do not silently drop inherited fields; noindex pages are excluded from the sitemap; the 404 page does not inherit the home canonical. Verify: read each `metadata` export and the built `out/*.html` head and `out/sitemap*.xml`.
- **NEXT-06** (SHOULD) `global-error.tsx` and `not-found.tsx` follow the installed docs: global error renders its own `html` and `body`, imports its own styles and fonts, and handles the retry prop. Verify: read `error.md` and `not-found.md` in the installed docs.
- **NEXT-07** (SHOULD) `next/font` loads only the weights used and its CSS variables are wired into the theme in every root that renders text (layout and global error). Verify: read the font calls and `globals.css` `@theme`.
- **NEXT-08** (SHOULD) `next.config.ts` options are valid for the bundler actually in use (Turbopack is the default in Next 16; webpack-only options such as Sentry's `webpack.treeshake` and the webpack bundle analyzer do nothing under it). Verify: read the installed CLI docs and each option's docs.
- **NEXT-09** (SHOULD) Instrumentation is understood: server `instrumentation.ts` runs only during the build for a static export, so nothing relies on `onRequestError` at runtime. Verify: read `instrumentation.md` in the installed docs.
- **NEXT-10** (SHOULD) Internal navigation uses `next/link`, and prefetch payloads for static export (`.txt` files) are served by CloudFront and the proxy. Verify: search `<a href="/` in scope and check `out/` for payload files.
- **NEXT-11** (SHOULD) Deprecation notices in the installed docs for every Next API touched were read and followed. Verify: record the doc pages read in the evidence.

## Automatic-fail signals

- Any unsupported static-export feature.
- A route that builds but cannot be loaded directly through CloudFront or the proxy.
- A hydration mismatch introduced by render-time values.

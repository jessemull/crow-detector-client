---
name: static-export
description: >-
  Respect Next.js static export constraints for S3/CloudFront hosting. Use when
  changing routes, pages, metadata, next.config.ts, or anything that might need
  a server.
---

# Static Export

Read `docs/ARCHITECTURE.md`. Review criteria: `docs/review/static-export.md` (NEXT), plus INF-03 and INF-05.

This Next.js version differs from older training data. Check behavior in `node_modules/next/dist/docs/` before relying on it (static exports guide, `error.md`, metadata, `next.config` options), and follow deprecation notices.

- `output: 'export'` must keep working; the deployed artifact is `out/`
- No request-time server features: `cookies()`, `headers()`, draft mode, rewrites, redirects, middleware, dynamic route handlers, or ISR
- Server components run at build time. Dates, env reads, and random values in them are frozen into the HTML; client components that read them during render can cause hydration mismatches
- No `trailingSlash`, so routes build to `about.html` and `porch.html`. Direct loads of `/about` rely on a CloudFront rewrite that exists live but not in the template; keep that in mind for any route change (INF-01, INF-03)
- `images.unoptimized: true`: nothing resizes images on request
- Turbopack is the default bundler; webpack-only `next.config.ts` options may do nothing
- Metadata per page: title, description, canonical, Open Graph, and robots; `/porch` is `noindex`

Verify with `make build`, then `ls out/` for `index.html`, `about.html`, `porch.html`, and `404.html`. Inside a review, record each NEXT criterion in the ledger.

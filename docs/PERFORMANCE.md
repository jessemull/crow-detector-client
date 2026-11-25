# Performance

> **AI agents — read this file when:** changing bundles, images, Lighthouse config, or perceived load.

---

## Lighthouse CI thresholds

| Category       | Min                                                            |
| -------------- | -------------------------------------------------------------- |
| Performance    | ≥ 0.8 error (prod); ≥ 0.6 warn (test) — see `.lighthouserc.js` |
| Accessibility  | ≥ 0.9                                                          |
| SEO            | ≥ 0.9                                                          |
| Best practices | ≥ 0.9                                                          |

Merge, deploy, and pull-request Lighthouse runs are blocking. A failed score rolls back a merge or deploy. See `docs/CI_CD.md`.

---

## Practices

- Stay static-export-friendly
- Keep the first viewport lean (brand, short copy, primary CTA)
- `images.unoptimized: true` → size assets in `public/` carefully
- Investigate bundles with `ENABLE_ANALYZER=true npm run build`

---

## Commands

`make build`, `make lighthouse`, `ENABLE_ANALYZER=true npm run build`

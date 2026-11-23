---
name: debugging
description: >-
  Reproduce, isolate, and verify bugs in the Critter Canteen static client
  and local CloudFront proxy. Use when a test, build, proxy, or page fails.
---

# Debugging

Do not blind-patch. Follow reproduce → isolate → fix → verify.

## 1. Reproduce

- Capture the command, URL, and error (`make test`, `make build`, `npm run proxy`, Cypress)
- Prefer a failing Jest test over a one-off console log
- Proxy failures: confirm `CLOUDFRONT_*` in `.env.local` (fail closed; see `docs/SECURITY.md`)

## 2. Isolate

- Route (`src/app`) vs feature component vs hook/util
- Static-export break vs UI bug vs test-only failure
- Dev server (`:3000`) vs signed-cookie proxy (`:8080`) vs deployed CDN

## 3. Fix

- Smallest change that addresses the cause
- Add a regression test that fails without the fix
- Leave unrelated cleanup out of the change

## 4. Verify

```bash
npx jest path/to/relevant.test.tsx
make test
make preflight
```

UI changes: exercise the route in the browser (Home, About, `/porch`), including the empty and error states the change touches.

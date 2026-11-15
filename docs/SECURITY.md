# Security

> **AI agents — read this file when:** handling env vars, proxy/cookies, analytics, or dependencies.

---

## Secrets

- Never commit `.env*`, PEM keys, CloudFront key pairs, or AWS access keys.
- Local proxy signing uses `CLOUDFRONT_*` env vars — **fail closed** on misconfig.
- CI secrets live in GitHub Actions; do not echo them in logs.

---

## Client surface

- Public config only via `NEXT_PUBLIC_*` (e.g. Sentry environment, GA tracking ID, `NEXT_PUBLIC_API_BASE_URL` for porch clips).
- CI bakes the porch API base from repo secrets `NEXT_PUBLIC_API_BASE_URL_DEV` / `NEXT_PUBLIC_API_BASE_URL_PROD` (public URLs, not signing secrets).
- Do not embed private keys or signing material in source or the static bundle.
- Avoid logging tokens, passwords, or full PII to the console in production paths.

---

## CDN & proxy

- Test CDN is cookie-gated; production static assets are world-readable — assume HTML/JS are public.
- `npm run proxy` requires `CLOUDFRONT_DOMAIN` at startup (`process.exit(1)` if missing).
- Signing requires `CLOUDFRONT_DOMAIN`, `CLOUDFRONT_KEY_PAIR_ID`, and either `CLOUDFRONT_PRIVATE_KEY` or `CLOUDFRONT_PRIVATE_KEY_PATH`. Incomplete config must throw — never return `undefined` cookies or proxy to `https://undefined`.
- See `env.example` for the local contract.

---

## Dependencies

- Run `make security` / `npm audit` when adding deps.
- Prefer well-maintained packages; justify new network/auth/analytics SDKs in the PR.
- Do **not** run `npm audit fix --force`.

---

## Sentry & analytics

- Sentry via `@sentry/nextjs` — do not attach secrets to events.
- Google Analytics via `NEXT_PUBLIC_GA_TRACKING_ID` when configured — treat measurement IDs as environment-specific, not secret.

# Analytics

> **AI agents — read this file when:** changing GA, Sentry, or adding telemetry.

---

## Current

- Google Analytics via `NEXT_PUBLIC_GA_TRACKING_ID` in root layout when set
- Sentry via `@sentry/nextjs` (client + build source-map flow)

---

## Rules

- No new analytics vendors without a product/privacy decision
- Keep IDs in env — not hardcoded
- Do not send PII in event parameters
- Do not attach secrets to Sentry events

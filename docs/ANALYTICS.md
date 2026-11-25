# Analytics

> **AI agents — read this file when:** changing GA, Sentry, or adding telemetry.

---

## Current

- Google Analytics in the root layout only when `NEXT_PUBLIC_GA_CONSENT` is `granted` and `NEXT_PUBLIC_GA_TRACKING_ID` matches `G-[A-Z0-9]+`
- Sentry via `@sentry/nextjs` (client + build source-map flow)

---

## Rules

- No new analytics vendors without a product/privacy decision
- Keep IDs in env — not hardcoded
- Do not send PII in event parameters
- Do not attach secrets to Sentry events
- The Google tag has no subresource integrity hash. `gtag/js` is not published with a stable digest, so a hash would break the next Google release. The tag still loads only after consent is granted and the measurement id matches `G-[A-Z0-9]+`.

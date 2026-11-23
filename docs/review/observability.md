# Sentry, analytics, and logging (OBS)

**Review kinds:** pr, repo
**Applies when:** `src/instrumentation*.ts`, `next.config.ts` (Sentry), `scripts/source-maps.js`, `layout.tsx` (Google Analytics), error handling, or logging is in scope.
**Policy:** `docs/ERROR_HANDLING.md`, `docs/ANALYTICS.md`, `docs/SECURITY.md`.
**References:** installed `@sentry/nextjs` docs and types, Google Analytics 4 gtag documentation.

## How to review

For each failure the change can produce, ask whether someone would find out. For each telemetry setting, open the installed SDK types to confirm the option does what the code assumes (for example replay sample rates do nothing without the replay integration). For each piece of data sent to Sentry or GA, ask whether it can contain personal data or signed URLs.

## Criteria

- **OBS-01** (SHOULD) Errors that indicate a malfunction (fetch failures, missing configuration, unexpected shapes) are reported to Sentry even when the UI handles them. Verify: read each `catch` and error branch in scope.
- **OBS-02** (SHOULD) Sentry options are valid for the installed SDK: integrations exist for configured features, sample rates are intended per environment, and environment and release are set. Verify: read `src/instrumentation-client.ts` against the installed types.
- **OBS-03** (MUST) Sentry does not collect personal data or secrets: `sendDefaultPii` stays off, `beforeSend` or equivalent scrubs signed URLs, and replay (if enabled) masks text and media. Verify: read the init options.
- **OBS-04** (SHOULD) Release names cannot become `undefined-<sha>`, and uploaded source maps match the deployed chunks. Verify: read the release construction in workflows and `scripts/source-maps.js`.
- **OBS-05** (SHOULD) Analytics is correct and minimal: page views on client-side navigation, consent considered, no personal data, no deprecated parameters. Verify: read the GA snippet in `layout.tsx`.
- **OBS-06** (SHOULD) Proxy and script logs are actionable: one message per failure, with context and without secrets. Verify: read each log call.
- **OBS-07** (SHOULD) Deploys are traceable: Sentry deploy markers and CI summaries identify what shipped. Verify: read the source-map and deploy steps.
- **OBS-08** (NICE) CDN and site errors are monitored (see INF-10). Verify: search for alarms or monitors.

## Automatic-fail signals

- Personal data or signed URLs sent to a third party.
- A malfunction that is caught, hidden from the user, and never reported.

# Error Handling

> **AI agents — read this file when:** adding error UI, Sentry captures, or catch blocks.

---

## Principles

- Fail visibly for actionable user errors
- Fail safely for configuration mistakes (e.g. proxy signing) — do not silently continue
- Prefer clear UI copy over raw exception strings
- Sentry without secrets attached to events

---

## Layers

- `src/app/global-error.tsx` + Sentry for unexpected client errors
- Proxy: missing `CLOUDFRONT_DOMAIN` exits at startup; signing failures return HTTP 500
- No empty `catch` blocks; no stack traces / tokens / internal payloads in user-facing UI

---

## Loading / empty

Where status UI exists, keep explicit ready/error states rather than blank screens.

# Application security and privacy (SEC)

**Review kinds:** pr, repo
**Applies when:** always. Secrets, injection, and trust-boundary criteria apply to every file type, including docs, tests, and workflows.
**Policy:** `docs/SECURITY.md`, `CONTEXT.md` (Secrets & boundaries), `docs/ANALYTICS.md`. **Procedure:** the `security-scan` skill (runs `make security` and the secret searches).
**References:** OWASP Top 10:2025, OWASP ASVS 5.0 chapter V3 (Web Frontend Security), OWASP cheat sheets for XSS, CSP, and Node.js.

CI/CD security is in [ci-cd.md](ci-cd.md), infrastructure in [infrastructure.md](infrastructure.md), and supply chain in [dependencies.md](dependencies.md).

## How to review

Start from the trust boundaries. Data enters this system from the porch API (clip names, timestamps, signed playback URLs), from the browser URL, from env vars baked in at build time, from workflow inputs, and from third-party scripts (Google Analytics, Sentry). Secrets exist only in the proxy (`CLOUDFRONT_PRIVATE_KEY`), in scripts (`SSH_PRIVATE_KEY_PATH`, Sentry auth token), and in CI secrets. For each changed line, ask whether untrusted data reaches a sink (HTML, URL attributes, shell, redirects, logs) and whether secret material can reach the client bundle, logs, artifacts, or the repo.

Run the secret searches from the `security-scan` skill and record their output. A search is a heuristic; still read every changed file in full.

## Criteria

### Secrets and exposure

- **SEC-01** (MUST) No secrets in source, tests, fixtures, docs, workflows, the lockfile, or built output. Verify: the `security-scan` searches plus reading every changed file; for env changes, search `out/` after `make build`.
- **SEC-02** (MUST) No `.env*` file other than the examples, and no `.pem`, is tracked. Verify: `git ls-files | rg -n '\.pem$|(^|/)\.env(\.|$)'`.
- **SEC-03** (MUST) `NEXT_PUBLIC_*` values are public by design (URLs, Sentry DSN, GA ID) and nothing private is inlined into the client bundle. Verify: list every `NEXT_PUBLIC_` read in scope and its source.
- **SEC-04** (MUST) CloudFront signing stays in `proxy/`; the private key is never logged, returned, written to disk, or exposed to the client. Verify: read every use of `CLOUDFRONT_PRIVATE_KEY*` and the signing error paths.
- **SEC-05** (SHOULD) Production source maps are not publicly served unless intended: `productionBrowserSourceMaps` stays off for the deployed build, and maps from the source-map build are not uploaded to S3. Verify: read `next.config.ts` and the artifact upload order in the workflows.
- **SEC-06** (SHOULD) Logs (console, Sentry breadcrumbs, CI output) do not contain tokens, cookies, keys, key paths, signed URLs, or personal data. Verify: read every log call and logged object in scope.

### Injection and unsafe sinks

- **SEC-07** (MUST) No `dangerouslySetInnerHTML` with non-constant content; inline scripts interpolate only validated build-time constants (for example the GA ID matches `G-[A-Z0-9]+`). Verify: `rg -n "dangerouslySetInnerHTML|<Script|innerHTML"` in scope.
- **SEC-08** (MUST) URLs from data (API `playbackUrl`, any `href` or `src` built from input) are restricted to expected schemes and hosts; `javascript:` and data URLs cannot reach the DOM. Verify: trace each data-derived URL to its sink.
- **SEC-09** (MUST) No open redirects: redirect targets are same-origin paths, and `//host` or absolute URLs from the request are rejected (the proxy's `res.redirect(307, req.originalUrl)` is the known case). Verify: read every `redirect`, `location`, and `window.location` write.
- **SEC-10** (MUST) No `eval`, `new Function`, or script injection from data; dynamically created script tags load only fixed first-party or reviewed third-party URLs. Verify: search for those calls in scope.

### Browser security headers

- **SEC-11** (SHOULD) Security headers exist and match what the page loads (ASVS V3): CSP with `script-src` covering Google Tag Manager and Sentry, `connect-src` covering the porch API, Sentry, and GA, `media-src` covering the video host, `frame-ancestors 'none'`; HSTS; `X-Content-Type-Options: nosniff`; `Referrer-Policy`; `Permissions-Policy`. A static export cannot set headers, so they belong in CloudFront. Any new external host needs a CSP update. Verify: read `SecurityHeadersPolicy` in the CloudFormation template and list new external hosts in scope.
- **SEC-12** (SHOULD) Third-party scripts are justified, loaded with the least privilege available, and use subresource integrity or a documented reason why they cannot. Verify: list every third-party origin in scope.

### Cookies and the proxy

- **SEC-13** (MUST) The signed-cookie policy stays minimal: resource scoped to the dev distribution host, short expiry, `Secure`, correct domain and path; `httpOnly: false` is justified by a real consumer; invalid or expired cookies are handled, not only missing ones. Verify: read `proxy/index.js` cookie options and `proxy/util.js` policy.
- **SEC-14** (SHOULD) The proxy stays local and narrow: fixed upstream target (no host taken from the request, so no SSRF), no CORS wildcard, listens on localhost when intended. Verify: read the `listen` call, the proxy target, and any CORS middleware.

### Privacy

- **SEC-15** (SHOULD) Analytics and telemetry are minimal: GA consent and data minimization are considered, Sentry `sendDefaultPii` stays off, Session Replay (if enabled) masks text and media, and no personal data goes into URLs or events. Verify: read `layout.tsx` GA setup and `src/instrumentation-client.ts`.
- **SEC-16** (SHOULD) Signed playback URLs are not persisted, logged, or sent to analytics or Sentry. Verify: trace `playbackUrl` through the component and error paths.

### Design

- **SEC-17** (MUST) Data crossing a trust boundary (API responses, URL parameters, env, workflow inputs) is validated before use, and no security decision relies on client-side checks. Verify: list each boundary in scope and its validation.
- **SEC-18** (SHOULD) Security-relevant changes (proxy, cookies, env contract, CI secrets, infrastructure) include a regression note and a test or a recorded manual check. Verify: read the PR description and tests.
- **SEC-19** (MUST) No new authentication, LLM SDK, or parallel secret channel without the product approval `CONTEXT.md` requires. Verify: read new dependencies and new env vars.

## Automatic-fail signals

- A secret value, private key, or token anywhere in the tree or built output.
- Untrusted data reaching HTML, a URL attribute, a redirect, or a shell.
- Signing or key material outside `proxy/`.

# Errors and failure modes (ERR)

**Review kinds:** pr, repo
**Applies when:** any code that can fail is in scope: network calls, parsing, env reads, file and process operations, workflows, error pages.
**Policy:** `docs/ERROR_HANDLING.md`, `docs/SECURITY.md` (fail closed). **References:** OWASP Top 10:2025 A10 Mishandling of Exceptional Conditions.

## How to review

List every operation in scope that can fail. For each, answer: what fails, who notices, what the user sees, what gets reported, and what state is left behind. "Fails open" (continues as if things were fine) is the failure mode to look for first; it is a MUST wherever the design says fail closed. Look specifically for silent failures: empty or logging-only `catch` blocks, fallbacks that make a broken configuration look like normal status, and CI steps that mask exit codes.

## Criteria

- **ERR-01** (MUST) Fail closed where documented: the proxy refuses to start, sign, or proxy without `CLOUDFRONT_DOMAIN`, the key pair ID, and the key; it never proxies to `https://undefined` or sets an empty cookie; its health check does not report healthy when signing cannot work. Verify: read `proxy/index.js` and `proxy/util.js` startup and signing branches.
- **ERR-02** (MUST) No swallowed errors: every `catch` handles, reports, or rethrows; an intentional swallow has a comment saying why. Verify: `rg -n "catch" <files in scope>` and read each block.
- **ERR-03** (SHOULD) Configuration errors are distinguishable from normal states (for example a missing API base URL is not shown as "camera offline"). Verify: trace each config-missing branch to the UI or log it produces.
- **ERR-04** (SHOULD) Every async UI has distinct loading, empty, error, and stale-data states, and each is reachable and recoverable. Verify: enumerate the states and how each is entered and left.
- **ERR-05** (SHOULD) Errors shown to users or written to logs do not leak internals: file paths, key paths, tokens, stack traces, signed URLs. Verify: read every message string and logged object.
- **ERR-06** (MUST) Error pages work: `global-error.tsx` is self-contained (Next 16's global error does not load global styles and must render `html` and `body`), `not-found.tsx` renders a real 404, and a failure in one component does not blank the page. Verify: read the files against `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/error.md`.
- **ERR-07** (SHOULD) Retries are bounded and back off; there are no tight loops (for example the proxy redirecting forever when the browser rejects the cookie). Verify: find each retry or redirect and its exit condition.
- **ERR-08** (MUST) Partial failure leaves a consistent state: deploy, backup, rollback, and multi-step scripts either complete or recover, and a failed step triggers the documented recovery. Verify: walk each job's failure at every step and check what runs next.
- **ERR-09** (SHOULD) Promise rejections are handled: async calls from effects, handlers, and top-level scripts have a rejection path. Verify: find each `async` call site and its error path.
- **ERR-10** (SHOULD) Exit codes are honest: scripts exit non-zero on failure, and CI steps do not mask failures with `|| true`, `continue-on-error`, or ignored pipelines without a documented reason. Verify: search for those patterns in scope.

## Automatic-fail signals

- A fail-open path in the proxy or in deploy and rollback.
- A `catch` that discards the error with no comment, report, or user-visible state.
- A destructive step that can run after a failed prerequisite.

# Data fetching and networking (NET)

**Review kinds:** pr, repo
**Applies when:** any `fetch`, media URL, polling loop, external host, API base URL, or CORS assumption is in scope.
**Policy:** `docs/NETWORKING.md`, `docs/ERROR_HANDLING.md`, `docs/SECURITY.md`.
**References:** react.dev "Fetching data with Effects"; MDN `AbortSignal.timeout`, Fetch API, Page Visibility API.

## How to review

For each request, write down: the URL and where its parts come from, the timeout, how it is cancelled, what happens on each failure class (network error, non-2xx, empty body, invalid JSON, wrong shape), how often it repeats, and whether two copies can be in flight at once. For media, write down how long the URL is valid and what happens when it expires during playback.

## Criteria

- **NET-01** (MUST) Every request has a timeout and is aborted when the component unmounts or a newer request supersedes it. Verify: read each `fetch` call for a `signal`.
- **NET-02** (MUST) Status and body are checked: non-2xx, empty body, invalid JSON, and an unexpected shape each produce a distinct, handled outcome. Verify: trace each failure class through the code.
- **NET-03** (MUST) Response data is validated before use (see TS-02); a contract change on the server cannot silently show "no data". Verify: read the parse and validation step.
- **NET-04** (SHOULD) Polling is controlled: a sensible interval, paused while the tab is hidden, no overlapping in-flight requests, backoff after repeated failures, and an immediate refresh when the tab becomes visible. Verify: read the interval, visibility, and in-flight logic.
- **NET-05** (SHOULD) Caching is intended: the `cache` option is set deliberately, expired signed URLs are never reused, and the poll interval plus the refresh buffer is shorter than the URL lifetime. Verify: read constants and the expiry logic.
- **NET-06** (SHOULD) Hosts come from env or constants, never hardcoded; base URLs are normalized and paths joined safely. Verify: search for `http` literals and URL construction in scope.
- **NET-07** (SHOULD) CORS expectations are documented: the API allows the production, test, and local proxy origins, and the credentials mode matches. Verify: read `docs/NETWORKING.md` and the request options; server behavior is VERIFY.
- **NET-08** (SHOULD) Slow and offline networks give the user a clear state, and retries do not spam the server. Verify: walk a request that hangs, then fails.
- **NET-09** (SHOULD) Media loading is deliberate: `preload`, lazy loading, a poster or placeholder, and `onError` handling for expired or failed video URLs. Verify: read each `<video>` and `<img>` with remote sources.
- **NET-10** (SHOULD) New external hosts are added to the CSP plan (SEC-11) and to `docs/NETWORKING.md`. Verify: list new hosts and check both.

## Automatic-fail signals

- A request with no timeout and no cancellation on unmount.
- A wrong response shape rendered as a normal empty state.

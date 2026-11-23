# Proxy and scripts (NODE)

**Review kinds:** pr, repo
**Applies when:** `proxy/`, `scripts/`, `.husky/`, `Makefile`, or any JavaScript or shell file outside `src/` is in scope.
**Policy:** `docs/SECURITY.md`, `docs/NETWORKING.md`, `docs/CI_CD.md`.
**References:** Node.js security best practices, Express security best practices, the installed `http-proxy-middleware` and `httpxy` README and types.

## How to review

These files are not typechecked and have no unit tests, so review them as if nothing else will catch a mistake. For every library call, open the installed package (`node_modules/<pkg>/README.md`, `dist/*.d.ts`) and confirm the option or method exists in this version; unknown options are usually ignored silently (for example `http-proxy-middleware` 4 reads `on: { proxyReq }`, not a top-level `onProxyReq`). For every shell or child-process call, check quoting and argument handling.

## Criteria

- **NODE-01** (MUST) Every library option and method used exists in the installed version and does what the code assumes. Verify: cite the installed type or README line for each.
- **NODE-02** (MUST) Required env vars are validated at startup with a clear message, and missing required values fail closed (see ERR-01). Verify: read the startup block of each entry point.
- **NODE-03** (MUST) Child processes use `execFile` or `spawn` with argument arrays; no shell strings built from input. Verify: search `exec(`, `execSync(`, `spawn(`, `shell:` in scope.
- **NODE-04** (SHOULD) Express middleware order is intended (health check placement, cookie parsing, signing, caching, rewrite, proxy), an error handler exists, `x-powered-by` is disabled, and local-only servers listen on localhost. Verify: read the `app.use` order and `listen` call.
- **NODE-05** (SHOULD) Headers the proxy sets are not overwritten by upstream responses, and path-matching regexes match the path, not the query string. Verify: read each header write and regex.
- **NODE-06** (MUST) Redirects use validated same-origin paths and cannot loop forever. Verify: read each `redirect` and its exit condition.
- **NODE-07** (SHOULD) Shell scripts use `set -euo pipefail`, quote every variable, check required variables, never echo secrets, are safe to re-run, and their globs cover every case they intend (for example `.jpeg` as well as `.jpg`). Verify: read each script line by line.
- **NODE-08** (SHOULD) Scripts call only declared dependencies (no `npx` of a transitive package). Verify: search `npx` in scripts and compare with `package.json`.
- **NODE-09** (SHOULD) Each failure logs once, with context, and without secrets or key paths. Verify: read each `console.*` call.
- **NODE-10** (SHOULD) Exit codes are correct and async errors are handled at the top level. Verify: read each entry point's error path.
- **NODE-11** (SHOULD) Key material is handled safely: PEM newlines normalized when read from env, never written to disk or logs, file paths not leaked. Verify: read every key read and use.
- **NODE-12** (NICE) Legacy scripts are still needed (for example the bastion connect script with no bastion in the stack) or removed. Verify: search references to each script.

## Automatic-fail signals

- An option the installed library does not support, relied on for behavior.
- Shell strings built from input.
- A proxy path that starts or signs with missing configuration.

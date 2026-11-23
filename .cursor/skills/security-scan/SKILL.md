---
name: security-scan
description: >-
  Run a Critter Canteen security review: npm audit via make security, secret
  and CloudFront proxy checks, and a severity-tiered report. Use when the user
  asks for a security scan, security review, or dependency audit.
---

# Security Scan

This is the security review for this repo. Read `docs/SECURITY.md`, `docs/DEPENDENCIES.md`, and `docs/REVIEW.md` before judging findings.

Diff-first on a branch. Scan the tree when the user asks for a repo scan. Record commands you actually ran. Do not claim a runtime check you did not execute.

## Audit

Run:

```bash
make security
```

`make security` is `npm audit --audit-level=high`, and a full `npm audit` if that fails. Exit 0 means no high or critical findings. It does not mean the tree is clean. Read the summary for moderate and low counts.

Rules:

- Do **not** run `npm audit fix --force`
- A high or critical finding with a safe, non-major fix is a **MUST**
- Moderate and low findings are **SHOULD**: name the package, the advisory, and whether a safe fix exists
- Accepted residuals live in `docs/DEPENDENCIES.md`. The current ones are `glob` 13 / `minimatch` 10, pulled in by Jest 30 and by `@sentry/nextjs` 10. The patched releases are `glob` 14.0.2 and `minimatch` 11.0.1, which those ranges cannot reach. `npm audit` suggests Jest 29. Report that as accepted. Do not apply it
- `@lhci/cli` and direct `lighthouse` stay on the same major

## Criteria

Fail the review (**MUST**) when any of these are true:

- A real secret is in source, a workflow, the lockfile, or `out/`: private keys, `AWS_SECRET_ACCESS_KEY` values, CloudFront signing material. `env.example` placeholders are fine. Report the path and line, not the value
- `.env`, `.env.local`, or a PEM is tracked by git
- The proxy starts, signs, or proxies when `CLOUDFRONT_DOMAIN`, `CLOUDFRONT_KEY_PAIR_ID`, or the private key is missing. Missing domain must `process.exit(1)`. Incomplete signing must throw. Never proxy to `https://undefined` or set an empty cookie
- A `NEXT_PUBLIC_*` value carries a private key, auth token, or signing key. Public URLs, Sentry DSN, and GA measurement IDs are not secrets
- CI logs or client `console.*` print cookies, tokens, or private keys
- Unsanitized HTML is injected (`dangerouslySetInnerHTML` of remote or user content)
- A new signing path appears outside `proxy/`

**SHOULD** when:

- The proxy, cookie flags, or env contract change and there is no regression note. This repo has no proxy unit suite; quote the fail-closed branch and say runtime was not executed
- A new network, auth, or analytics dependency lands without a reason
- `package.json` and `package-lock.json` disagree, or a hold in `docs/DEPENDENCIES.md` is silently broken
- Cookie `httpOnly` changes. `httpOnly: false` on the localhost proxy is intentional so Cypress can read the CloudFront cookies. Do not flip it as a drive-by fix

**NICE** when the report only needs a clearer residual note or a renamed check.

## Checks

Run the secret search from the repo root. Skip `node_modules/` and `out/`.

```bash
git grep -nE 'AKIA[0-9A-Z]{16}|BEGIN (RSA |EC )?PRIVATE KEY|AWS_SECRET_ACCESS_KEY=.+' -- ':!env.example' ':!*.md' || true
git ls-files | grep -E '\.pem$|(^|/)\.env(\.|$)' | grep -vE '(^|/)\.env\.example$' || true
```

`git grep` exits 1 when nothing matches. That is a clean result. `env.example` is the placeholder file and is allowed.

Then read, when they are in the diff or this is a full scan:

- `proxy/index.js` and `proxy/util.js` — fail-closed branches
- `env.example` — placeholders only
- `.github/workflows/` — secrets stay in `${{ secrets.* }}` and are not echoed
- `src/` — `NEXT_PUBLIC_` and `dangerouslySetInnerHTML`

## Report

Use `docs/REVIEW.md` tiers. No hedging in MUST or SHOULD. One bullet is one task: `` `path:line` — imperative task ``. Write `(no items)` for an empty section.

1. **Scope** — branch or full tree, files reviewed
2. **Audit** — `make security` result: critical / high / moderate / low, plus accepted residuals
3. **Criteria** — pass or fail for secrets, proxy fail-closed, `NEXT_PUBLIC_*`, logging, dependencies
4. **[MUST]** / **[SHOULD]** / **[NICE TO HAVE]** / **[OUT OF SCOPE]** / **[VERIFY]**
5. **Verification** — commands actually run, and checks not run

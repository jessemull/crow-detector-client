# Contracts and integration (CON)

**Review kinds:** pr, repo
**Applies when:** any export, prop, type, route, env var, file path, selector, log line, or cross-repo interface is added, changed, renamed, or deleted.
**Policy:** `docs/ARCHITECTURE.md`, `docs/NETWORKING.md`, `docs/CI_CD.md`, `docs/SECURITY.md`.

## How to review

Most bugs that need context beyond the diff are broken contracts. For every changed or deleted name, search the whole repository, not only `src/`:

```bash
rg -n "<name>" --hidden -g '!node_modules' -g '!out' -g '!.next' -g '!coverage'
```

Record the search and every hit in the ledger evidence. Read each caller. For contracts that leave the repo (the porch API, AWS resources, secrets), state what the other side expects and mark anything you cannot see as VERIFY.

Contracts in this repo that reviewers must trace:

- `NEXT_PUBLIC_API_BASE_URL`: `PorchClips.tsx`, `.env.example`, workflows (`_DEV`/`_PROD` secrets), `docs/SECURITY.md`, `docs/ARCHITECTURE.md`, `docs/CI_CD.md`.
- Porch API: `GET /porch/clips` returning `{ name, recordedAt, playbackUrl, expiresAt }[]`, newest first; test fixtures; `crow-detector-server`.
- Feeder API: `GET /feeder/feeds` (feeds + ungroupedVisits), `GET /feeder/status`, `POST /feeder/dispense`, `GET /feeder/dispense/:id`; `crow-detector-server`.
- Sentry release and environment strings: workflows, `src/instrumentation-client.ts`, `scripts/source-maps.js`, `env.example`.
- Proxy readiness: `/healthcheck` and the "Proxy server running" log line, used by `wait-on` and `.lighthouserc.js`.
- Signed cookies: cookie names in `proxy/util.js`, `CLOUDFRONT_*` secrets, the key group in CloudFormation, the `CLOUDFRONT_DOMAIN` host versus CloudFront's apex redirect.
- Buckets and backups: CloudFormation names, `env.example`, secrets, the backup key format shared by merge, deploy, and rollback.
- Route lists: Header active routes, Footer hidden routes, `HeroCopyright` pages, metadata canonicals, sitemap, Cypress and Lighthouse URLs.

## Criteria

- **CON-01** (MUST) Every changed or removed export, prop, type, or constant has all its users found and updated. Verify: the repo-wide search above, with hits recorded.
- **CON-02** (MUST) Deleted or renamed files and symbols leave no stale references in imports, tests, Cypress specs, Jest config (paths, coverage ignores), workflows, docs, rule globs, or skills. Verify: search the old name and old path.
- **CON-03** (MUST) The porch API contract holds: field names and types, ordering, endpoint path, and error behavior match the server, and fixtures match the real shape. Verify: read the type, fixtures, and the server contract if available; otherwise VERIFY.
- **CON-04** (MUST) Env var names are identical across code, `env.example`, `.env.example`, workflow `env:` blocks and secret names, and docs. Verify: search each changed or added variable name.
- **CON-05** (SHOULD) Routes and URLs agree across links, Header and Footer route lists, metadata canonicals, the sitemap, Cypress, Lighthouse, and CloudFront aliases. Verify: search the route string and the canonical host.
- **CON-06** (MUST) Sibling paths stay in parity: when one of several similar paths changes (merge.yml vs deploy.yml jobs, HomePage vs About, desktop vs mobile nav, test vs production branches), the others change too or the difference is stated. Verify: list the siblings and compare them.
- **CON-07** (SHOULD) Readiness and log-line contracts used by CI still match (`/healthcheck`, the proxy's startup log, Next's "Ready" output). Verify: search the strings in workflows and `.lighthouserc.js`.
- **CON-08** (SHOULD) Sentry release and environment naming match between the build, the client SDK, and the source-map upload. Verify: compare the three definitions.
- **CON-09** (SHOULD) The signed-cookie contract holds: cookie names, policy resource host, key pair and key group, and the proxied host that CloudFront will not redirect. Verify: read `proxy/util.js`, `proxy/index.js`, the CloudFormation key group, and `env.example`.
- **CON-10** (SHOULD) Test selectors still match changed copy, roles, and structure. Verify: search Cypress and Jest queries for the changed text and roles.
- **CON-11** (SHOULD) Bucket names and the backup key format agree across CloudFormation, workflows, `env.example`, and rollback inputs. Verify: compare the definitions.
- **CON-12** (MUST) Exported types and component props are explicit, and widening or narrowing them does not break callers. Verify: typecheck plus reading each caller of a changed type.

## Automatic-fail signals

- A renamed or deleted symbol, env var, route, or file still referenced anywhere.
- A change applied to one sibling path and silently not the others.

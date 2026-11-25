# CI / CD

> **AI agents — read this file when:** changing workflows, interpreting CI failures, or documenting deploy gates.

---

## Workflows

| Workflow                             | Trigger                               | Role                                                                                                                                                                                                     |
| ------------------------------------ | ------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `.github/workflows/pull-request.yml` | PR → `main`                           | Build, lint, typecheck, unit tests (≥80% via Jest), Cypress + Lighthouse against the static export                                                                                                       |
| `.github/workflows/merge.yml`        | Push → `main`                         | Build, lint, and typecheck start together. Tests need all three. Backup and deploy follow. E2E and Lighthouse need only the deploy. Rollback runs when deploy, E2E, or Lighthouse fails or is cancelled. |
| `.github/workflows/deploy.yml`       | `workflow_dispatch` (test/production) | Manual deploy with same post-deploy e2e/LH rollback pattern                                                                                                                                              |
| `.github/workflows/rollback.yml`     | `workflow_dispatch`                   | Restore named S3 backup + CloudFront invalidate                                                                                                                                                          |

Do **not** rewrite these lightly. Document changes in the PR and treat as human-review required (`docs/GOVERNANCE.md`).

### Quality jobs (PR)

| Job              | Blocking? | Notes                                                                                                                                                              |
| ---------------- | --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Build            | Yes       | Static export; bakes `NEXT_PUBLIC_SENTRY_*` and `NEXT_PUBLIC_API_BASE_URL` from `NEXT_PUBLIC_API_BASE_URL_DEV` only. The PROD secret is used by the manual deploy. |
| Lint             | Yes       | `npm run lint`                                                                                                                                                     |
| Typecheck        | Yes       | `npm run typecheck`                                                                                                                                                |
| Unit tests       | Yes       | Jest + ≥80% coverage (`jest.config` thresholds; authoritative gate)                                                                                                |
| E2E & Lighthouse | Yes       | Cypress and Lighthouse run against the static export served on 127.0.0.1:3000. Lighthouse is blocking.                                                             |

### Merge / deploy

| Job                             | Notes                                                                                                                                                          |
| ------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Build + lint + typecheck + unit | Required before deploy                                                                                                                                         |
| Sentry source maps              | Uploaded on merge/deploy only; release = `${env}-${github.sha}`                                                                                                |
| S3 backup                       | Pre-deploy backup; `backup_dir` job output feeds rollback                                                                                                      |
| Deploy                          | OIDC role, then hashed `/_next/*` before HTML. `aws s3 sync --delete` refuses an empty build and skips `data/*`. Invalidation waits until CloudFront finishes. |
| E2E                             | Via proxy against deployed/test URL; failure triggers S3 rollback                                                                                              |
| Lighthouse                      | Failure triggers S3 rollback on merge/deploy                                                                                                                   |
| Revert                          | Restores a 14-digit backup key through the OIDC role and invalidates CloudFront. Excludes `data/*`. A failed deploy rolls back when the backup succeeded.      |

After that sync, merge and deploy run `scripts/cache-splash-images.sh`. Hero files keep stable names, so the script recopies `images/hero/` onto itself with `Cache-Control: public, max-age=86400`.

Node **26** (`.nvmrc`, `engines.node`, `actions/setup-node`).

---

## Local parity

Husky runs `./scripts/preflight.sh` (lint + typecheck + test + build) on **every `git push`** via `.husky/pre-push`. Agents should run:

```bash
make preflight   # lint + typecheck + test + build
make typecheck
make security    # npm audit. Local only. No workflow runs it.
```

Local preflight and CI both require **typecheck**. Keep both green.

---

## Fail signals

- Skipping hooks with `--no-verify` / `HUSKY=0` without explicit human request
- Weakening coverage or LH assertions to “make CI green”
- Deploying without backup / invalidation steps
- Rollback without a propagated `backup_dir` output, AWS credentials on restore, or `data/*` exclude
- Swallowing Sentry source-map upload failures on merge/deploy

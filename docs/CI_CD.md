# CI / CD

> **AI agents — read this file when:** changing workflows, interpreting CI failures, or documenting deploy gates.

---

## Workflows

| Workflow                             | Trigger                               | Role                                                                                               |
| ------------------------------------ | ------------------------------------- | -------------------------------------------------------------------------------------------------- |
| `.github/workflows/pull-request.yml` | PR → `main`                           | Build, lint, typecheck, unit tests (≥80% via Jest), Cypress + Lighthouse on local `dev`            |
| `.github/workflows/merge.yml`        | Push → `main`                         | Build → lint → typecheck → tests → S3 backup → deploy → E2E → Lighthouse → rollback on E2E/LH fail |
| `.github/workflows/deploy.yml`       | `workflow_dispatch` (test/production) | Manual deploy with same post-deploy e2e/LH rollback pattern                                        |
| `.github/workflows/rollback.yml`     | `workflow_dispatch`                   | Restore named S3 backup + CloudFront invalidate                                                    |

Do **not** rewrite these lightly. Document changes in the PR and treat as human-review required (`docs/GOVERNANCE.md`).

### Quality jobs (PR)

| Job              | Blocking? | Notes                                                                |
| ---------------- | --------- | -------------------------------------------------------------------- |
| Build            | Yes       | Static export; bakes `NEXT_PUBLIC_SENTRY_*` (no source-map upload)   |
| Lint             | Yes       | `npm run lint`                                                       |
| Typecheck        | Yes       | `npm run typecheck`                                                  |
| Unit tests       | Yes       | Jest + ≥80% coverage (`jest.config` thresholds; authoritative gate)  |
| E2E & Lighthouse | Soft LH   | Cypress blocking; **LH may `continue-on-error` on PR** (intentional) |

### Merge / deploy

| Job                             | Notes                                                                        |
| ------------------------------- | ---------------------------------------------------------------------------- |
| Build + lint + typecheck + unit | Required before deploy                                                       |
| Sentry source maps              | Uploaded on merge/deploy only; release = `${env}-${github.sha}`              |
| S3 backup                       | Pre-deploy backup; `backup_dir` job output feeds rollback                    |
| Deploy                          | `aws s3 sync` of `out/` + CloudFront invalidation (`data/*` preserved)       |
| E2E                             | Via proxy against deployed/test URL; failure triggers S3 rollback            |
| Lighthouse                      | Failure triggers S3 rollback on merge/deploy                                 |
| Revert                          | Restores named backup + AWS creds + CloudFront invalidate; excludes `data/*` |

Node **26** (`.nvmrc`, `engines.node`, `actions/setup-node`).

---

## Local parity

Husky runs `./scripts/preflight.sh` (lint + typecheck + test + build) on **every `git push`** via `.husky/pre-push`. Agents should run:

```bash
make preflight   # lint + typecheck + test + build
make typecheck
make security    # npm audit (advisory locally; CI may treat audit as non-blocking)
```

Local preflight and CI both require **typecheck**. Keep both green.

---

## Fail signals

- Skipping hooks with `--no-verify` / `HUSKY=0` without explicit human request
- Weakening coverage or LH assertions to “make CI green”
- Deploying without backup / invalidation steps
- Rollback without a propagated `backup_dir` output, AWS credentials on restore, or `data/*` exclude
- Swallowing Sentry source-map upload failures on merge/deploy

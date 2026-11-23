# Workflows, deploy, and rollback (CI)

**Review kinds:** pr, repo
**Applies when:** any file under `.github/`, any script a workflow runs, or any env var, secret, artifact, or command a workflow depends on is in scope.
**Policy:** `docs/CI_CD.md`, `docs/RELEASES.md`, `docs/SECURITY.md`.
**References:** GitHub Docs "Secure use reference", "Script injections", "Securely using pull_request_target"; GitHub Well-Architected Actions security; OWASP Top 10 CI/CD Security Risks; OWASP Top 10:2025 A03.

## How to review

Read every workflow in scope from top to bottom, job by job, step by step. For each step record: its trigger, what it can read (secrets, tokens, inputs), what it writes (S3, CloudFront, artifacts, Sentry), and what happens if it fails. Then walk the whole pipeline for three failure scenarios: a step fails midway, two runs overlap, and an input or secret is empty or wrong. If `actionlint` or `zizmor` are available, run them and record the output; if not, record that they were not run.

Workflows in this repo: `pull-request.yml` (PR checks), `merge.yml` (push to `main`: build, deploy to the test environment, e2e, Lighthouse, rollback), `deploy.yml` (manual deploy to test or production), `rollback.yml` (manual restore from a backup key).

## Criteria

- **CI-01** (MUST) No expression is interpolated straight into a `run:` script: `${{ inputs.* }}`, `${{ github.event.* }}`, branch names, titles, and similar values pass through `env:` and are quoted. Verify: `rg -n '\$\{\{ *(inputs|github\.event|github\.head_ref)' .github/workflows` and read each hit inside `run:`.
- **CI-02** (SHOULD) Every job declares least-privilege `permissions:` (default `contents: read`), set per job rather than once for the workflow. Verify: `rg -n "permissions:" .github/workflows`.
- **CI-03** (SHOULD) Actions are pinned to full commit SHAs with the version in a comment; third-party actions that receive secrets are maintained and justified, or replaced with the AWS CLI. Verify: `rg -n "uses:" .github/workflows`.
- **CI-04** (MUST) No `pull_request_target` workflow checks out or runs pull request code, and fork PRs cannot reach secrets. Verify: search triggers and checkout `ref:` values.
- **CI-05** (SHOULD) Cloud credentials come from OIDC roles scoped per environment; long-lived keys, if still used, are separate per environment and least privilege. Verify: search `aws-access-key-id`, `AWS_ACCESS_KEY_ID`, `role-to-assume`, `id-token`.
- **CI-06** (MUST) Environment selection cannot fall through to production: `cond && secrets.X_DEV || secrets.X_PROD` silently picks production when the dev value is empty, so it is forbidden for buckets, distributions, and credentials; production jobs use `environment:` with protection rules. Verify: search `&& secrets.` and read each expression.
- **CI-07** (MUST) Destructive operations are guarded: every `s3 sync --delete` has a validated, non-empty source (checked before running), inputs such as backup keys are validated for format and existence, and the backup is confirmed complete before the deploy deletes anything. Verify: read each `--delete` step and the steps before it.
- **CI-08** (MUST) Rollback runs on every failure after the live site changed (partial S3 sync, invalidation failure, e2e failure, Lighthouse failure), not only when later jobs fail, and rollback itself is validated. Verify: read job `needs:` and `if:` conditions and walk a failure in each job.
- **CI-09** (SHOULD) Deploy and rollback runs cannot overlap (`concurrency:` per environment), every job has `timeout-minutes`, and background servers have bounded wait timeouts. Verify: search those keys and `wait-on` flags.
- **CI-10** (MUST) The artifact that was tested is the artifact deployed; a separate source-map build does not change deployed chunk names or get uploaded; `.map` files are not deployed publicly unless intended. Verify: trace the build, upload-artifact, source-map, and sync steps in order.
- **CI-11** (SHOULD) PR checks test what ships: e2e runs against the static export (or the proxy), not only `next dev`; Lighthouse failures fail the job unless the exception is documented. Verify: read the PR e2e and Lighthouse steps.
- **CI-12** (SHOULD) Every job uses the `.nvmrc` Node version and `npm ci`, and caches are keyed on the lockfile. Verify: read `setup-node` and install steps.
- **CI-13** (SHOULD) CI runs the gates `CONTEXT.md` lists (lint, typecheck, format, test, build) and the audit policy in `docs/DEPENDENCIES.md`. Verify: compare job steps with the gates table.
- **CI-14** (SHOULD) Secrets are only in the steps that need them, never echoed, never written into artifacts or `.env` files that are uploaded; artifact retention is minimal. Verify: read each step's `env:` and every upload.
- **CI-15** (SHOULD) Workflow syntax and security lint is clean or triaged. Verify: `actionlint` and `zizmor` output, or a recorded `not-run`.
- **CI-16** (SHOULD) Deploy ordering avoids broken pages: hashed assets are available before HTML that references them, old chunks survive long enough for cached HTML, and tests start after the CloudFront invalidation completes. Verify: read the sync, cache-header, and invalidation steps.

## Automatic-fail signals

- An input or event field interpolated into a shell command.
- A `--delete` sync whose source can be empty or wrong.
- An expression that can route a test run to production resources.
- A failure path that leaves a half-deployed site live with no rollback.

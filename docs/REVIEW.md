# Review

> **AI agents — read this file when:** reviewing PRs or running repo reviews.

---

## Severity tiers

### MUST (blocks merge)

- Breaks static export / introduces server-only Next incompatible with S3 hosting
- Secrets, XSS, or token leakage
- Crashes on critical paths (Home / About / Header / Footer / proxy)
- Coverage regressions or deleted tests to greenwash
- Architecture violations (wrong layer, parallel secret channels)
- Unjustified `any` sprawl

### SHOULD

- Missing tests for behavior changes
- Accessibility gaps (names, keyboard, heading hierarchy)
- Performance footguns
- Duplicated UI chrome
- Poor error / empty / loading states where applicable

### NICE

- Naming polish, optional refactors, docs clarity

### OUT OF SCOPE

- Unrelated refactors
- Dependency churn not in the PR
- Features that exist only in other products (Cognito admin, SWR feeds, etc.)

### VERIFY

- Runtime claims (proxy fail-closed, LH, Cypress) — do not assert without evidence

---

## Hygiene

- Focused Conventional Commits
- PR body: What / Why / Testing
- `make preflight` / CI green
- No drive-by changes

Agent skills (`pr-review`, `repo-review`, `security-review`) define fixed output shapes — follow those skills.

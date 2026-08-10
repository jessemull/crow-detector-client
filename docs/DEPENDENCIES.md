# Dependencies

> **AI agents — read this file when:** adding, removing, or upgrading npm packages.

---

## Principles

- Prefer packages already in the tree (Next, React, Sentry, Testing Library, Tailwind, Lucide).
- New runtime dependencies need a clear problem statement in the PR.
- Prefer official / widely used libraries for AWS tooling and a11y.
- Stay on the latest major/minor that the toolchain supports; document intentional holds below.
- Prefer upgrading the **blocking constraint** (CI Node pin, peers) over freezing a package at an old major.

---

## Process

1. Check whether an existing dependency already solves the need.
2. Add with an exact or caret range consistent with the repo.
3. Run `make preflight` (lint + typecheck + test + build).
4. Run `make security` / `npm audit` and note residual risk.
5. Document notable upgrades in the PR body / this holds table.

---

## Runtime / CI pins

| Pin            | Value                                                              | Notes                                                 |
| -------------- | ------------------------------------------------------------------ | ----------------------------------------------------- |
| Node           | **26** (Current)                                                   | `.nvmrc`, `engines.node`, GitHub Actions `setup-node` |
| GitHub Actions | keep current majors used in workflows; bump deliberately with docs |                                                       |

This repo’s CloudFormation stack is S3/CloudFront/Route 53 only (no Lambda `nodejs*` runtime).

---

## Intentional version holds

| Package               | Held at   | Latest blocked | Why                                                                                              |
| --------------------- | --------- | -------------- | ------------------------------------------------------------------------------------------------ |
| `eslint`              | `^9.39.5` | 10.x           | `eslint-plugin-jsx-a11y` / `eslint-plugin-react` (via `eslint-config-next`) peer-cap at ESLint 9 |
| `typescript`          | `^6.0.3`  | 7.x            | `typescript-eslint` (via `eslint-config-next`) peers typically `<6.1` / current Next pin         |
| `lighthouse` (direct) | `^12.8.2` | 13.x           | Keep major aligned with `@lhci/cli@0.15`                                                         |

Do **not** run `npm audit fix --force` — it may downgrade tooling (e.g. `@lhci/cli`) to ancient versions.

Residual audit findings are often transitive via `@lhci/cli`. Prefer upgrading LHCI when a compatible release lands.

---

## Discouraged without product approval

- LLM provider SDKs in this client
- New global state managers (Redux, Zustand, MobX)
- Cognito / SWR / heavy form kits unless product introduces those surfaces
- Legacy `aws-sdk` v2 — prefer modular `@aws-sdk/*` clients or drop unused deps

---

## Notes

- Target stack: Next **16** + Tailwind **4** + React **19** + TypeScript **6** + Jest **30** + Husky **9** + ESLint **9** (flat config).
- Static export remains required (`output: 'export'`).
- ESLint uses `eslint-config-next/core-web-vitals` plus Prettier and unused-import rules in `eslint.config.mjs`.

---

## Automation

Review Dependabot / manual bumps carefully for breaking Next/ESLint/Tailwind majors.

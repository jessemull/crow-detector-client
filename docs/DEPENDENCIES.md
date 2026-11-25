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
3. Run `make preflight` (prettier, lint, typecheck, test, and build).
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

| Package      | Held at   | Latest blocked | Why                                                                                              |
| ------------ | --------- | -------------- | ------------------------------------------------------------------------------------------------ |
| `eslint`     | `^9.39.5` | 10.x           | `eslint-plugin-jsx-a11y` / `eslint-plugin-react` (via `eslint-config-next`) peer-cap at ESLint 9 |
| `typescript` | `^6.0.3`  | 7.x            | `typescript-eslint` (via `eslint-config-next`) peers typically `<6.1` / current Next pin         |

`@lhci/cli@0.16` depends on `lighthouse@13.6.0`. Keep the direct `lighthouse` dependency on that same major (`^13.6.0`). Do not pin Lighthouse 12 against LHCI 0.16.

`@sentry/cli` is a direct devDependency so `scripts/source-maps.js` calls `node_modules/.bin/sentry-cli` instead of `npx`. Its install script, plus Cypress, `@parcel/watcher`, and `fsevents`, is listed in `allowScripts`.

Do **not** run `npm audit fix --force`. The remaining moderate advisories are [GHSA-3g3m-2fjr-6pw4](https://github.com/advisories/GHSA-3g3m-2fjr-6pw4) (`glob` 9.0.0–14.0.1, patched in 14.0.2) and [GHSA-g3hv-75wg-m249](https://github.com/advisories/GHSA-g3hv-75wg-m249) (`minimatch` 7.0.0–11.0.0, patched in 11.0.1). Jest 30 and `@sentry/nextjs` 10 both depend on `glob` `^13`, so they cannot take the patched 14.x release. Jest’s coverage helper `test-exclude` also pins `minimatch` 10. ESLint’s `minimatch` 3 is outside this advisory. `npm audit` suggests Jest 29.7.0 because that line uses `glob` 7, which is outside the advisory range rather than patched, and that downgrade still leaves the Sentry 10 copy in the tree. These paths run in test and build tooling. They are not in the static client bundle.

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

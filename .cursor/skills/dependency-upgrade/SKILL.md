---
name: dependency-upgrade
description: >-
  Upgrade or add npm dependencies safely for the Critter Canteen (crow-detector-client).
---

# Dependency Upgrade

Read `docs/DEPENDENCIES.md`. Review criteria: `docs/review/dependencies.md` (DEP).

1. Justify the change: the need, maintenance (recent releases, maintainers), license, install size, and whether an existing dependency already covers it
2. Use Node from `.nvmrc` (`nvm use`); `engines`, `.nvmrc`, and `setup-node` in workflows must agree
3. Install or bump in coherent groups: framework → plugins → lint/test → misc. Put runtime and build packages in `dependencies`, tooling in `devDependencies`
4. Review install scripts: `npm approve-scripts --allow-scripts-pending` lists packages with install scripts that are not approved yet. Approve only the ones that need them (for example Cypress and the Sentry CLI binary) with `npm approve-scripts <pkg>`, and say why in the PR
5. Check the diff of `package-lock.json`: only the intended packages and their dependencies changed, and `package.json` agrees
6. For a major upgrade, read the installed version's changelog, types, and docs in `node_modules/` (for Next.js, `node_modules/next/dist/docs/`), and check every usage in this repo against the new API. Do not rely on memory of older versions
7. `make preflight` (lint + typecheck + test + build)
8. `make security`, and report the result with the `security-scan` skill
9. Update the intentional holds table in `docs/DEPENDENCIES.md`; note breaking changes and any new `overrides` with their reason
10. Do **not** run `npm audit fix --force`

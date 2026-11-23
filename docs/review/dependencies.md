# Dependencies and supply chain (DEP)

**Review kinds:** pr, repo
**Applies when:** `package.json`, `package-lock.json`, `.npmrc`, `.nvmrc`, or any import of a new package is in scope. In a repo review, always.
**Policy:** `docs/DEPENDENCIES.md`, `docs/SECURITY.md`. **Procedure:** the `dependency-upgrade` and `security-scan` skills.
**References:** OWASP Top 10:2025 A03 Software Supply Chain Failures; npm docs for `npm audit`, `npm approve-scripts`, and the npm 12 install-script changes; OpenSSF Scorecard.

## How to review

Read the `package.json` diff, then the lockfile diff for the packages that changed (the lockfile does not need line-by-line reading, but every changed package entry does). For each added or upgraded package, read its installed `package.json`, README, types, and changelog in `node_modules/` and check this repo's usage against the installed API. Run `make security` and `npm approve-scripts --allow-scripts-pending` and record the output.

## Criteria

- **DEP-01** (MUST) `package.json` and `package-lock.json` agree, and the lockfile changes match the intended change: no unexpected packages, registries, git or tarball URLs, or integrity changes. Verify: `npm ls --all` exits 0 and the lockfile diff is read package by package.
- **DEP-02** (MUST) Each new dependency is justified: the need, maintenance (recent releases, maintainers), license, size, install scripts, and provenance; platform APIs or existing dependencies were considered first. Verify: `npm view <pkg> time maintainers license dist.unpackedSize` and the installed `package.json`.
- **DEP-03** (MUST) `make security` was run; new high or critical advisories are fixed or have a written rationale in `docs/DEPENDENCIES.md`; `npm audit fix --force` was not used. Verify: run it and compare with the accepted residuals.
- **DEP-04** (SHOULD) Install scripts are reviewed: packages that need them (for example Cypress and the Sentry CLI binary) are approved in `allowScripts` before npm 12 blocks unreviewed scripts, and new script-bearing packages are justified. Verify: `npm approve-scripts --allow-scripts-pending`.
- **DEP-05** (MUST) Major upgrades are checked against the installed version's API: breaking changes read, and every usage in this repo compared to the new types and docs (unknown options are often silently ignored). Verify: read `node_modules/<pkg>` types, README, and changelog, and list each call site.
- **DEP-06** (SHOULD) Holds and pairings in `docs/DEPENDENCIES.md` are respected (ESLint, TypeScript, `@lhci/cli` with `lighthouse`), and the doc is updated when they change. Verify: compare versions with the holds table.
- **DEP-07** (SHOULD) Every used tool is a declared dependency (no reliance on transitive packages through `npx`), and unused dependencies are removed. Verify: search imports and `npx` calls for each package.
- **DEP-08** (SHOULD) `engines`, `.nvmrc`, and `setup-node` agree. Verify: compare the three.
- **DEP-09** (SHOULD) `overrides` are justified and documented. Verify: read `overrides` and the matching doc entry.
- **DEP-10** (NICE) The bundle impact of new client-side dependencies is measured. Verify: compare `out/_next/static` sizes before and after.
- **DEP-11** (SHOULD) Packages are in the right section (`dependencies` for runtime and build, `devDependencies` for tooling). Verify: read the sections.

## Automatic-fail signals

- A lockfile change that does not correspond to a `package.json` change or a stated reason.
- A major upgrade whose call sites were not checked against the installed API.
- `npm audit fix --force` in the history or instructions.

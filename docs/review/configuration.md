# Configuration and environment (CFG)

**Review kinds:** pr, repo
**Applies when:** env vars, env templates, `next.config.ts`, `tsconfig.json`, Jest, ESLint, Prettier, Cypress, Lighthouse, sitemap, lint-staged, `.gitignore`, `Makefile`, or `package.json` scripts are in scope.
**Policy:** `docs/SECURITY.md`, `docs/CONTRIBUTING.md`, `docs/CI_CD.md`, `CONTEXT.md` (Quality Gates).

## How to review

For each config value in scope, find who reads it, when (build time, test time, runtime, CI), and what happens when it is missing or wrong. For each tool config, check that its include and ignore lists cover the files they are meant to and that referenced paths exist.

## Criteria

- **CFG-01** (MUST) New or renamed env vars appear in the env templates, the workflow secret mapping, and the docs, with consistent names (see CON-04). Verify: search the variable name everywhere.
- **CFG-02** (SHOULD) The env templates (`env.example` and `.env.example`) do not contradict each other, and docs point to the right one. Verify: compare both files and `docs/SECURITY.md`, `docs/CONTRIBUTING.md`.
- **CFG-03** (MUST) Build time versus runtime is understood: `NEXT_PUBLIC_*` values are baked in at build, changing them needs a rebuild, and nothing expects secrets at runtime on S3. Verify: trace each env read to the phase it runs in.
- **CFG-04** (SHOULD) Defaults are safe: optional config degrades visibly, required config fails at build or startup. Verify: read each default and fallback.
- **CFG-05** (SHOULD) Environment names are consistent (`test`, `production`, `prod`, `dev` are not mixed by accident) and `NODE_ENV` is not overloaded in ways Next or tools mis-handle. Verify: search environment names across code, workflows, and config.
- **CFG-06** (SHOULD) Tool configs are consistent with each other and with the tree: `tsconfig.json` include and exclude, Jest coverage and ignore paths, ESLint ignores, Prettier ignores, lint-staged globs (YAML is not covered), LHCI URLs, Cypress base URLs, sitemap exclusions. Verify: read each config in scope and check referenced paths exist.
- **CFG-07** (SHOULD) `.gitignore` covers secrets, build outputs, and review ledgers, and has no entry that hides files that should be tracked. Verify: `git check-ignore -v <path>` for questionable paths.
- **CFG-08** (SHOULD) `Makefile` targets and `package.json` scripts match the docs and CI. Verify: compare targets with `CONTEXT.md` and the workflows.
- **CFG-09** (NICE) Dead config (paths, variables, or ignores that reference nothing) is removed. Verify: search each referenced path.

## Automatic-fail signals

- A required env var missing from the templates or CI mapping.
- A config change that silently drops files from lint, typecheck, test, or coverage.

# Gates and tool evidence (GATE)

**Review kinds:** pr, repo
**Applies when:** always.
**Policy:** `CONTEXT.md` (Quality Gates), `docs/CI_CD.md`, `docs/TESTING.md`.

## How to review

Run the gates yourself and record each command, exit code, and the key output in the ledger's `gates[]`. A gate you did not run is `not-run`, which forces the verdict to `incomplete`. Then look past the exit codes: the tools have known blind spots in this repo, and a green run does not cover them.

Known blind spots (check by hand, do not assume the tools did):

- `tsconfig.json` only includes `src/**`, so `proxy/`, `scripts/`, `next.config.ts`, `jest.setup.ts`, and `cypress/**` are not typechecked.
- ESLint has no type-aware rules (`no-floating-promises`, `no-misused-promises`, `no-unsafe-*`, `switch-exhaustiveness-check` are off).
- Only six `jsx-a11y` rules run, all as warnings, and `eslint .` does not fail on warnings.
- Preflight does not check formatting; lint-staged does not touch YAML.
- Coverage thresholds are global, so a single file can sit below 80%.

## Criteria

- **GATE-01** (MUST) Husky hooks are installed and the branch's commits pass commitlint. Verify: `git config core.hooksPath` is `.husky/_`, `test -d .husky/_`, and `npx --no-install commitlint --from <base> --to HEAD` exits 0.
- **GATE-02** (MUST) The Node version matches `.nvmrc` and `engines` (26). Verify: `node -v`; record it in the gates evidence.
- **GATE-03** (MUST) `make lint` exits 0 and the changed files add no new warnings. Verify: run it and list warnings in changed files; each new warning is a finding because lint does not fail on warnings.
- **GATE-04** (MUST) `make typecheck` exits 0. Verify: run it.
- **GATE-05** (SHOULD) Formatting is clean. Verify: `npx prettier --check .` exits 0, and changed YAML is formatted consistently by inspection.
- **GATE-06** (MUST) `make test` exits 0 with thresholds met, and every changed source file has at least 80% branch coverage. Verify: run it and read the per-file table for changed files.
- **GATE-07** (MUST) `make build` exits 0 and `out/` contains every route as HTML (`index.html`, `about.html`, `porch.html`, `404.html`, plus any new route). Verify: run it and `ls out/*.html`.
- **GATE-08** (MUST) `make security` was run and every finding is triaged against `docs/DEPENDENCIES.md`. Verify: run it and record critical/high/moderate/low counts.
- **GATE-09** (SHOULD) End-to-end tests ran when routes, navigation, Header, Footer, the proxy, or Cypress specs changed. Verify: `make e2e` against the built export or the proxy, or record `not-run` with the reason and add the run to the test plan.
- **GATE-10** (SHOULD) Lighthouse ran when images, fonts, scripts, layout, or `.lighthouserc.js` changed. Verify: `make lighthouse`, or record `not-run` with the reason.
- **GATE-11** (MUST) Every changed file in a tool blind spot (see above) was reviewed by hand against the TypeScript, Node, and accessibility criteria the tools would otherwise enforce. Verify: list those files in the evidence.
- **GATE-12** (MUST) No suppression was added to get a gate green: `eslint-disable`, `@ts-ignore`, `@ts-expect-error` without a reason, `istanbul ignore`, new coverage exclusions, `continue-on-error`, `--no-verify`, `HUSKY=0`, `.skip`/`.only`, or lowered thresholds. Verify: `git diff <base>...HEAD | rg -n "eslint-disable|ts-ignore|ts-expect-error|istanbul ignore|continue-on-error|no-verify|HUSKY=0|\.skip\(|\.only\(|minScore|coverageThreshold"`.

## Automatic-fail signals

- Any required gate failed, or was not run and the verdict is not `incomplete`.
- `.husky/_` missing while commits were made.
- A suppression or threshold change that exists only to pass a gate.

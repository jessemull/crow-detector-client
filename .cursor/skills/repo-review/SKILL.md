---
name: repo-review
description: >-
  Exhaustive whole-repository audit for Critter Canteen: every tracked file read
  line by line, every criterion in docs/review/ decided with evidence, gates,
  doc-drift pass, fresh-context verifier, checked ledger, and a remediation
  backlog. Use for release readiness, compliance sweeps, or "review the repo".
---

# Repository Review

Same standard, ledger, and report as `pr-review` (`docs/REVIEW.md`, `docs/review/`), applied to **every tracked file** instead of a diff. Read the `pr-review` skill first; this skill lists only what differs. Every rule there applies here: whole files, every criterion its own row, evidence for every pass, VERIFY for unproven concerns, the fresh-context verifier, and `check-ledger` exit 0 before reporting.

The repository is about 140 tracked files and 27,000 lines (most of it `package-lock.json` and binaries, which need a row but not line coverage). That is too much for one context window, so the work is partitioned and the ledger carries state. Do not reduce scope to fit; partition more.

Do not fix anything during the review. Fixes come afterwards, as separate PRs from the backlog.

---

## Phase 0 — Context

Run the `load-context` skill in full. A repo review that has not read every governance and domain doc cannot judge drift.

## Phase 1 — Inventory and ledger

```bash
git fetch origin
git status --short   # a repo review reads files as they are on disk; commit or stash first
npm run review:inventory -- --kind repo --init .review/repo-<short head sha>/ledger.json
```

Resume an existing ledger instead of starting over.

## Phase 2 — Gates

All required gates from `pr-review` Phase 2, plus `e2e` and `lighthouse` when the environment allows (record `not-run` with the reason otherwise). For commitlint, check the whole history of the current branch against `origin/main` and report older failures as pre-existing.

## Phase 3 — Partitioned line-by-line reading (parallel subagents)

Split `files[]` into partitions of roughly 1,500–2,500 lines of required coverage, keeping related files together:

1. `src/app/` and `src/instrumentation*.ts`
2. `src/components/` (split further by component if large), `src/constants/`, `src/types/`
3. `proxy/`, `scripts/` (including `scripts/review/`), `.husky/`
4. `.github/workflows/`, `cloudformation/`
5. Root configuration files, `env.example`, `.env.example`, `public/` text files, `cypress/`
6. `docs/`, `.cursor/rules/`, `.cursor/skills/`, `CONTEXT.md`, `AGENTS.md`, `CLAUDE.md`, `evals/`

Run one subagent per partition in parallel. Each must read every line of its files (and the callers and tests they depend on, wherever they live), apply **every** criteria file to them, and return per-file `linesRead` and evidence, per-criterion observations, and candidate findings in the JSON shape from `pr-review` Phase 5. A criterion is decided for the repo as a whole: merge partition results so a `pass` cites evidence from every partition where the criterion applies, and any partition's finding makes the row a `finding`.

Record each file in the ledger as its partition finishes. Lockfile, binaries, and generated files still get a row (DEP-01, PR-04, PR-03 checks).

## Phase 4 — Area passes across the whole repo

After partition reading, run the area groups from `pr-review` Phase 5 as parallel subagents again, this time across the whole repository rather than per partition, so cross-file problems are found: contract mismatches, sibling drift, untested modules, inconsistent error handling, configuration that disagrees with code. Each criterion row ends with one decision and one evidence string covering the repo.

## Phase 5 — Cross-cutting passes

Everything in `pr-review` Phase 6, applied repo-wide, plus:

1. **Doc drift**: check every factual claim in `CONTEXT.md`, `AGENTS.md`, `docs/*.md`, `.cursor/rules/`, and `.cursor/skills/` against the code: commands, paths, routes, env vars, versions, workflow behavior, product surface. Each false claim is a DOC-02 or DOC-03 finding with `path:line` on both sides.
2. **Template versus live**: infrastructure and workflow behavior that cannot be confirmed from the repo (live CloudFront functions, headers, bucket policies) is VERIFY with the exact command or console check that would prove it.
3. **Dead code and config**: unused exports, constants, mocks, scripts, ignore entries, and dependencies (ARCH-08, CFG-09, DEP-07).
4. **Test quality**: tests that pass without asserting their name's behavior, date- or locale-dependent tests, missing error-path tests (TEST-03, TEST-05, TEST-06).

## Phase 6 — Findings, verifier, check

Phases 7–9 of `pr-review`, unchanged. Every finding in a repo review is effectively pre-existing; set `preExisting: true` and note that for repo reviews any MUST forces `changes-required`.

For the verifier sample, check at least 20% of `pass` rows (MUST criteria first) because the scope is larger.

## Phase 7 — Report and backlog

Write the report with `docs/review/REPORT_TEMPLATE.md`. `approve` means ready; `changes-required` means needs work.

The first lines of the chat report are the Decision counts: how many findings will be fixed, how many will not, and what a visitor hits if none of them are fixed. Do not open with the verdict.

Then add a **Remediation backlog** section: group findings into proposed fix PRs, each with a Conventional branch name, the finding IDs it closes, the files it touches, the tests it needs, and its risk. Order MUST groups first, then by blast radius (CI/CD and infrastructure, security, correctness, then the rest). Keep each PR small enough to review in one sitting.

## Measuring this skill

After a run, score it against `evals/review/repo-recall.md` (do not read that file before or during the review). Missed items mean a criterion or pass needs strengthening; see `evals/review/README.md`.

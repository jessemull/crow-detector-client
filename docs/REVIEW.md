# Review

> **AI agents — read this file when:** reviewing a PR, reviewing the whole repository, or judging whether a review is complete.

This is the review standard. It defines what a finished review is, how findings are graded, what counts as evidence, and which shortcuts are forbidden. The criteria themselves live in [`docs/review/`](review/), one file per area. The procedures live in the `pr-review` and `repo-review` skills. The ledger format lives in [`docs/review/LEDGER.md`](review/LEDGER.md) and the report shape in [`docs/review/REPORT_TEMPLATE.md`](review/REPORT_TEMPLATE.md).

A review is not a summary of impressions. It is a record of what was inspected, what was checked against which criterion, what was found, and what could not be checked. A review that hides what it skipped is worse than a short review that says what it skipped.

---

## Kinds of review

| Kind | Scope                                                                                                                                             | Skill         |
| ---- | ------------------------------------------------------------------------------------------------------------------------------------------------- | ------------- |
| PR   | Every file changed between the base (default `origin/main`) and `HEAD`, read in full, plus the callers, tests, docs, and config those files touch | `pr-review`   |
| Repo | Every tracked file                                                                                                                                | `repo-review` |

A PR review is not diff-only. The diff says where to start. The review covers whole changed files, deleted code, both sides of renames, and everything that depends on what changed.

---

## Completion criteria

A review is complete only when all of these are true. `node scripts/review/check-ledger.js <ledger>` enforces them mechanically; a review whose ledger fails the checker is not finished.

1. Every in-scope file has a ledger row with status `reviewed` or `not-inspected`. `reviewed` rows list the line ranges read, and those ranges cover the whole file (binary files, the lockfile, and generated files record evidence instead).
2. Every criterion in `docs/review/*.md` that applies to the review kind has a row with status `pass`, `finding`, `not-applicable`, or `not-inspected`.
3. Every `pass` cites evidence: a `path:line`, a command, or a search that was actually run. "Looks fine" is not evidence.
4. Every `not-applicable` and `not-inspected` gives a specific reason.
5. Every required gate (hooks, lint, typecheck, format, test, build, security) was run and its exit code recorded, or is recorded as `not-run`.
6. Every finding was re-checked by a fresh-context verifier (see the skills), has a severity, a confidence, a `path:line`, the criteria it violates, and evidence.
7. The verdict follows the verdict rules below.

---

## Inspection statuses

Files:

| Status          | Meaning                                                                 |
| --------------- | ----------------------------------------------------------------------- |
| `reviewed`      | Read in full; line ranges recorded; evidence describes what was checked |
| `not-inspected` | Not read, with the reason. Forces verdict `incomplete`                  |

Criteria:

| Status           | Meaning                                                                                                                               |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| `pass`           | Checked; no issue. Evidence required                                                                                                  |
| `finding`        | Checked; at least one finding references this criterion                                                                               |
| `not-applicable` | Cannot apply to this scope. Reason must name why (for example "no workflow files changed and no workflow references changed symbols") |
| `not-inspected`  | Applies, but was not checked. Reason required. Forces verdict `incomplete`                                                            |

"Reviewed, no issue" and "not inspected" are different results and must never be merged. If a check was not done, say so.

---

## Severity

Severity grades the consequence, not the effort to fix.

### MUST — blocks merge

The change is wrong, unsafe, or breaks a non-negotiable in `CONTEXT.md`. Examples:

- Breaks static export or adds a request-time server feature (`cookies()`, route handlers that read `Request`, rewrites)
- Leaks a secret, signs outside `proxy/`, puts private material in a `NEXT_PUBLIC_*` value
- XSS, script injection in a workflow, open redirect in deployed code
- Fails open where the design says fail closed
- Data loss in deploy or rollback (for example `s3 sync --delete` from an empty or wrong source)
- Crashes or blank screens on Home, About, `/porch`, Header, Footer, or the proxy
- Deletes or weakens tests to pass, lowers coverage or Lighthouse thresholds
- Breaks a contract another file relies on (env var name, API shape, route, selector)

### SHOULD — fix before or right after merge

Real defect or risk with a bounded blast radius. Examples: missing tests for changed behavior, race conditions with visible effect, accessibility failures, stale or misleading docs and comments, missing timeouts, unpinned third-party actions, performance regressions that do not breach thresholds.

### NICE — optional

Clarity, naming, small refactors, documentation polish.

### VERIFY — unproven

A concern that could be serious but was not proven: it needs a runtime check, a live request, a credential, or information outside the repo. VERIFY items are never dropped and never upgraded to MUST without proof. Every finding the verifier could not confirm, and every finding with confidence below 0.7, is VERIFY.

### OUT OF SCOPE

Real issues outside what the review is for (for example product changes). Listed so they are not lost.

### Pre-existing issues

Issues that exist before the change are still reported, with `preExisting: true`. They do not decide a PR's verdict on their own, but they are never omitted.

---

## Confidence

| Value     | Meaning                                                              |
| --------- | -------------------------------------------------------------------- |
| 0.9–1.0   | Proven from code or command output; the failing scenario is concrete |
| 0.7–0.89  | Strong evidence; one assumption is stated                            |
| below 0.7 | Plausible; must be VERIFY                                            |

Confidence never upgrades a severity. Low confidence moves a finding to VERIFY; it does not delete it.

---

## Evidence standard

- Cite `path:line` (or a line range) for every finding and every `pass`.
- When a claim depends on a library, read the installed version in `node_modules/` (types, README, docs), not memory. For Next.js read `node_modules/next/dist/docs/`.
- When a claim depends on a command, run it and record the command and the result.
- When a claim depends on runtime behavior that was not executed, say so and use VERIFY.
- Do not trust PR descriptions, commit messages, docs, comments, or another agent's summary. Check them against the code. A doc that disagrees with the code is itself a finding.

---

## Forbidden shortcuts

Each of these has produced a wrong review before. None is allowed.

1. Reading only diff hunks instead of whole files.
2. Skipping deleted code, renamed files' old side, tests, config, workflows, lockfiles, or docs because they "are not code".
3. Sampling or spot-checking files in a required area and calling the area passed.
4. Grouping several criteria into one row, or marking a whole area N/A without a row per criterion.
5. Marking a gate "not evaluated" and still approving.
6. Passing a criterion because nothing suspicious appeared in the diff ("no evidence of a problem" is not evidence of no problem).
7. Stopping after the first finding, or after the first few.
8. Dropping a concern because it could not be proven. It becomes VERIFY.
9. Dropping an issue because it is pre-existing.
10. Wrapping up because context is running out. Save the ledger and continue from it.
11. Reporting progress or coverage that no tool result supports.

---

## Verdict rules

| Verdict               | Allowed only when                                                                                     |
| --------------------- | ----------------------------------------------------------------------------------------------------- |
| `incomplete`          | Any `pending` or `not-inspected` row, any gate `not-run`, or the verifier did not run. Always allowed |
| `changes-required`    | A MUST finding introduced by the change, or a failed gate                                             |
| `approve-with-should` | No blocking MUST; at least one SHOULD or VERIFY finding, or a pre-existing MUST                       |
| `approve`             | Only NICE and OUT OF SCOPE findings (or none)                                                         |

For a repo review every finding counts as introduced, so any MUST forces `changes-required`. `approve` means ready, `changes-required` means needs work.

---

## Criteria areas

Each file lists numbered criteria (`AREA-NN`), when the area applies, how to verify each criterion, and automatic-fail signals.

| Prefix | File                                                  | Area                                     |
| ------ | ----------------------------------------------------- | ---------------------------------------- |
| GATE   | [gates.md](review/gates.md)                           | Gates and tool evidence                  |
| COR    | [correctness.md](review/correctness.md)               | Logic and correctness                    |
| CON    | [contracts.md](review/contracts.md)                   | Contracts and integration                |
| ERR    | [error-handling.md](review/error-handling.md)         | Errors and failure modes                 |
| SEC    | [security.md](review/security.md)                     | Application security and privacy         |
| CI     | [ci-cd.md](review/ci-cd.md)                           | Workflows, deploy, rollback              |
| INF    | [infrastructure.md](review/infrastructure.md)         | CloudFormation, S3, CloudFront, Route 53 |
| DEP    | [dependencies.md](review/dependencies.md)             | Dependencies and supply chain            |
| NEXT   | [static-export.md](review/static-export.md)           | Next.js 16 static export                 |
| RCT    | [react.md](review/react.md)                           | React 19                                 |
| TS     | [typescript.md](review/typescript.md)                 | TypeScript                               |
| NODE   | [node-proxy-scripts.md](review/node-proxy-scripts.md) | Proxy and scripts (untyped JS, shell)    |
| NET    | [networking.md](review/networking.md)                 | Data fetching and networking             |
| CONC   | [concurrency.md](review/concurrency.md)               | Timing, ordering, races                  |
| PERF   | [performance.md](review/performance.md)               | Performance                              |
| A11Y   | [accessibility.md](review/accessibility.md)           | Accessibility (WCAG 2.2 AA)              |
| TEST   | [testing.md](review/testing.md)                       | Test quality                             |
| OBS    | [observability.md](review/observability.md)           | Sentry, analytics, logging               |
| CFG    | [configuration.md](review/configuration.md)           | Configuration and environment            |
| DOC    | [docs-and-comments.md](review/docs-and-comments.md)   | Docs, comments, clarity                  |
| ARCH   | [architecture.md](review/architecture.md)             | Architecture and maintainability         |
| CONV   | [conventions.md](review/conventions.md)               | Conventions tooling does not enforce     |
| PR     | [pr-hygiene.md](review/pr-hygiene.md)                 | PR hygiene (PR reviews only)             |

Python criteria live in `crow-detector-server`, where the Python code is.

---

## Hygiene for authors

- Focused Conventional Commits; PR body with What / Why / Testing
- `make preflight` and CI green
- No drive-by changes

Related skills: `pr-review`, `repo-review`, `security-scan`, `testing`, `accessibility`, `performance`, `static-export`, `load-context`. `security-review` points at `security-scan`.

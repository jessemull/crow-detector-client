# Review report template

> **AI agents — read this file when:** writing the final report for `pr-review` or `repo-review`.

Write the report from the ledger after `node scripts/review/check-ledger.js` passes, or after it fails only because the review is honestly `incomplete`. Use every section, in this order. Write `(no items)` for an empty section. One bullet is one task.

Open with the decision counts. Do not open with the verdict, the ledger path, or a severity list.

Finding bullet format:

```
- `path:line` — Imperative task. Why it matters (one sentence). [F-n · CRITERION-ID · confidence 0.9 · verified]
```

Mark pre-existing findings with `· pre-existing`.

---

## 1. Decision

Count ledger findings, not criteria. If the user has already said what to fix, use that. If they have not, "will fix" is every MUST plus every finding a visitor can see, and say that this split is the recommendation.

- Will fix: `<n>` of `<total>`. Name the set in one sentence.
- Will not fix: `<n>` of `<total>`. Name the set in one sentence.
- If nothing is fixed, what a visitor to the site would hit. One sentence per consequence, with the finding ids. Then one sentence for the findings that only affect a developer, a deploy, or the docs, so those are not described as a broken page.

## 2. Verdict

One line: `approve`, `approve-with-should`, `changes-required`, or `incomplete`, and the single most important reason.

## 3. Scope

- Kind (PR or repo), base and head SHAs, worktree changes included or not
- Files in scope by category, total lines, chunks read
- Ledger path and the checker result (exit code and remaining errors, if any)

## 4. Gates

| Gate | Command | Result | Evidence |
| ---- | ------- | ------ | -------- |

Every required gate appears. `not-run` states why.

## 5. Findings

### [MUST]

### [SHOULD]

### [NICE TO HAVE]

### [VERIFY]

### [OUT OF SCOPE]

## 6. Not inspected

Every `not-inspected` file and criterion, with the reason and what it would take to inspect it. If this section has items, the verdict is `incomplete`.

## 7. Coverage summary

- Files: reviewed / in scope
- Criteria: pass / finding / not-applicable / not-inspected, per area
- Verifier: findings checked, findings overturned, passes sampled

## 8. Cross-cutting checks

One line each, with evidence: callers of changed exports, sibling-path parity, removed guards, weakened or deleted tests, comment and doc consistency, env and contract propagation, pre-existing issues in touched files.

## 9. Strengths

Concrete things done well, with `path:line`.

## 10. Test plan

Commands and manual checks the author should run, including anything only a runtime or live check can prove.

## 11. Residual risk

What could still be wrong after this review, and why (for example "live CloudFront config differs from the template and was not inspected").

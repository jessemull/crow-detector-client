# PR hygiene (PR)

**Review kinds:** pr
**Applies when:** every PR review. Repo reviews skip this area.
**Policy:** `docs/GOVERNANCE.md`, `docs/CONTRIBUTING.md`, `docs/REVIEW.md` (Hygiene for authors).

## How to review

Compare the PR title, description, and commits with the full file list from the inventory. Every file in the inventory should be explained by the description; every claim in the description should be visible in the diff.

## Criteria

- **PR-01** (SHOULD) The description matches the diff and has What, Why, and Testing. Verify: compare the description with the inventory.
- **PR-02** (SHOULD) The change is focused; unrelated changes are split out or called out. Verify: group the files by purpose.
- **PR-03** (MUST) Generated and incidental files are intended: lockfile, `next-env.d.ts`, the Next block in `AGENTS.md`, coverage, `out/`, `.next/`. Verify: list each and why it changed.
- **PR-04** (SHOULD) Binary assets are necessary and sized for use. Verify: `git diff --stat` and file sizes.
- **PR-05** (MUST) Deleted and renamed files were reviewed as code: the deleted content was read and its references removed, and both sides of each rename were compared. Verify: ledger rows for `D` and `R` files.
- **PR-06** (SHOULD) Commits are atomic and Conventional, with no WIP or fixup commits left. Verify: `git log --oneline <base>..HEAD`.
- **PR-07** (SHOULD) Approvals `docs/GOVERNANCE.md` requires are noted (CI/CD, CloudFormation, governance docs, new third-party dependencies, security-sensitive work). Verify: compare the file list with the governance lists.
- **PR-08** (SHOULD) Deploy-affecting changes include rollout and rollback notes. Verify: read the description for workflow, infrastructure, and env changes.
- **PR-09** (SHOULD) The branch is current with its base and merges cleanly. Verify: `git fetch origin` and `git merge-base --is-ancestor origin/main HEAD`.

## Automatic-fail signals

- Files in the diff that the author did not intend to change.

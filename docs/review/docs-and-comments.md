# Docs, comments, and clarity (DOC)

**Review kinds:** pr, repo
**Applies when:** always. Code changes make docs and comments stale even when no doc file is in the diff.
**Policy:** `docs/COMMENTS.md`, `CONTEXT.md` (Source-of-Truth Precedence), `docs/GOVERNANCE.md` (governance-only PRs).
**References:** code-comment inconsistency research (CCISolver, CARL-CCI): the strongest signal is a comment that stayed the same while the code it describes changed.

## How to review

For every changed hunk, re-read every comment and docstring inside it and within the surrounding function, and check each claim in them against the new code. Then search the docs, rules, and skills for every changed symbol, file path, command, env var, route, and workflow name, and read each hit. Treat a doc claim as a testable statement: if the code disagrees, the doc is wrong (or the code is), and either way it is a finding.

```bash
rg -n "<symbol|path|command|ENV_VAR>" CONTEXT.md AGENTS.md CLAUDE.md README.md docs .cursor
```

## Criteria

- **DOC-01** (MUST) Every comment and docstring in or beside changed code is still true; each claim (what, why, which caller, which tool reads it) holds against the code. Verify: list comments read and check each claim.
- **DOC-02** (MUST) Docs, rules, and skills that mention changed files, symbols, commands, env vars, routes, or workflows are updated. Verify: the search above with hits recorded.
- **DOC-03** (SHOULD) The governance chain is consistent: lower-precedence docs (domain docs, rules, skills, comments) do not contradict higher ones (`CONTEXT.md`, `GOVERNANCE.md`, `ARCHITECTURE.md`); contradictions are reported. Verify: compare the statements on the topic at each level.
- **DOC-04** (SHOULD) Comments follow `docs/COMMENTS.md`: they explain why, do not restate code or narrate history, and follow the spacing rules. Verify: read each new or changed comment.
- **DOC-05** (SHOULD) No TODO or FIXME describes work that is already done, and new ones name an owner or issue. Verify: search TODO and FIXME in scope.
- **DOC-06** (SHOULD) User-facing copy and metadata are accurate (product claims, page descriptions, status messages). Verify: compare copy with behavior.
- **DOC-07** (SHOULD) Skills and rules reference files, commands, and globs that exist. Verify: check each referenced path.
- **DOC-08** (SHOULD) Operational knowledge the change introduces (deploy steps, env vars, proxy behavior, infrastructure drift) is documented. Verify: identify what a maintainer would need and find where it is written.
- **DOC-09** (NICE) Names say what things are and do not mislead (for example leftover names from another product). Verify: read names introduced or touched.

## Automatic-fail signals

- A comment or doc that now states the opposite of what the code does.
- A changed command, path, or env var still documented under its old form.

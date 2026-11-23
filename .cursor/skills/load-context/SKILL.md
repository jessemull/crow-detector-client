---
name: load-context
description: >-
  Load end-to-end context for Critter Canteen before any work: every governance
  and domain doc, rules, skills, configs, workflows, infrastructure, proxy,
  scripts, and all of src/, then report what was read and any doc/code
  contradictions. Use at the start of a session, before a review, or when the
  user says load context, get up to speed, or read the repo.
---

# Load Context

Read the whole project before working on it. Agents that skip context make avoidable mistakes: they break static export, contradict the docs, miss the `/porch` API, or restyle the site. This skill is read-only. It changes no files and runs no gates.

## Rules

- Read files **in full** with the Read tool. Do not skim, sample, or rely on search snippets, file names, or memory of a previous session.
- Read in the order below. Higher items set the rules for lower ones (`CONTEXT.md` precedence).
- Keep a running list of every file read. If a file is too long to read in one call, read it in ranges until the end.
- Note any place where a doc and the code disagree. Do not fix it; report it.
- Do not start any task, edit, commit, or command beyond the read-only ones listed here. When done, report and wait.

## 1. Governance (mandatory, in order)

1. `CONTEXT.md`
2. `AGENTS.md`
3. `docs/GOVERNANCE.md`
4. `docs/ARCHITECTURE.md`
5. `docs/TESTING.md`
6. `docs/COMMENTS.md`
7. `docs/SECURITY.md`
8. `docs/DEPENDENCIES.md`
9. `docs/RELEASES.md`
10. `docs/CI_CD.md`

## 2. Domain docs (all of them, not only the "relevant" ones)

`docs/NETWORKING.md`, `docs/ERROR_HANDLING.md`, `docs/PERFORMANCE.md`, `docs/ACCESSIBILITY.md`, `docs/ANALYTICS.md`, `docs/CONTRIBUTING.md`, `docs/DEVICES.md`, then any other `docs/*.md` not yet read (`ls docs`).

## 3. Review system

`docs/REVIEW.md`, `docs/review/LEDGER.md`, `docs/review/REPORT_TEMPLATE.md`. For the criteria files in `docs/review/`, read each file's header and criterion IDs (`rg -n '^- \*\*' docs/review/`); read a criteria file in full when the task touches its area.

## 4. Agent tooling

- Every rule in `.cursor/rules/` in full.
- Every skill's frontmatter (`name` and `description`) in `.cursor/skills/*/SKILL.md`, so you know which skill to use for which job. Read a skill in full only when you use it.
- `CLAUDE.md` and `README.md` if present.

## 5. Configuration and tooling

`package.json` (scripts, engines, overrides, dependencies), `Makefile`, `.nvmrc`, `next.config.ts`, `tsconfig.json`, `eslint.config.mjs`, `jest.config.js`, `jest.setup.ts`, `cypress.config.js`, `.lighthouserc.js`, `next-sitemap.config.js`, `postcss.config.mjs`, `commitlint.config.js`, `.prettierrc`, `.prettierignore`, `.gitignore`, `.sentryignore`, `env.example`, `.env.example`, and every file in `.husky/` (not `.husky/_/`).

Do not read `package-lock.json` line by line; record the installed versions of the main packages with `npm ls next react typescript jest eslint @sentry/nextjs --depth=0`.

## 6. Delivery and infrastructure

- Every workflow in `.github/workflows/` and any other file under `.github/`.
- Every template in `cloudformation/`.
- `scripts/` (every file, including `scripts/review/`; test files may be skimmed for structure).
- `proxy/index.js` and `proxy/util.js`.

## 7. Application source

Every file under `src/`, including tests, in this order: `src/app/` (layout, pages, error and not-found pages, metadata), `src/components/` (each component folder in full), `src/constants/`, `src/types/`, `src/hooks/` and `src/utils/` if present, `src/instrumentation*.ts`. Then `cypress/` and `public/` (list files; read text files such as `403.html` and `robots.txt`).

For Next.js behavior, read the relevant pages in `node_modules/next/dist/docs/` instead of relying on memory; this version differs from older training data.

## 8. Repository state

Run (read-only):

```bash
git status --short --branch
git log --oneline -10
git config core.hooksPath
node -v
```

## Report

Reply with exactly these sections, then stop and wait for instructions:

1. **Read** — counts per group above, and any file you could not read and why. If you skipped anything, say so plainly; do not claim full context.
2. **Project summary** — five to ten lines: what the site is, routes, how it builds and deploys, how `/porch` gets data, how the test CDN proxy works, the quality gates.
3. **Repository state** — branch, ahead/behind, uncommitted changes, hooks installed or not, Node version against `.nvmrc`.
4. **Contradictions noticed** — doc versus code or doc versus doc, with `path:line` on both sides. Write `(none noticed)` if none.
5. **Ready** — one line: "Context loaded. Waiting for instructions."

Do not propose work, start fixing contradictions, or run gates unless the user asks.

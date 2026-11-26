# AGENTS.md — Critter Canteen (crow-detector-client)

> Complete development rules and constraints for AI agents and human contributors.
> This file is the authoritative reference for coding standards. Precedence: see `CONTEXT.md`.

---

## Repository Overview

| Field                 | Value                                                                            |
| --------------------- | -------------------------------------------------------------------------------- |
| **Project**           | Critter Canteen client (`crow-detector-client`)                                  |
| **Architecture**      | Next.js App Router static site + CloudFront signed-cookie proxy for test CDN     |
| **Platform**          | Web (static hosting on S3 / CloudFront)                                          |
| **Core Technologies** | Next.js 16, React 19, TypeScript 6, Tailwind 4, Lucide, Sentry (Node 26)         |
| **CI/CD**             | GitHub Actions → S3 / CloudFront                                                 |
| **Git Hooks**         | Husky + lint-staged + Conventional Commits (commitlint); pre-push runs preflight |

### Layout

```
crow-detector-client/
├── src/
│   ├── app/                 # Routes: /, /about, /porch (Shelter Cam), /feeder (Feeder Cam)
│   ├── components/          # Header, Footer, HomePage, About, PorchClips, SplashBackground, UtilityNotice, GaRouteListener
│   ├── constants/           # Shared constants (when present)
│   ├── hooks/               # Shared hooks (when present)
│   ├── types/
│   └── utils/
├── scripts/                 # bastion connect, source-maps, preflight, serve-export, cache-splash-images, review/ (ledger tooling)
├── proxy/                   # Local CloudFront signed-cookie proxy
├── cloudformation/
├── cypress/
├── docs/                    # Governance documentation; review/ holds review criteria
├── evals/review/            # Seeded cases and recall set for measuring reviews
├── .cursor/                 # Rules, skills
├── .github/                 # Workflows
├── CONTEXT.md
├── AGENTS.md                # This file
└── Makefile
```

### Path aliases

Use these instead of deep relative imports (see `tsconfig.json`):

| Alias           | Path               |
| --------------- | ------------------ |
| `@components/*` | `src/components/*` |
| `@constants/*`  | `src/constants/*`  |
| `@hooks/*`      | `src/hooks/*`      |
| `@pages/*`      | `src/app/*`        |
| `@ts-types/*`   | `src/types/*`      |
| `@utils/*`      | `src/utils/*`      |
| `@/*`           | `src/*`            |

---

## Development Commands

Prefer **`make`** targets (see `make help`). Equivalents use npm.

### Setup

| Command           | Description          |
| ----------------- | -------------------- |
| `npm install`     | Install dependencies |
| `npm run prepare` | Install Husky hooks  |

### Quality

| Command           | Description                                |
| ----------------- | ------------------------------------------ |
| `make lint`       | ESLint check                               |
| `make typecheck`  | `tsc --noEmit`                             |
| `make format`     | Prettier write                             |
| `make test`       | Jest with coverage                         |
| `make build`      | Next.js static export build                |
| `make preflight`  | prettier, lint, typecheck, test, and build |
| `make security`   | `npm audit`                                |
| `make e2e`        | Cypress                                    |
| `make lighthouse` | LHCI                                       |

### Review

| Command                                         | Description                                          |
| ----------------------------------------------- | ---------------------------------------------------- |
| `npm run review:inventory -- --kind pr\|repo …` | List files in scope; `--init <path>` writes a ledger |
| `npm run review:check -- <ledger>`              | Check a review ledger is complete and consistent     |
| `npm run review:eval -- validate\|apply\|score` | Seeded review evals (`evals/review/README.md`)       |
| `make review-inventory` / `make review-check`   | Make wrappers (`BASE=`, `LEDGER=`)                   |

### Local

| Command                    | Description                                |
| -------------------------- | ------------------------------------------ |
| `npm run dev` / `make dev` | Next.js dev server                         |
| `npm run proxy`            | Signed-cookie proxy for test CDN (`:8080`) |
| `npm run bastion`          | SSH to bastion                             |

`npm start` is intentionally disabled for this static-export app — use `dev`, `build` + static hosting of `out/`, or `proxy` for CDN testing.

---

## Language & Framework Rules

### TypeScript

- Keep `strict: true` and existing `moduleResolution`.
- Prefer explicit types on exported APIs; avoid `any`.
- Use path aliases from `tsconfig.json`.

### React / Next.js

- Mark client components with `'use client'` only when needed (hooks, browser APIs).
- Pages under `src/app/` should stay thin — compose feature components under `src/components/`.
- Respect static export: no features that require a Node server at runtime on S3/CloudFront.
- Prefer `next/link` for in-app navigation.

### Comments

Follow `docs/COMMENTS.md`. Prefer self-documenting names; comments explain **why**.

---

## Architecture Rules

### Layers

- **Routes** (`src/app`) → **feature components** → **hooks / util / constants**.
- Shared chrome: prefer `Header`, `Footer`.
- Keep the product surface small: Home, About, `/porch` (Shelter Cam), and `/feeder` (Feeder Cam), linked from Home, unless product expands it further.
- Shelter Cam / Feeder Cam capture assumptions: see `docs/DEVICES.md` (pointer to server `docs/DEVICES.md`). Do not assume an on-porch Pi CSI camera.

### Data

- Marketing pages are static. Shelter Cam fetches `${NEXT_PUBLIC_API_BASE_URL}/porch/clips`; Feeder Cam fetches `/feeder/feeds` and `/feeder/status` in the browser. Do not hardcode that host — use the env var.

### State

- Local `useState` is fine for UI-only state (e.g. mobile menu).
- No Redux/Zustand/MobX without governance approval.
- Do not add Cognito/`AuthProvider`/SWR unless product decides to introduce them.

---

## Testing Rules

- Unit/component: Jest + Testing Library; accessibility: jest-axe where established.
- Coverage gate: **80%** (CI and local `npm test`).
- E2E: Cypress (`npm run e2e`).
- Prefer testing user-visible behavior and edge cases over implementation details.
- Do not remove tests solely to raise coverage percentage.

See `docs/TESTING.md`.

---

## Performance Rules

- Respect Lighthouse CI thresholds (see `docs/PERFORMANCE.md` / `.lighthouserc.js`).
- Watch bundle size (`ENABLE_ANALYZER=true` when investigating).
- Lighthouse regressions on merge can trigger rollback — see `docs/CI_CD.md` / `docs/PERFORMANCE.md`.

---

## Security Rules

- Secrets only in env / CI / local `.env*` (gitignored).
- Never commit CloudFront private keys or AWS keys.
- Do not log tokens, passwords, or PII to third parties beyond existing Sentry/GA configuration without review.

See `docs/SECURITY.md`.

---

## Git & PR Rules

- Conventional Commits via commitlint; prefer `npm run commit` (Commitizen).
- Pre-commit: lint-staged. Commit-msg: commitlint. Pre-push: `./scripts/preflight.sh`.
- Review standard: `docs/REVIEW.md` (MUST / SHOULD / NICE / VERIFY / OUT OF SCOPE, verdict rules); criteria in `docs/review/`.
- Reviews use the `pr-review` or `repo-review` skill, keep a ledger in `.review/` (gitignored), and pass `npm run review:check -- <ledger>` before reporting.
- Start new work with the `start-branch` skill (fresh `main`, new branch, `load-context`, then stop and wait).

---

## Forbidden Patterns

- Adding server-only Next features incompatible with `output: 'export'`
- Hardcoded API keys or cookie-signing material
- Lowering coverage thresholds or disabling Husky/commitlint to bypass gates
- Inventing Cognito admin, SWR feeds, forms, lightbox, or search menus without a product decision
- Adding LLM SDKs or new global state libraries without product approval

---

## When stuck

1. Re-read `CONTEXT.md` precedence.
2. Check domain docs (`NETWORKING.md`, `SECURITY.md`, etc.).
3. Run `make preflight` and fix failures before expanding scope.
4. Flag product/architecture decisions for human review per `docs/GOVERNANCE.md`.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Contributing

> **AI agents and humans — start here for day-to-day contribution workflow.**

---

## Setup

1. `npm install` (Node ≥ 26; see `.nvmrc`)
2. Copy `env.example` → `.env.local` and fill CloudFront / Sentry / GA as needed
3. `make dev` for local Next; `npm run proxy` for signed test CDN
4. Husky hooks install via `prepare`
5. Prefer `npm run commit` (Commitizen) for Conventional Commits

---

## Git

- Branch from `main`
- Conventional Commits (commitlint)
- Pre-commit: lint-staged
- Commit-msg: commitlint
- Pre-push: `./scripts/preflight.sh`

---

## Pull requests

- Focused What / Why / Testing
- Green `make preflight`
- Follow `docs/REVIEW.md`
- `[governance]` prefix for governance-only PRs

---

## Style

- ESLint + Prettier
- Shared Header / Footer chrome
- Behavior tests for user-visible changes
- Preserve Critter Canteen visual language (light canvas, ink, yellow `#fff017`, Urbanist; photo heroes stay dark)

---

## Agents

Start with `CONTEXT.md` → `AGENTS.md` → mandatory `docs/`.

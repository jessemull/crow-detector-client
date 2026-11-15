# Governance

> **AI agents — read this file when:** planning contributions, PRs, reviews, or process changes.

---

## Precedence

See `CONTEXT.md`. Conflicts resolve upward: CONTEXT → GOVERNANCE → ARCHITECTURE → domain docs → inline comments.

---

## Non-negotiables

- Static export (`output: 'export'`); TypeScript `strict: true`
- ≥80% Jest coverage; Conventional Commits + Husky
- No hardcoded secrets; CloudFront signing stays in `proxy/`
- No LLM SDKs or new global state managers without product approval
- Keep the product surface small (Home / About / Header / Footer, plus unlinked `/porch`) unless product expands it

---

## Autonomous (agents may do without waiting)

- Bugfixes that do not change auth/deploy/proxy secret handling
- Tests and docs that follow existing patterns
- Lint/format fixes
- Internal refactors that preserve public APIs and static-export constraints
- Copy/styling within Critter Canteen visual language

---

## Human review required

- New routes / information architecture
- Changes to governance docs (`CONTEXT.md`, `AGENTS.md`, `docs/`)
- New third-party deps (analytics, payments, LLM, auth)
- CI/CD or CloudFormation changes
- Security-sensitive work (proxy cookies, env contracts)
- Removing tests or lowering coverage thresholds
- Server-side Next features that conflict with static export

---

## Product decision required

- New product surfaces beyond Home / About / unlinked `/porch`
- Privacy / analytics policy changes
- AI/LLM features in the client
- Introducing Cognito, SWR, forms, or an API sibling

---

## Governance-only PRs

- Title prefix `[governance]`
- Explain why / prior / impact
- At least one write-access reviewer (two if changing this file)
- Cascade updates to lower-precedence docs when needed

---

## Review

Severity tiers: MUST / SHOULD / NICE — see `docs/REVIEW.md`. MUST blocks merge.

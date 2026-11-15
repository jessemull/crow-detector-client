# Testing

> **AI agents — read this file when:** adding or changing tests, coverage, Cypress, or a11y checks.

---

## Stack

- Unit/component: Jest + Testing Library
- Accessibility: jest-axe on interactive UI; eslint-plugin-jsx-a11y
- E2E: Cypress (`make e2e` / `npm run e2e`)
- Perf/a11y gates: Lighthouse CI (`make lighthouse`)

---

## Coverage

**≥80%** branches, functions, lines, and statements — enforced in `jest.config.js` and CI.

Do **not** lower the threshold. Do **not** delete tests solely to raise coverage percentage.

---

## What to test

- Shared chrome: Header (desktop + mobile menu keyboard/`type="button"`), Footer
- Pages: HomePage, About, PorchClips (headings, primary CTAs/links, clip list states)
- Behavior and accessible names over implementation details
- Proxy fail-closed behavior may be covered by manual/script smoke; keep unit focus on UI

## What not to over-test

- Sentry SDK internals
- Pure Tailwind class strings
- Animation / browser chrome details

---

## Conventions

- Colocate `*.test.ts(x)` next to source
- Prefer `userEvent` + accessible roles/names
- Setup lives in `jest.setup.ts`

---

## Commands

| Command                  | Description        |
| ------------------------ | ------------------ |
| `make test` / `npm test` | Jest with coverage |
| `npm run test:watch`     | Watch mode         |
| `make e2e`               | Cypress            |
| `make lighthouse`        | LHCI               |

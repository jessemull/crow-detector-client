---
name: testing
description: >-
  Jest, Testing Library, Cypress, and coverage rules for Critter Canteen. Use
  when writing or changing tests, or reviewing test quality.
---

# Testing

Read `docs/TESTING.md` and `docs/ACCESSIBILITY.md`. Review criteria: `docs/review/testing.md` (TEST), plus GATE-06, GATE-09, GATE-12, CONC-06, and A11Y-12.

## Writing tests

- Keep the 80% global thresholds; changed files should have at least 80% branch coverage too
- Test behavior users see: query by role, label, and text; prefer `userEvent` for interaction
- Each test asserts what its name says. A test that would still pass with the feature broken is worse than no test
- Fix system time (`jest.useFakeTimers().setSystemTime(...)`) and time zone assumptions for any date logic; advance fake timers explicitly for polling
- Cover empty, one, many, error, and unmount paths for async UI (PorchClips is the main case)
- Mock only at boundaries (`fetch`, Next modules), with shapes that match the real contract; restore mocks and env vars after each test
- Interactive UI gets a jest-axe check in each meaningful state (for example menu open)
- Node-side code (`scripts/`, `proxy/`) uses `/** @jest-environment node */`; prefer real temp directories and git repos over mocking the filesystem (see `scripts/review/test-utils/repo.js`)
- Do not delete, skip, or loosen tests to get green, and do not add coverage exclusions without a reason in the config

## Running

- `make test` (coverage included)
- `make e2e` when routes, navigation, Header, Footer, the proxy, or Cypress specs change
- `make lighthouse` when UI changes can move a category score

## As a review pass

Inside `pr-review` or `repo-review`, apply every TEST criterion and record it in the ledger. Compare changed tests old against new for weakened assertions (TEST-02), and check that each changed behavior has a test that fails when the behavior breaks (TEST-01): reason through what the test would do if the line under test were reverted.

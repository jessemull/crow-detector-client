# Test quality (TEST)

**Review kinds:** pr, repo
**Applies when:** always. A change with no test changes still needs this area: the question becomes whether existing tests catch a break in the changed code.
**Policy:** `docs/TESTING.md`, `docs/ACCESSIBILITY.md`, `CONTEXT.md` (80% coverage). **Procedure:** the `testing` skill.
**References:** Testing Library guiding principles, StrykerJS (mutation testing with Jest).

## How to review

Coverage says a line ran, not that a test would notice it breaking. For every changed branch, do a mental mutation: flip the condition, delete the line, change the constant. Name the test that would fail. If none would, that is a finding. Then read every changed test as code: what it sets up, what it asserts, whether its name matches its assertions, and whether it depends on the clock, global mocks, or other tests.

## Criteria

- **TEST-01** (MUST) Every changed behavior has a test that fails if the behavior breaks. Verify: for each changed branch, record the mutation and the test that would catch it, or the gap.
- **TEST-02** (MUST) No test is deleted, skipped (`.skip`, `.only`, `xit`), or weakened (assertions removed, matchers broadened, `toBeTruthy` on a container) without a stated reason. Verify: read every removed or changed test line in the diff.
- **TEST-03** (MUST) Assertions check what users see or what callers receive, and each test asserts what its name claims; checking that a test ID is absent when that ID exists nowhere proves nothing. Verify: read each test's name against its assertions.
- **TEST-04** (SHOULD) Mocks match the real contracts (fetch responses, Next modules); global mocks and spies are restored in `afterEach`; dead mocks are removed. Verify: read setup and teardown.
- **TEST-05** (SHOULD) Tests are deterministic: system time is fixed for date logic, fake timers are advanced on purpose, there is no ordering dependency, and env mutations are restored correctly (assigning `undefined` to `process.env.X` stores the string "undefined"; delete it instead). Verify: search `Date`, `useFakeTimers`, `process.env` in tests.
- **TEST-06** (SHOULD) Edge and error paths are tested: empty, one, many, invalid, error, retry, unmount; list logic uses multi-item fixtures. Verify: compare fixtures to the branches.
- **TEST-07** (SHOULD) Browser APIs missing from jsdom (`IntersectionObserver`, `matchMedia`, `ResizeObserver`) are mocked so the real branch runs. Verify: read guards like `typeof IntersectionObserver` and the matching tests.
- **TEST-08** (SHOULD) Queries use roles, labels, and text; `userEvent` is preferred over `fireEvent` (per `docs/TESTING.md`); class-name assertions are used only when the style is the behavior. Verify: read queries and events.
- **TEST-09** (SHOULD) Changed files have at least 80% branch coverage, coverage exclusions are justified, and branches covered without an assertion are noted. Verify: the per-file coverage table and the uncovered lines.
- **TEST-10** (SHOULD) Interactive UI has a jest-axe check in each meaningful state (for example menu open). Verify: read the axe tests.
- **TEST-11** (SHOULD) End-to-end tests cover critical routes against the artifact that ships (the static export through the proxy), with selectors that survive copy edits. Verify: read `cypress/e2e` and the CI e2e steps.
- **TEST-12** (SHOULD) When the change touches an untested area (proxy, scripts, workflows, infrastructure, metadata exports, `global-error`, `layout.tsx`), a manual verification is recorded and the gap is reported. Verify: list untested files in scope.
- **TEST-13** (NICE) Mutation testing (StrykerJS) was considered for changed logic whose tests look weak. Verify: record whether it was run.

## Automatic-fail signals

- A behavior change with no test that would fail if it broke.
- A test made weaker or removed to get green.

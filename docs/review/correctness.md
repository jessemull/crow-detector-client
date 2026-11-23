# Logic and correctness (COR)

**Review kinds:** pr, repo
**Applies when:** any source, script, workflow, or config logic is in scope.
**Policy:** `AGENTS.md`, `docs/ARCHITECTURE.md`.

## How to review

For each changed function, component, script step, or workflow expression, write down its inputs (props, state, env, API data, CLI args, workflow inputs) and walk each branch with normal, empty, boundary, and invalid values. Compare old and new behavior line by line; a refactor that changes behavior is a finding even if the new behavior is arguably better. Read the whole file, not the hunk: most logic bugs live in the interaction between changed and unchanged lines.

## Criteria

- **COR-01** (MUST) Conditions are correct: comparison direction, negation, `&&`/`||`/`??` precedence, and no flipped literals or operators (`<` vs `<=`, `true` vs `false`, `===` vs `!==`). Verify: re-derive each changed condition from the intended behavior.
- **COR-02** (MUST) Boundaries are handled: empty and single-item arrays, first and last index, zero, negative numbers, maximum sizes, off-by-one in loops, slices, and ranges. Verify: walk each loop or slice with 0, 1, and n items.
- **COR-03** (MUST) Absent and invalid values are handled where they can occur: `undefined` env vars, missing API fields, optional props, `NaN`, invalid `Date`. Verify: trace each value back to its source and confirm what happens when it is missing.
- **COR-04** (SHOULD) Date and time logic is correct: units match (ms vs s), time zones are explicit where shown to users, expiry comparisons use the same clock, and values that a static export freezes at build time are intended. Verify: read every `Date`, `Date.now`, `toLocale*`, and expiry comparison in scope.
- **COR-05** (MUST) Control flow is intended: early returns, fall-through, unreachable code, and removed branches do not strand callers or states. Verify: trace every exit of each changed function.
- **COR-06** (SHOULD) Strings and URLs are built correctly: trailing slashes, double slashes, encoding of path and query parts, template literals. Verify: evaluate the built string for normal and edge inputs.
- **COR-07** (SHOULD) Ordering assumptions are explicit and enforced (for example "newest first" from the porch API) and comparators are correct and stable. Verify: find where order is produced and where it is relied on.
- **COR-08** (SHOULD) Fallbacks do not hide wrong inputs: `|| '/'`, `|| ''`, default parameters; `||` is not used where `??` is needed because `0` or `''` are valid. Verify: list each fallback and the inputs that trigger it.
- **COR-09** (MUST) State combinations are valid: loading, error, warning, and data flags cannot end up contradictory or stuck. Verify: enumerate the reachable combinations after each transition.
- **COR-10** (SHOULD) Re-running is safe: scripts, workflow steps, and handlers behave correctly when run twice or retried. Verify: reason through a second run with the state left by the first.
- **COR-11** (SHOULD) Copy matches behavior: buttons, status lines, and messages describe what actually happened. Verify: compare each user-visible string to the branch that renders it.
- **COR-12** (MUST) The change does what the PR or commit says and nothing it does not say. Verify: compare the description and commit messages with the full diff; list unexplained behavior changes.

## Automatic-fail signals

- A condition whose truth table contradicts the stated intent.
- A crash on an empty list, a missing field, or an unset env var in Home, About, `/porch`, Header, Footer, or the proxy.

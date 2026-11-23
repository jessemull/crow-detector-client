# Timing, ordering, and races (CONC)

**Review kinds:** pr, repo
**Applies when:** timers, intervals, event listeners, async functions, deploy sequencing, or anything time-dependent is in scope.
**Policy:** `docs/ERROR_HANDLING.md`, `docs/CI_CD.md`.

## How to review

List every source of asynchronous work in scope (interval ticks, visibility events, keyboard and click events, fetch completions, workflow jobs). For each pair that can overlap, ask what happens if they interleave in the worst order. Write the bad interleaving down; if you cannot rule it out from the code, it is a finding.

## Criteria

- **CONC-01** (MUST) Overlapping triggers for the same work (an interval and a visibility event, two clicks) are deduplicated or ordered, and "last response wins" is intended rather than accidental. Verify: list the triggers and the in-flight guard.
- **CONC-02** (MUST) No state update lands after unmount or after a newer operation started. Verify: read each continuation after an `await` or timer.
- **CONC-03** (SHOULD) Timers are cleared on unmount and on re-run, and intervals cannot stack when dependencies change. Verify: pair each `setTimeout`/`setInterval` with its clear.
- **CONC-04** (SHOULD) Event-ordering assumptions hold (keydown before click, focus after a state update renders, transition end). Verify: read each handler that depends on another event.
- **CONC-05** (SHOULD) Deploy timing is safe: HTML cached at the edge or in browsers does not reference chunks that a `--delete` sync already removed; backup completes before the deploy; concurrent workflow runs cannot interleave. Verify: read the deploy step order and cache settings.
- **CONC-06** (SHOULD) Tests of async code control time (fake timers, a fixed system time) and wait for the right condition rather than sleeping. Verify: read the tests for the changed async code.
- **CONC-07** (SHOULD) Expiring resources (signed URLs, cookies) are refreshed before use, with clock skew considered. Verify: read the expiry checks and buffers.

## Automatic-fail signals

- A reachable interleaving that shows stale data, double-submits, or deletes live assets.

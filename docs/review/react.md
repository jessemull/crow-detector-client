# React 19 (RCT)

**Review kinds:** pr, repo
**Applies when:** any `.tsx` component or hook is in scope.
**Policy:** `AGENTS.md` (React / Next.js), `.cursor/rules/090-components.mdc`.
**References:** react.dev "You Might Not Need an Effect", "Synchronizing with Effects", `useEffect` "Fetching data with Effects", "Rules of React"; `eslint-plugin-react-hooks` 7 compiler rules (enabled here).

## How to review

For each component, list its state, effects, refs, and event handlers. For each effect, write what external system it synchronizes with, what it starts, and how its cleanup undoes every one of those things. Then walk the component through mount, prop or state change, a slow async result arriving after a newer one, unmount, a breakpoint change, and a route change. Lint covers the rules of hooks and the compiler rules; it does not cover races, stale results, cleanup completeness, or keys that change identity.

## Criteria

- **RCT-01** (MUST) Effects only synchronize with external systems; values derivable from props or state are computed during render, and there are no effect chains that set state to trigger other effects. Verify: classify each effect in scope.
- **RCT-02** (MUST) Everything an effect starts is cleaned up: listeners, timers, intervals, observers, requests, and DOM side effects such as `inert` attributes, including on early-return paths. Verify: pair each start with its cleanup line.
- **RCT-03** (MUST) Async results are guarded: after every `await`, a stale or unmounted run cannot set state (ignore flag or `AbortController` checked after the await), and an older response cannot overwrite a newer one. Verify: trace each async function called from an effect or handler.
- **RCT-04** (SHOULD) No stale closures: callbacks read current values through dependencies or functional updates; dependency arrays are complete and not suppressed. Verify: read each `useCallback`, `useEffect`, and handler that reads state.
- **RCT-05** (MUST) List keys are stable per item identity, not indexes and not values that change on refresh (such as signed URLs); a key change that remounts (for example a playing video) is intended. Verify: read every `key=` in scope and what changes it.
- **RCT-06** (MUST) Render is pure: no `Date.now`, `Math.random`, `window`, or `document` reads during render that differ between the static HTML and the client. Verify: search the render bodies in scope.
- **RCT-07** (SHOULD) State is minimal and not duplicated; state that must reset when a prop changes is reset (key or explicit logic). Verify: list each state variable and its source of truth.
- **RCT-08** (SHOULD) Refs are not read or written during render, DOM access happens in effects or handlers, and focus moves are deliberate. Verify: read each `useRef` usage.
- **RCT-09** (SHOULD) Handlers sit on the right elements (buttons for actions, links for navigation), prevent default behavior only when needed, and do not rely on event ordering that differs between keyboard and pointer. Verify: read each handler.
- **RCT-10** (SHOULD) React Compiler and hooks lint rules are not disabled; any `eslint-disable` for `react-hooks/*` has a reason. Verify: search `eslint-disable` in scope.
- **RCT-11** (SHOULD) UI state stays consistent when the viewport crosses a breakpoint, the route changes, or the component unmounts (for example an open mobile menu and its `inert` targets). Verify: walk those three events for each stateful component.
- **RCT-12** (SHOULD) Components are small and single-purpose, props are typed, and defaults are meaningful. Verify: read component signatures and sizes.

## Automatic-fail signals

- An effect that starts something it never stops.
- An async result that can land after unmount or after a newer result.
- A render-time value that differs between build and client.

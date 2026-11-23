# Accessibility, WCAG 2.2 AA (A11Y)

**Review kinds:** pr, repo
**Applies when:** any rendered markup, styles, focus or keyboard logic, media, or accessibility test is in scope.
**Policy:** `docs/ACCESSIBILITY.md`. **Procedure:** the `accessibility` skill.
**References:** WCAG 2.2 (including 2.4.11 Focus Not Obscured and 2.5.8 Target Size), WAI-ARIA Authoring Practices, Deque's automated coverage report (axe finds roughly 57% of issues by volume and covers about a third of AA criteria).

## How to review

Automated checks here are thin: six `jsx-a11y` rules run as warnings, and jest-axe passing does not mean the page is accessible. For each changed component, read the rendered structure and walk it as a keyboard user and as a screen reader user: tab order, what is announced, where focus goes when things open and close, and what happens at narrow widths and when the viewport crosses a breakpoint.

## Criteria

- **A11Y-01** (MUST) Structure is semantic: landmarks, one `h1` per page, heading order, lists for lists, buttons for actions, links for navigation. Verify: read the rendered markup.
- **A11Y-02** (MUST) Everything interactive is reachable and operable by keyboard in a logical order, with no traps, and Escape closes menus. Verify: walk the tab order in the code.
- **A11Y-03** (MUST) Focus is visible and not hidden behind the fixed header (2.4.11); the skip link works. Verify: read focus styles and header positioning.
- **A11Y-04** (MUST) Menus and dialogs manage focus: move in on open, contain while open, restore on close, and remove `inert` on every exit path (Escape, link, resize past the breakpoint, route change, unmount). Verify: read the open, close, and cleanup code.
- **A11Y-05** (MUST) Names, roles, and states are correct: every control has an accessible name; ARIA attributes are valid for the element's role (no `aria-label` on a generic `div`); disabled states are conveyed; `title` is not the only label. Verify: read each control's attributes.
- **A11Y-06** (SHOULD) Status messages are announced once: one live region per message source, polite by default, not wrapping `aria-hidden` content (4.1.3). Verify: search `aria-live` and `role="status"` in scope.
- **A11Y-07** (SHOULD) Images have correct alternatives: decorative images use `alt=""`, content images have meaningful text. Verify: read each `img`, `picture`, and SVG.
- **A11Y-08** (SHOULD) Media is accessible: videos have controls and a name, no autoplay with sound, captions or a transcript are considered, and motion respects `prefers-reduced-motion`. Verify: read each `<video>` and animation.
- **A11Y-09** (SHOULD) Contrast meets 4.5:1 for text and 3:1 for UI, including brand yellow and text over photos. Verify: compute contrast for changed colors.
- **A11Y-10** (SHOULD) Targets are at least 24 by 24 CSS pixels or adequately spaced (2.5.8). Verify: read sizes of changed controls.
- **A11Y-11** (SHOULD) Content reflows at 320 CSS pixels and with increased text spacing without loss or horizontal scrolling. Verify: read responsive styles in scope.
- **A11Y-12** (SHOULD) Interactive UI has jest-axe coverage, and the manual checks above are recorded because axe cannot see them. Verify: read the tests.
- **A11Y-13** (SHOULD) Each route has a unique, descriptive title and the document language is set. Verify: read metadata and the root `html` element.

## Automatic-fail signals

- A control that cannot be reached or operated by keyboard.
- A state that leaves the page inert or focus lost.
- A new control with no accessible name.

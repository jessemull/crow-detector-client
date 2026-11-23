---
name: accessibility
description: >-
  Keep Critter Canteen controls keyboard-operable and axe-clean. Use when
  changing buttons, links, headings, menus, media, or accessibility tests.
---

# Accessibility

Read `docs/ACCESSIBILITY.md`. Review criteria: `docs/review/accessibility.md` (A11Y), plus RCT-11 and TEST-10.

- `eslint-plugin-jsx-a11y` stays on; do not disable rules to pass
- Interactive UI gets a jest-axe check in each meaningful state (Header menu open and closed, pages with controls)
- Buttons and links have accessible names; menu buttons use `type="button"` unless they submit a form
- One `h1` per page and a logical heading order
- Prefer `next/link` for in-app routes
- Decorative images use `alt=""`; content images have meaningful text
- Videos have controls and a name, and do not autoplay with sound
- Status messages are announced once (one polite live region per source)
- Lighthouse accessibility score stays ≥ 0.9
- Do not add chrome only to silence an audit

## Manual checks

Automated tools find only part of accessibility problems (axe catches roughly half), so check these by reading the code and, when possible, in a browser:

- Keyboard: every control reachable and operable, Escape closes the menu, focus moves into the menu and back to the toggle
- Focus is visible and not hidden behind the fixed header; the skip link works
- `inert` is removed whenever the menu closes for any reason, including crossing the `lg` breakpoint
- Contrast for brand yellow and text over photos (4.5:1 text, 3:1 UI)
- Reflow at 320 CSS pixels; targets at least 24 by 24 pixels

Verify with `make test`. Run `make lighthouse` when the change affects navigation, contrast, or names. Inside a review, record each A11Y criterion in the ledger, including which manual checks were done and which were not.

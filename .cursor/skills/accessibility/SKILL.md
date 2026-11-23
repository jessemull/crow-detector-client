---
name: accessibility
description: >-
  Keep Critter Canteen controls keyboard-operable and axe-clean. Use when
  changing buttons, links, headings, menus, or accessibility tests.
---

# Accessibility

Read `docs/ACCESSIBILITY.md`.

- `eslint-plugin-jsx-a11y` stays on; do not disable rules to pass
- Interactive UI gets a jest-axe check (Header menu, pages with controls)
- Buttons and links have accessible names
- Menu buttons use `type="button"` unless they submit a form
- One page `h1`
- Prefer `next/link` for in-app routes
- Lighthouse accessibility score stays ≥ 0.9
- Do not add chrome only to silence an audit

Verify with `make test`. Run `make lighthouse` when the change affects navigation, contrast, or names.

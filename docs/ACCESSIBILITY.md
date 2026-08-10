# Accessibility

> **AI agents — read this file when:** changing UI controls, headings, menus, or a11y tests.

---

## Requirements

- `eslint-plugin-jsx-a11y` recommended rules
- jest-axe for interactive UI where established
- Lighthouse accessibility score ≥ **0.9**

---

## Practices

- Accessible names on buttons and links
- Keyboard operable menus (Header open/close)
- Interactive `<button>` elements need `type="button"` unless submitting a form
- Prefer `next/link` for navigation over imperative `router.push` for static routes
- One clear page `<h1>`; do not stack multiple `h1`s
- Preserve focus visibility; do not “fix” a11y by adding unrequested chrome

---

## Commands

`make test`, `make lighthouse`, `make e2e`

# Accessibility

> **AI agents — read this file when:** changing UI controls, headings, menus, or a11y tests.

---

## Requirements

- `eslint-config-next` enables six `eslint-plugin-jsx-a11y` rules as warnings. `npm run lint` does not pass `--max-warnings 0`, so those warnings do not fail the gate.
- jest-axe for interactive UI (Header menu, HomePage)
- Lighthouse accessibility score ≥ **0.9**

---

## Practices

- Accessible names on buttons and links
- Keyboard operable menus (Header open/close)
- Interactive `<button>` elements need `type="button"` unless submitting a form
- Prefer `next/link` for navigation over imperative `router.push` for static routes
- Shelter Cam clips are wildlife camera video with no speech. They have controls and a name, and no caption track.
- One clear page `<h1>`; do not stack multiple `h1`s
- Preserve focus visibility; do not “fix” a11y by adding unrequested chrome

---

## Commands

`make test`, `make lighthouse`, `make e2e`

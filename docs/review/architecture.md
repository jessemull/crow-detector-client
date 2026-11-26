# Architecture and maintainability (ARCH)

**Review kinds:** pr, repo
**Applies when:** always.
**Policy:** `CONTEXT.md` (Non-Negotiable Constraints, Product & UI), `docs/ARCHITECTURE.md`, `docs/GOVERNANCE.md`, `AGENTS.md` (Architecture Rules, Forbidden Patterns).

## How to review

Place every changed file in the layer model (routes in `src/app`, feature components in `src/components`, shared hooks, utils, constants, and types) and check its imports go in the allowed direction. Check the change against the product scope and the governance lists of what needs human review or a product decision.

## Criteria

- **ARCH-01** (MUST) Layering holds: routes stay thin, feature logic lives in components, shared logic in hooks, utils, and constants; no circular imports. Verify: read the imports of each changed file.
- **ARCH-02** (MUST) Product scope holds: no new surface beyond Home, About, `/porch`, and `/feeder`, and no Cognito, SWR, forms, lightbox, search menus, global state libraries, or LLM SDKs without a product decision. Verify: compare the change with `CONTEXT.md` and `docs/GOVERNANCE.md`.
- **ARCH-03** (SHOULD) Path aliases are used instead of deep relative imports. Verify: search `'../../` in scope.
- **ARCH-04** (SHOULD) Nothing is duplicated that should be shared: chrome reused, constants centralized, near-identical logic consolidated or intentionally separate. Verify: search for similar code near each change.
- **ARCH-05** (SHOULD) Modules have one responsibility and stay a reviewable size; large components are split along real seams. Verify: read the structure of changed modules.
- **ARCH-06** (SHOULD) Types and constants live where they belong (API types in `src/types`, shared constants in `src/constants`). Verify: read where new types and constants are declared.
- **ARCH-07** (SHOULD) The visual language is preserved everywhere, including static files such as `public/403.html`: canvas, ink, yellow, Urbanist, and `cc-*` tokens. Verify: read colors, fonts, and classes in scope.
- **ARCH-08** (SHOULD) Dead code, unused mocks, unused constants, and obsolete scripts are removed. Verify: search usages of each candidate.
- **ARCH-09** (SHOULD) Changes that `docs/GOVERNANCE.md` lists as needing human review or a product decision are flagged as such in the report. Verify: compare the change with those lists.

## Automatic-fail signals

- A forbidden pattern from `AGENTS.md` or a product-scope change without approval.

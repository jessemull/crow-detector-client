# Conventions tooling does not enforce (CONV)

**Review kinds:** pr, repo
**Applies when:** always.
**Policy:** `AGENTS.md`, `docs/CONTRIBUTING.md`, `docs/COMMENTS.md`, `commitlint.config.js`.

## How to review

Compare each changed file with its neighbors. Conventions are whatever the surrounding code does consistently; a change that breaks a pattern used everywhere else is a finding even if no linter complains.

## Criteria

- **CONV-01** (SHOULD) Names follow the codebase: PascalCase components and component folders, camelCase functions and variables, SCREAMING_SNAKE_CASE module constants. Verify: read names introduced in scope.
- **CONV-02** (SHOULD) File layout follows the codebase: component folder with `index.ts` barrel and colocated test. Verify: list the files in each changed component folder.
- **CONV-03** (SHOULD) Imports are grouped and ordered like their neighbors, and unused imports are gone. Verify: compare import blocks with sibling files.
- **CONV-04** (SHOULD) Commit messages are Conventional and pass commitlint, including the 100-character body line limit. Verify: `npx --no-install commitlint --from <base> --to HEAD`.
- **CONV-05** (NICE) Ordering conventions the code already uses (alphabetized config keys, prop order) are kept. Verify: compare with neighbors.
- **CONV-06** (SHOULD) Styling uses theme tokens (`cc-*`) and existing class patterns rather than raw hex values. Verify: search `#[0-9a-fA-F]{3,6}` and `[` arbitrary values in scope.
- **CONV-07** (SHOULD) YAML is formatted like its neighbors. lint-staged includes `yml` and `yaml`. Verify: `npx prettier --check` on changed YAML.

## Automatic-fail signals

- None on their own; repeated violations in one change are a SHOULD.

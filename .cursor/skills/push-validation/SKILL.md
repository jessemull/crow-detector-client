---
name: push-validation
description: >-
  Validate branch before push using preflight and git checks.
---

# Push Validation

Husky `.husky/pre-push` runs `./scripts/preflight.sh` automatically on push, but only when the hooks are installed. Check that first, then run the same checks early:

```bash
git config core.hooksPath          # expect .husky/_
test -d .husky/_ || npm run prepare
node -v                            # must match .nvmrc
npx --no-install commitlint --from origin/main --to HEAD
make preflight
git status
```

- If `core.hooksPath` is empty or `.husky/_` is missing, run `npm run prepare`; without it no commit or push hook runs
- Every commit on the branch must pass commitlint (Conventional type, body lines at most 100 characters). Fixing an already-pushed commit needs a history rewrite; ask the user before rewording or force-pushing
- No secrets staged; no unrelated files
- Do not push unless the user asks. Do not use `--no-verify` / `HUSKY=0` unless the user explicitly requests it

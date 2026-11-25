#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

if [ ! -d .husky/_ ]; then
  echo "Husky hooks are not installed. Run npm install so prepare can create .husky/_."
  exit 1
fi

echo "==> format"
npx prettier --check .

echo "==> lint"
npm run lint

echo "==> typecheck"
npm run typecheck

echo "==> test"
npm test

echo "==> build"
npm run build

echo "==> preflight OK"

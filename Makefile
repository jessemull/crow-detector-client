# Critter Canteen (crow-detector-client) — developer commands.
# Run `make` or `make help` for targets.

.DEFAULT_GOAL := help

.PHONY: help lint lint-fix format typecheck test test-coverage e2e lighthouse build preflight security review-inventory review-check review-eval-validate dev

help: ## Help@show targets
	@printf 'Critter Canteen — make <target>\n\n'
	@grep -E '^[a-zA-Z0-9_-]+:.* ## ' Makefile \
		| grep -v '^help:' \
		| awk 'BEGIN {FS = ":.* ## "} \
		{ split($$2, p, "@"); \
		  if (p[1] != g) { if (g != "") print ""; printf "%s\n", p[1]; g = p[1] } \
		  printf "  %-20s %s\n", $$1, p[2] }'

# ── Quality ────────────────────────────────────────────────────────

lint: ## Quality@ESLint check
	npm run lint

lint-fix: ## Quality@ESLint with --fix
	npm run lint:fix

format: ## Quality@Prettier write
	npm run format

typecheck: ## Quality@tsc --noEmit
	npm run typecheck

test: ## Quality@Jest with coverage
	npm test

test-coverage: test ## Quality@alias for test

e2e: ## Quality@Cypress e2e
	npm run e2e

lighthouse: ## Quality@Lighthouse CI
	npm run lighthouse

build: ## Quality@Next.js static export build
	npm run build

preflight: ## Quality@prettier, lint, typecheck, test, and build
	./scripts/preflight.sh

security: ## Quality@npm audit
	npm audit --audit-level=high || npm audit

# ── Review ─────────────────────────────────────────────────────────

BASE ?= origin/main

review-inventory: ## Review@print PR inventory vs BASE (default origin/main)
	npm run --silent review:inventory -- --kind pr --base $(BASE)

review-check: ## Review@check a ledger: make review-check LEDGER=.review/<name>/ledger.json
	@test -n "$(LEDGER)" || (echo 'Set LEDGER=.review/<name>/ledger.json' && exit 2)
	npm run --silent review:check -- $(LEDGER)

review-eval-validate: ## Review@check seeded review cases still apply
	npm run --silent review:eval -- validate

# ── Local ──────────────────────────────────────────────────────────

dev: ## Local@Next.js dev server
	npm run dev

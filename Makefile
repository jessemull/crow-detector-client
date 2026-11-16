# Critter Canteen (crow-detector-client) — developer commands.
# Run `make` or `make help` for targets.

.DEFAULT_GOAL := help

.PHONY: help lint lint-fix format typecheck test test-coverage e2e lighthouse build preflight security dev stack-create

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

preflight: ## Quality@lint + typecheck + test + build
	./scripts/preflight.sh

security: ## Quality@npm audit
	npm audit --audit-level=high || npm audit

# ── Local ──────────────────────────────────────────────────────────

dev: ## Local@Next.js dev server
	npm run dev

# ── Infra ──────────────────────────────────────────────────────────

# Usage: make stack-create ENV=prod   or   make stack-create ENV=dev
ENV ?= prod

stack-create: ## Infra@create/update client CFN stack (ENV=prod|dev)
	./scripts/create-client-stack.sh "$(ENV)"

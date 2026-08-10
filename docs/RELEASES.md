# Releases

> **AI agents — read this file when:** preparing a release, deploy, or rollback.

---

## Model

- Static export to S3 + CloudFront
- Push/merge to `main` → `.github/workflows/merge.yml` (test/dev deploy)
- Manual environments: `.github/workflows/deploy.yml` (`test` | `production`)
- Rollback: `.github/workflows/rollback.yml` (named S3 backup + CloudFront invalidate)

---

## Environments

| Env            | Typical URL                                                                                |
| -------------- | ------------------------------------------------------------------------------------------ |
| Production     | `https://www.crittercanteen.com`                                                           |
| Test / DEV CDN | CloudFront test domain (cookie-gated); local via `npm run proxy` → `http://localhost:8080` |

---

## Versioning

- `package.json` version is informational
- Conventional Commits are the changelog signal

---

## Checklist

- [ ] `make preflight` green
- [ ] Env contracts documented (`env.example` / `docs/SECURITY.md`)
- [ ] No secrets in the static bundle
- [ ] UI-heavy changes: Cypress + Lighthouse considered

---

## Hotfix

Prefer Actions rollback for production. Coordinate with humans for prod deploys.

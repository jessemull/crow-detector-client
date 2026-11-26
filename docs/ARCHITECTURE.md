# Architecture

> **AI agents — read this file when:** changing folder structure, routes, proxy, or module boundaries.

---

## System

```
Browser → CloudFront → S3 (static `out/`)
                 ↑
Local `npm run proxy` (signed cookies) → test CloudFront domain
```

- Next.js App Router with `output: 'export'` builds to `out/`
- Deployed via GitHub Actions to S3 + CloudFront invalidation
- Test CDN is cookie-gated; local proxy at `:8080` signs CloudFront cookies
- No Cognito / runtime API sibling in this repository today

---

## Folder structure

| Path                                                       | Role                                                                                                                                                   |
| ---------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `src/app/`                                                 | Routes (`/`, `/about`, `/porch` Shelter Cam, `/feeder` Feeder Cam), root layout, globals                                                               |
| `src/components/`                                          | Feature UI: `Header`, `Footer`, `HomePage`, `About`, `PorchClips`, `FeederClips`, `FeedButton`, `SplashBackground`, `UtilityNotice`, `GaRouteListener` |
| `src/constants/`, `src/hooks/`, `src/types/`, `src/utils/` | Shared non-UI modules (as needed)                                                                                                                      |
| `proxy/`                                                   | Express signed-cookie proxy for local test CDN                                                                                                         |
| `scripts/`                                                 | Bastion SSH, Sentry source maps, preflight                                                                                                             |
| `cloudformation/`                                          | S3 / CloudFront / Route 53 stack                                                                                                                       |
| `cypress/`                                                 | E2E smoke                                                                                                                                              |
| `docs/`                                                    | Governance                                                                                                                                             |

---

## Dependency direction

`app` routes → feature components → hooks / utils / constants / types.

- Constants and utils must not import React components.
- Prefer path aliases from `AGENTS.md` / `tsconfig.json`.

---

## Constraints

- `'use client'` only when hooks or browser APIs require it
- No Route Handlers / server actions that must run on the static host
- `images.unoptimized: true`
- Public config only via `NEXT_PUBLIC_*` (Shelter Cam and Feeder Cam use `NEXT_PUBLIC_API_BASE_URL`)
- Prefer `next/link` for in-app routes
- `/porch` is Shelter Cam; `/feeder` is Feeder Cam; both linked from Home and Header

---

## Fail signals

- Deep `../../../` imports across features
- Hardcoded CloudFront / API hosts in client code
- Server-only Next APIs incompatible with static export
- Duplicating Header / Footer shells
- Inventing Cognito / SWR / admin surfaces without product approval

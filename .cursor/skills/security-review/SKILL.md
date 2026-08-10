---
name: security-review
description: >-
  Security review for secrets, CloudFront proxy, and client bundle risks.
---

# Security Review

Read `CONTEXT.md`, `AGENTS.md`, `docs/SECURITY.md`, `docs/REVIEW.md`.

Review the change for:

- Secrets in source, bundle, or logs
- Proxy fail-closed behavior (`CLOUDFRONT_*`)
- Unsafe `NEXT_PUBLIC_*` exposure of private material
- Dependency / audit risk

Output MUST / SHOULD / NICE / OUT OF SCOPE per `docs/REVIEW.md`.

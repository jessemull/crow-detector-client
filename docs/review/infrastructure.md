# Infrastructure (INF)

**Review kinds:** pr, repo
**Applies when:** `cloudformation/` is in scope, or a change depends on how S3, CloudFront, or Route 53 serve the site (routes, headers, caching, error pages, signed cookies).
**Policy:** `docs/RELEASES.md`, `docs/NETWORKING.md`, `docs/SECURITY.md`.
**References:** AWS CloudFront docs (Origin Access Control, response headers policies, cache policies, CloudFront Functions), S3 Block Public Access, OWASP ASVS 5.0 V3.

## How to review

Read the whole template. For each resource, ask what serves which request and what happens on error. The template's viewer function redirects apex hosts to www and appends `.html` to extensionless paths. Live checks need read-only evidence such as an AWS CLI `get-distribution-config` output or HTTP response headers; without that evidence, live-behavior claims are VERIFY.

## Criteria

- **INF-01** (MUST) The template matches live infrastructure, or every known difference is documented: functions, behaviors, response headers policies, and error responses that exist live are in the template. Verify: read the template; compare with recorded live evidence, or VERIFY.
- **INF-02** (MUST) Buckets are private: all four Block Public Access settings are `true` unless a documented reason exists; CloudFront uses Origin Access Control rather than the legacy Origin Access Identity; the bucket policy grants `s3:GetObject` only to the distribution. Verify: read the bucket and policy resources.
- **INF-03** (MUST) Direct loads of every route resolve: `/about` and `/porch` map to their `.html` objects (via a CloudFront Function or `trailingSlash`), and a missing page returns the real 404 page with status 404. Verify: read the function code, `next.config.ts`, and error responses; live behavior is VERIFY without evidence.
- **INF-04** (SHOULD) A response headers policy sets the headers in SEC-11. Verify: search `ResponseHeadersPolicy`.
- **INF-05** (SHOULD) Caching matches the deploy model: HTML is short-lived or reliably invalidated, hashed `/_next/static/` assets are long-lived and immutable, and `MinTTL` does not override origin intent by accident. Verify: read the cache policy and the cache headers set during deploy.
- **INF-06** (SHOULD) Transport is correct: HTTPS redirect, TLS 1.2+ security policy, HTTP/2 or HTTP/3, and IPv6 with matching AAAA records, or a stated reason. Verify: read the distribution and record sets.
- **INF-07** (SHOULD) Error responses do not mislead: the 403-to-404 mapping does not hide access-denied on the signed-cookie distribution or real 403s in production, and error pages exist in the bucket. Verify: read `CustomErrorResponses` for both conditions.
- **INF-08** (SHOULD) Data protection: buckets have `DeletionPolicy` and `UpdateReplacePolicy` of `Retain`; site bucket versioning is considered; the backup lifecycle is longer than the rollback window and documented. Verify: read bucket resources and lifecycle rules.
- **INF-09** (SHOULD) Parameters have safe defaults and constraints (allowed values, non-empty key group when signed cookies are enabled). Verify: read `Parameters` and `Conditions`.
- **INF-10** (SHOULD) Monitoring exists or its absence is accepted: access logs or standard logging, and CloudFront error-rate alarms. Verify: search for logging and alarm resources.
- **INF-11** (SHOULD) Resource names agree with `env.example`, docs, and workflow secrets. Verify: compare `BucketName`-derived names with those files.
- **INF-12** (SHOULD) Trusted key groups apply only to the distribution that needs signed cookies. Verify: read the `TrustedKeyGroups` condition.
- **INF-13** (SHOULD) Deploy credentials are least privilege (only these buckets and this distribution). Verify: read IAM resources if present; otherwise VERIFY.
- **INF-14** (NICE) CloudFront Function code uses only features its runtime supports and is tested (CloudFront function test events or a unit test). Verify: read the function and any tests.

## Automatic-fail signals

- A template change that removes or omits behavior production depends on.
- A bucket that can become public.
- A change that makes direct route loads or 404s return the wrong page or status.

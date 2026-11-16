# Production stand-up (static client)

> **AI agents — read this file when:** creating or updating the production CloudFront/S3 stack, wiring GitHub prod secrets, or running the first production deploy.

ACM certificates and the Route 53 hosted zone are **external prereqs** (not created by this template). Once those IDs exist, stack create is one command.

Shelter Cam (`/porch`) needs a separate server/API prod stand-up and `NEXT_PUBLIC_API_BASE_URL_PROD`. Home and About do not.

---

## What the stack creates

Template: [`cloudformation/crow-detector-client-s3-cloudfront-route-53-stack.yaml`](../cloudformation/crow-detector-client-s3-cloudfront-route-53-stack.yaml)

| Resource         | Prod (`Environment=prod`)                                | Test (`Environment=dev`)                               |
| ---------------- | -------------------------------------------------------- | ------------------------------------------------------ |
| Site bucket      | `crow-detector-client-prod`                              | `crow-detector-client-dev`                             |
| Backup bucket    | `crow-detector-client-backup-prod`                       | `crow-detector-client-backup-dev`                      |
| DNS (if enabled) | `www.crittercanteen.com`, `crittercanteen.com`           | `www.dev.crittercanteen.com`, `dev.crittercanteen.com` |
| Signed cookies   | Off                                                      | On (requires Key Group)                                |
| Stack name       | `crow-detector-client-s3-cloudfront-route-53-stack-prod` | `…-stack-dev`                                          |

Live account already has these stacks/buckets. GitHub secrets must use the **`-prod` / `-dev`** names above (not `-production` / `-test`).

---

## Prerequisites

1. **ACM certificate in `us-east-1`** covering `www.crittercanteen.com` and `crittercanteen.com` (and `www.dev…` / `dev…` for the test stack).
2. **Route 53 hosted zone** for `crittercanteen.com` (note the Hosted Zone ID).
3. AWS credentials that can create S3, CloudFront, and Route 53 records.
4. `aws` CLI and `jq` installed locally (or in the agent environment).

CloudFront alias hosted zone ID is almost always `Z2FDTNDATAQYW2` (already in the example params).

---

## Create or update the stack

```bash
# From repo root
cp cloudformation/parameters/prod.json.example cloudformation/parameters/prod.json
# Edit prod.json: set ACMCertificateArn and HostedZoneId (and confirm BucketName).

make stack-create ENV=prod
# equivalent: ./scripts/create-client-stack.sh prod
```

For the cookie-gated test CDN (optional parity):

```bash
cp cloudformation/parameters/dev.json.example cloudformation/parameters/dev.json
# Fill ACM, HostedZoneId, CloudFrontKeyGroupId; EnableSignedCookiesCheck=true
make stack-create ENV=dev
```

Filled `cloudformation/parameters/*.json` files are gitignored; only `*.example` is committed.

The script prints stack outputs and the GitHub secret names to set.

**Existing stacks:** Critter Canteen already has
`crow-detector-client-s3-cloudfront-route-53-stack-prod` (and `-dev`). The create script
defaults to those stack names. Running it again **updates** the stack; it does not
create a duplicate if the name matches.

---

## Post-merge ops checklist (go live)

1. **Stack** — Already live (`crow-detector-client-s3-cloudfront-route-53-stack-prod`). Re-run `make stack-create ENV=prod` only to **update** the template; do not create a second stack.
2. **GitHub secrets** — set/confirm these **exact** live values:

   | Secret                                | Must be                            |
   | ------------------------------------- | ---------------------------------- |
   | `AWS_S3_BUCKET_PROD`                  | `crow-detector-client-prod`        |
   | `AWS_S3_BUCKET_BACKUP_PROD`           | `crow-detector-client-backup-prod` |
   | `AWS_CLOUDFRONT_DISTRIBUTION_ID_PROD` | `E6LTPZFHOXVP8`                    |
   | `SENTRY_ENVIRONMENT_PROD`             | `production`                       |
   | `GA_TRACKING_ID_PROD`                 | your prod GA id                    |
   | `NEXT_PUBLIC_API_BASE_URL_PROD`       | optional until API prod exists     |

   Shared (used by test too): `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_REGION`, Sentry DSN/org/token.

3. **Deploy site** — Actions → **Deploy** → **`production`**. That uploads current `main` to S3. Merge alone does **not** update www.
4. **Smoke** — `https://www.crittercanteen.com` (today still an older Aug 2026 build until Deploy runs).

---

## Rollback

Use [`.github/workflows/rollback.yml`](../.github/workflows/rollback.yml) with environment `production` and the backup directory from the failed deploy, or see [`docs/RELEASES.md`](RELEASES.md).

---

## Follow-on (not this stack)

- **crow-detector-server** prod API / media + CORS for `https://www.crittercanteen.com`
- Set `NEXT_PUBLIC_API_BASE_URL_PROD` and re-run Deploy → production
- Outdoor capture hardware per [`docs/DEVICES.md`](DEVICES.md) (does not change this CDN stack)

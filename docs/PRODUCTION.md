# Production stand-up (static client)

> **AI agents — read this file when:** creating or updating the production CloudFront/S3 stack, wiring GitHub prod secrets, or running the first production deploy.

ACM certificates and the Route 53 hosted zone are **external prereqs** (not created by this template). Once those IDs exist, stack create is one command.

Shelter Cam (`/porch`) needs a separate server/API prod stand-up and `NEXT_PUBLIC_API_BASE_URL_PROD`. Home and About do not.

---

## What the stack creates

Template: [`cloudformation/crow-detector-client-s3-cloudfront-route-53-stack.yaml`](../cloudformation/crow-detector-client-s3-cloudfront-route-53-stack.yaml)

| Resource         | Prod (`Environment=prod`)                      | Test (`Environment=dev`)                               |
| ---------------- | ---------------------------------------------- | ------------------------------------------------------ |
| Site bucket      | `crow-detector-client-production`              | `crow-detector-client-test`                            |
| Backup bucket    | `crow-detector-client-backup-production`       | `crow-detector-client-backup-test`                     |
| DNS (if enabled) | `www.crittercanteen.com`, `crittercanteen.com` | `www.dev.crittercanteen.com`, `dev.crittercanteen.com` |
| Signed cookies   | Off                                            | On (requires Key Group)                                |

Bucket suffixes match GitHub secrets in [`env.example`](../env.example) (`AWS_S3_BUCKET_PROD`, etc.).

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

**Existing stacks:** If a prod stack already exists under another name or with old `*-prod` bucket names, reconcile before create (rename secrets, or update the existing stack carefully — S3 bucket renames require replacement). Prefer `aws cloudformation describe-stacks` first.

---

## Post-merge ops checklist (go live)

Complete after the IaC MR is on `main` (or from a branch with AWS access):

1. **Audit** — Confirm whether `crow-detector-client-prod` (or an older prod stack) and buckets already exist; create vs update accordingly.
2. **Params** — Copy `prod.json.example` → `prod.json`; fill real `ACMCertificateArn` and `HostedZoneId`.
3. **Stack** — `make stack-create ENV=prod`; save printed outputs.
4. **GitHub secrets** (Actions → repo secrets):

   | Secret                                | Value                                                                                      |
   | ------------------------------------- | ------------------------------------------------------------------------------------------ |
   | `AWS_S3_BUCKET_PROD`                  | Stack `S3BucketName`                                                                       |
   | `AWS_S3_BUCKET_BACKUP_PROD`           | Stack `BackupBucketName`                                                                   |
   | `AWS_CLOUDFRONT_DISTRIBUTION_ID_PROD` | Stack `CloudFrontDistributionId`                                                           |
   | `SENTRY_ENVIRONMENT_PROD`             | `production` (or your label)                                                               |
   | `GA_TRACKING_ID_PROD`                 | Prod GA measurement ID                                                                     |
   | `NEXT_PUBLIC_API_BASE_URL_PROD`       | Prod Nest API base when ready; omit/placeholder until then (`/porch` shows not configured) |

   Shared secrets (`AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_REGION`, Sentry org/token/DSN) should already exist for test deploys.

5. **Deploy** — Actions → **Deploy** → environment **`production`** ([`.github/workflows/deploy.yml`](../.github/workflows/deploy.yml)). Merge to `main` does **not** promote to prod.
6. **Smoke** — `https://www.crittercanteen.com` Home and About; Cypress/LH run against live www in that workflow. `/porch` waits on server prod + API URL secret + redeploy.

---

## Rollback

Use [`.github/workflows/rollback.yml`](../.github/workflows/rollback.yml) with environment `production` and the backup directory from the failed deploy, or see [`docs/RELEASES.md`](RELEASES.md).

---

## Follow-on (not this stack)

- **crow-detector-server** prod API / media + CORS for `https://www.crittercanteen.com`
- Set `NEXT_PUBLIC_API_BASE_URL_PROD` and re-run Deploy → production
- Outdoor capture hardware per [`docs/DEVICES.md`](DEVICES.md) (does not change this CDN stack)

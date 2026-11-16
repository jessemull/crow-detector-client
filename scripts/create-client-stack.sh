#!/usr/bin/env bash
# Create or update the Critter Canteen client S3/CloudFront/Route53 stack.
# Usage: ./scripts/create-client-stack.sh <dev|prod>
# Requires: aws CLI, jq; filled cloudformation/parameters/<env>.json (from *.example).

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ENV_NAME="${1:-}"

if [[ "${ENV_NAME}" != "dev" && "${ENV_NAME}" != "prod" ]]; then
  echo "Usage: $0 <dev|prod>" >&2
  exit 1
fi

PARAMS_FILE="${ROOT_DIR}/cloudformation/parameters/${ENV_NAME}.json"
TEMPLATE_FILE="${ROOT_DIR}/cloudformation/crow-detector-client-s3-cloudfront-route-53-stack.yaml"
STACK_NAME="crow-detector-client-${ENV_NAME}"

if [[ ! -f "${PARAMS_FILE}" ]]; then
  echo "Missing ${PARAMS_FILE}" >&2
  echo "Copy cloudformation/parameters/${ENV_NAME}.json.example → ${ENV_NAME}.json and fill ACM/HostedZone values." >&2
  exit 1
fi

if [[ ! -f "${TEMPLATE_FILE}" ]]; then
  echo "Missing template ${TEMPLATE_FILE}" >&2
  exit 1
fi

if ! command -v aws >/dev/null 2>&1; then
  echo "aws CLI is required" >&2
  exit 1
fi

if ! command -v jq >/dev/null 2>&1; then
  echo "jq is required" >&2
  exit 1
fi

# Build --parameter-overrides Key=Value ... (empty values allowed for optional Key Group).
OVERRIDES=()
while IFS= read -r line; do
  OVERRIDES+=("${line}")
done < <(jq -r 'to_entries[] | "\(.key)=\(.value)"' "${PARAMS_FILE}")

echo "==> Deploying stack ${STACK_NAME}"
echo "    Template: ${TEMPLATE_FILE}"
echo "    Params:   ${PARAMS_FILE}"

aws cloudformation deploy \
  --stack-name "${STACK_NAME}" \
  --template-file "${TEMPLATE_FILE}" \
  --parameter-overrides "${OVERRIDES[@]}" \
  --no-fail-on-empty-changeset

echo "==> Stack outputs"
aws cloudformation describe-stacks \
  --stack-name "${STACK_NAME}" \
  --query 'Stacks[0].Outputs[].[OutputKey,OutputValue]' \
  --output table

SITE_BUCKET="$(aws cloudformation describe-stacks --stack-name "${STACK_NAME}" --query "Stacks[0].Outputs[?OutputKey=='S3BucketName'].OutputValue" --output text)"
BACKUP_BUCKET="$(aws cloudformation describe-stacks --stack-name "${STACK_NAME}" --query "Stacks[0].Outputs[?OutputKey=='BackupBucketName'].OutputValue" --output text)"
DISTRIBUTION_ID="$(aws cloudformation describe-stacks --stack-name "${STACK_NAME}" --query "Stacks[0].Outputs[?OutputKey=='CloudFrontDistributionId'].OutputValue" --output text)"
WEBSITE_URL="$(aws cloudformation describe-stacks --stack-name "${STACK_NAME}" --query "Stacks[0].Outputs[?OutputKey=='WebsiteURL'].OutputValue" --output text)"

echo ""
echo "==> GitHub secrets to set"
if [[ "${ENV_NAME}" == "prod" ]]; then
  echo "  AWS_S3_BUCKET_PROD=${SITE_BUCKET}"
  echo "  AWS_S3_BUCKET_BACKUP_PROD=${BACKUP_BUCKET}"
  echo "  AWS_CLOUDFRONT_DISTRIBUTION_ID_PROD=${DISTRIBUTION_ID}"
  echo "  (also SENTRY_ENVIRONMENT_PROD, GA_TRACKING_ID_PROD, NEXT_PUBLIC_API_BASE_URL_PROD when ready)"
else
  echo "  AWS_S3_BUCKET_DEV=${SITE_BUCKET}"
  echo "  AWS_S3_BUCKET_BACKUP_DEV=${BACKUP_BUCKET}"
  echo "  AWS_CLOUDFRONT_DISTRIBUTION_ID_DEV=${DISTRIBUTION_ID}"
fi
echo "  WebsiteURL=${WEBSITE_URL}"
echo ""
echo "==> Done. Next: set secrets, then Actions → Deploy → $([ "${ENV_NAME}" = prod ] && echo production || echo test)."

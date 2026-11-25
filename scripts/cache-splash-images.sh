#!/usr/bin/env bash
# The splash files keep stable names, so the browser needs an explicit lifetime.
set -euo pipefail

: "${AWS_S3_BUCKET:?AWS_S3_BUCKET is required}"

cache_type() {
  local ext="$1"
  local content_type="$2"

  aws s3 cp "s3://${AWS_S3_BUCKET}/images/hero/" "s3://${AWS_S3_BUCKET}/images/hero/" \
    --recursive \
    --exclude "*" \
    --include "*.${ext}" \
    --metadata-directive REPLACE \
    --cache-control "public, max-age=86400" \
    --content-type "${content_type}"
}

cache_type webp image/webp
cache_type jpg image/jpeg
cache_type jpeg image/jpeg

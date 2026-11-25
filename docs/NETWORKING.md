# Networking

> **AI agents — read this file when:** changing proxy, CDN access, or outbound client requests.

---

## Static hosting

- Production serves static assets from S3 via CloudFront (`www.crittercanteen.com`).
- Apex `crittercanteen.com` (and `dev.crittercanteen.com`) resolve to the same distribution and **301 to `www…`** via a CloudFront Function. Prefer `www` in links and canonicals.
- Do not hardcode environment hosts in client code; use env / config.
- Shelter Cam fetches `${NEXT_PUBLIC_API_BASE_URL}/porch/clips` with the default credentials mode. The API must send `Access-Control-Allow-Origin` for `https://www.crittercanteen.com`, `https://www.dev.crittercanteen.com`, and local dev origins or the browser will not read the JSON.

---

## Proxy (local test CDN)

- `npm run proxy` — Express + CloudFront signed cookies on port **8080**
- Requires `CLOUDFRONT_DOMAIN` at startup (fail closed)
- Signing needs `CLOUDFRONT_KEY_PAIR_ID` and `CLOUDFRONT_PRIVATE_KEY` or `CLOUDFRONT_PRIVATE_KEY_PATH`
- Never commit private keys; see `env.example` and `docs/SECURITY.md`

---

## Analytics / error reporting

- Sentry and GA use public env IDs only — no Authorization headers for an API sibling today
- Do not log secrets to third parties

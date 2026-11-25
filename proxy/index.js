require('dotenv').config({ path: '.env.local', quiet: true });
const cookieParser = require('cookie-parser');
const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const {
  getSignedCookies,
  isSameOriginPath,
  policyStillValid,
  pathWithoutQuery,
} = require('./util');

const app = express();
app.disable('x-powered-by');

const PORT = 8080;
const LOCAL_HOST = '127.0.0.1';
const CLOUDFRONT_DOMAIN = process.env.CLOUDFRONT_DOMAIN;
const COOKIE_TTL = 60 * 60 * 1000;
const ASSET_PATH = /\.(js|css|png|jpg|jpeg|gif|svg|woff2|webp|ico)$/;

if (!CLOUDFRONT_DOMAIN && require.main === module) {
  console.error(
    'CLOUDFRONT_DOMAIN is required. Set it in .env.local before starting the proxy.'
  );
  process.exit(1);
}

const signingReady = () =>
  Boolean(
    process.env.CLOUDFRONT_DOMAIN &&
    process.env.CLOUDFRONT_KEY_PAIR_ID &&
    (process.env.CLOUDFRONT_PRIVATE_KEY ||
      process.env.CLOUDFRONT_PRIVATE_KEY_PATH)
  );

app.get('/healthcheck', (req, res) => {
  if (!signingReady()) {
    return res.status(503).send('CloudFront signing is not configured');
  }
  try {
    getSignedCookies();
    return res.status(200).send('OK');
  } catch {
    return res.status(503).send('CloudFront signing is not configured');
  }
});

app.use(cookieParser());

app.use((req, res, next) => {
  if (!isSameOriginPath(req.originalUrl)) {
    return res.status(400).send('Invalid redirect target');
  }

  if (policyStillValid(req.cookies, CLOUDFRONT_DOMAIN)) {
    return next();
  }

  let signedCookies;
  try {
    signedCookies = getSignedCookies();
  } catch {
    console.error('Failed to sign CloudFront cookies');
    return res.status(500).send('CloudFront cookie signing misconfigured');
  }

  Object.entries(signedCookies).forEach(([name, value]) => {
    // Host-only cookie so 127.0.0.1 and localhost each keep their own.
    res.cookie(name, value, {
      httpOnly: true,
      secure: true,
      maxAge: COOKIE_TTL,
    });
  });

  return res.redirect(307, req.originalUrl);
});

app.use((req, res, next) => {
  const [baseUrl, queryString] = req.originalUrl.split('?');
  const queryParams = queryString ? `?${queryString}` : '';
  const pathOnly = baseUrl.replace(/\/+$/, '') || '/';

  if (pathOnly === '/') {
    req.url = `/index.html${queryParams}`;
  } else if (!pathOnly.match(/\.[a-zA-Z0-9]+$/)) {
    req.url = `${pathOnly}.html${queryParams}`;
  }
  next();
});

app.use(
  '/',
  createProxyMiddleware({
    changeOrigin: true,
    target: `https://${CLOUDFRONT_DOMAIN}`,
    on: {
      proxyReq: (proxyReq, req) => {
        if (req.headers.cookie) {
          proxyReq.setHeader('Cookie', req.headers.cookie);
        }
      },
      proxyRes: (proxyRes, req) => {
        const status = proxyRes.statusCode || 0;
        if (
          status >= 200 &&
          status < 300 &&
          ASSET_PATH.test(pathWithoutQuery(req.originalUrl))
        ) {
          proxyRes.headers['cache-control'] =
            'public, max-age=31536000, immutable';
        }
      },
    },
  })
);

if (require.main === module) {
  app.listen(PORT, LOCAL_HOST, () => {
    console.log(`Proxy server running at http://${LOCAL_HOST}:${PORT}`);
  });
}

module.exports = {
  app,
  isSameOriginPath,
  policyStillValid,
  pathWithoutQuery,
};

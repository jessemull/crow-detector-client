/**
 * @jest-environment node
 */
jest.mock('http-proxy-middleware', () => ({
  createProxyMiddleware: (config) => {
    global.__proxyConfig = config;
    return (_req, _res, next) => next();
  },
}));

const crypto = require('crypto');
const http = require('http');
const {
  isSameOriginPath,
  policyStillValid,
  pathWithoutQuery,
  toCloudFrontBase64,
} = require('./util');

const { privateKey } = crypto.generateKeyPairSync('rsa', {
  modulusLength: 2048,
});
const privateKeyPem = privateKey.export({ type: 'pkcs1', format: 'pem' });

const signedPolicy = (statement) => {
  const policyJson = JSON.stringify({ Statement: [statement] });
  const signer = crypto.createSign('RSA-SHA1');
  signer.update(policyJson);
  return {
    'CloudFront-Policy': toCloudFrontBase64(policyJson),
    'CloudFront-Signature': toCloudFrontBase64(signer.sign(privateKey)),
    'CloudFront-Key-Pair-Id': 'K',
  };
};

const request = (port, path, headers) =>
  new Promise((resolve, reject) => {
    const req = http.request(
      {
        hostname: '127.0.0.1',
        port,
        path,
        method: 'GET',
        headers,
      },
      (res) => {
        res.resume();
        resolve({ status: res.statusCode, headers: res.headers });
      }
    );
    req.on('error', reject);
    req.end();
  });

describe('proxy request guards', () => {
  it('rejects protocol-relative and backslash redirect targets', () => {
    expect(isSameOriginPath('/about')).toBe(true);
    expect(isSameOriginPath('//evil.example/phish')).toBe(false);
    expect(isSameOriginPath('https://evil.example')).toBe(false);
    expect(isSameOriginPath('/\\evil.example')).toBe(false);
  });

  it('requires a matching resource, signature, and key pair', () => {
    process.env.CLOUDFRONT_PRIVATE_KEY = privateKeyPem;
    process.env.CLOUDFRONT_KEY_PAIR_ID = 'K';
    const future = Math.floor(Date.now() / 1000) + 3600;
    const cookies = signedPolicy({
      Resource: 'https://cdn.example.com/*',
      Condition: { DateLessThan: { 'AWS:EpochTime': future } },
    });
    expect(policyStillValid(cookies, 'cdn.example.com')).toBe(true);
    expect(
      policyStillValid(
        { 'CloudFront-Policy': cookies['CloudFront-Policy'] },
        'cdn.example.com'
      )
    ).toBe(false);
    expect(
      policyStillValid(
        { ...cookies, 'CloudFront-Signature': 'sig' },
        'cdn.example.com'
      )
    ).toBe(false);
    expect(
      policyStillValid(
        { ...cookies, 'CloudFront-Key-Pair-Id': 'OTHER' },
        'cdn.example.com'
      )
    ).toBe(false);
    const expiring = signedPolicy({
      Resource: 'https://cdn.example.com/*',
      Condition: {
        DateLessThan: { 'AWS:EpochTime': Math.floor(Date.now() / 1000) + 30 },
      },
    });
    expect(policyStillValid(expiring, 'cdn.example.com')).toBe(false);
    expect(policyStillValid(cookies, 'other.example.com')).toBe(false);
    expect(policyStillValid('not-a-policy', 'cdn.example.com')).toBe(false);
  });

  it('matches cache headers on the path, not the query', () => {
    expect(pathWithoutQuery('/file.js?Signature=1')).toBe('/file.js');
  });

  it('loads the proxy app and rejects a backslash target', async () => {
    process.env.CLOUDFRONT_DOMAIN = 'cdn.example.com';
    process.env.CLOUDFRONT_KEY_PAIR_ID = 'K';
    process.env.CLOUDFRONT_PRIVATE_KEY = privateKeyPem;
    jest.resetModules();
    const { app } = require('./index');
    const server = app.listen(0, '127.0.0.1');
    await new Promise((resolve) => server.once('listening', resolve));
    const { port } = server.address();
    try {
      expect((await request(port, '/\\evil.example')).status).toBe(400);
      expect((await request(port, '//evil.example/phish')).status).toBe(400);
    } finally {
      await new Promise((resolve) => server.close(resolve));
    }
  });

  it('reports signing failure on the health check', async () => {
    process.env.CLOUDFRONT_DOMAIN = 'cdn.example.com';
    delete process.env.CLOUDFRONT_KEY_PAIR_ID;
    delete process.env.CLOUDFRONT_PRIVATE_KEY;
    delete process.env.CLOUDFRONT_PRIVATE_KEY_PATH;
    jest.resetModules();
    const { app } = require('./index');
    process.env.CLOUDFRONT_KEY_PAIR_ID = '';
    process.env.CLOUDFRONT_PRIVATE_KEY = '';
    delete process.env.CLOUDFRONT_PRIVATE_KEY_PATH;
    const server = app.listen(0, '127.0.0.1');
    await new Promise((resolve) => server.once('listening', resolve));
    const { port } = server.address();
    try {
      expect((await request(port, '/healthcheck')).status).toBe(503);
    } finally {
      await new Promise((resolve) => server.close(resolve));
    }
  });

  it('stops redirecting after repeated cookie setup attempts', async () => {
    process.env.CLOUDFRONT_DOMAIN = 'cdn.example.com';
    process.env.CLOUDFRONT_KEY_PAIR_ID = 'K';
    process.env.CLOUDFRONT_PRIVATE_KEY = privateKeyPem;
    jest.resetModules();
    const { app } = require('./index');
    const server = app.listen(0, '127.0.0.1');
    await new Promise((resolve) => server.once('listening', resolve));
    const { port } = server.address();
    try {
      const first = await request(port, '/about');
      expect(first.status).toBe(307);
      expect(first.headers['set-cookie'].join('\n')).toContain(
        'cf-proxy-auth-tries=1'
      );
      expect(first.headers.location).toBe('/about');
      const blocked = await request(port, '/about', {
        Cookie: 'cf-proxy-auth-tries=2',
      });
      expect(blocked.status).toBe(508);
    } finally {
      await new Promise((resolve) => server.close(resolve));
    }
  });

  it('keeps a year-long cache header on hashed assets only', () => {
    process.env.CLOUDFRONT_DOMAIN = 'cdn.example.com';
    jest.resetModules();
    require('./index');
    const proxyRes = { statusCode: 200, headers: {} };
    global.__proxyConfig.on.proxyRes(proxyRes, {
      originalUrl: '/_next/static/chunk.js',
    });
    expect(proxyRes.headers['cache-control']).toBe(
      'public, max-age=31536000, immutable'
    );
    const hero = { statusCode: 200, headers: {} };
    global.__proxyConfig.on.proxyRes(hero, {
      originalUrl: '/images/hero/spencer-960.jpg',
    });
    expect(hero.headers['cache-control']).toBeUndefined();
  });
});

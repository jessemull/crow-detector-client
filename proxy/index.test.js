/**
 * @jest-environment node
 */
jest.mock('http-proxy-middleware', () => ({
  createProxyMiddleware: () => (_req, _res, next) => next(),
}));

const http = require('http');
const {
  isSameOriginPath,
  policyStillValid,
  pathWithoutQuery,
} = require('./util');

const policyCookie = (statement) =>
  Buffer.from(JSON.stringify({ Statement: [statement] })).toString('base64');

describe('proxy request guards', () => {
  it('rejects protocol-relative and backslash redirect targets', () => {
    expect(isSameOriginPath('/about')).toBe(true);
    expect(isSameOriginPath('//evil.example/phish')).toBe(false);
    expect(isSameOriginPath('https://evil.example')).toBe(false);
    expect(isSameOriginPath('/\\evil.example')).toBe(false);
  });

  it('requires a matching resource, signature, and key pair', () => {
    const future = Math.floor(Date.now() / 1000) + 3600;
    const policy = policyCookie({
      Resource: 'https://cdn.example.com/*',
      Condition: { DateLessThan: { 'AWS:EpochTime': future } },
    });
    const cookies = {
      'CloudFront-Policy': policy,
      'CloudFront-Signature': 'sig',
      'CloudFront-Key-Pair-Id': 'K',
    };
    expect(policyStillValid(cookies, 'cdn.example.com')).toBe(true);
    expect(
      policyStillValid({ 'CloudFront-Policy': policy }, 'cdn.example.com')
    ).toBe(false);
    expect(policyStillValid(cookies, 'other.example.com')).toBe(false);
    expect(policyStillValid('not-a-policy', 'cdn.example.com')).toBe(false);
  });

  it('matches cache headers on the path, not the query', () => {
    expect(pathWithoutQuery('/file.js?Signature=1')).toBe('/file.js');
  });

  it('loads the proxy app and rejects a backslash target', async () => {
    process.env.CLOUDFRONT_DOMAIN = 'cdn.example.com';
    const { app } = require('./index');
    const server = app.listen(0, '127.0.0.1');
    await new Promise((resolve) => server.once('listening', resolve));
    const { port } = server.address();
    try {
      const status = await new Promise((resolve, reject) => {
        const req = http.request(
          {
            hostname: '127.0.0.1',
            port,
            path: '/\\evil.example',
            method: 'GET',
          },
          (res) => {
            res.resume();
            resolve(res.statusCode);
          }
        );
        req.on('error', reject);
        req.end();
      });
      expect(status).toBe(400);
    } finally {
      await new Promise((resolve) => server.close(resolve));
    }
  });
});

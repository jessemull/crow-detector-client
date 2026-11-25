const crypto = require('crypto');
const fs = require('fs');

const toCloudFrontBase64 = (value) =>
  Buffer.from(value)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/=/g, '_')
    .replace(/\//g, '~');

const getSignedCookies = () => {
  try {
    const domain = process.env.CLOUDFRONT_DOMAIN;
    const key = process.env.CLOUDFRONT_PRIVATE_KEY;
    const keyPairId = process.env.CLOUDFRONT_KEY_PAIR_ID;
    const privateKeyPath = process.env.CLOUDFRONT_PRIVATE_KEY_PATH;

    if (!domain || !keyPairId || (!key && !privateKeyPath)) {
      throw new Error(
        'Missing CloudFront signing config (CLOUDFRONT_DOMAIN, CLOUDFRONT_KEY_PAIR_ID, and private key)'
      );
    }

    const rawKey = key || fs.readFileSync(privateKeyPath, 'utf8');
    const privateKey = rawKey.replace(/\\n/g, '\n');

    const expireTime = Math.floor((Date.now() + 60 * 60 * 1000) / 1000);

    const policy = {
      Statement: [
        {
          Resource: `https://${domain}/*`,
          Condition: {
            DateLessThan: { 'AWS:EpochTime': expireTime },
          },
        },
      ],
    };

    const policyJson = JSON.stringify(policy);
    const policyBase64 = toCloudFrontBase64(policyJson);

    const signer = crypto.createSign('sha1');
    signer.update(policyJson);
    const signature = signer.sign(privateKey);
    const signatureBase64 = toCloudFrontBase64(signature);

    return {
      'CloudFront-Policy': policyBase64,
      'CloudFront-Signature': signatureBase64,
      'CloudFront-Key-Pair-Id': keyPairId,
    };
  } catch {
    throw new Error('CloudFront cookie signing failed');
  }
};

/**
 * Accept only a path the URL parser keeps on 127.0.0.1.
 * A backslash such as /\evil.example is an open redirect.
 */
const isSameOriginPath = (value) => {
  if (
    typeof value !== 'string' ||
    !value.startsWith('/') ||
    value.startsWith('//')
  ) {
    return false;
  }
  if (value.includes('\\') || value.includes('\0')) {
    return false;
  }
  try {
    const parsed = new URL(value, 'http://127.0.0.1');
    return parsed.hostname === '127.0.0.1';
  } catch {
    return false;
  }
};

const policyStillValid = (cookies, domain) => {
  try {
    const policyValue = cookies?.['CloudFront-Policy'];
    const signature = cookies?.['CloudFront-Signature'];
    const keyPairId = cookies?.['CloudFront-Key-Pair-Id'];
    if (!policyValue || !signature || !keyPairId || !domain) {
      return false;
    }
    const padded = policyValue
      .replace(/-/g, '+')
      .replace(/_/g, '=')
      .replace(/~/g, '/');
    const json = JSON.parse(Buffer.from(padded, 'base64').toString('utf8'));
    const statement = json?.Statement?.[0];
    const epoch = statement?.Condition?.DateLessThan?.['AWS:EpochTime'];
    const resource = statement?.Resource;
    const expected = `https://${domain}/`;
    const resourceMatches =
      typeof resource === 'string' &&
      (resource === `https://${domain}/*` || resource.startsWith(expected));
    return (
      resourceMatches &&
      typeof epoch === 'number' &&
      epoch * 1000 > Date.now() + 60_000
    );
  } catch {
    return false;
  }
};

const pathWithoutQuery = (url) => (url || '').split('?')[0];

module.exports = {
  getSignedCookies,
  toCloudFrontBase64,
  isSameOriginPath,
  policyStillValid,
  pathWithoutQuery,
};

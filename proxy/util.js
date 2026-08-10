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

    const privateKey = key || fs.readFileSync(privateKeyPath, 'utf8');

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
  } catch (error) {
    console.error('Signing cookies failed: ', error);
    throw error;
  }
};

module.exports = { getSignedCookies, toCloudFrontBase64 };

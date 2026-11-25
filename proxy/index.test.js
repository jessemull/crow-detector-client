/**
 * @jest-environment node
 */
const {
  isSameOriginPath,
  policyStillValid,
  pathWithoutQuery,
} = require('./util');

describe('proxy request guards', () => {
  it('rejects protocol-relative redirect targets', () => {
    expect(isSameOriginPath('/about')).toBe(true);
    expect(isSameOriginPath('//evil.example/phish')).toBe(false);
    expect(isSameOriginPath('https://evil.example')).toBe(false);
  });

  it('treats an expired CloudFront policy cookie as invalid', () => {
    const expired = Buffer.from(
      JSON.stringify({
        Statement: [
          {
            Condition: { DateLessThan: { 'AWS:EpochTime': 1 } },
          },
        ],
      })
    ).toString('base64');
    expect(policyStillValid(expired)).toBe(false);
    expect(policyStillValid('not-a-policy')).toBe(false);
  });

  it('matches cache headers on the path, not the query', () => {
    expect(pathWithoutQuery('/file.js?Signature=1')).toBe('/file.js');
  });
});

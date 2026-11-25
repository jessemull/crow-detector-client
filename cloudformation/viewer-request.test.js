/**
 * @jest-environment node
 */
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const template = fs.readFileSync(
  path.join(
    __dirname,
    'crow-detector-client-s3-cloudfront-route-53-stack.yaml'
  ),
  'utf8'
);

const start = template.indexOf('function handler(event)');
const end = template.indexOf('SecurityHeadersPolicy');
const source = template.slice(start, end);

const loadHandler = () => {
  const sandbox = { module: { exports: null } };
  vm.runInNewContext(`${source}\nmodule.exports = handler;`, sandbox);
  return sandbox.module.exports;
};

describe('CloudFront viewer request', () => {
  const handler = loadHandler();

  it('redirects the apex host to www and keeps the query', () => {
    const response = handler({
      request: {
        uri: '/about',
        querystring: { clip: { value: 'a b' } },
        headers: { host: { value: 'crittercanteen.com' } },
      },
    });

    expect(response.statusCode).toBe(301);
    expect(response.headers.location.value).toBe(
      'https://www.crittercanteen.com/about?clip=a%20b'
    );
  });

  it('rewrites an extensionless route to the exported html file', () => {
    const request = {
      uri: '/porch/',
      querystring: {},
      headers: { host: { value: 'www.crittercanteen.com' } },
    };

    expect(handler({ request })).toBe(request);
    expect(request.uri).toBe('/porch.html');
  });
});

/**
 * @jest-environment node
 */
const fs = require('fs');
const os = require('os');
const path = require('path');
const { resolveFile } = require('./serve-export');

describe('serve-export paths', () => {
  const base = fs.mkdtempSync(path.join(os.tmpdir(), 'serve-export-'));
  const root = path.join(base, 'out');

  beforeAll(() => {
    fs.mkdirSync(root);
    fs.writeFileSync(path.join(root, 'index.html'), 'home');
    fs.writeFileSync(path.join(base, 'out-secret'), 'secret');
  });

  it('does not read a sibling whose name continues the root', () => {
    const resolved = resolveFile(root, '/../out-secret');
    expect(resolved.file).toBeUndefined();
    expect(resolved.error).toBe(404);
  });

  it('turns a bad percent-encoding into a 400', () => {
    expect(resolveFile(root, '/%').error).toBe(400);
  });

  it('serves index.html for /', () => {
    expect(resolveFile(root, '/').file).toBe(path.join(root, 'index.html'));
  });

  it('does not follow a symlink out of the export', () => {
    const outside = path.join(base, 'outside.html');
    fs.writeFileSync(outside, 'secret');
    fs.symlinkSync(outside, path.join(root, 'linked.html'));

    const resolved = resolveFile(root, '/linked.html');
    expect(resolved.file).toBeUndefined();
    expect(resolved.error).toBe(404);
  });
});

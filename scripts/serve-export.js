/**
 * Serve the static export with the same extensionless HTML rewrite as the proxy.
 * Used by pull-request Cypress so it hits `out/`, not `next dev`.
 */
const fs = require('fs');
const http = require('http');
const path = require('path');

const contentType = (filePath) => {
  if (filePath.endsWith('.html')) return 'text/html; charset=utf-8';
  if (filePath.endsWith('.js')) return 'text/javascript; charset=utf-8';
  if (filePath.endsWith('.css')) return 'text/css; charset=utf-8';
  if (filePath.endsWith('.json')) return 'application/json';
  if (filePath.endsWith('.svg')) return 'image/svg+xml';
  if (filePath.endsWith('.webp')) return 'image/webp';
  if (filePath.endsWith('.jpg') || filePath.endsWith('.jpeg'))
    return 'image/jpeg';
  if (filePath.endsWith('.png')) return 'image/png';
  return 'application/octet-stream';
};

const insideRoot = (root, resolved) => {
  const prefix = root.endsWith(path.sep) ? root : `${root}${path.sep}`;
  return resolved === root || resolved.startsWith(prefix);
};

const resolveFile = (root, urlPath) => {
  let clean;
  try {
    clean = decodeURIComponent((urlPath || '/').split('?')[0]);
  } catch {
    return { error: 400 };
  }
  const relative = clean.replace(/^\/+/, '');
  const candidates = [];
  if (relative === '') {
    candidates.push(path.join(root, 'index.html'));
  } else {
    candidates.push(path.join(root, relative));
    if (!path.extname(relative)) {
      candidates.push(path.join(root, `${relative}.html`));
    }
  }
  let rootReal;
  try {
    rootReal = fs.realpathSync(root);
  } catch {
    return { error: 404 };
  }
  const file = candidates.find((candidate) => {
    const resolved = path.resolve(candidate);
    let fileReal;
    try {
      fileReal = fs.realpathSync(resolved);
    } catch {
      return false;
    }
    return insideRoot(rootReal, fileReal) && fs.statSync(fileReal).isFile();
  });
  return file ? { file } : { error: 404 };
};

const createServer = (root) =>
  http.createServer((req, res) => {
    const resolved = resolveFile(root, req.url || '/');
    if (resolved.error === 400) {
      res.writeHead(400, { 'content-type': 'text/plain; charset=utf-8' });
      res.end('Bad request');
      return;
    }
    if (!resolved.file) {
      const missing = path.join(root, '404.html');
      res.writeHead(404, { 'content-type': 'text/html; charset=utf-8' });
      res.end(fs.existsSync(missing) ? fs.readFileSync(missing) : 'Not found');
      return;
    }
    res.writeHead(200, { 'content-type': contentType(resolved.file) });
    res.end(fs.readFileSync(resolved.file));
  });

if (require.main === module) {
  const root = path.resolve(process.argv[2] || 'out');
  const port = Number(process.env.PORT || 3000);
  createServer(root).listen(port, '127.0.0.1', () => {
    console.log(`Serving ${root} at http://127.0.0.1:${port}`);
  });
}

module.exports = { contentType, insideRoot, resolveFile, createServer };

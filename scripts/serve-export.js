/**
 * Serve the static export with the same extensionless HTML rewrite as the proxy.
 * Used by pull-request Cypress so it hits `out/`, not `next dev`.
 */
const fs = require('fs');
const http = require('http');
const path = require('path');

const root = path.resolve(process.argv[2] || 'out');
const port = Number(process.env.PORT || 3000);

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

const resolveFile = (urlPath) => {
  const clean = decodeURIComponent(urlPath.split('?')[0]);
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
  return candidates.find((candidate) => {
    const resolved = path.resolve(candidate);
    return (
      resolved.startsWith(root) &&
      fs.existsSync(resolved) &&
      fs.statSync(resolved).isFile()
    );
  });
};

const server = http.createServer((req, res) => {
  const file = resolveFile(req.url || '/');
  if (!file) {
    const missing = path.join(root, '404.html');
    res.writeHead(404, { 'content-type': 'text/html; charset=utf-8' });
    res.end(fs.existsSync(missing) ? fs.readFileSync(missing) : 'Not found');
    return;
  }
  res.writeHead(200, { 'content-type': contentType(file) });
  res.end(fs.readFileSync(file));
});

server.listen(port, '127.0.0.1', () => {
  console.log(`Serving ${root} at http://127.0.0.1:${port}`);
});

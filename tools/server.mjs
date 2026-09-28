/* Dev server for Cha Chaan Teng Rush: static files, served as UTF-8. */
import { createServer } from 'http';
import { readFile } from 'fs/promises';
import { extname, join, normalize } from 'path';
import { fileURLToPath } from 'url';

const ROOT = fileURLToPath(new URL('../', import.meta.url));
const PORT = Number(process.env.PORT) || 8741;
const TYPES = {
  '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.mjs': 'text/javascript',
  '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.md': 'text/plain'
};

const server = createServer(async (req, res) => {
  const path = normalize(decodeURIComponent(req.url.split('?')[0])).replace(/^(\.\.[/\\])+/, '');
  const file = join(ROOT, path === '/' ? 'index.html' : path);
  try {
    const body = await readFile(file);
    res.writeHead(200, { 'Content-Type': `${TYPES[extname(file)] || 'application/octet-stream'}; charset=utf-8`, 'Cache-Control': 'no-store' });
    res.end(body);
  } catch {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Not found');
  }
});

// If the port is taken (say, another copy is already running), try the next few.
let port = PORT;
server.on('error', err => {
  if (err.code === 'EADDRINUSE' && port < PORT + 10){
    console.log(`Port ${port} is busy, trying ${port + 1}…`);
    server.listen(++port);
  } else throw err;
});
server.on('listening', () => console.log(`Cha Chaan Teng Rush on http://localhost:${port}`));
server.listen(port);

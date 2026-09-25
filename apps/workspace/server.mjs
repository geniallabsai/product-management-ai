
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn, spawnSync } from 'node:child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '../..');
const publicDir = path.join(__dirname, 'public');

function parseArgs(argv) {
  const args = { path: repoRoot, port: 4738, open: false };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--open') args.open = true;
    else if (arg === '--path' || arg === '-p') args.path = argv[++i];
    else if (arg === '--port') args.port = Number(argv[++i] || 4738);
  }
  return args;
}

function contentType(file) {
  const ext = path.extname(file).toLowerCase();
  return {
    '.html': 'text/html; charset=utf-8',
    '.js': 'text/javascript; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.svg': 'image/svg+xml; charset=utf-8'
  }[ext] || 'application/octet-stream';
}

function runAnalyzer(targetPath) {
  const outDir = path.join(repoRoot, '.pm-ai', 'outputs');
  fs.mkdirSync(outDir, { recursive: true });
  const output = path.join(outDir, 'workspace-server-analysis.json');
  const report = path.join(outDir, 'workspace-server-report.md');
  const visual = path.join(outDir, 'workspace-server-static.html');
  const script = path.join(repoRoot, 'python', 'pm_ai', 'repository_analyzer.py');
  const args = [script, '--path', targetPath, '--output', output, '--report', report, '--visual', visual, '--max-files', '3000'];
  let result = spawnSync('python', args, { cwd: repoRoot, encoding: 'utf8' });
  if (result.status !== 0) result = spawnSync('python3', args, { cwd: repoRoot, encoding: 'utf8' });
  if (result.status !== 0) {
    const detail = `${result.stdout || ''}\n${result.stderr || ''}`.trim();
    throw new Error(detail || 'Repository analyzer failed');
  }
  return { output, report, visual };
}

const args = parseArgs(process.argv.slice(2));
const targetPath = path.resolve(process.cwd(), args.path);
let analysisFiles;
try {
  analysisFiles = runAnalyzer(targetPath);
} catch (error) {
  console.error('[pm-ai workspace] analyzer failed');
  console.error(error.message);
  process.exit(1);
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url || '/', `http://${req.headers.host}`);
  if (url.pathname === '/api/health') {
    res.writeHead(200, { 'content-type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify({ ok: true, targetPath, repoRoot }));
    return;
  }
  if (url.pathname === '/api/analysis') {
    res.writeHead(200, { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' });
    fs.createReadStream(analysisFiles.output).pipe(res);
    return;
  }
  if (url.pathname === '/api/report') {
    res.writeHead(200, { 'content-type': 'text/markdown; charset=utf-8', 'cache-control': 'no-store' });
    fs.createReadStream(analysisFiles.report).pipe(res);
    return;
  }

  const requested = url.pathname === '/' ? '/index.html' : url.pathname;
  const safePath = path.normalize(requested).replace(/^([.][.][\\/])+/, '');
  const filePath = path.join(publicDir, safePath);
  if (!filePath.startsWith(publicDir) || !fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    res.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' });
    res.end('Not found');
    return;
  }
  res.writeHead(200, { 'content-type': contentType(filePath) });
  fs.createReadStream(filePath).pipe(res);
});

server.listen(args.port, '127.0.0.1', () => {
  const url = `http://127.0.0.1:${args.port}`;
  console.log('Product Management AI Workspace running');
  console.log(url);
  console.log(`Analyzing: ${targetPath}`);
  if (args.open) {
    if (process.platform === 'win32') spawn('cmd', ['/c', 'start', '', url], { detached: true, stdio: 'ignore' }).unref();
    else if (process.platform === 'darwin') spawn('open', [url], { detached: true, stdio: 'ignore' }).unref();
    else spawn('xdg-open', [url], { detached: true, stdio: 'ignore' }).unref();
  }
});

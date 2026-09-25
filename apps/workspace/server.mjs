
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn, spawnSync } from 'node:child_process';
import { PROVIDERS, readAIConfig, saveAIConfig, runIdeaLab } from './ai/providers.mjs';
import { generateCompanyDossier } from './ai/consulting.mjs';

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

function sendJson(res, status, payload) {
  res.writeHead(status, { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' });
  res.end(JSON.stringify(payload));
}

function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk;
      if (body.length > 2_000_000) reject(new Error('Request body too large'));
    });
    req.on('end', () => {
      if (!body.trim()) return resolve({});
      try { resolve(JSON.parse(body)); } catch (error) { reject(error); }
    });
    req.on('error', reject);
  });
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

function run(command, args, cwd = targetPath) {
  const result = spawnSync(command, args, { cwd, encoding: 'utf8' });
  if (result.status !== 0) return null;
  return String(result.stdout || '').trim();
}

function json(res, payload, status = 200) {
  res.writeHead(status, { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' });
  res.end(JSON.stringify(payload, null, 2));
}

function runAnalyzer(targetPath) {
  const outDir = path.join(repoRoot, '.pm-ai', 'outputs');
  fs.mkdirSync(outDir, { recursive: true });
  const output = path.join(outDir, 'workspace-server-analysis.json');
  const report = path.join(outDir, 'workspace-server-report.md');
  const visual = path.join(outDir, 'workspace-server-static.html');
  const script = path.join(repoRoot, 'python', 'pm_ai', 'repository_analyzer.py');
  const analyzerArgs = [script, '--path', targetPath, '--output', output, '--report', report, '--visual', visual, '--max-files', '3000'];
  let result = spawnSync('python', analyzerArgs, { cwd: repoRoot, encoding: 'utf8' });
  if (result.status !== 0) result = spawnSync('python3', analyzerArgs, { cwd: repoRoot, encoding: 'utf8' });
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

function gitActivity() {
  const isRepo = run('git', ['rev-parse', '--is-inside-work-tree']);
  if (isRepo !== 'true') {
    return { ok: false, reason: 'Target path is not a Git repository', commits: [], status: [], branch: null, remotes: [] };
  }
  const branch = run('git', ['branch', '--show-current']) || '(detached)';
  const statusText = run('git', ['status', '--short']) || '';
  const remoteText = run('git', ['remote', '-v']) || '';
  const logText = run('git', ['log', '--date=iso-strict', '--pretty=format:%H%x1f%h%x1f%an%x1f%ad%x1f%s', '--name-only', '-n', '18']) || '';
  const blocks = logText.split(/\n(?=[0-9a-f]{40}\x1f)/).filter(Boolean);
  const commits = blocks.map(block => {
    const lines = block.split('\n').filter(Boolean);
    const [hash, short, author, date, subject] = (lines.shift() || '').split('\x1f');
    return { hash, short, author, date, subject, files: lines.filter(line => !line.includes('\x1f')).slice(0, 40) };
  }).filter(c => c.hash);
  return {
    ok: true,
    branch,
    status: statusText.split('\n').filter(Boolean).map(line => ({ code: line.slice(0, 2).trim(), path: line.slice(3) })),
    remotes: remoteText.split('\n').filter(Boolean),
    commits,
    updatedAt: new Date().toISOString()
  };
}

function safeReadFile(queryPath) {
  if (!queryPath) return { ok: false, error: 'missing path' };
  const requested = path.resolve(targetPath, queryPath);
  if (!requested.startsWith(targetPath)) return { ok: false, error: 'path outside target' };
  if (!fs.existsSync(requested) || fs.statSync(requested).isDirectory()) return { ok: false, error: 'file not found' };
  const stat = fs.statSync(requested);
  if (stat.size > 512_000) return { ok: false, error: 'file too large for preview' };
  return { ok: true, path: path.relative(targetPath, requested), size: stat.size, content: fs.readFileSync(requested, 'utf8').slice(0, 20000) };
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url || '/', `http://${req.headers.host}`);
  if (url.pathname === '/api/health') return json(res, { ok: true, targetPath, repoRoot });
  if (url.pathname === '/api/analysis') {
    const analysis = JSON.parse(fs.readFileSync(analysisFiles.output, 'utf8'));
    analysis.project = analysis.project || {};
    analysis.project.source_name = analysis.project.name;
    analysis.project.name = 'Startup AI OS';
    analysis.project.product_name = 'Startup AI OS';
    analysis.project.scope = 'Business, product, engineering, DevOps, MLOps, data, growth and operations';
    res.writeHead(200, { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' });
    res.end(JSON.stringify(analysis));
    return;
  }

  if (url.pathname === '/api/startup-stack') {
    const stackPath = path.join(repoRoot, 'lib', 'startup-stack.js');
    const content = fs.readFileSync(stackPath, 'utf8');
    res.writeHead(200, { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' });
    res.end(JSON.stringify({ ok: true, source: 'lib/startup-stack.js', content }));
    return;
  }



  if (url.pathname === '/api/ai/providers') {
    sendJson(res, 200, { ok: true, providers: PROVIDERS, config: readAIConfig(repoRoot) });
    return;
  }

  if (url.pathname === '/api/ai/config') {
    if (req.method === 'GET') {
      sendJson(res, 200, { ok: true, providers: PROVIDERS, config: readAIConfig(repoRoot) });
      return;
    }
    if (req.method === 'POST') {
      try {
        const body = await readJsonBody(req);
        const config = saveAIConfig(repoRoot, body);
        sendJson(res, 200, { ok: true, config });
      } catch (error) {
        sendJson(res, 400, { ok: false, error: error.message });
      }
      return;
    }
    sendJson(res, 405, { ok: false, error: 'GET or POST required' });
    return;
  }

  if (url.pathname === '/api/idea-lab') {
    if (req.method !== 'POST') {
      sendJson(res, 405, { ok: false, error: 'POST required' });
      return;
    }
    try {
      const body = await readJsonBody(req);
      const result = await runIdeaLab(repoRoot, body);
      sendJson(res, 200, { ok: true, result });
    } catch (error) {
      sendJson(res, 500, { ok: false, error: error.message });
    }
    return;
  }



  if (url.pathname === '/api/repository/analyze-path') {
    if (req.method !== 'POST') {
      sendJson(res, 405, { ok: false, error: 'POST required' });
      return;
    }
    try {
      const body = await readJsonBody(req);
      const requestedPath = path.resolve(process.cwd(), body.path || targetPath);
      const files = runAnalyzer(requestedPath);
      const analysis = JSON.parse(fs.readFileSync(files.output, 'utf8'));
      sendJson(res, 200, { ok: true, sourcePath: requestedPath, analysis });
    } catch (error) {
      sendJson(res, 500, { ok: false, error: error.message });
    }
    return;
  }

  if (url.pathname === '/api/company-dossier') {
    if (req.method !== 'POST') {
      sendJson(res, 405, { ok: false, error: 'POST required' });
      return;
    }
    try {
      const body = await readJsonBody(req);
      let repoAnalysis = null;
      if (body.repositoryPath) {
        const requestedPath = path.resolve(process.cwd(), body.repositoryPath);
        const files = runAnalyzer(requestedPath);
        repoAnalysis = JSON.parse(fs.readFileSync(files.output, 'utf8'));
      } else if (body.includeCurrentRepository) {
        repoAnalysis = JSON.parse(fs.readFileSync(analysisFiles.output, 'utf8'));
      }
      const dossier = generateCompanyDossier(body, repoAnalysis);
      sendJson(res, 200, { ok: true, dossier });
    } catch (error) {
      sendJson(res, 500, { ok: false, error: error.message });
    }
    return;
  }

  if (url.pathname === '/api/report') {
    res.writeHead(200, { 'content-type': 'text/markdown; charset=utf-8', 'cache-control': 'no-store' });
    fs.createReadStream(analysisFiles.report).pipe(res);
    return;
  }
  if (url.pathname === '/api/git') return json(res, gitActivity());
  if (url.pathname === '/api/file') return json(res, safeReadFile(url.searchParams.get('path')));
  if (url.pathname === '/api/events') {
    res.writeHead(200, {
      'content-type': 'text/event-stream; charset=utf-8',
      'cache-control': 'no-store',
      connection: 'keep-alive'
    });
    const send = (name, payload) => res.write(`event: ${name}\ndata: ${JSON.stringify(payload)}\n\n`);
    send('hello', { ok: true, targetPath, at: new Date().toISOString() });
    let lastHead = run('git', ['rev-parse', 'HEAD']) || null;
    const interval = setInterval(() => {
      const head = run('git', ['rev-parse', 'HEAD']) || null;
      if (head && head !== lastHead) {
        lastHead = head;
        send('git', gitActivity());
      } else {
        send('heartbeat', { at: new Date().toISOString(), branch: gitActivity().branch });
      }
    }, 5000);
    req.on('close', () => clearInterval(interval));
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
  console.log('Startup AI OS Workspace running');
  console.log(url);
  console.log(`Analyzing: ${targetPath}`);
  if (args.open) {
    if (process.platform === 'win32') spawn('cmd', ['/c', 'start', '', url], { detached: true, stdio: 'ignore' }).unref();
    else if (process.platform === 'darwin') spawn('open', [url], { detached: true, stdio: 'ignore' }).unref();
    else spawn('xdg-open', [url], { detached: true, stdio: 'ignore' }).unref();
  }
});

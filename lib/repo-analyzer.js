import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { repoRoot } from './core.js';

function runPython(command, args) {
  const result = spawnSync(command, args, { encoding: 'utf8' });
  return result;
}

export function runRepositoryAnalyzer({ targetPath, output, report, visual, maxFiles }) {
  const root = repoRoot();
  const script = path.join(root, 'python', 'pm_ai', 'repository_analyzer.py');
  const args = [script, '--path', targetPath || process.cwd()];
  if (output) args.push('--output', output);
  if (report) args.push('--report', report);
  if (visual) args.push('--visual', visual);
  if (maxFiles) args.push('--max-files', String(maxFiles));

  let result = runPython('python', args);
  if (result.error || result.status !== 0) {
    const fallback = runPython('python3', args);
    if (!fallback.error && fallback.status === 0) result = fallback;
  }
  if (result.error) throw result.error;
  if (result.status !== 0) {
    throw new Error((result.stderr || result.stdout || 'Repository analyzer failed').trim());
  }
  return result.stdout.trim();
}

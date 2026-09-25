import { spawnSync } from 'node:child_process';
import fs from 'node:fs';

const checks = [
  { name: 'help works', args: ['--help'], match: /Product Management AI CLI/ },
  { name: 'skills list works', args: ['skills'], match: /principal-pm/ },
  { name: 'diagnose works', args: ['diagnose', '--input', 'examples/sample-brief.md'], match: /Diagnóstico Product Management AI/ },
  { name: 'doctor works', args: ['doctor'], match: /Status: \*\*OK\*\*/ },
  { name: 'analyze-repo works', args: ['analyze-repo', '--path', 'examples', '--output', '.pm-ai/outputs/test-analysis.json', '--report', '.pm-ai/outputs/test-analysis.md', '--visual', '.pm-ai/outputs/test-analysis.html'], match: /"ok": true/ }
];

let failed = 0;
for (const check of checks) {
  const result = spawnSync(process.execPath, ['./bin/pm-ai.js', ...check.args], { encoding: 'utf8' });
  const output = `${result.stdout || ''}\n${result.stderr || ''}`;
  if (result.status !== 0 || !check.match.test(output)) {
    failed += 1;
    console.error(`✗ ${check.name}`);
    console.error(output.trim() || `(exit ${result.status})`);
  } else {
    console.log(`✓ ${check.name}`);
  }
}


if (failed === 0) {
  try {
    const html = fs.readFileSync('.pm-ai/outputs/test-analysis.html', 'utf8');
    const dataMatch = html.match(/<script id="pm-ai-data" type="application\/json">([\s\S]*?)<\/script>/);
    if (!dataMatch) throw new Error('missing pm-ai-data script');
    JSON.parse(dataMatch[1]);
    for (const token of ['Genial Product OS', 'Living product documentation', 'data-panel="architecture"', 'id="archGraph"', 'id="inspector"']) {
      if (!html.includes(token)) throw new Error('missing token: ' + token);
    }
    console.log('OK dashboard html validates');
  } catch (error) {
    failed += 1;
    console.error('✗ dashboard html validates');
    console.error(error.message);
  }
}

if (failed > 0) {
  console.error(`${failed} check(s) failed`);
  process.exit(1);
}
console.log(`${checks.length + 1} checks passed`);

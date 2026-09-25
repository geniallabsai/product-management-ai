import { spawnSync } from 'node:child_process';
import fs from 'node:fs';

const checks = [
  { name: 'help works', args: ['--help'], match: /Startup AI OS CLI/ },
  { name: 'skills list works', args: ['skills'], match: /principal-pm/ },
  { name: 'startup-stack works', args: ['startup-stack'], match: /Startup AI OS Stack/ },
  { name: 'diagnose works', args: ['diagnose', '--input', 'examples/sample-brief.md'], match: /Diagnóstico Product Management AI/ },
  { name: 'doctor works', args: ['doctor'], match: /Status: \*\*OK\*\*/ },
  { name: 'analyze-repo works', args: ['analyze-repo', '--path', 'examples', '--output', '.pm-ai/outputs/test-analysis.json', '--report', '.pm-ai/outputs/test-analysis.md', '--visual', '.pm-ai/outputs/test-analysis.html'], match: /"ok": true/ }
];

let failed = 0;
for (const file of ['apps/workspace/public/app.js','apps/workspace/server.mjs']) {
  const syntax = spawnSync(process.execPath, ['--check', file], { encoding: 'utf8' });
  if (syntax.status !== 0) { failed += 1; console.error(`✗ syntax ${file}`); console.error((syntax.stdout || '') + (syntax.stderr || '')); }
  else console.log(`✓ syntax ${file}`);
}

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
    for (const token of ['Genial Startup Workspace', 'data-panel="arch"', 'id="archBoard"', 'id="inspector"']) {
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

try {
  for (const file of ['apps/workspace/server.mjs','apps/workspace/public/index.html','apps/workspace/public/styles.css','apps/workspace/public/app.js','lib/startup-stack.js','docs/startup-ai-os.md','apps/workspace/ai/providers.mjs','apps/workspace/ai/consulting.mjs','apps/workspace/ai/solution-architecture.mjs','docs/idea-lab-ai-providers.md','docs/consulting-dossier.md','apps/django_startup_os/requirements.txt','apps/django_startup_os/manage.py','apps/django_startup_os/startup_os/settings.py','docs/django-stack-migration.md','docs/foundational-methods.md']) {
    if (!fs.existsSync(file)) throw new Error('missing workspace file: ' + file);
  }
  const serverText = fs.readFileSync('apps/workspace/server.mjs', 'utf8');
  const appText = fs.readFileSync('apps/workspace/public/app.js', 'utf8');
  const htmlText = fs.readFileSync('apps/workspace/public/index.html', 'utf8');
  for (const token of ['/api/git','/api/events','/api/file','/api/ai/providers','/api/idea-lab','/api/company-dossier','/api/repository/analyze-path','/api/idea-chat','/api/web-snapshot','/api/toolbox/plan','/api/client-project','/api/solution-architecture']) if (!serverText.includes(token)) throw new Error('missing server endpoint: ' + token);
  for (const token of ['graph3dCanvas','draw3d','renderActivity','openFile','renderIdeaLab','renderDossier','runIdeaLab','runDossier','sendIdeaChat','collectIdeaContext','diagnostic-cards','renderToolbox','runToolbox','renderDelivery','runDelivery','renderSolutionArchitecture','runSolutionArchitecture','blueprint-card']) if (!appText.includes(token) && !htmlText.includes(token)) throw new Error('missing workspace feature: ' + token);
  console.log('OK workspace server files validate');
  console.log('OK workspace graph, git, AI and dossier endpoints validate');
} catch (error) {
  console.error('✗ workspace server files validate');
  console.error(error.message);
  process.exit(1);
}

try {
  const pyFiles = [
    'apps/django_startup_os/diagnostics/services/process_analyzer.py',
    'apps/django_startup_os/mlops/services/ml_decision.py',
    'apps/django_startup_os/projects/services/kanban_builder.py',
    'apps/django_startup_os/manage.py'
  ];
  const py = spawnSync('python', ['-m', 'py_compile', ...pyFiles], { encoding: 'utf8' });
  if (py.status !== 0) throw new Error((py.stdout || '') + (py.stderr || ''));
  console.log('OK django python services validate');
} catch (error) {
  console.error('✗ django python services validate');
  console.error(error.message);
  process.exit(1);
}

console.log(`${checks.length + 4} checks passed`);

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { skills, workflows } from './registry.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');

export function repoRoot() { return ROOT; }
export function parseArgs(argv) {
  const result = { _: [] };
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg.startsWith('--')) { const pair = arg.slice(2).split('='); const key = pair[0]; if (pair[1] !== undefined) result[key] = pair.slice(1).join('='); else if (argv[i + 1] && !argv[i + 1].startsWith('-')) result[key] = argv[++i]; else result[key] = true; }
    else if (arg.startsWith('-') && arg.length > 1) { const key = arg.slice(1); if (argv[i + 1] && !argv[i + 1].startsWith('-')) result[key] = argv[++i]; else result[key] = true; }
    else result._.push(arg);
  }
  return result;
}

export function resolveFromRoot(filePath) {
  if (path.isAbsolute(filePath)) return filePath;
  const cwdPath = path.resolve(process.cwd(), filePath);
  if (fs.existsSync(cwdPath)) return cwdPath;
  return path.resolve(ROOT, filePath);
}

export function readText(filePath) { return fs.readFileSync(resolveFromRoot(filePath), 'utf8'); }
export function writeText(filePath, content) { const resolved = path.isAbsolute(filePath) ? filePath : path.resolve(process.cwd(), filePath); fs.mkdirSync(path.dirname(resolved), { recursive: true }); fs.writeFileSync(resolved, content, "utf8"); }

export function formatTable(headers, rows) {
  const all = [headers, ...rows];
  const widths = headers.map((_, i) => Math.max(...all.map(row => String(row[i] ?? '').length)));
  const line = row => '| ' + row.map((cell, i) => String(cell ?? '').padEnd(widths[i])).join(' | ') + ' |';
  return [line(headers), '| ' + widths.map(w => '-'.repeat(w)).join(' | ') + ' |', ...rows.map(line)].join('\n');
}

export function ensureWorkspace(targetDir) {
  const root = path.resolve(targetDir);
  const files = { '.pm-ai/context.md': '# Contexto do Produto\n\nDescreva produto, público, problema, estágio, restrições e objetivo.\n', '.pm-ai/inputs/brief.md': '# Brief inicial\n\nCole aqui o briefing bruto.\n', '.pm-ai/outputs/.gitkeep': '', 'PRODUCT_BRIEF.md': '# Product Brief\n\n## Produto\n\n## Público alvo\n\n## Problema\n\n## Solução proposta\n\n## Métrica de sucesso\n\n## Restrições\n\n## Dúvidas abertas\n' };
  const created = [];
  for (const [relative, content] of Object.entries(files)) { const full = path.join(root, relative); fs.mkdirSync(path.dirname(full), { recursive: true }); if (!fs.existsSync(full)) { fs.writeFileSync(full, content, "utf8"); created.push(relative); } else created.push(relative + " (já existia)"); }
  return created;
}

function hasAny(text, patterns) { return patterns.some(pattern => pattern.test(text)); }
export function renderDiagnosis(brief, options = {}) {
  const checks = [['Problema claro', [/problema/i,/dor/i,/necessidade/i,/fricção/i]], ['Usuário/ICP definido', [/usu[aá]rio/i,/cliente/i,/persona/i,/icp/i,/p[uú]blico/i]], ['Proposta de valor', [/valor/i,/benef[ií]cio/i,/promessa/i,/resultado/i]], ['Métrica de sucesso', [/m[eé]trica/i,/kpi/i,/north star/i,/convers[aã]o/i,/reten[cç][aã]o/i]], ['Escopo/MVP', [/mvp/i,/escopo/i,/vers[aã]o/i,/lan[cç]ar/i]], ['Canal/distribuição', [/canal/i,/aquisi[cç][aã]o/i,/vendas/i,/marketing/i]], ['Riscos/restrições', [/risco/i,/restri[cç][aã]o/i,/depend[eê]ncia/i,/limita[cç][aã]o/i]], ['Modelo de receita', [/receita/i,/pre[cç]o/i,/monetiza/i,/ticket/i]]];
  const scored = checks.map(([label, patterns]) => [label, hasAny(brief, patterns) ? 1 : 0]);
  const total = scored.reduce((sum, item) => sum + item[1], 0);
  const percent = Math.round((total / scored.length) * 100);
  const missing = scored.filter(item => item[1] === 0).map(item => item[0]);
  const strengths = scored.filter(item => item[1] === 1).map(item => item[0]);
  const maturity = percent < 45 ? 'ideia ainda nebulosa' : percent < 75 ? 'produto em estruturação' : 'produto com boa base para execução';
  return ['# Diagnóstico Product Management AI', '', 'Fonte analisada: ' + (options.source || 'entrada direta'), '', '## Leitura executiva', '', 'Maturidade estimada: **' + maturity + '**  ', 'Completude do briefing: **' + percent + '%**', '', '## Pontos já presentes', '', strengths.length ? strengths.map(x => '- ' + x).join('\n') : '- Nenhum sinal forte encontrado.', '', '## Lacunas críticas', '', missing.length ? missing.map(x => '- ' + x).join('\n') : '- Nenhuma lacuna crítica óbvia encontrada.', '', '## Perguntas de PM', '', '1. Qual usuário tem a dor mais urgente?', '2. Qual resultado mensurável prova que o produto funciona?', '3. Qual parte pode ser removida sem matar a proposta de valor?', '4. Qual hipótese mais arriscada precisa ser testada antes de construir?', '5. Que evidência real existe hoje?', '', '## Plano recomendado de 10 dias', '', '| Dia | Foco | Entrega |', '| --- | --- | --- |', '| 1 | Alinhamento | Objetivo de negócio e restrições |', '| 2 | ICP | Persona prioritária e jobs to be done |', '| 3 | Pesquisa | Roteiro de entrevista |', '| 4 | Evidência | Síntese de dores |', '| 5 | Proposta | Promessa e diferenciação |', '| 6 | MVP | Escopo mínimo |', '| 7 | Métricas | North Star e funil |', '| 8 | Backlog | Histórias e prioridades |', '| 9 | Experimento | Teste Lean |', '| 10 | Decisão | Continuar, ajustar, pausar ou matar |', '', '## Brief analisado', '', brief.trim() || '_Entrada vazia._'].join('\n') + '\n';
}

export function renderWorkflowResult(workflowId, brief, options = {}) {
  const workflow = workflows.find(item => item.id === workflowId);
  if (!workflow) throw new Error("Workflow não encontrado: " + workflowId);
  const phases = workflow.phases.map((phase, index) => '### ' + (index + 1) + '. ' + phase + '\n\n**Perguntas**\n- O que precisa ser verdade para avançar?\n- Que evidência existe hoje?\n- Qual decisão será tomada?\n\n**Entrega**\n- Documento curto com decisão, evidências, riscos e próximos passos.').join('\n\n');
  return ['# ' + workflow.title, '', 'Fonte: ' + (options.source || 'entrada direta'), '', '## Objetivo', '', workflow.description, '', '## Contexto de entrada', '', brief.trim() || '_Entrada vazia._', '', '## Fases', '', phases, '', '## Artefatos esperados', '', workflow.outputs.map(x => '- ' + x).join('\n'), '', '## Critérios de qualidade', '', '- O plano deixa claro o que será feito e o que não será feito.', '- Cada hipótese tem métrica ou sinal de aprendizado.', '- O MVP preserva valor com o menor escopo possível.', '- Riscos técnicos, comerciais e operacionais estão visíveis.'].join('\n') + '\n';
}

export function listTemplateIds() { return fs.readdirSync(path.join(ROOT, "templates")).filter(f => f.endsWith(".md")).map(f => f.replace(/\.md$/, "")); }
export function copyTemplate(templateId, outputPath) { const candidate = path.join(ROOT, "templates", templateId + ".md"); if (!fs.existsSync(candidate)) throw new Error("Template não encontrado: " + templateId); writeText(outputPath, fs.readFileSync(candidate, "utf8")); }
export function readSkill(id) { const skill = skills.find(item => item.id === id); if (!skill) throw new Error("Skill não encontrada: " + id); return readText(skill.path); }
export function validateRepository(root) { const required = ["README.md","package.json","bin/pm-ai.js","lib/core.js","lib/registry.js","AGENTS.md","docs/getting-started.md","skills/principal-pm/skill.md","templates/prd.md"]; const missing = required.filter(relative => !fs.existsSync(path.join(root, relative))); const ok = missing.length === 0; return { ok, markdown: "# Doctor\n\nStatus: **" + (ok ? "OK" : "com pendências") + "**\n\n" + (ok ? "Todos os arquivos essenciais foram encontrados." : "Arquivos faltando:\n" + missing.map(x => "- " + x).join("\n")) + "\n\nRaiz: " + root + "\n" }; }

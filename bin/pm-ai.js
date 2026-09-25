#!/usr/bin/env node
import process from 'node:process';
import { parseArgs, readText, writeText, ensureWorkspace, formatTable, renderDiagnosis, renderWorkflowResult, copyTemplate, listTemplateIds, readSkill, validateRepository, repoRoot } from '../lib/core.js';
import { agents, skills, workflows } from '../lib/registry.js';

const args = parseArgs(process.argv.slice(2));
const command = args._[0] || 'help';
function print(text = '') { process.stdout.write(String(text) + '\n'); }
function fail(message) { process.stderr.write('Erro: ' + message + '\n'); process.exit(1); }
function help() { print(['# Product Management AI CLI','','Uso: pm-ai <comando> [opções]','','Comandos:','  help                         Mostra ajuda','  version                      Mostra versão','  init [--path DIR]            Cria workspace .pm-ai e PRODUCT_BRIEF.md','  team                         Lista o time de produto AI','  skills                       Lista skills disponíveis','  skill <id> [--output FILE]   Mostra ou salva uma skill','  workflows                    Lista workflows disponíveis','  diagnose --input FILE        Diagnóstico de produto em Markdown','  run <workflow> --input FILE  Executa um workflow guiado','  template <id> --output FILE  Copia template','  doctor                       Valida estrutura do repositório','','Exemplos:','  pm-ai init','  pm-ai team','  pm-ai diagnose --input examples/sample-brief.md --output product-diagnosis.md','  pm-ai run mvp-sprint --input PRODUCT_BRIEF.md --output mvp-plan.md'].join('\n')); }
try {
  switch (command) {
    case 'help': case '--help': case '-h': help(); break;
    case 'version': case '--version': case '-v': print(JSON.parse(readText('package.json')).version); break;
    case 'init': { const target = args.path || args.p || process.cwd(); const created = ensureWorkspace(target); print('# Workspace Product Management AI criado\n\n' + created.map(x => '- ' + x).join('\n')); break; }
    case 'team': print('# Time de Produto AI\n'); print(formatTable(['ID','Função','Missão'], agents.map(a => [a.id, a.name, a.mission]))); break;
    case 'skills': print('# Skills disponíveis\n'); print(formatTable(['ID','Skill','Quando usar'], skills.map(s => [s.id, s.title, s.whenToUse]))); break;
    case 'skill': { const id = args._[1]; if (!id) fail('informe o id da skill'); const content = readSkill(id); const output = args.output || args.o; if (output) { writeText(output, content); print('Skill salva em ' + output); } else print(content); break; }
    case 'workflows': print('# Workflows disponíveis\n'); print(formatTable(['ID','Workflow','Descrição'], workflows.map(w => [w.id, w.title, w.description]))); break;
    case 'diagnose': { const input = args.input || args.i; if (!input) fail('use --input FILE'); const output = renderDiagnosis(readText(input), { source: input }); const target = args.output || args.o; if (target) { writeText(target, output); print('Diagnóstico salvo em ' + target); } else print(output); break; }
    case 'run': { const workflowId = args._[1]; if (!workflowId) fail('informe o workflow'); const input = args.input || args.i; if (!input) fail('use --input FILE'); const output = renderWorkflowResult(workflowId, readText(input), { source: input }); const target = args.output || args.o; if (target) { writeText(target, output); print('Workflow ' + workflowId + ' salvo em ' + target); } else print(output); break; }
    case 'template': { const id = args._[1]; if (!id) { print(listTemplateIds().map(x => '- ' + x).join('\n')); break; } const output = args.output || args.o; if (!output) fail('use --output FILE'); copyTemplate(id, output); print('Template ' + id + ' copiado para ' + output); break; }
    case 'doctor': { const report = validateRepository(repoRoot()); print(report.markdown); process.exit(report.ok ? 0 : 1); break; }
    default: fail('comando desconhecido: ' + command);
  }
} catch (error) { fail(error.message); }


export const MATURITY_DIMENSIONS = [
  { id: 'strategy', label: 'Estratégia', weight: 1.1, signals: ['visão', 'tese', 'posicionamento', 'objetivo', 'north star', 'estratégia'] },
  { id: 'customer', label: 'Cliente e mercado', weight: 1.2, signals: ['cliente', 'icp', 'persona', 'dor', 'jobs', 'mercado', 'segmento'] },
  { id: 'value', label: 'Proposta de valor / PUV', weight: 1.2, signals: ['proposta de valor', 'puv', 'diferenciação', 'oferta', 'promessa', 'valor'] },
  { id: 'product', label: 'Produto / MVP', weight: 1.1, signals: ['produto', 'mvp', 'protótipo', 'roadmap', 'backlog', 'prd'] },
  { id: 'technology', label: 'Tecnologia e arquitetura', weight: 1, signals: ['sistema', 'software', 'api', 'arquitetura', 'código', 'repositório', 'stack'] },
  { id: 'data_ai', label: 'Dados, IA e MLOps', weight: 1, signals: ['dados', 'ia', 'mlops', 'modelo', 'automação', 'analytics', 'score'] },
  { id: 'growth_gtm', label: 'Growth e GTM', weight: 1.1, signals: ['growth', 'gtm', 'canal', 'vendas', 'marketing', 'funil', 'aquisição'] },
  { id: 'operations', label: 'Operação e processos', weight: 1, signals: ['operação', 'processo', 'sop', 'time', 'ritual', 'atendimento', 'entrega'] },
  { id: 'finance', label: 'Financeiro / unit economics', weight: 0.9, signals: ['receita', 'ticket', 'preço', 'margem', 'cac', 'ltv', 'custo'] },
  { id: 'governance', label: 'Governança e risco', weight: 0.8, signals: ['contrato', 'legal', 'compliance', 'risco', 'segurança', 'governança'] }
];

export const COMPANY_STAGES = [
  { id: 'idea', label: 'Ideação', objective: 'Transformar uma ideia em hipótese clara de negócio.' },
  { id: 'discovery', label: 'Discovery', objective: 'Validar dor, ICP, jobs to be done, PUV e disposição de adoção/pagamento.' },
  { id: 'prototype', label: 'Protótipo', objective: 'Materializar a solução antes de construir pesado.' },
  { id: 'mvp', label: 'MVP', objective: 'Entregar a menor versão que valida valor real.' },
  { id: 'gtm', label: 'GTM', objective: 'Criar canais, mensagem, funil e processo comercial.' },
  { id: 'operation', label: 'Operação', objective: 'Padronizar atendimento, entrega, suporte, qualidade e gestão.' },
  { id: 'scale', label: 'Escala', objective: 'Aumentar receita, eficiência, automação, dados e confiabilidade.' }
];

function contains(text, word) {
  return text.toLowerCase().includes(word.toLowerCase());
}

function scoreDimension(text, dimension, repoAnalysis = null) {
  const hits = dimension.signals.filter(signal => contains(text, signal)).length;
  let score = Math.min(5, Math.round((hits / Math.max(1, dimension.signals.length)) * 5 + (hits ? 1 : 0)));
  if (repoAnalysis && ['technology', 'product', 'data_ai'].includes(dimension.id)) {
    if ((repoAnalysis.project?.files_scanned || 0) > 5) score = Math.max(score, 3);
    if ((repoAnalysis.architecture?.layers || []).length > 2) score = Math.max(score, 4);
  }
  return Math.max(1, Math.min(5, score || 1));
}

function maturityLevel(total) {
  if (total < 1.8) return 'Inicial / informal';
  if (total < 2.6) return 'Em estruturação';
  if (total < 3.4) return 'Operacional';
  if (total < 4.2) return 'Escalável';
  return 'Empresa orientada por sistema';
}

function recommendedStage(scores) {
  const low = scores.filter(s => s.score <= 2).map(s => s.id);
  if (low.includes('customer') || low.includes('value')) return 'discovery';
  if (low.includes('product')) return 'prototype';
  if (low.includes('growth_gtm')) return 'gtm';
  if (low.includes('operations')) return 'operation';
  return 'scale';
}

export function generateCompanyDossier(input = {}, repoAnalysis = null) {
  const text = [
    input.companyName, input.companyType, input.industry, input.idea,
    input.currentState, input.goals, input.customers, input.channels,
    input.team, input.operations, input.technology, input.data, input.constraints
  ].filter(Boolean).join('\n');
  const scores = MATURITY_DIMENSIONS.map(dim => ({ ...dim, score: scoreDimension(text, dim, repoAnalysis) }));
  const weighted = scores.reduce((sum, item) => sum + item.score * item.weight, 0) / scores.reduce((sum, item) => sum + item.weight, 0);
  const stageId = recommendedStage(scores);
  const stage = COMPANY_STAGES.find(s => s.id === stageId) || COMPANY_STAGES[0];
  const companyName = input.companyName || 'Empresa / Ideia';
  const type = input.companyType || 'startup ou empresa em transformação digital';
  const markdown = renderDossierMarkdown({ input, repoAnalysis, scores, weighted, stage, companyName, type });
  return {
    ok: true,
    generatedAt: new Date().toISOString(),
    companyName,
    companyType: type,
    maturity: { score: Number(weighted.toFixed(2)), level: maturityLevel(weighted), recommendedStage: stage },
    dimensions: scores,
    stages: COMPANY_STAGES,
    markdown
  };
}

function renderScoreTable(scores) {
  return ['| Área | Nota 1-5 | Leitura |', '| --- | ---: | --- |', ...scores.map(s => `| ${s.label} | ${s.score} | ${s.score <= 2 ? 'Prioridade alta' : s.score <= 3 ? 'Precisa estruturar' : 'Boa base'} |`)].join('\n');
}

function renderDossierMarkdown({ input, repoAnalysis, scores, weighted, stage, companyName, type }) {
  const repoBlock = repoAnalysis ? `\n## Código / repositório analisado\n\n- Arquivos: **${repoAnalysis.project?.files_scanned || 0}**\n- Linhas: **${repoAnalysis.project?.total_lines || 0}**\n- Camadas detectadas: ${(repoAnalysis.architecture?.layers || []).join(', ') || 'não detectadas'}\n` : '\n## Código / repositório\n\nNenhum repositório foi anexado ainda. A análise pode começar apenas pela ideia/empresa e depois incorporar código local ou GitHub.\n';
  return `# Dossiê Startup AI OS · ${companyName}\n\n## Leitura executiva\n\nTipo: **${type}**.\n\nMaturidade estimada: **${maturityLevel(weighted)}** (${weighted.toFixed(2)}/5).\n\nFase recomendada: **${stage.label}** — ${stage.objective}\n\n## Ideia / contexto\n\n${input.idea || input.currentState || 'Contexto ainda não descrito.'}\n\n${repoBlock}\n\n## Maturidade por área\n\n${renderScoreTable(scores)}\n\n## PV / PUV\n\n**PV provisória:** entregar um resultado claro para um público específico com menos fricção, mais previsibilidade e melhor experiência.\n\n**PUV provisória:** combinar negócio, tecnologia, IA, dados, operações e growth em um sistema único para criar, digitalizar ou escalar a empresa.\n\n## SWOT\n\n| Forças | Fraquezas |\n| --- | --- |\n| Existe intenção de estruturar tecnologia, negócio e operação. | A maturidade ainda precisa ser validada com dados reais e clientes. |\n| Pode conectar mundo físico e digital. | Risco de escopo amplo demais sem priorização. |\n\n| Oportunidades | Ameaças |\n| --- | --- |\n| Digitalização, IA, automação, dados, canais digitais e eficiência operacional. | Concorrência, adoção baixa, dependência de pessoas-chave e falta de foco. |\n\n## GTM\n\n1. Definir ICP prioritário.\n2. Escrever promessa e PUV em linguagem simples.\n3. Criar prova de valor em 7 dias.\n4. Escolher canal principal: outbound, conteúdo, parcerias, comunidade, performance ou vendas consultivas.\n5. Montar funil: atração → diagnóstico → proposta → fechamento → onboarding → retenção.\n\n## Arquitetura de dados / IA\n\n- Mapear dados disponíveis e dados necessários.\n- Definir eventos críticos do funil e da operação.\n- Criar score de oportunidade/risco.\n- Definir governança de prompts, agentes, avaliações e qualidade.\n- Separar o que pertence ao Startup AI OS e o que será DevOps OS.\n\n## Kanban inicial\n\n| Backlog | Fazer agora | Fazendo | Validar |\n| --- | --- | --- | --- |\n| Pesquisa de cliente | ICP e dor principal | Protótipo | Entrevistas |\n| Canvas e PUV | Plano 7 dias | MVP | Métricas |\n| Stack tecnológica | Backlog | GTM | Aprendizados |\n\n## Roadmap\n\n### Próximos 7 dias\n- Definir ICP, dor e PUV.\n- Criar brief da empresa/ideia.\n- Rodar 5 a 10 entrevistas.\n- Criar prova de valor.\n\n### Próximos 30 dias\n- Validar proposta, canal e MVP.\n- Organizar backlog e rotina ágil.\n- Medir ativação, interesse e conversão.\n\n### Próximos 90 dias\n- Escalar o canal que funciona.\n- Padronizar operação.\n- Criar sistema de dados e automação.\n- Revisar unit economics.\n\n## Próxima ação recomendada\n\nComece pela fase **${stage.label}** e transforme este dossiê em tarefas no Kanban.\n`;
}


export const SOLUTION_DOMAINS = [
  { id: 'strategy', label: 'Estratégia e tese', owner: 'Founder / Strategist' },
  { id: 'market', label: 'Mercado, ICP e cliente', owner: 'Discovery / Growth' },
  { id: 'process', label: 'Processos e operação', owner: 'Operations Architect' },
  { id: 'product', label: 'Produto digital / sistema', owner: 'Product Architect' },
  { id: 'data', label: 'Dados, BI e IA', owner: 'Data & AI Architect' },
  { id: 'automation', label: 'Automações e agentes', owner: 'AI Automation Architect' },
  { id: 'tech', label: 'Stack e arquitetura técnica', owner: 'Solution Architect' },
  { id: 'gtm', label: 'GTM, growth e vendas', owner: 'Growth Architect' },
  { id: 'people', label: 'Pessoas, papéis e rituais', owner: 'Operating System Lead' }
];

const DEFAULT_STACK = {
  noCode: ['Airtable/SmartSuite', 'Notion', 'Make/Zapier/n8n', 'Typeform/Tally', 'Webflow/Framer'],
  product: ['Figma', 'Linear/Jira', 'PostHog', 'Hotjar', 'Storybook'],
  code: ['Next.js/React', 'Node.js', 'Python/FastAPI', 'Postgres/Supabase', 'Redis'],
  ai: ['OpenAI/Gemini/Claude', 'local harness', 'RAG', 'evals', 'agent workflows'],
  data: ['Postgres', 'dbt', 'Metabase/Lightdash', 'warehouse/lakehouse', 'event tracking'],
  devops: ['GitHub Actions', 'Docker', 'Vercel/Fly/Render', 'observability', 'secrets manager']
};

function asText(value) {
  if (Array.isArray(value)) return value.filter(Boolean).join('\n');
  return String(value || '').trim();
}

function splitList(text) {
  return asText(text).split(/\n|,|;/).map(x => x.trim()).filter(Boolean).slice(0, 24);
}

function detectMissing(input) {
  const missing = [];
  if (!asText(input.icp)) missing.push('ICP/persona ainda não está claro');
  if (!asText(input.coreProblem)) missing.push('dor/problema central precisa ser escrito em linguagem do cliente');
  if (!asText(input.currentProcesses)) missing.push('processos atuais não foram mapeados');
  if (!asText(input.dataSources)) missing.push('fontes de dados e eventos críticos não foram definidos');
  if (!asText(input.channels)) missing.push('canais de aquisição/GTM precisam ser priorizados');
  if (!asText(input.metrics)) missing.push('métricas e North Star precisam ser definidas');
  return missing;
}

function processCards(input) {
  const raw = splitList(input.currentProcesses || input.processes);
  const fallback = ['Aquisição', 'Diagnóstico / atendimento', 'Proposta / venda', 'Onboarding', 'Entrega', 'Suporte', 'Retenção', 'Gestão e indicadores'];
  return (raw.length ? raw : fallback).map((name, index) => ({
    id: `process-${index + 1}`,
    type: 'process',
    title: name,
    owner: 'Ops + Product',
    problem: index < 3 ? 'Mapear gargalos, tempos, responsáveis e dados capturados.' : 'Padronizar operação, qualidade e medição.',
    automation: 'Identificar se existe tarefa repetitiva, decisão baseada em regra, triagem, mensagem ou relatório que pode virar automação/agente.',
    output: 'SOP, evento de dados, card de backlog e métrica.'
  }));
}

function agentCards(input) {
  return [
    { id: 'agent-discovery', type: 'ai-agent', title: 'Agente de Discovery', where: 'Briefing, entrevistas, ICP, dores e JTBD', jobs: ['organizar informações do cliente', 'sugerir perguntas', 'extrair padrões'] },
    { id: 'agent-growth', type: 'ai-agent', title: 'Agente de GTM/Growth', where: 'Canais, oferta, campanhas, funil e CRM', jobs: ['sugerir experimentos', 'priorizar canais', 'analisar mensagens'] },
    { id: 'agent-ops', type: 'ai-agent', title: 'Agente de Operações', where: 'Atendimento, entrega, follow-up, qualidade', jobs: ['classificar solicitações', 'gerar SOP', 'alertar gargalos'] },
    { id: 'agent-data', type: 'ai-agent', title: 'Agente de Dados/BI', where: 'Eventos, métricas, dashboards e previsões', jobs: ['mapear eventos', 'gerar indicadores', 'apontar anomalias'] },
    { id: 'agent-product', type: 'ai-agent', title: 'Agente de Produto', where: 'PRD, backlog, MVP, roadmap e releases', jobs: ['gerar backlog', 'escrever PRD', 'avaliar impacto'] }
  ];
}

function systemCards(input) {
  const wantsExistingRepo = Boolean(asText(input.repositoryPath) || asText(input.githubUrl));
  return [
    {
      id: 'system-intake', type: 'system', title: 'Camada de diagnóstico / intake',
      purpose: 'Capturar ideia, empresa, processos, dores, canais, dados, site, redes e repositório quando existir.',
      build: 'Formulário guiado + chat + upload/link/adapters.'
    },
    {
      id: 'system-knowledge', type: 'system', title: 'Base de conhecimento da empresa',
      purpose: 'Guardar contexto, evidências, processos, documentos, decisões e aprendizados.',
      build: 'Arquivos locais, markdown, banco, embeddings/RAG quando houver volume.'
    },
    {
      id: 'system-automation', type: 'system', title: 'Motor de automações e agentes',
      purpose: 'Executar rotinas, follow-ups, classificação, geração de relatórios e alertas.',
      build: 'n8n/Make/Zapier no começo; depois workers e filas se virar produto.'
    },
    {
      id: 'system-product', type: 'system', title: wantsExistingRepo ? 'Produto/código existente conectado' : 'Produto digital a desenvolver',
      purpose: wantsExistingRepo ? 'Analisar repositório, arquitetura e gaps.' : 'Projetar o sistema que resolve gargalos do negócio.',
      build: wantsExistingRepo ? 'Local path agora; GitHub adapter com OAuth/token em próxima camada.' : 'Protótipo, MVP, APIs, banco, painel, CRM, automações e analytics.'
    },
    {
      id: 'system-data', type: 'system', title: 'Camada de dados, métricas e BI',
      purpose: 'Capturar eventos do funil/operacional e transformar em decisões.',
      build: 'Postgres + tracking + dashboards + score/IA conforme maturidade.'
    }
  ];
}

function stackRecommendations(input) {
  const maturity = input.digitalMaturity || 'early';
  const hasRepo = Boolean(asText(input.repositoryPath) || asText(input.githubUrl));
  const traditional = String(input.companyType || '').includes('traditional') || String(input.companyType || '').includes('physical');
  const base = [];
  if (traditional) base.push({ stage: 'Começar leve', stack: DEFAULT_STACK.noCode, why: 'Digitalizar rápido antes de codificar pesado.' });
  base.push({ stage: 'Produto e experiência', stack: DEFAULT_STACK.product, why: 'Transformar diagnóstico em protótipo, PRD, backlog e métricas.' });
  base.push({ stage: hasRepo ? 'Evoluir código existente' : 'Construir MVP', stack: DEFAULT_STACK.code, why: hasRepo ? 'Auditar, organizar, refatorar e criar módulos novos.' : 'Criar produto digital escalável após validação.' });
  base.push({ stage: 'IA e agentes', stack: DEFAULT_STACK.ai, why: 'Automatizar diagnóstico, suporte, análise, growth e operação.' });
  base.push({ stage: 'Dados e governança', stack: DEFAULT_STACK.data, why: 'Medir funil, processos e decisões críticas.' });
  base.push({ stage: 'DevOps / depois', stack: DEFAULT_STACK.devops, why: 'Quando houver produto em produção e necessidade de confiabilidade.' });
  return base;
}

function roadmap(input) {
  return [
    { horizon: 'Agora / 7 dias', actions: ['Completar diagnóstico', 'Mapear processos críticos', 'Definir ICP/dor/PUV', 'Criar primeiro canvas', 'Escolher 1 prova de valor'] },
    { horizon: '30 dias', actions: ['Validar com clientes/usuários', 'Desenhar arquitetura do negócio', 'Criar protótipo/MVP', 'Definir stack inicial', 'Criar Kanban e rituais'] },
    { horizon: '90 dias', actions: ['Implantar MVP ou automações principais', 'Medir funil e operação', 'Criar dashboards', 'Conectar repositório/código se houver', 'Rodar GTM inicial'] },
    { horizon: '6 meses', actions: ['Escalar canais', 'Automatizar processos', 'Criar camada de dados/IA', 'Consolidar produto digital', 'Preparar DevOps OS se houver operação em produção'] }
  ];
}

export function generateSolutionArchitecture(input = {}, repoAnalysis = null, webSnapshots = []) {
  const contextText = [
    input.companyName, input.companyType, input.idea, input.icp, input.coreProblem,
    input.currentProcesses, input.tools, input.channels, input.dataSources, input.metrics,
    input.team, input.budget, input.constraints, input.siteUrl, input.socialLinks,
    webSnapshots.map(s => [s.title, s.description, s.headings?.join(' ')].join(' ')).join(' ')
  ].filter(Boolean).join('\n');
  const missing = detectMissing(input);
  const process = processCards(input);
  const agents = agentCards(input);
  const systems = systemCards(input);
  const stack = stackRecommendations(input);
  const repoCard = repoAnalysis ? {
    connected: true,
    files: repoAnalysis.project?.files_scanned || 0,
    lines: repoAnalysis.project?.total_lines || 0,
    layers: repoAnalysis.architecture?.layers || []
  } : {
    connected: false,
    message: 'Sem repositório conectado. Primeiro arquitetar negócio, processos e sistema; depois conectar código local ou GitHub.'
  };
  const cards = [
    { id: 'business-architecture', type: 'architecture', title: 'Arquitetura do negócio', description: 'Como a empresa cria, entrega e captura valor.', owner: 'Strategist + Founder' },
    { id: 'process-architecture', type: 'architecture', title: 'Arquitetura de processos', description: 'Onde existem processos, onde faltam processos e onde automatizar.', owner: 'Operations Architect' },
    { id: 'ai-architecture', type: 'architecture', title: 'Arquitetura de IA e agentes', description: 'Onde entram agentes, copilotos, automações e inteligência operacional.', owner: 'AI Architect' },
    { id: 'solution-architecture', type: 'architecture', title: 'Arquitetura de solução', description: 'Sistemas, integrações, dados, APIs, ferramentas e produto digital.', owner: 'Solution Architect' },
    { id: 'gtm-architecture', type: 'architecture', title: 'Arquitetura de GTM', description: 'Oferta, canal, funil, vendas, onboarding, retenção e growth loops.', owner: 'Growth Architect' }
  ];
  return {
    ok: true,
    generatedAt: new Date().toISOString(),
    mode: input.mode || (repoAnalysis ? 'existing-with-code' : 'business-architecture-first'),
    summary: {
      companyName: input.companyName || 'Empresa / ideia',
      companyType: input.companyType || 'não informado',
      hasRepository: Boolean(repoAnalysis),
      hasWebsite: webSnapshots.length > 0,
      missing
    },
    domains: SOLUTION_DOMAINS,
    cards,
    process,
    agents,
    systems,
    stack,
    roadmap: roadmap(input),
    repo: repoCard,
    matrices: {
      swot: {
        strengths: ['Conhecimento do negócio pode virar sistema replicável', 'Possibilidade de conectar físico e digital'],
        weaknesses: missing.slice(0, 3),
        opportunities: ['Automação com IA', 'Digitalização de processos', 'GTM mais mensurável', 'Produto digital escalável'],
        threats: ['Escopo amplo demais', 'Baixa adoção interna', 'Dados fragmentados', 'Construir tecnologia antes de validar processo']
      },
      eisenhower: {
        urgentImportant: ['Mapear processos críticos', 'Definir problema central', 'Identificar onde IA gera ganho rápido'],
        importantNotUrgent: ['Arquitetura de dados', 'Stack futura', 'Governança de agentes', 'Cultura de métricas'],
        urgentNotImportant: ['Ferramentas sem processo claro', 'Tela bonita antes de validação'],
        eliminate: ['Automatizar processo que ninguém usa', 'Criar IA sem dados ou objetivo']
      },
      prioritization: ['MoSCoW para escopo', 'ICE para experimentos', 'RICE quando houver alcance', 'Kanban para execução diária', 'Scrum quando houver time de produto/engenharia']
    },
    markdown: renderArchitectureMarkdown({ input, repoAnalysis, webSnapshots, missing, process, agents, systems, stack })
  };
}

function renderArchitectureMarkdown({ input, repoAnalysis, webSnapshots, missing, process, agents, systems, stack }) {
  return `# Arquitetura Startup AI OS · ${input.companyName || 'Empresa / Ideia'}\n\n## Leitura central\n\nAntes de olhar para código, o sistema precisa entender a arquitetura do negócio: processos, pessoas, canais, dados, ferramentas, gargalos, cliente, oferta e operação. Repositório é opcional: se existir, ele entra como evidência técnica; se não existir, primeiro desenhamos a solução.\n\n## Repositório\n\n${repoAnalysis ? `Código conectado: ${repoAnalysis.project?.files_scanned || 0} arquivos, ${repoAnalysis.project?.total_lines || 0} linhas.` : 'Nenhum repositório conectado. Caminho recomendado: arquitetar negócio → processos → produto digital → MVP → repositório.'}\n\n## Site / redes\n\n${webSnapshots.length ? webSnapshots.map(s => `- ${s.url}: ${s.title || 'sem título'}`).join('\n') : 'Nenhum site/rede analisado ainda. Quando informado, entra como evidência de posicionamento, oferta, autoridade e funil.'}\n\n## Lacunas críticas\n\n${missing.map(x => `- ${x}`).join('\n') || '- Sem lacunas críticas óbvias.'}\n\n## Processos prioritários\n\n${process.map(p => `- **${p.title}**: ${p.problem}`).join('\n')}\n\n## Onde entram agentes de IA\n\n${agents.map(a => `- **${a.title}** em ${a.where}: ${a.jobs.join(', ')}.`).join('\n')}\n\n## Sistemas a construir/conectar\n\n${systems.map(s => `- **${s.title}**: ${s.purpose}`).join('\n')}\n\n## Stack sugerida\n\n${stack.map(s => `- **${s.stage}**: ${s.stack.join(', ')}. Motivo: ${s.why}`).join('\n')}\n`;
}

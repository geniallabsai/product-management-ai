
export const startupDomains = [
  {
    id: 'strategy',
    name: 'Strategy & Founder Office',
    mission: 'Definir visão, tese, posicionamento, narrativa, modelo de negócio e escolhas estratégicas.',
    artifacts: ['Tese de negócio', 'North Star', 'Business Model Canvas', 'Mapa de riscos', 'Narrativa executiva']
  },
  {
    id: 'customer',
    name: 'Customer Discovery & Market',
    mission: 'Entender mercado, ICP, segmentos, dores, jobs to be done, canais e competição.',
    artifacts: ['ICP', 'Jobs to be done', 'Roteiro de entrevista', 'Mapa competitivo', 'Síntese de evidências']
  },
  {
    id: 'value',
    name: 'Value Proposition & Offer',
    mission: 'Criar proposta de valor, PUV, promessa, oferta, embalagem, pricing e diferenciação.',
    artifacts: ['PV', 'PUV', 'Value Proposition Canvas', 'Oferta', 'Pricing hypothesis']
  },
  {
    id: 'product',
    name: 'Product Management',
    mission: 'Transformar problema em produto, MVP, PRD, roadmap, backlog, métricas e melhoria contínua.',
    artifacts: ['PRD', 'Roadmap', 'Backlog', 'MVP scorecard', 'Critérios de aceite']
  },
  {
    id: 'design',
    name: 'Design & Experience',
    mission: 'Criar jornada, fluxos, protótipos, UX, UI e experiência ponta a ponta.',
    artifacts: ['Jornada', 'Wireframe', 'Protótipo', 'Design system', 'Teste de usabilidade']
  },
  {
    id: 'engineering',
    name: 'Engineering & Architecture',
    mission: 'Definir arquitetura, stack, módulos, integrações, APIs, qualidade e entrega incremental.',
    artifacts: ['Arquitetura', 'Mapa de módulos', 'ADR', 'API contract', 'Plano técnico']
  },
  {
    id: 'data-ai-mlops',
    name: 'Data, AI & MLOps',
    mission: 'Projetar dados, automações, modelos, agentes, avaliação, governança e ciclo de ML/AI.',
    artifacts: ['Mapa de dados', 'Modelo de score', 'MLOps pipeline', 'Eval plan', 'AI governance']
  },
  {
    id: 'devops',
    name: 'DevOps & Platform',
    mission: 'Organizar ambientes, CI/CD, deploy, observabilidade, segurança e confiabilidade.',
    artifacts: ['CI/CD map', 'Ambientes', 'Runbook', 'Observabilidade', 'Release plan'],
    boundary: 'O Startup AI OS lê impacto e versão. Execução profunda de infra pode virar DevOps OS.'
  },
  {
    id: 'growth',
    name: 'Growth, Marketing & Sales',
    mission: 'Criar aquisição, ativação, retenção, receita, canais, funil, CRM e experimentos de crescimento.',
    artifacts: ['Funil AARRR', 'Growth loops', 'Plano de canais', 'Sales playbook', 'Experimentos']
  },
  {
    id: 'operations',
    name: 'Operations & Delivery',
    mission: 'Traduzir estratégia em operação física/digital, processos, qualidade, playbooks e rotina.',
    artifacts: ['SOPs', 'Rituais', 'SLAs internos', 'Mapa de processo', 'Gestão de capacidade']
  },
  {
    id: 'finance-legal',
    name: 'Finance, Legal & Governance',
    mission: 'Dar visibilidade a custos, unit economics, riscos legais, contratos, governança e compliance.',
    artifacts: ['Unit economics', 'Budget', 'Contrato', 'Matriz de riscos', 'Políticas']
  },
  {
    id: 'people-culture',
    name: 'People, Culture & Learning',
    mission: 'Criar papéis, competências, treinamento, cultura, accountability e aprendizagem contínua.',
    artifacts: ['Org design', 'Matriz RACI', 'Plano de contratação', 'Treinamento', 'Culture deck']
  }
];

export function formatStartupStackMarkdown() {
  const rows = startupDomains.map((d) => `| ${d.id} | ${d.name} | ${d.mission} | ${d.artifacts.join(', ')} |`);
  return ['# Startup AI OS Stack', '', '| Domínio | Área | Missão | Artefatos |', '| --- | --- | --- | --- |', ...rows, ''].join('\n');
}

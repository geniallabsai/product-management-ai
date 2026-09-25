export const agents = [
  { id: 'principal-pm', name: 'Principal Product Manager', mission: 'Transformar ambiguidade em estratégia, decisões claras, PRD e roadmap.' },
  { id: 'discovery-lead', name: 'Product Discovery Lead', mission: 'Entender usuário, problema, ICP, jobs to be done e evidências.' },
  { id: 'mvp-architect', name: 'MVP Architect', mission: 'Reduzir escopo, preservar valor e desenhar a menor versão validável.' },
  { id: 'ux-researcher', name: 'UX Researcher', mission: 'Criar entrevistas, testes e síntese de aprendizados.' },
  { id: 'product-designer', name: 'Product Designer', mission: 'Converter problema em fluxo, protótipo e experiência.' },
  { id: 'data-analyst', name: 'Product Data Analyst', mission: 'Definir métricas, eventos, funis, coortes e guardrails.' },
  { id: 'agile-coach', name: 'Agile Coach / Scrum Master', mission: 'Organizar cadência, sprint, cerimônias, riscos e melhoria contínua.' },
  { id: 'growth-pm', name: 'Growth Product Manager', mission: 'Achar alavancas de aquisição, ativação, retenção, monetização e indicação.' },
  { id: 'tech-liaison', name: 'Tech Lead Liaison', mission: 'Traduzir produto para arquitetura, riscos técnicos e entrega incremental.' },
  { id: 'product-ops', name: 'Product Operations', mission: 'Padronizar documentação, rituais, governança e comunicação.' }
];

export const skills = [
  { id: 'principal-pm', title: 'Principal PM Hard Mode', path: 'skills/principal-pm/skill.md', whenToUse: 'Estratégia, PRD, priorização, roadmap e decisões difíceis.' },
  { id: 'discovery-lead', title: 'Product Discovery Lead', path: 'skills/discovery-lead/skill.md', whenToUse: 'Quando problema, usuário ou ICP ainda estão nebulosos.' },
  { id: 'mvp-architect', title: 'MVP Architect', path: 'skills/mvp-architect/skill.md', whenToUse: 'Quando há excesso de escopo e é preciso lançar uma versão validável.' },
  { id: 'ux-researcher', title: 'UX Researcher', path: 'skills/ux-researcher/skill.md', whenToUse: 'Entrevistas, testes, síntese e usabilidade.' },
  { id: 'data-analyst', title: 'Product Data Analyst', path: 'skills/data-analyst/skill.md', whenToUse: 'Métricas, eventos, funis, North Star e tracking.' },
  { id: 'agile-coach', title: 'Agile Coach', path: 'skills/agile-coach/skill.md', whenToUse: 'Scrum, Kanban, sprint planning, review, retro e melhoria contínua.' },
  { id: 'growth-pm', title: 'Growth PM', path: 'skills/growth-pm/skill.md', whenToUse: 'Aquisição, ativação, retenção, receita e loops de crescimento.' },
  { id: 'tech-liaison', title: 'Tech Lead Liaison', path: 'skills/tech-liaison/skill.md', whenToUse: 'Requisitos técnicos, riscos, dependências e fatiamento de entrega.' },
  { id: 'product-ops', title: 'Product Ops', path: 'skills/product-ops/skill.md', whenToUse: 'Documentação, rituais, governança e operação de produto.' },
  { id: 'team-orchestrator', title: 'Product Team Orchestrator', path: 'skills/team-orchestrator/skill.md', whenToUse: 'Coordenação da equipe inteira em uma análise completa.' }
];

export const workflows = [
  { id: 'discovery', title: 'Discovery Sprint', description: 'Entender problema, usuário, ICP, evidências, riscos e oportunidades.', phases: ['Mapear contexto e restrições','Definir hipóteses','Planejar entrevistas','Sintetizar evidências','Decidir próximo passo'], outputs: ['Hipóteses','Roteiro de entrevista','Oportunidades','Critérios de decisão'] },
  { id: 'product-audit', title: 'Product Audit', description: 'Auditar produto existente, funil, UX, proposta de valor, métricas e backlog.', phases: ['Revisar proposta de valor','Mapear jornada','Analisar funil','Priorizar oportunidades','Gerar plano de 30 dias'], outputs: ['Diagnóstico','Matriz de prioridades','Plano de melhoria','Riscos'] },
  { id: 'mvp-sprint', title: 'MVP Sprint', description: 'Reduzir escopo e criar uma versão mínima validável em ciclos curtos.', phases: ['Definir usuário e resultado','Cortar escopo','Criar fluxo principal','Definir métrica','Planejar sprint'], outputs: ['Escopo MVP','Backlog','Critérios de aceite','Métricas'] },
  { id: 'roadmap', title: 'Roadmap Now/Next/Later', description: 'Construir roadmap por resultado, não por lista de features.', phases: ['Definir objetivos','Agrupar oportunidades','Classificar Now/Next/Later','Mapear dependências','Criar cadência de revisão'], outputs: ['Roadmap','Temas estratégicos','Dependências'] },
  { id: 'scrum-routine', title: 'Rotina Scrum', description: 'Organizar sprint planning, daily, review, retro e refinamento.', phases: ['Preparar objetivo da sprint','Selecionar backlog','Mapear riscos','Acompanhar execução','Fechar aprendizado'], outputs: ['Sprint goal','Backlog','Riscos','Checklist de cerimônias'] },
  { id: 'lean-experiment', title: 'Lean Experiment', description: 'Desenhar experimento enxuto com hipótese, métrica e decisão.', phases: ['Escrever hipótese','Definir público','Escolher métrica','Definir duração','Documentar aprendizado'], outputs: ['Cartão de experimento','Métricas','Critério de decisão'] }
];


export const TOOLBOX_CATALOG = [
  { id: 'discovery', name: 'Discovery e Diagnóstico', tools: ['Entrevistas', 'JTBD', 'Mapa de dores', 'Blueprint de serviço', 'BPMN leve', 'SIPOC'] },
  { id: 'strategy', name: 'Estratégia e Negócio', tools: ['Business Model Canvas', 'Value Proposition Canvas', 'SWOT', '5 forças', 'PUV', 'North Star'] },
  { id: 'process', name: 'Processos e Operação', tools: ['Mapa OTE', 'RACI', 'SOP', 'Kanban', 'Eisenhower', 'Matriz de gargalos'] },
  { id: 'gtm', name: 'GTM e Growth', tools: ['ICP', 'Funil AARRR', 'Sales playbook', 'CRM', 'Growth loops', 'Experimentos ICE/RICE'] },
  { id: 'data', name: 'Dados e Analytics', tools: ['Tracking plan', 'Eventos', 'Data dictionary', 'BI', 'Data quality', 'Lakehouse quando necessário'] },
  { id: 'ai', name: 'IA e Agentes', tools: ['RAG', 'Prompt ops', 'Evals', 'Fine-tuning', 'LLM local', 'Agentes por processo'] },
  { id: 'mlops', name: 'MLOps e ML', tools: ['Python', 'Notebooks', 'MLflow', 'DVC', 'Pipelines', 'Model registry', 'Monitoramento'] },
  { id: 'engineering', name: 'Engenharia e Sistemas', tools: ['Arquitetura de solução', 'APIs', 'Banco de dados', 'Integrações', 'Repositório', 'CI/CD futuro'] }
];

export const ML_DECISION_TREE = [
  { condition: 'Poucos dados ou problema ainda incerto', recommendation: 'Não treinar modelo. Use diagnóstico, regras, prompts, RAG leve e coleta de dados.' },
  { condition: 'Conversas/documentos do cliente com padrão repetido', recommendation: 'Comece com base de conhecimento + RAG + avaliação. Fine-tuning só depois de dataset limpo e métrica clara.' },
  { condition: 'Muitas conversas rotuladas e tarefa muito específica', recommendation: 'Avaliar fine-tuning supervisionado, guardando dataset, métricas, versão e rollback.' },
  { condition: 'Dados tabulares/históricos para previsão', recommendation: 'Pipeline Python com baseline, validação, tracking, feature store simples e monitoramento.' },
  { condition: 'Privacidade/offline/custo exige local', recommendation: 'Avaliar LLM local ou OpenAI-compatible endpoint com quantização e limites claros.' }
];

function includesAny(text, words) {
  const t = String(text || '').toLowerCase();
  return words.some(w => t.includes(w.toLowerCase()));
}

export function generateToolboxPlan(input = {}) {
  const text = Object.values(input).filter(Boolean).join('\n');
  const needs = {
    process: includesAny(text, ['processo', 'operação', 'atendimento', 'entrega', 'gargalo', 'erro', 'retrabalho']),
    gtm: includesAny(text, ['venda', 'marketing', 'lead', 'funil', 'gtm', 'canal', 'crm', 'growth']),
    data: includesAny(text, ['dados', 'dashboard', 'métrica', 'relatório', 'analytics', 'indicador']),
    ai: includesAny(text, ['ia', 'agente', 'automação', 'llm', 'chatbot', 'copiloto', 'prompt']),
    ml: includesAny(text, ['machine learning', 'modelo', 'previsão', 'score', 'fine-tuning', 'dataset', 'treinar']),
    code: includesAny(text, ['sistema', 'software', 'app', 'api', 'repositório', 'github', 'código'])
  };
  const recommended = TOOLBOX_CATALOG.filter(cat => {
    if (cat.id === 'process') return needs.process;
    if (cat.id === 'gtm') return needs.gtm;
    if (cat.id === 'data') return needs.data;
    if (cat.id === 'ai') return needs.ai;
    if (cat.id === 'mlops') return needs.ml;
    if (cat.id === 'engineering') return needs.code;
    return true;
  });
  const mlPlan = buildMLPlan(input, needs);
  const delivery = buildDeliveryPlan(input, recommended, mlPlan);
  return { ok: true, generatedAt: new Date().toISOString(), needs, recommended, mlDecisionTree: ML_DECISION_TREE, mlPlan, delivery };
}

export function buildMLPlan(input = {}, needs = {}) {
  const text = Object.values(input).filter(Boolean).join('\n');
  const hasConversations = includesAny(text, ['conversa', 'whatsapp', 'chat', 'atendimento', 'suporte']);
  const hasSensitive = includesAny(text, ['sensível', 'lgpd', 'saúde', 'jurídico', 'financeiro', 'privado']);
  const hasPrediction = includesAny(text, ['prever', 'churn', 'evasão', 'score', 'probabilidade', 'forecast']);
  const steps = [];
  steps.push('Definir objetivo do modelo antes de escolher ferramenta.');
  steps.push('Criar dataset mínimo com origem, permissão, qualidade e rótulos.');
  if (hasConversations) steps.push('Extrair conversas, anonimizar dados pessoais e criar taxonomia de intenção/objeção.');
  if (hasPrediction) steps.push('Criar baseline simples em Python antes de modelo complexo.');
  if (hasSensitive) steps.push('Priorizar processamento local, mascaramento, controle de acesso e logs de auditoria.');
  steps.push('Criar avaliação: precisão, utilidade, segurança, custo, latência e taxa de erro.');
  steps.push('Só fazer fine-tuning se RAG/prompt/regras não resolverem e houver dataset validado.');
  return {
    shouldUseML: Boolean(needs.ml || hasPrediction),
    shouldFineTune: hasConversations && includesAny(text, ['muitas', 'histórico', 'rotulado', 'padrão']),
    localAIRecommended: hasSensitive || includesAny(text, ['local', 'offline', 'privacidade', 'custo']),
    pythonPipeline: ['ingestão', 'limpeza', 'rotulagem', 'treino/baseline', 'avaliação', 'registro', 'deploy/uso', 'monitoramento'],
    tools: ['Python', 'Pandas', 'scikit-learn baseline', 'MLflow Tracking', 'DVC/data versioning', 'Hugging Face PEFT/LoRA quando open-source', 'OpenAI/Gemini/Claude quando API fizer sentido'],
    steps
  };
}

export function buildDeliveryPlan(input = {}, recommended = [], mlPlan = {}) {
  const client = input.clientName || input.companyName || 'Cliente / Empresa';
  return {
    client,
    objective: input.objective || input.goals || 'Arquitetar, digitalizar e escalar operação com tecnologia, IA e growth.',
    cadence: ['Diagnóstico semanal', 'Kanban contínuo', 'Review quinzenal', 'Roadmap mensal'],
    roles: ['Arquiteto de soluções', 'Business/GTM', 'Dados/IA', 'Produto', 'Operações', 'Engenharia quando houver sistema'],
    kanban: {
      backlog: ['Mapear processos', 'Mapear dados', 'Mapear canais', 'Levantar ferramentas atuais'],
      todo: ['Definir objetivo e métrica', 'Priorizar gargalos', 'Escolher stack inicial'],
      doing: ['Dossiê', 'Arquitetura de solução', 'Plano 7/30/90'],
      validation: ['Validar com decisor', 'Validar com operação', 'Validar com clientes'],
      done: ['Brief inicial', 'Hipóteses principais']
    },
    deliverables: ['Dossiê de maturidade', 'Mapa OTE', 'Mapa de processos', 'Mapa de IA/agentes', 'GTM blueprint', 'Stack recomendada', 'Kanban de implantação', 'Roadmap executivo', ...(mlPlan.shouldUseML ? ['Plano ML/MLOps'] : [])],
    risks: ['Escopo amplo sem dono', 'Automatizar processo ruim', 'Dados insuficientes', 'Ferramenta antes de estratégia', 'Adoção interna baixa']
  };
}

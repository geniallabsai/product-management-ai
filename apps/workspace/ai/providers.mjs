
import fs from 'node:fs';
import path from 'node:path';

export const PROVIDERS = [
  { id: 'offline', name: 'Offline Startup AI', kind: 'local', requiresKey: false, defaultModel: 'startup-ai-offline-v1', description: 'Local heuristic mode. No API key required.' },
  { id: 'openai', name: 'OpenAI', kind: 'api', requiresKey: true, defaultModel: 'gpt-4.1-mini', baseUrl: 'https://api.openai.com/v1', description: 'OpenAI Chat Completions API.' },
  { id: 'gemini', name: 'Google Gemini', kind: 'api', requiresKey: true, defaultModel: 'gemini-1.5-flash', baseUrl: 'https://generativelanguage.googleapis.com/v1beta', description: 'Google Gemini generateContent API.' },
  { id: 'anthropic', name: 'Anthropic Claude', kind: 'api', requiresKey: true, defaultModel: 'claude-3-5-sonnet-latest', baseUrl: 'https://api.anthropic.com/v1', description: 'Anthropic Messages API.' },
  { id: 'openai-compatible', name: 'OpenAI-compatible endpoint', kind: 'api', requiresKey: false, defaultModel: 'local-model', baseUrl: 'http://127.0.0.1:11434/v1', description: 'Works with local gateways, Ollama-compatible proxies, vLLM, LiteLLM or custom harnesses exposing /chat/completions.' },
  { id: 'local-harness', name: 'Local harness webhook', kind: 'harness', requiresKey: false, defaultModel: 'harness-default', baseUrl: 'http://127.0.0.1:8787', description: 'POSTs to a local harness controlled by the user.' }
];

export function startupAiDir(repoRoot) {
  const dir = path.join(repoRoot, '.startup-ai');
  fs.mkdirSync(dir, { recursive: true });
  return dir;
}

export function configPaths(repoRoot) {
  const dir = startupAiDir(repoRoot);
  return {
    dir,
    config: path.join(dir, 'ai-config.json'),
    secrets: path.join(dir, 'ai-secrets.json')
  };
}

function readJson(file, fallback) {
  try { return JSON.parse(fs.readFileSync(file, 'utf8')); }
  catch { return fallback; }
}

export function readAIConfig(repoRoot) {
  const paths = configPaths(repoRoot);
  const config = readJson(paths.config, {});
  const secrets = readJson(paths.secrets, {});
  const provider = config.provider || 'offline';
  const catalog = PROVIDERS.find(p => p.id === provider) || PROVIDERS[0];
  return {
    provider,
    model: config.model || catalog.defaultModel,
    baseUrl: config.baseUrl || catalog.baseUrl || '',
    hasApiKey: Boolean(secrets[provider]?.apiKey || config.apiKeyEnv && process.env[config.apiKeyEnv]),
    apiKeyEnv: config.apiKeyEnv || '',
    customHeaders: config.customHeaders || {},
    harnessPath: config.harnessPath || '',
    savedAt: config.savedAt || null
  };
}

export function saveAIConfig(repoRoot, input = {}) {
  const paths = configPaths(repoRoot);
  const provider = input.provider || 'offline';
  const catalog = PROVIDERS.find(p => p.id === provider) || PROVIDERS[0];
  const config = {
    provider,
    model: input.model || catalog.defaultModel,
    baseUrl: input.baseUrl || catalog.baseUrl || '',
    apiKeyEnv: input.apiKeyEnv || '',
    customHeaders: input.customHeaders || {},
    harnessPath: input.harnessPath || '',
    savedAt: new Date().toISOString()
  };
  fs.writeFileSync(paths.config, JSON.stringify(config, null, 2), 'utf8');
  if (input.apiKey) {
    const secrets = readJson(paths.secrets, {});
    secrets[provider] = { apiKey: input.apiKey, savedAt: new Date().toISOString() };
    fs.writeFileSync(paths.secrets, JSON.stringify(secrets, null, 2), 'utf8');
  }
  return readAIConfig(repoRoot);
}

function readApiKey(repoRoot, config) {
  const paths = configPaths(repoRoot);
  const secrets = readJson(paths.secrets, {});
  return secrets[config.provider]?.apiKey || (config.apiKeyEnv ? process.env[config.apiKeyEnv] : '') || '';
}

export function buildStartupSystemPrompt() {
  return `You are Startup AI OS, a multi-agent startup/company operating system. Act as a team: founder strategist, business designer, customer discovery lead, product manager, UX strategist, growth lead, engineering architect, data/AI/MLOps strategist, operations lead, finance/legal advisor, agile coach and digital transformation consultant.

Return practical, structured output for creating, improving or digitizing a company. Cover: idea clarity, ICP, jobs to be done, PV/PUV, value proposition canvas, business model canvas, SWOT, Eisenhower, RICE/ICE/MoSCoW, MVP, prototype, backlog, Kanban, Scrum cadence, 7/30/90 day plan, 6-month roadmap, metrics, risks and next actions. Mark assumptions clearly. Do not invent market facts; ask to validate when evidence is missing.`;
}

export function buildIdeaLabPrompt({ idea, companyType = 'startup', horizon = '90 days', context = '' }) {
  return `Analyze this business/startup/company transformation idea.

Company type: ${companyType}
Planning horizon: ${horizon}
Context: ${context || 'No extra context.'}
Idea: ${idea}

Create a robust Startup AI OS plan with these sections:
1. Executive diagnosis
2. ICP and jobs to be done
3. PV and PUV
4. Value Proposition Canvas
5. Business Model Canvas
6. SWOT
7. Eisenhower matrix
8. Prioritization with RICE/ICE/MoSCoW
9. Prototype and MVP scope
10. Kanban backlog
11. Scrum/agile cadence
12. 7/30/90 day plan
13. 6-month roadmap
14. Metrics and North Star
15. Risks and validation experiments
16. Required agents/skills
17. Final next actions.`;
}

function offlineIdeaLab({ idea, companyType = 'startup', horizon = '90 dias', context = '' }) {
  const trimmed = String(idea || '').trim();
  const base = trimmed || 'Ideia ainda não descrita';
  return {
    provider: 'offline',
    model: 'startup-ai-offline-v1',
    generatedAt: new Date().toISOString(),
    markdown: `# Startup AI OS · Idea Lab\n\n## Diagnóstico executivo\n\nIdeia analisada: **${base}**.\n\nTipo de empresa: **${companyType}**. Horizonte: **${horizon}**.\n\n${context ? `Contexto adicional: ${context}\n\n` : ''}A primeira hipótese é que essa ideia precisa ser tratada como um sistema de negócio, não apenas como produto. O próximo passo é validar dor, público, proposta de valor e canal antes de construir pesado.\n\n## Agentes ativados\n\n- Founder strategist\n- Business designer\n- Customer discovery lead\n- Product manager\n- UX/prototype lead\n- Growth lead\n- Engineering architect\n- Data/AI/MLOps strategist\n- Operations lead\n- Finance/legal advisor\n- Agile coach\n\n## PV / PUV\n\n**PV provisória:** ajudar um público específico a alcançar um resultado valioso com menos fricção, mais clareza e maior velocidade.\n\n**PUV provisória:** transformar uma ideia ou empresa tradicional em uma operação digital validável, mensurável e escalável usando IA, produto e métodos de startup.\n\n## SWOT\n\n| Forças | Fraquezas |\n| --- | --- |\n| Pode gerar clareza, velocidade e padronização. | Ainda depende de validação real com clientes. |\n| Combina negócio, produto, tecnologia e operação. | Risco de escopo grande demais no início. |\n\n| Oportunidades | Ameaças |\n| --- | --- |\n| Digitalizar mercados tradicionais e criar startups com menor desperdício. | Concorrentes, baixa adoção, falta de foco ou canal fraco. |\n\n## Eisenhower\n\n| Quadrante | Ações |\n| --- | --- |\n| Urgente e importante | Definir ICP, dor principal, PUV e experimento de validação. |\n| Importante, não urgente | Construir roadmap, sistema de métricas e playbook operacional. |\n| Urgente, não importante | Evitar excesso de telas, branding e automações antes da validação. |\n| Nem urgente nem importante | Features avançadas sem evidência de demanda. |\n\n## Priorização inicial\n\n| Método | Decisão inicial |\n| --- | --- |\n| MoSCoW | Must: ICP, PUV, landing/brief, entrevistas, protótipo, métrica. |\n| ICE | Priorizar ações de alto impacto, alta confiança e baixa complexidade. |\n| RICE | Usar depois que houver estimativa de alcance e esforço. |\n\n## MVP\n\n1. Brief guiado da ideia.\n2. Canvas automático.\n3. Roteiro de entrevista com clientes.\n4. Protótipo simples da solução.\n5. Backlog inicial com Kanban.\n6. Métrica North Star provisória.\n\n## Kanban inicial\n\n| Backlog | Fazer agora | Fazendo | Validar |\n| --- | --- | --- | --- |\n| Jornada do cliente | ICP | PUV | Entrevistas |\n| Protótipo | Landing/teste | Canvas | Métricas |\n| Tech stack | Backlog MVP | Experimento | Aprendizados |\n\n## 7 dias\n\n- Dia 1: clarear ideia, ICP e dor.\n- Dia 2: criar PV/PUV e canvas.\n- Dia 3: roteiro de entrevista.\n- Dia 4: falar com potenciais clientes.\n- Dia 5: desenhar protótipo.\n- Dia 6: definir MVP e métrica.\n- Dia 7: decidir construir, ajustar ou matar.\n\n## 30 dias\n\n- Validar problema e proposta.\n- Criar MVP com escopo mínimo.\n- Rodar primeiros experimentos de canal.\n- Definir rotina Scrum/Kanban.\n- Medir ativação e interesse real.\n\n## 90 dias\n\n- Escalar aquisição inicial.\n- Melhorar retenção.\n- Automatizar operação crítica.\n- Criar playbooks.\n- Revisar unit economics e roadmap.\n\n## Próximas ações\n\n1. Escrever ICP em uma frase.\n2. Escrever PUV em uma frase.\n3. Listar 10 potenciais clientes para entrevista.\n4. Criar uma prova de valor em até 7 dias.\n5. Converter este plano em Kanban.`,
    artifacts: {
      swot: ['Forças, fraquezas, oportunidades, ameaças'],
      matrices: ['Eisenhower', 'MoSCoW', 'ICE', 'RICE'],
      roadmap: ['7 dias', '30 dias', '90 dias', '6 meses'],
      agents: ['Founder', 'Business', 'Product', 'Growth', 'Tech', 'Data/AI', 'Ops', 'Finance/Legal']
    }
  };
}

async function callOpenAICompatible(config, apiKey, messages) {
  const base = (config.baseUrl || 'https://api.openai.com/v1').replace(/\/$/, '');
  const response = await fetch(`${base}/chat/completions`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      ...(apiKey ? { authorization: `Bearer ${apiKey}` } : {}),
      ...(config.customHeaders || {})
    },
    body: JSON.stringify({ model: config.model, messages, temperature: 0.4 })
  });
  if (!response.ok) throw new Error(`Model request failed: ${response.status} ${await response.text()}`);
  const json = await response.json();
  return json.choices?.[0]?.message?.content || '';
}

async function callGemini(config, apiKey, messages) {
  if (!apiKey) throw new Error('Gemini API key is required.');
  const model = config.model || 'gemini-1.5-flash';
  const prompt = messages.map(m => `${m.role.toUpperCase()}: ${m.content}`).join('\n\n');
  const url = `${(config.baseUrl || 'https://generativelanguage.googleapis.com/v1beta').replace(/\/$/, '')}/models/${model}:generateContent?key=${apiKey}`;
  const response = await fetch(url, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }) });
  if (!response.ok) throw new Error(`Gemini request failed: ${response.status} ${await response.text()}`);
  const json = await response.json();
  return json.candidates?.[0]?.content?.parts?.map(p => p.text).join('\n') || '';
}

async function callAnthropic(config, apiKey, messages) {
  if (!apiKey) throw new Error('Anthropic API key is required.');
  const system = messages.find(m => m.role === 'system')?.content || '';
  const user = messages.filter(m => m.role !== 'system').map(m => m.content).join('\n\n');
  const response = await fetch(`${(config.baseUrl || 'https://api.anthropic.com/v1').replace(/\/$/, '')}/messages`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' },
    body: JSON.stringify({ model: config.model || 'claude-3-5-sonnet-latest', max_tokens: 4000, system, messages: [{ role: 'user', content: user }] })
  });
  if (!response.ok) throw new Error(`Anthropic request failed: ${response.status} ${await response.text()}`);
  const json = await response.json();
  return json.content?.map(c => c.text).join('\n') || '';
}

export async function runIdeaLab(repoRoot, input = {}) {
  const config = readAIConfig(repoRoot);
  const apiKey = readApiKey(repoRoot, config);
  const messages = [
    { role: 'system', content: buildStartupSystemPrompt() },
    { role: 'user', content: buildIdeaLabPrompt(input) }
  ];
  if (config.provider === 'offline' || (!apiKey && ['openai', 'gemini', 'anthropic'].includes(config.provider))) {
    return offlineIdeaLab(input);
  }
  let markdown = '';
  if (config.provider === 'openai' || config.provider === 'openai-compatible' || config.provider === 'local-harness') markdown = await callOpenAICompatible(config, apiKey, messages);
  else if (config.provider === 'gemini') markdown = await callGemini(config, apiKey, messages);
  else if (config.provider === 'anthropic') markdown = await callAnthropic(config, apiKey, messages);
  else markdown = offlineIdeaLab(input).markdown;
  return { provider: config.provider, model: config.model, generatedAt: new Date().toISOString(), markdown, artifacts: {} };
}


export async function runStartupChat(repoRoot, input = {}) {
  const config = readAIConfig(repoRoot);
  const apiKey = readApiKey(repoRoot, config);
  const messages = [
    { role: 'system', content: buildStartupSystemPrompt() },
    ...(input.history || []).slice(-12).map(m => ({ role: m.role === 'assistant' ? 'assistant' : 'user', content: String(m.content || '') })),
    { role: 'user', content: `Responda como um time de consultoria Startup AI OS. Contexto do formulário: ${JSON.stringify(input.context || {}, null, 2)}\n\nPergunta: ${input.message || ''}` }
  ];
  if (config.provider === 'offline' || (!apiKey && ['openai', 'gemini', 'anthropic'].includes(config.provider))) {
    const idea = input.context?.idea || input.context?.currentState || input.message || 'negócio ainda não detalhado';
    return {
      provider: 'offline',
      model: 'startup-ai-offline-v1',
      generatedAt: new Date().toISOString(),
      message: `Como Startup AI OS, eu começaria estruturando isso em 5 blocos: 1) ICP e dor principal, 2) PV/PUV, 3) diagnóstico de maturidade, 4) MVP ou melhoria operacional, 5) GTM e métricas.\n\nPelo contexto atual (${idea}), minha próxima pergunta seria: qual público tem a dor mais urgente, qual resultado ele compraria agora e qual evidência você já tem disso?\n\nAção prática: preencha os campos de ICP, canais, operação atual, dados disponíveis, orçamento e prazo; depois gere o Dossiê para transformar a conversa em cards, Kanban, SWOT, roadmap e matriz de prioridade.`
    };
  }
  let message = '';
  if (config.provider === 'openai' || config.provider === 'openai-compatible' || config.provider === 'local-harness') message = await callOpenAICompatible(config, apiKey, messages);
  else if (config.provider === 'gemini') message = await callGemini(config, apiKey, messages);
  else if (config.provider === 'anthropic') message = await callAnthropic(config, apiKey, messages);
  else message = 'Provider não suportado; use offline, OpenAI, Gemini, Anthropic, OpenAI-compatible ou local harness.';
  return { provider: config.provider, model: config.model, generatedAt: new Date().toISOString(), message };
}

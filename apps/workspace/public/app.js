
const state = {
  data: null, git: null, events: [], view: 'architecture', density: 'essential', query: '',
  transform: { x: 80, y: 80, scale: 1 }, nodes: [], edges: [], selected: null, dragging: null, panning: null,
  graph3d: { nodes: [], edges: [], rotX: -0.2, rotY: 0.5, zoom: 1, dragging: null, selected: null },
  ideaChat: []
};
const el = (id) => document.getElementById(id);
const qs = (s, r = document) => r.querySelector(s);
const qsa = (s, r = document) => [...r.querySelectorAll(s)];
const esc = (v) => String(v ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
const fmt = (n) => Number(n || 0).toLocaleString('pt-BR');
const colors = { project:'#9b8cff', product:'#9b8cff', frontend:'#57d5ff', backend:'#5ee6a8', api:'#8bd3ff', database:'#c69cff', dependency:'#f8c96d', config:'#a4aab6', file:'#d9dde5', symbol:'#ffb86b', improvement:'#ff7a90', layer:'#7bdcff', docs:'#b8f7d4' };

async function boot() {
  const [analysis, git] = await Promise.all([fetch('/api/analysis', { cache: 'no-store' }).then(r=>r.json()), fetch('/api/git', { cache:'no-store' }).then(r=>r.json()).catch(()=>null)]);
  state.data = analysis; state.git = git;
  el('pageTitle').textContent = state.data.project?.name || 'Startup workspace';
  bindShell(); renderAll(); showView('architecture'); bindEvents();
}
function bindShell(){
  qsa('.nav-item').forEach(btn => btn.addEventListener('click', () => showView(btn.dataset.view)));
  el('globalSearch').addEventListener('input', (event) => { state.query = event.target.value.trim().toLowerCase(); rebuildMap(); build3d(); renderFiles(); });
  el('density').addEventListener('change', (event) => { state.density = event.target.value; rebuildMap(true); build3d(true); });
  el('fitBtn').addEventListener('click', fitMap);
  el('resetBtn').addEventListener('click', () => { state.transform = { x: 80, y: 80, scale: 1 }; state.graph3d.rotX=-0.2; state.graph3d.rotY=0.5; state.graph3d.zoom=1; rebuildMap(true); build3d(true); });
  const canvas = el('mapCanvas'); canvas.addEventListener('pointerdown', pointerDown); canvas.addEventListener('pointermove', pointerMove); canvas.addEventListener('pointerup', pointerUp); canvas.addEventListener('pointerleave', pointerUp); canvas.addEventListener('wheel', wheel, { passive: false });
  const g3 = el('graph3dCanvas'); g3.addEventListener('pointerdown', graphPointerDown); g3.addEventListener('pointermove', graphPointerMove); g3.addEventListener('pointerup', graphPointerUp); g3.addEventListener('pointerleave', graphPointerUp); g3.addEventListener('wheel', graphWheel, { passive:false });
  window.addEventListener('resize', () => { drawMap(); draw3d(); });
}
function showView(view){ state.view=view; qsa('.nav-item').forEach(n=>n.classList.toggle('active', n.dataset.view===view)); qsa('.view').forEach(v=>v.classList.remove('active')); el(`view-${view}`).classList.add('active'); if(view==='architecture') setTimeout(drawMap,30); if(view==='graph3d') setTimeout(draw3d,30); if(view==='activity') renderActivity(); }
function renderAll(){ renderIdeaLab(); renderDossier(); renderSolutionArchitecture(); renderOverview(); renderCanvas(); renderDocs(); renderImprovements(); renderFiles(); renderActivity(); rebuildMap(true); build3d(true); }
function bindEvents(){
  if (!window.EventSource) return;
  const source = new EventSource('/api/events');
  source.addEventListener('heartbeat', e => { state.events.unshift({ type:'heartbeat', ...JSON.parse(e.data) }); state.events = state.events.slice(0,20); if(state.view==='activity') renderActivity(); });
  source.addEventListener('git', e => { state.git = JSON.parse(e.data); state.events.unshift({ type:'git', at:new Date().toISOString() }); if(state.view==='activity') renderActivity(); });
}
function pill(v){ return `<span class="pill">${esc(v)}</span>`; }

function markdownLite(text){
  let html = esc(text || '');
  html = html.replace(/^# (.*)$/gm, '<h1>$1</h1>')
             .replace(/^## (.*)$/gm, '<h2>$1</h2>')
             .replace(/^### (.*)$/gm, '<h3>$1</h3>')
             .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
             .replace(/^\- (.*)$/gm, '<li>$1</li>')
             .replace(/\n\n/g, '</p><p>')
             .replace(/\n/g, '<br>');
  html = html.replace(/(<li>.*?<\/li>)/gs, '<ul>$1</ul>');
  return `<div class="markdown-result"><p>${html}</p></div>`;
}
async function loadAIProviders(){
  const response = await fetch('/api/ai/providers', { cache:'no-store' });
  return response.json();
}
function renderIdeaLab(){
  el('view-idea').innerHTML = `<div class="cards">
    <div class="card span-8"><h2>Idea Lab / Startup Studio</h2><p>Para ideia do zero, empresa existente ou transformação digital. Preencha o máximo possível; o sistema gera cards, matrizes, Kanban, MVP, GTM, roadmap e usa IA plugável quando configurada.</p></div>
    <div class="card span-4"><h2>Entrada inteligente</h2><p>Ideia → diagnóstico → mapa mental → cards → plano 7/30/90 → execução.</p></div>
    <div class="card span-4"><h2>Modelo / Harness</h2><div id="aiProviderPanel" class="stack-form"><p>Carregando providers...</p></div></div>
    <div class="card span-5">
      <h2>Brief guiado</h2>
      <div class="form-grid two">
        <div><label>Modo</label><select id="companyType" class="select wide"><option value="startup">Criar startup/empresa tech</option><option value="traditional-digitalization">Digitalizar empresa tradicional</option><option value="existing-tech-company">Melhorar empresa tech existente</option><option value="physical-business">Melhorar negócio físico</option></select></div>
        <div><label>Horizonte</label><select id="ideaHorizon" class="select wide"><option>7 dias</option><option selected>90 dias</option><option>6 meses</option><option>12 meses</option></select></div>
      </div>
      <label>Ideia / empresa / problema</label><textarea id="ideaText" class="textarea big" placeholder="Conte a ideia ou a empresa existente. Qual dor resolve? Quem compra? O que existe hoje?"></textarea>
      <div class="form-grid two">
        <div><label>ICP / público</label><textarea id="ideaIcp" class="textarea" placeholder="Quem é o cliente ideal? Segmento, cargo, perfil, região..."></textarea></div>
        <div><label>Dor / Jobs to be done</label><textarea id="ideaPain" class="textarea" placeholder="Qual dor urgente? Qual job o cliente quer resolver?"></textarea></div>
      </div>
      <label>Site e redes para análise</label>
      <div class="form-grid two"><input id="ideaWebsite" class="input wide" placeholder="https://site.com"/><input id="ideaInstagram" class="input wide" placeholder="Instagram / rede social"/></div>
      <div class="form-grid two"><input id="ideaLinkedin" class="input wide" placeholder="LinkedIn"/><input id="ideaYoutube" class="input wide" placeholder="YouTube / TikTok / comunidade"/></div>
      <label>Contexto operacional</label><textarea id="ideaContext" class="textarea" placeholder="Time, canais, dados, budget, restrições, sistemas atuais, concorrentes..."></textarea>
      <button id="runIdeaLab" class="btn primary">Gerar diagnóstico e cards</button>
    </div>
    <div class="card span-3 chat-card"><h2>Chat com agentes</h2><div id="ideaChatLog" class="chat-log"><div class="chat-msg assistant">Me conte sua ideia ou empresa. Eu vou agir como founder strategist, PM, arquiteto, growth, dados e operações.</div></div><textarea id="ideaChatInput" class="textarea" placeholder="Pergunte: qual MVP? qual tecnologia? como validar? qual GTM?"></textarea><button id="sendIdeaChat" class="btn">Enviar para IA</button></div>
    <div class="card span-12"><h2>Diagnóstico automático</h2><div id="ideaCards" class="diagnostic-cards"></div><div id="ideaResult" class="idea-result empty">O plano aparecerá aqui com SWOT, PUV, canvas, MVP, Kanban, Scrum, matrizes e roadmap.</div></div>
  </div>`;
  hydrateProviderPanel();
  el('runIdeaLab').onclick = runIdeaLab;
  el('sendIdeaChat').onclick = sendIdeaChat;
}

async function hydrateProviderPanel(){
  try{
    const payload = await loadAIProviders();
    const cfg = payload.config || {};
    const providers = payload.providers || [];
    el('aiProviderPanel').innerHTML = `<label>Provider</label><select id="aiProvider" class="select wide">${providers.map(p=>`<option value="${esc(p.id)}" ${p.id===cfg.provider?'selected':''}>${esc(p.name)}</option>`).join('')}</select>
      <label>Modelo</label><input id="aiModel" class="input wide" value="${esc(cfg.model || '')}" placeholder="gpt-4.1-mini, gemini-1.5-flash, local-model..." />
      <label>Base URL / Harness</label><input id="aiBaseUrl" class="input wide" value="${esc(cfg.baseUrl || '')}" placeholder="https://api.openai.com/v1 ou http://127.0.0.1:11434/v1" />
      <label>API Key local</label><input id="aiApiKey" type="password" class="input wide" placeholder="Salvo localmente em .startup-ai/ai-secrets.json" />
      <button id="saveAIConfig" class="btn">Salvar provider local</button>
      <p class="help-text">Chaves não são commitadas. Use Offline para trabalhar sem API Key.</p>`;
    el('saveAIConfig').onclick = saveAIConfig;
  }catch(error){ el('aiProviderPanel').innerHTML = `<p>${esc(error.message)}</p>`; }
}
async function saveAIConfig(){
  const body = { provider: el('aiProvider').value, model: el('aiModel').value, baseUrl: el('aiBaseUrl').value, apiKey: el('aiApiKey').value };
  const res = await fetch('/api/ai/config', { method:'POST', headers:{'content-type':'application/json'}, body: JSON.stringify(body) });
  const json = await res.json();
  el('ideaResult').innerHTML = json.ok ? '<p>Provider salvo localmente.</p>' : `<p>${esc(json.error)}</p>`;
  await hydrateProviderPanel();
}
function collectIdeaContext(){
  return {
    idea: el('ideaText')?.value || '',
    icp: el('ideaIcp')?.value || '',
    pain: el('ideaPain')?.value || '',
    website: el('ideaWebsite')?.value || '',
    instagram: el('ideaInstagram')?.value || '',
    linkedin: el('ideaLinkedin')?.value || '',
    youtube: el('ideaYoutube')?.value || '',
    context: el('ideaContext')?.value || '',
    companyType: el('companyType')?.value || 'startup',
    horizon: el('ideaHorizon')?.value || '90 dias'
  };
}
function renderAutoCards(cards = [], matrices = null){
  const target = el('ideaCards');
  if(!target) return;
  if(!cards.length && !matrices){ target.innerHTML = ''; return; }
  const cardHtml = cards.map(c=>`<div class="auto-card ${esc(c.priority || '')}"><div class="auto-card-type">${esc(c.type || 'card')}</div><h3>${esc(c.title)}</h3><p>${esc(c.body)}</p></div>`).join('');
  const matrixHtml = matrices ? `<div class="auto-card"><div class="auto-card-type">Matrizes</div><h3>SWOT / Eisenhower / Priorização</h3><p>SWOT, Eisenhower, MoSCoW, ICE/RICE e Kanban foram gerados no relatório abaixo.</p></div>` : '';
  target.innerHTML = cardHtml + matrixHtml;
}
async function sendIdeaChat(){
  const input = el('ideaChatInput');
  const log = el('ideaChatLog');
  const message = input.value.trim();
  if(!message) return;
  state.ideaChat.push({ role:'user', content: message });
  log.innerHTML += `<div class="chat-msg user">${esc(message)}</div>`;
  input.value = '';
  log.innerHTML += `<div class="chat-msg assistant pending">Pensando com os agentes...</div>`;
  log.scrollTop = log.scrollHeight;
  const res = await fetch('/api/idea-chat', { method:'POST', headers:{'content-type':'application/json'}, body: JSON.stringify({ message, history: state.ideaChat, context: collectIdeaContext() }) });
  const json = await res.json();
  const pending = qs('.pending', log);
  if(!json.ok){ pending.textContent = json.error || 'Erro no chat.'; return; }
  const answer = json.result.message || '';
  state.ideaChat.push({ role:'assistant', content: answer });
  pending.classList.remove('pending');
  pending.innerHTML = markdownLite(answer);
  log.scrollTop = log.scrollHeight;
}

async function runIdeaLab(){
  const result = el('ideaResult');
  result.innerHTML = '<p>Gerando plano com agentes de startup, produto, GTM, tecnologia, dados e operação...</p>';
  const ctx = collectIdeaContext();
  let websiteSnapshot = null;
  if(ctx.website){
    try {
      const snap = await fetch('/api/web-snapshot?url=' + encodeURIComponent(ctx.website)).then(r=>r.json());
      if(snap.ok) websiteSnapshot = snap.snapshot;
    } catch {}
  }
  const body = { ...ctx, context: [ctx.context, ctx.icp && `ICP: ${ctx.icp}`, ctx.pain && `Dor/JTBD: ${ctx.pain}`, websiteSnapshot && `Site: ${websiteSnapshot.title} · ${websiteSnapshot.description}`].filter(Boolean).join('\n') };
  const res = await fetch('/api/idea-lab', { method:'POST', headers:{'content-type':'application/json'}, body: JSON.stringify(body) });
  const json = await res.json();
  if(!json.ok){ result.innerHTML = `<p>${esc(json.error)}</p>`; return; }
  renderAutoCards([{type:'idea', title:'Plano gerado', body:'O Idea Lab criou plano, matrizes, MVP, Kanban e roadmap.', priority:'high'}], json.result.artifacts);
  result.innerHTML = `<div class="provider-note">Provider: ${esc(json.result.provider)} · Modelo: ${esc(json.result.model)}</div>${websiteSnapshot ? `<div class="provider-note">Site lido: ${esc(websiteSnapshot.title || websiteSnapshot.url)}</div>` : ''}${markdownLite(json.result.markdown)}`;
}

function renderDossier(){
  el('view-dossier').innerHTML = `<div class="cards">
    <div class="card span-8"><h2>Dossiê completo de empresa</h2><p>Para consultoria com cliente: maturidade, negócio, operação, tecnologia, dados, IA, GTM, redes, site, código local e roadmap.</p></div>
    <div class="card span-4"><h2>Entrada</h2><p>Serve para ideia, empresa tech, empresa tradicional ou negócio físico buscando digitalização e escala.</p></div>
    <div class="card span-6"><h2>1. Negócio</h2>
      <div class="form-grid two"><input id="dossierCompany" class="input wide" placeholder="Nome da empresa/projeto"/><select id="dossierType" class="select wide"><option value="startup">Startup</option><option value="existing-tech-company">Empresa tech existente</option><option value="traditional-digitalization">Empresa tradicional → digital</option><option value="physical-business">Negócio físico + tecnologia</option></select></div>
      <div class="form-grid two"><input id="dossierIndustry" class="input wide" placeholder="Setor"/><input id="dossierBudget" class="input wide" placeholder="Budget / recursos"/></div>
      <textarea id="dossierCurrent" class="textarea big" placeholder="Estado atual: operação, produto, clientes, canais, receita, dores..."></textarea>
      <textarea id="dossierGoals" class="textarea" placeholder="Objetivos para próximos dias, semanas e meses"></textarea>
      <textarea id="dossierIdea" class="textarea" placeholder="Ideia, transformação, produto ou oportunidade"></textarea>
    </div>
    <div class="card span-6"><h2>2. Evidências e presença digital</h2>
      <input id="dossierWebsite" class="input wide" placeholder="Site para scraping básico"/>
      <div class="form-grid two"><input id="dossierInstagram" class="input wide" placeholder="Instagram"/><input id="dossierLinkedin" class="input wide" placeholder="LinkedIn"/></div>
      <div class="form-grid two"><input id="dossierYoutube" class="input wide" placeholder="YouTube/TikTok"/><input id="dossierCompetitors" class="input wide" placeholder="Concorrentes / referências"/></div>
      <input id="dossierRepoPath" class="input wide" placeholder="Caminho local do repositório/código" />
      <p class="help-text">Local primeiro. GitHub com autenticação/API entra como adapter: clone/fetch/permissions.</p>
    </div>
    <div class="card span-6"><h2>3. Operação, dados e tecnologia</h2>
      <textarea id="dossierSystems" class="textarea" placeholder="Sistemas atuais: planilhas, CRM, ERP, WhatsApp, site, banco, automações..."></textarea>
      <textarea id="dossierDataSources" class="textarea" placeholder="Dados disponíveis: leads, vendas, alunos, estoque, financeiro, produto, eventos..."></textarea>
      <textarea id="dossierOps" class="textarea" placeholder="Processo de venda, atendimento, entrega, suporte, qualidade..."></textarea>
    </div>
    <div class="card span-6"><h2>4. GTM, métricas e riscos</h2>
      <textarea id="dossierChannels" class="textarea" placeholder="Canais atuais e desejados: outbound, tráfego, conteúdo, parcerias, comunidade, indicação..."></textarea>
      <textarea id="dossierMetrics" class="textarea" placeholder="Métricas: CAC, LTV, conversão, churn, ticket, margem, SLA, produtividade..."></textarea>
      <textarea id="dossierRisks" class="textarea" placeholder="Restrições legais/técnicas, time, prazo, concorrência, riscos..."></textarea>
      <button id="runDossier" class="btn primary">Gerar dossiê, cards e matrizes</button>
    </div>
    <div class="card span-12"><h2>Cards automáticos</h2><div id="dossierCards" class="diagnostic-cards"></div></div>
    <div class="card span-12"><h2>Resultado</h2><div id="dossierResult" class="idea-result empty">O dossiê aparecerá aqui com maturidade, SWOT, GTM, arquitetura de dados, Kanban, roadmap e matriz de prioridade.</div></div>
  </div>`;
  el('runDossier').onclick = runDossier;
}
async 
function renderSolutionArchitecture(){
  el('view-solution').innerHTML = `<div class="cards">
    <div class="card span-8"><h2>Arquitetura do Negócio e da Solução</h2><p>Antes de código, desenhe processos, pessoas, agentes de IA, dados, ferramentas, produto digital, stack, GTM e operação. Se já existir repositório, ele entra como evidência técnica; se não existir, arquitetamos o que deve ser construído.</p></div>
    <div class="card span-4"><h2>Repositório é opcional</h2><p>Use local path agora. GitHub com autenticação entra como adapter. Sem código, o foco é negócio, processos e produto a desenvolver.</p></div>
    <div class="card span-6"><h2>Negócio e processos</h2>
      <label>Nome da empresa/projeto</label><input id="solutionCompany" class="input wide" placeholder="Empresa, projeto ou ideia" />
      <label>Tipo</label><select id="solutionType" class="select wide"><option value="idea-zero">Ideia do zero</option><option value="traditional-digitalization">Empresa tradicional para digital</option><option value="existing-tech-company">Empresa tech existente</option><option value="physical-business">Negócio físico com tecnologia</option></select>
      <label>ICP / público</label><textarea id="solutionIcp" class="textarea" placeholder="Quem compra, usa ou sofre a dor? Segmentos, cargos, região, maturidade..."></textarea>
      <label>Problema central / dor</label><textarea id="solutionProblem" class="textarea" placeholder="Qual problema precisa resolver? Onde dói na operação? O que trava crescimento?"></textarea>
      <label>Processos atuais ou desejados</label><textarea id="solutionProcesses" class="textarea big" placeholder="Aquisição, atendimento, vendas, entrega, suporte, financeiro, gestão, qualidade, dados..."></textarea>
      <label>Ferramentas atuais</label><textarea id="solutionTools" class="textarea" placeholder="Planilhas, WhatsApp, CRM, ERP, Notion, sistemas internos, ferramentas manuais..."></textarea>
    </div>
    <div class="card span-6"><h2>Stack, IA, canais e evidências</h2>
      <label>Site</label><input id="solutionSite" class="input wide" placeholder="https://..." />
      <label>Instagram</label><input id="solutionInstagram" class="input wide" placeholder="https://instagram.com/..." />
      <label>LinkedIn</label><input id="solutionLinkedin" class="input wide" placeholder="https://linkedin.com/company/..." />
      <label>Repositório local, se existir</label><input id="solutionRepo" class="input wide" placeholder="C:\\Users\\...\\Projeto" />
      <label>GitHub URL / futuro adapter</label><input id="solutionGithub" class="input wide" placeholder="https://github.com/owner/repo" />
      <label>Dados, canais, métricas, time e restrições</label><textarea id="solutionContext" class="textarea big" placeholder="Dados disponíveis, canais, GTM, métricas, equipe, orçamento, prazo, compliance, integrações..."></textarea>
      <button id="runSolutionArchitecture" class="btn primary">Gerar arquitetura completa</button>
    </div>
    <div class="card span-12"><h2>Blueprint</h2><div id="solutionResult" class="idea-result empty">O blueprint vai aparecer em cards: processos, pessoas, agentes de IA, sistemas, stack, roadmap e matrizes.</div></div>
  </div>`;
  el('runSolutionArchitecture').onclick = runSolutionArchitecture;
}
async function runSolutionArchitecture(){
  const result = el('solutionResult');
  result.innerHTML = '<p>Gerando arquitetura do negócio, processos, IA, stack e produto digital...</p>';
  const body = {
    companyName: el('solutionCompany').value,
    companyType: el('solutionType').value,
    icp: el('solutionIcp').value,
    coreProblem: el('solutionProblem').value,
    currentProcesses: el('solutionProcesses').value,
    tools: el('solutionTools').value,
    siteUrl: el('solutionSite').value,
    instagramUrl: el('solutionInstagram').value,
    linkedinUrl: el('solutionLinkedin').value,
    socialLinks: [el('solutionInstagram').value, el('solutionLinkedin').value].filter(Boolean).join('\n'),
    repositoryPath: el('solutionRepo').value.trim(),
    githubUrl: el('solutionGithub').value.trim(),
    constraints: el('solutionContext').value,
    dataSources: el('solutionContext').value,
    channels: el('solutionContext').value,
    metrics: el('solutionContext').value,
    includeCurrentRepository: false
  };
  const res = await fetch('/api/solution-architecture', { method:'POST', headers:{'content-type':'application/json'}, body: JSON.stringify(body) });
  const json = await res.json();
  if(!json.ok){ result.innerHTML = `<p>${esc(json.error)}</p>`; return; }
  const b = json.blueprint;
  result.innerHTML = renderBlueprint(b);
}
function renderBlueprint(b){
  const renderCard = card => `<div class="blueprint-card"><span>${esc(card.type || 'card')}</span><h3>${esc(card.title)}</h3><p>${esc(card.description || card.purpose || card.problem || '')}</p><small>${esc(card.owner || card.build || '')}</small></div>`;
  const renderProcess = p => `<div class="blueprint-card"><span>processo</span><h3>${esc(p.title)}</h3><p>${esc(p.problem)}</p><small>Automação: ${esc(p.automation)}</small></div>`;
  const renderAgent = a => `<div class="blueprint-card"><span>agente IA</span><h3>${esc(a.title)}</h3><p>${esc(a.where)}</p><small>${esc((a.jobs || []).join(', '))}</small></div>`;
  const renderSystem = s => `<div class="blueprint-card"><span>sistema</span><h3>${esc(s.title)}</h3><p>${esc(s.purpose)}</p><small>${esc(s.build)}</small></div>`;
  const stack = (b.stack || []).map(s => `<div class="blueprint-card"><span>stack</span><h3>${esc(s.stage)}</h3><p>${esc((s.stack || []).join(', '))}</p><small>${esc(s.why)}</small></div>`).join('');
  const road = (b.roadmap || []).map(r => `<div class="blueprint-card"><span>roadmap</span><h3>${esc(r.horizon)}</h3><p>${esc((r.actions || []).join(' · '))}</p></div>`).join('');
  const missing = (b.summary?.missing || []).map(x => `<li>${esc(x)}</li>`).join('') || '<li>Nenhuma lacuna crítica óbvia.</li>';
  return `<div class="provider-note">Modo: ${esc(b.mode)} · Repositório: ${b.summary?.hasRepository ? 'conectado' : 'opcional/não conectado'} · Site: ${b.summary?.hasWebsite ? 'analisado' : 'não informado'}</div>
    <div class="card"><h2>Lacunas antes de construir</h2><ul>${missing}</ul></div>
    <div class="blueprint-grid">${(b.cards||[]).map(renderCard).join('')}${(b.process||[]).map(renderProcess).join('')}${(b.agents||[]).map(renderAgent).join('')}${(b.systems||[]).map(renderSystem).join('')}${stack}${road}</div>
    <div class="card"><h2>Markdown executivo</h2>${markdownLite(b.markdown || '')}</div>`;
}

function runDossier(){
  const result = el('dossierResult');
  result.innerHTML = '<p>Mapeando empresa, site, redes, dados, operação, código e maturidade...</p>';
  const body = {
    companyName: el('dossierCompany').value, companyType: el('dossierType').value, industry: el('dossierIndustry').value,
    budget: el('dossierBudget').value, currentState: el('dossierCurrent').value, goals: el('dossierGoals').value, idea: el('dossierIdea').value,
    website: el('dossierWebsite').value, instagram: el('dossierInstagram').value, linkedin: el('dossierLinkedin').value,
    youtube: el('dossierYoutube').value, competitors: el('dossierCompetitors').value, repositoryPath: el('dossierRepoPath').value.trim(),
    currentSystems: el('dossierSystems').value, dataSources: el('dossierDataSources').value, operations: el('dossierOps').value,
    channels: el('dossierChannels').value, metrics: el('dossierMetrics').value, legalRisks: el('dossierRisks').value,
    includeCurrentRepository: !el('dossierRepoPath').value.trim()
  };
  const res = await fetch('/api/company-dossier', { method:'POST', headers:{'content-type':'application/json'}, body: JSON.stringify(body) });
  const json = await res.json();
  if(!json.ok){ result.innerHTML = `<p>${esc(json.error)}</p>`; return; }
  const d = json.dossier;
  const cards = d.cards || [];
  el('dossierCards').innerHTML = cards.map(c=>`<div class="auto-card ${esc(c.priority||'')}"><div class="auto-card-type">${esc(c.type)}</div><h3>${esc(c.title)}</h3><p>${esc(c.body)}</p></div>`).join('');
  result.innerHTML = `<div class="provider-note">Maturidade: ${esc(d.maturity.level)} · ${esc(d.maturity.score)}/5 · Fase: ${esc(d.maturity.recommendedStage.label)}</div>${markdownLite(d.markdown)}`;
}

function renderOverview(){ const d=state.data; const langs=Object.entries(d.summary?.loc_by_language||{}).sort((a,b)=>b[1]-a[1]).slice(0,8); const layers=d.architecture?.layers||[]; el('view-overview').innerHTML=`<div class="panel-grid"><div class="cards"><div class="card span-4"><h3>Arquivos</h3><div class="metric">${fmt(d.project?.files_scanned)}</div><p>Total lido pelo analisador.</p></div><div class="card span-4"><h3>Linhas</h3><div class="metric">${fmt(d.project?.total_lines)}</div><p>Código e documentação.</p></div><div class="card span-4"><h3>Oportunidades</h3><div class="metric">${fmt(d.improvements?.length)}</div><p>Melhorias acionáveis.</p></div><div class="card span-6"><h2>Camadas detectadas</h2><p>${layers.map(pill).join(' ')||'Nenhuma camada forte detectada.'}</p></div><div class="card span-6"><h2>Linguagens</h2><p>${langs.map(([k,v])=>pill(`${k} · ${fmt(v)} linhas`)).join(' ')}</p></div><div class="card span-12"><h2>Riscos</h2><ul>${(d.risks||[]).map(r=>`<li>${esc(r)}</li>`).join('')||'<li>Nenhum risco crítico detectado automaticamente.</li>'}</ul></div></div></div>`; }
function renderCanvas(){ const c=state.data.business_canvas||{}; const block=(title, cls='')=>`<div class="canvas-block ${cls}"><h3>${esc(title)}</h3><ul>${(c[title]||[]).map(i=>`<li>${esc(i)}</li>`).join('')}</ul></div>`; el('view-canvas').innerHTML=`<div class="card"><h2>Business Model Canvas</h2><p>Hipótese automática para discussão de produto.</p></div><div class="canvas-grid">${block('Key Partners')} ${block('Key Activities')} ${block('Value Propositions','value')} ${block('Customer Relationships')} ${block('Customer Segments','segment')} ${block('Key Resources')} ${block('Channels')} ${block('Cost Structure','wide')} ${block('Revenue Streams','wide')}</div>`; }
function renderDocs(){ const d=state.data; const layers=(d.architecture?.layers||[]).map(x=>`<li><b>${esc(x)}</b>: camada detectada automaticamente.</li>`).join(''); el('view-docs').innerHTML=`<div class="cards"><div class="card span-8"><h2>Documento vivo do produto</h2><p>Este workspace ajuda um PM a entender valor, arquitetura, versões e mudanças sem abrir o código primeiro.</p><h3>Onde termina PM e começa DevOps?</h3><p><b>PM AI:</b> impacto de mudanças, versões, riscos, roadmap, produto e arquitetura compreensível. <b>DevOps OS futuro:</b> deploy, runtime, logs, incidentes, ambientes, custos e confiabilidade.</p><ol><li>Comece pelo Mapa 3D para entender dependências.</li><li>Use Versões para ver evolução e commits.</li><li>Transforme Melhorias em PRD/backlog.</li></ol></div><div class="card span-4"><h2>Objetivo</h2><p>Transformar repositórios em mapas de produto, arquitetura e melhoria contínua.</p></div><div class="card span-12"><h2>Camadas</h2><ul>${layers||'<li>Nenhuma camada forte detectada.</li>'}</ul></div></div>`; }
function renderImprovements(){ const items=state.data.improvements||[]; el('view-improvements').innerHTML=`<div class="cards">${items.map(i=>`<div class="card span-6"><h2>${esc(i.title)}</h2><p>${pill(i.area)}</p><p><b>Por quê:</b> ${esc(i.why)}</p><p><b>Ação:</b> ${esc(i.action)}</p></div>`).join('')}</div>`; }
function renderFiles(){ const q=state.query; const files=(state.data.files||[]).filter(f=>!q||JSON.stringify(f).toLowerCase().includes(q)).slice(0,500); el('view-files').innerHTML=`<div class="card"><h2>Arquivos</h2><p>${fmt(files.length)} arquivos filtrados. Clique numa linha para ler o código.</p></div><div class="table-wrap"><table><thead><tr><th>Arquivo</th><th>Linguagem</th><th>Linhas</th><th>Tags</th></tr></thead><tbody>${files.map(f=>`<tr data-file="${esc(f.path)}"><td>${esc(f.path)}</td><td>${esc(f.language)}</td><td>${fmt(f.lines)}</td><td>${esc((f.tags||[]).join(', '))}</td></tr>`).join('')}</tbody></table></div>`; qsa('#view-files tr[data-file]').forEach(row=>row.onclick=()=>openFile(row.dataset.file)); }
function renderActivity(){ const git=state.git; const commits=git?.commits||[]; const status=git?.status||[]; el('view-activity').innerHTML=`<div class="cards"><div class="card span-4"><h3><span class="live-dot"></span> Branch</h3><div class="metric" style="font-size:24px">${esc(git?.branch||'N/A')}</div><p>${git?.ok?'Repositório Git conectado.':'Sem Git detectado.'}</p></div><div class="card span-4"><h3>Mudanças locais</h3><div class="metric">${fmt(status.length)}</div><p>Arquivos modificados/untracked.</p></div><div class="card span-4"><h3>Eventos ao vivo</h3><div class="metric">${fmt(state.events.length)}</div><p>Heartbeat/Git polling local.</p></div><div class="card span-6"><h2>Status local</h2>${status.length?`<ul>${status.map(s=>`<li><b>${esc(s.code)}</b> ${esc(s.path)}</li>`).join('')}</ul>`:'<p>Nenhuma mudança local detectada.</p>'}</div><div class="card span-6"><h2>Fronteira DevOps</h2><p>Deploys, CI/CD, ambientes, logs e incidentes ficam para um futuro DevOps OS. Aqui mostramos versões e impacto para tomada de decisão de produto.</p></div><div class="card span-12"><h2>Últimas versões</h2><div class="panel-grid">${commits.map(c=>`<div class="card commit"><div class="commit-title">${esc(c.subject)}</div><div class="commit-meta">${esc(c.short)} · ${esc(c.author)} · ${esc(new Date(c.date).toLocaleString('pt-BR'))}</div><div>${(c.files||[]).slice(0,8).map(pill).join(' ')}</div></div>`).join('')||'<p>Sem commits.</p>'}</div></div></div>`; }

function buildMap(){ const d=state.data; const nodes=[]; const edges=[]; const add=n=>{if(!nodes.find(x=>x.id===n.id))nodes.push(n)}; add({id:'product',label:d.project?.name||'Produto',type:'project',group:'project',desc:'Produto analisado.'}); (d.architecture?.layers||[]).forEach(layer=>{const id=`layer:${layer}`; add({id,label:layer,type:'layer',group:'layer',desc:'Camada de arquitetura detectada.'}); edges.push(['product',id]);}); (d.improvements||[]).slice(0,state.density==='essential'?5:10).forEach((item,i)=>{const id=`improvement:${i}`; add({id,label:item.title,type:'improvement',group:'improvement',desc:item.action,raw:item}); edges.push(['product',id]);}); const graphNodes=d.graph?.nodes||[], graphEdges=d.graph?.edges||[]; const limits={essential:46,product:80,code:140,all:240}; const ranked=graphNodes.filter(n=>!state.query||JSON.stringify(n).toLowerCase().includes(state.query)).slice(0,limits[state.density]||80); ranked.forEach(n=>add({id:n.id,label:n.label||n.id,type:n.type||'file',group:n.group||n.type||'file',desc:n.path||n.id,raw:n})); graphEdges.forEach(e=>{if(nodes.find(n=>n.id===e.source)&&nodes.find(n=>n.id===e.target))edges.push([e.source,e.target]);}); return{nodes,edges}; }
function rebuildMap(reset=false){ const model=buildMap(); state.nodes=model.nodes; state.edges=model.edges; layoutNodes(reset); drawMap(); }
function layoutNodes(reset){ const groups=['project','layer','frontend','backend','api','database','config','dependency','file','symbol','improvement']; const cols=new Map(groups.map((g,i)=>[g,{x:i*260,y:0,count:0}])); for(const node of state.nodes){ if(!reset&&Number.isFinite(node.x)&&Number.isFinite(node.y))continue; const col=cols.get(node.group)||cols.get('file'); node.w=node.type==='project'?230:210; node.h=node.type==='project'?86:74; node.x=col.x; node.y=col.y+col.count*104; col.count++; } if(reset)fitMap(); }
function fitMap(){ const rect=el('mapCanvas').getBoundingClientRect(); state.transform={x:60,y:60,scale:Math.min(1,rect.width/2200)}; drawMap(); }
function resizeCanvas(canvas){ const rect=canvas.getBoundingClientRect(); const dpr=window.devicePixelRatio||1; canvas.width=Math.max(1,Math.floor(rect.width*dpr)); canvas.height=Math.max(1,Math.floor(rect.height*dpr)); const ctx=canvas.getContext('2d'); ctx.setTransform(dpr,0,0,dpr,0,0); return{canvas,ctx,width:rect.width,height:rect.height}; }
function drawMap(){ const {ctx,width,height}=resizeCanvas(el('mapCanvas')); ctx.clearRect(0,0,width,height); drawGrid(ctx,width,height); ctx.save(); ctx.translate(state.transform.x,state.transform.y); ctx.scale(state.transform.scale,state.transform.scale); drawGroupHeaders(ctx); drawEdges(ctx); for(const n of state.nodes)drawNode(ctx,n); ctx.restore(); }
function drawGrid(ctx,w,h){ ctx.fillStyle='#0b0d11'; ctx.fillRect(0,0,w,h); ctx.strokeStyle='rgba(255,255,255,.04)'; const step=42, ox=state.transform.x%step, oy=state.transform.y%step; for(let x=ox;x<w;x+=step){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,h);ctx.stroke()} for(let y=oy;y<h;y+=step){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(w,y);ctx.stroke()} }
function drawGroupHeaders(ctx){ const seen=new Set(); ctx.font='700 13px Inter, system-ui'; for(const n of state.nodes){ if(seen.has(n.group))continue; seen.add(n.group); ctx.fillStyle='rgba(255,255,255,.42)'; ctx.fillText(String(n.group||'group').toUpperCase(),n.x,-22); } }
function drawEdges(ctx){ ctx.strokeStyle='rgba(255,255,255,.14)'; ctx.lineWidth=1.2; const byId=new Map(state.nodes.map(n=>[n.id,n])); for(const [s,t]of state.edges){ const a=byId.get(s),b=byId.get(t); if(!a||!b)continue; ctx.beginPath(); ctx.moveTo(a.x+a.w,a.y+a.h/2); const mx=(a.x+a.w+b.x)/2; ctx.bezierCurveTo(mx,a.y+a.h/2,mx,b.y+b.h/2,b.x,b.y+b.h/2); ctx.stroke(); } }
function roundRect(ctx,x,y,w,h,r){ ctx.beginPath(); ctx.moveTo(x+r,y); ctx.arcTo(x+w,y,x+w,y+h,r); ctx.arcTo(x+w,y+h,x,y+h,r); ctx.arcTo(x,y+h,x,y,r); ctx.arcTo(x,y,x+w,y,r); ctx.closePath(); }
function drawNode(ctx,n){ const sel=state.selected?.id===n.id, color=colors[n.group]||'#d9dde5'; ctx.save(); ctx.shadowColor='rgba(0,0,0,.25)'; ctx.shadowBlur=18; ctx.fillStyle=sel?'rgba(155,140,255,.22)':'rgba(32,36,44,.94)'; ctx.strokeStyle=sel?color:'rgba(255,255,255,.14)'; ctx.lineWidth=sel?2:1; roundRect(ctx,n.x,n.y,n.w,n.h,16); ctx.fill(); ctx.stroke(); ctx.shadowBlur=0; ctx.fillStyle=color; roundRect(ctx,n.x+12,n.y+13,10,10,5); ctx.fill(); ctx.fillStyle='#f5f6f8'; ctx.font='700 13px Inter, system-ui'; wrapText(ctx,n.label,n.x+30,n.y+23,n.w-42,16,2); ctx.fillStyle='rgba(245,246,248,.56)'; ctx.font='12px Inter, system-ui'; wrapText(ctx,n.type||n.group||'node',n.x+14,n.y+n.h-17,n.w-28,14,1); ctx.restore(); }
function wrapText(ctx,text,x,y,maxWidth,lineHeight,maxLines){ const words=String(text||'').split(/\s+/); let line='',lines=[]; for(const word of words){ const test=line?`${line} ${word}`:word; if(ctx.measureText(test).width>maxWidth&&line){lines.push(line);line=word}else line=test } if(line)lines.push(line); lines.slice(0,maxLines).forEach((l,i)=>ctx.fillText(l,x,y+i*lineHeight)); }
function screenToWorld(e){ const r=el('mapCanvas').getBoundingClientRect(); return{x:(e.clientX-r.left-state.transform.x)/state.transform.scale,y:(e.clientY-r.top-state.transform.y)/state.transform.scale}; }
function hitTest(p){ for(let i=state.nodes.length-1;i>=0;i--){ const n=state.nodes[i]; if(p.x>=n.x&&p.x<=n.x+n.w&&p.y>=n.y&&p.y<=n.y+n.h)return n; } return null; }
function pointerDown(e){ const p=screenToWorld(e), n=hitTest(p); if(n){ state.selected=n; state.dragging={id:n.id,dx:p.x-n.x,dy:p.y-n.y}; renderInspector(n); } else state.panning={x:e.clientX,y:e.clientY,tx:state.transform.x,ty:state.transform.y}; el('mapCanvas').setPointerCapture(e.pointerId); drawMap(); }
function pointerMove(e){ if(state.dragging){ const n=state.nodes.find(x=>x.id===state.dragging.id), p=screenToWorld(e); n.x=p.x-state.dragging.dx; n.y=p.y-state.dragging.dy; drawMap(); } else if(state.panning){ state.transform.x=state.panning.tx+(e.clientX-state.panning.x); state.transform.y=state.panning.ty+(e.clientY-state.panning.y); drawMap(); } }
function pointerUp(){ state.dragging=null; state.panning=null; }
function wheel(e){ e.preventDefault(); const r=el('mapCanvas').getBoundingClientRect(), mx=e.clientX-r.left, my=e.clientY-r.top, old=state.transform.scale, next=Math.max(.22,Math.min(2.5,old*(e.deltaY<0?1.08:.92))); const wx=(mx-state.transform.x)/old, wy=(my-state.transform.y)/old; state.transform.scale=next; state.transform.x=mx-wx*next; state.transform.y=my-wy*next; drawMap(); }
function renderInspector(n){ el('inspectorContent').innerHTML=`<div class="inspect-card"><h3>${esc(n.label)}</h3><div class="inspect-meta">${pill(n.group)}${pill(n.type)}</div><p>${esc(n.desc||'Sem descrição.')}</p>${n.raw?.path?`<button class="btn primary" onclick="window.openFileFromInspector('${esc(n.raw.path)}')">Abrir código</button>`:''}<pre>${esc(JSON.stringify(n.raw||n,null,2))}</pre></div>`; }
window.openFileFromInspector = openFile;
async function openFile(path){ const res=await fetch('/api/file?path='+encodeURIComponent(path)); const data=await res.json(); const html=data.ok?`<h3>${esc(data.path)}</h3><pre>${esc(data.content)}</pre>`:`<p>${esc(data.error)}</p>`; if(state.view==='graph3d')el('graphInspector').innerHTML=html; else el('inspectorContent').innerHTML=html; }

function build3d(reset=false){ const model=buildMap(); const nodes=model.nodes.slice(0, state.density==='all'?260:state.density==='code'?170:90); const edges=model.edges.filter(([a,b])=>nodes.find(n=>n.id===a)&&nodes.find(n=>n.id===b)); const groups=[...new Set(nodes.map(n=>n.group||'file'))]; nodes.forEach((n,i)=>{ if(!reset&&Number.isFinite(n.gx))return; const ring=110+(groups.indexOf(n.group)%5)*72+Math.floor(i/60)*52; const angle=(i/nodes.length)*Math.PI*2*3; n.gx=Math.cos(angle)*ring; n.gy=Math.sin(angle)*ring; n.gz=(groups.indexOf(n.group)-groups.length/2)*70+(i%7)*16; }); state.graph3d.nodes=nodes; state.graph3d.edges=edges; draw3d(); }
function project3d(n,w,h){ const {rotX,rotY,zoom}=state.graph3d; let x=n.gx,y=n.gy,z=n.gz; let cy=Math.cos(rotY),sy=Math.sin(rotY),cx=Math.cos(rotX),sx=Math.sin(rotX); let x1=x*cy-z*sy,z1=x*sy+z*cy,y1=y*cx-z1*sx,z2=y*sx+z1*cx; const scale=zoom*520/(520+z2); return{x:w/2+x1*scale,y:h/2+y1*scale,z:z2,scale}; }
function draw3d(){ const canvas=el('graph3dCanvas'); if(!canvas)return; const {ctx,width,height}=resizeCanvas(canvas); ctx.clearRect(0,0,width,height); ctx.fillStyle='#0b0d11'; ctx.fillRect(0,0,width,height); const projected=new Map(state.graph3d.nodes.map(n=>[n.id,project3d(n,width,height)])); ctx.strokeStyle='rgba(255,255,255,.13)'; ctx.lineWidth=1; for(const [a,b] of state.graph3d.edges){ const pa=projected.get(a),pb=projected.get(b); if(!pa||!pb)continue; ctx.beginPath(); ctx.moveTo(pa.x,pa.y); ctx.lineTo(pb.x,pb.y); ctx.stroke(); } const sorted=[...state.graph3d.nodes].sort((a,b)=>projected.get(a.id).z-projected.get(b.id).z); for(const n of sorted){ const p=projected.get(n.id), color=colors[n.group]||'#d9dde5', r=Math.max(4,10*p.scale); n._screen=p; ctx.beginPath(); ctx.fillStyle=color; ctx.globalAlpha=Math.max(.35,Math.min(1,p.scale)); ctx.arc(p.x,p.y,r,0,Math.PI*2); ctx.fill(); ctx.globalAlpha=1; if(p.scale>.55){ctx.fillStyle='#f5f6f8';ctx.font='700 11px Inter,system-ui';ctx.fillText(String(n.label).slice(0,30),p.x+r+5,p.y+4)} } }
function graphPointerDown(e){ const r=el('graph3dCanvas').getBoundingClientRect(); const x=e.clientX-r.left,y=e.clientY-r.top; let hit=null, best=999; for(const n of state.graph3d.nodes){ const p=n._screen; if(!p)continue; const d=Math.hypot(p.x-x,p.y-y); if(d<best&&d<18){hit=n;best=d} } if(hit){ state.graph3d.selected=hit; renderGraphInspector(hit); } state.graph3d.dragging={x:e.clientX,y:e.clientY,rotX:state.graph3d.rotX,rotY:state.graph3d.rotY}; el('graph3dCanvas').setPointerCapture(e.pointerId); }
function graphPointerMove(e){ if(!state.graph3d.dragging)return; const d=state.graph3d.dragging; state.graph3d.rotY=d.rotY+(e.clientX-d.x)*0.006; state.graph3d.rotX=d.rotX+(e.clientY-d.y)*0.006; draw3d(); }
function graphPointerUp(){ state.graph3d.dragging=null; }
function graphWheel(e){ e.preventDefault(); state.graph3d.zoom=Math.max(.35,Math.min(3,state.graph3d.zoom*(e.deltaY<0?1.08:.92))); draw3d(); }
function renderGraphInspector(n){ el('graphInspector').innerHTML=`<div class="inspect-card"><h3>${esc(n.label)}</h3><div class="inspect-meta">${pill(n.group)}${pill(n.type)}</div><p>${esc(n.desc||'')}</p>${n.raw?.path?`<button class="btn primary" onclick="window.openFileFromInspector('${esc(n.raw.path)}')">Abrir código</button>`:''}<pre>${esc(JSON.stringify(n.raw||n,null,2))}</pre></div>`; }

boot().catch(error=>{document.body.innerHTML=`<pre style="padding:24px;color:#fff;background:#111;height:100vh;overflow:auto">${esc(error.stack||error.message)}</pre>`});

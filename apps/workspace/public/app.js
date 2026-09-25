
const state = {
  data: null,
  view: 'architecture',
  density: 'essential',
  query: '',
  transform: { x: 80, y: 80, scale: 1 },
  nodes: [],
  edges: [],
  selected: null,
  dragging: null,
  panning: null
};

const el = (id) => document.getElementById(id);
const qs = (s, r = document) => r.querySelector(s);
const qsa = (s, r = document) => [...r.querySelectorAll(s)];
const esc = (v) => String(v ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
const fmt = (n) => Number(n || 0).toLocaleString('pt-BR');

const colors = {
  project: '#9b8cff', product: '#9b8cff', frontend: '#57d5ff', backend: '#5ee6a8', api: '#8bd3ff', database: '#c69cff',
  dependency: '#f8c96d', config: '#a4aab6', file: '#d9dde5', symbol: '#ffb86b', improvement: '#ff7a90', layer: '#7bdcff', docs: '#b8f7d4'
};

async function boot() {
  const response = await fetch('/api/analysis', { cache: 'no-store' });
  state.data = await response.json();
  el('pageTitle').textContent = state.data.project?.name || 'Product workspace';
  bindShell();
  renderAll();
  showView('architecture');
}

function bindShell() {
  qsa('.nav-item').forEach(btn => btn.addEventListener('click', () => showView(btn.dataset.view)));
  el('globalSearch').addEventListener('input', (event) => { state.query = event.target.value.trim().toLowerCase(); rebuildMap(); renderFiles(); });
  el('density').addEventListener('change', (event) => { state.density = event.target.value; rebuildMap(true); });
  el('fitBtn').addEventListener('click', fitMap);
  el('resetBtn').addEventListener('click', () => { state.transform = { x: 80, y: 80, scale: 1 }; rebuildMap(true); });
  const canvas = el('mapCanvas');
  canvas.addEventListener('pointerdown', pointerDown);
  canvas.addEventListener('pointermove', pointerMove);
  canvas.addEventListener('pointerup', pointerUp);
  canvas.addEventListener('pointerleave', pointerUp);
  canvas.addEventListener('wheel', wheel, { passive: false });
  window.addEventListener('resize', drawMap);
}

function showView(view) {
  state.view = view;
  qsa('.nav-item').forEach(n => n.classList.toggle('active', n.dataset.view === view));
  qsa('.view').forEach(v => v.classList.remove('active'));
  el(`view-${view}`).classList.add('active');
  if (view === 'architecture') setTimeout(drawMap, 30);
}

function renderAll() {
  renderOverview();
  renderCanvas();
  renderDocs();
  renderImprovements();
  renderFiles();
  rebuildMap(true);
}

function renderOverview() {
  const d = state.data;
  const langs = Object.entries(d.summary?.loc_by_language || {}).sort((a,b)=>b[1]-a[1]).slice(0,8);
  const layers = d.architecture?.layers || [];
  el('view-overview').innerHTML = `<div class="panel-grid"><div class="cards">
    <div class="card span-4"><h3>Arquivos</h3><div class="metric">${fmt(d.project?.files_scanned)}</div><p>Total lido pelo analisador.</p></div>
    <div class="card span-4"><h3>Linhas</h3><div class="metric">${fmt(d.project?.total_lines)}</div><p>Código e documentação.</p></div>
    <div class="card span-4"><h3>Oportunidades</h3><div class="metric">${fmt(d.improvements?.length)}</div><p>Melhorias acionáveis.</p></div>
    <div class="card span-6"><h2>Camadas detectadas</h2><p>${layers.map(x=>`<span class="pill">${esc(x)}</span>`).join(' ') || 'Nenhuma camada forte detectada.'}</p></div>
    <div class="card span-6"><h2>Linguagens</h2><p>${langs.map(([k,v])=>`<span class="pill">${esc(k)} · ${fmt(v)} linhas</span>`).join(' ')}</p></div>
    <div class="card span-12"><h2>Riscos</h2><ul>${(d.risks || []).map(r=>`<li>${esc(r)}</li>`).join('') || '<li>Nenhum risco crítico detectado automaticamente.</li>'}</ul></div>
  </div></div>`;
}

function renderCanvas() {
  const c = state.data.business_canvas || {};
  const block = (title, cls='') => `<div class="canvas-block ${cls}"><h3>${esc(title)}</h3><ul>${(c[title] || []).map(i=>`<li>${esc(i)}</li>`).join('')}</ul></div>`;
  el('view-canvas').innerHTML = `<div class="card"><h2>Business Model Canvas</h2><p>Hipótese automática para discussão de produto.</p></div><div class="canvas-grid">
    ${block('Key Partners')} ${block('Key Activities')} ${block('Value Propositions','value')} ${block('Customer Relationships')} ${block('Customer Segments','segment')}
    ${block('Key Resources')} ${block('Channels')} ${block('Cost Structure','wide')} ${block('Revenue Streams','wide')}
  </div>`;
}

function renderDocs() {
  const d = state.data;
  const layers = (d.architecture?.layers || []).map(x=>`<li><b>${esc(x)}</b>: camada detectada automaticamente.</li>`).join('');
  el('view-docs').innerHTML = `<div class="cards">
    <div class="card span-8"><h2>Documento vivo do produto</h2><p>Este workspace deve ajudar um PM, founder ou dev a entender o produto sem precisar abrir o código primeiro.</p><h3>Leitura recomendada</h3><ol><li>Comece pela Arquitetura em modo Essencial.</li><li>Abra o Business Canvas para entender o modelo.</li><li>Use Melhorias para transformar em PRD/backlog.</li><li>Entre em Arquivos quando precisar de detalhe técnico.</li></ol></div>
    <div class="card span-4"><h2>Objetivo</h2><p>Transformar repositórios em mapas de produto, arquitetura e melhoria contínua.</p></div>
    <div class="card span-12"><h2>Camadas</h2><ul>${layers || '<li>Nenhuma camada forte detectada.</li>'}</ul></div>
  </div>`;
}

function renderImprovements() {
  const items = state.data.improvements || [];
  el('view-improvements').innerHTML = `<div class="cards">${items.map((i, idx)=>`<div class="card span-6"><h2>${esc(i.title)}</h2><p><span class="pill">${esc(i.area)}</span></p><p><b>Por quê:</b> ${esc(i.why)}</p><p><b>Ação:</b> ${esc(i.action)}</p></div>`).join('')}</div>`;
}

function renderFiles() {
  const q = state.query;
  const files = (state.data.files || []).filter(f => !q || JSON.stringify(f).toLowerCase().includes(q)).slice(0, 500);
  el('view-files').innerHTML = `<div class="card"><h2>Arquivos</h2><p>${fmt(files.length)} arquivos filtrados. Use a busca no topo para refinar.</p></div><div class="table-wrap"><table><thead><tr><th>Arquivo</th><th>Linguagem</th><th>Linhas</th><th>Tags</th></tr></thead><tbody>${files.map(f=>`<tr><td>${esc(f.path)}</td><td>${esc(f.language)}</td><td>${fmt(f.lines)}</td><td>${esc((f.tags || []).join(', '))}</td></tr>`).join('')}</tbody></table></div>`;
}

function buildMap() {
  const d = state.data;
  const nodes = [];
  const edges = [];
  const add = (node) => { if (!nodes.find(n => n.id === node.id)) nodes.push(node); };
  add({ id: 'product', label: d.project?.name || 'Produto', type: 'project', group: 'project', desc: 'Produto analisado.' });
  (d.architecture?.layers || []).forEach((layer, i) => { const id = `layer:${layer}`; add({ id, label: layer, type: 'layer', group: 'layer', desc: 'Camada de arquitetura detectada.' }); edges.push(['product', id]); });
  (d.improvements || []).slice(0, state.density === 'essential' ? 5 : 10).forEach((item, i) => { const id = `improvement:${i}`; add({ id, label: item.title, type: 'improvement', group: 'improvement', desc: item.action, raw: item }); edges.push(['product', id]); });

  const graphNodes = d.graph?.nodes || [];
  const graphEdges = d.graph?.edges || [];
  const limits = { essential: 46, product: 80, code: 140, all: 240 };
  const allowed = new Set(['project','product','frontend','backend','api','database','config','dependency','file','symbol']);
  const ranked = graphNodes
    .filter(n => allowed.has(n.group || n.type || 'file'))
    .filter(n => !state.query || JSON.stringify(n).toLowerCase().includes(state.query))
    .slice(0, limits[state.density] || 80);
  ranked.forEach(n => add({ id: n.id, label: n.label || n.id, type: n.type || 'file', group: n.group || n.type || 'file', desc: n.path || n.id, raw: n }));
  graphEdges.forEach(e => { if (nodes.find(n=>n.id===e.source) && nodes.find(n=>n.id===e.target)) edges.push([e.source, e.target]); });
  if (state.query) {
    for (const n of nodes) if (!JSON.stringify(n).toLowerCase().includes(state.query) && n.id !== 'product') n.hidden = true;
  }
  return { nodes: nodes.filter(n=>!n.hidden), edges };
}

function rebuildMap(reset = false) {
  const model = buildMap();
  state.nodes = model.nodes;
  state.edges = model.edges;
  layoutNodes(reset);
  drawMap();
}

function layoutNodes(reset) {
  const groups = ['project','layer','frontend','backend','api','database','config','dependency','file','symbol','improvement'];
  const columns = new Map(groups.map((g, i) => [g, { x: i * 260, y: 0, count: 0 }]));
  for (const node of state.nodes) {
    if (!reset && Number.isFinite(node.x) && Number.isFinite(node.y)) continue;
    const col = columns.get(node.group) || columns.get('file');
    node.w = node.type === 'project' ? 230 : 210;
    node.h = node.type === 'project' ? 86 : 74;
    node.x = col.x;
    node.y = col.y + col.count * 104;
    col.count += 1;
  }
  if (reset) fitMap();
}

function fitMap() {
  const canvas = el('mapCanvas');
  const rect = canvas.getBoundingClientRect();
  state.transform = { x: 60, y: 60, scale: Math.min(1, rect.width / 2200) };
  drawMap();
}

function resizeCanvas() {
  const canvas = el('mapCanvas');
  const rect = canvas.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;
  canvas.width = Math.max(1, Math.floor(rect.width * dpr));
  canvas.height = Math.max(1, Math.floor(rect.height * dpr));
  const ctx = canvas.getContext('2d');
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  return { canvas, ctx, width: rect.width, height: rect.height };
}

function drawMap() {
  const { ctx, width, height } = resizeCanvas();
  ctx.clearRect(0, 0, width, height);
  drawGrid(ctx, width, height);
  ctx.save();
  ctx.translate(state.transform.x, state.transform.y);
  ctx.scale(state.transform.scale, state.transform.scale);
  drawGroupHeaders(ctx);
  drawEdges(ctx);
  for (const node of state.nodes) drawNode(ctx, node);
  ctx.restore();
}

function drawGrid(ctx, width, height) {
  ctx.fillStyle = '#0b0d11';
  ctx.fillRect(0, 0, width, height);
  ctx.strokeStyle = 'rgba(255,255,255,.04)';
  ctx.lineWidth = 1;
  const step = 42;
  const ox = state.transform.x % step;
  const oy = state.transform.y % step;
  for (let x = ox; x < width; x += step) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, height); ctx.stroke(); }
  for (let y = oy; y < height; y += step) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(width, y); ctx.stroke(); }
}

function drawGroupHeaders(ctx) {
  const seen = new Set();
  ctx.font = '700 13px Inter, system-ui';
  for (const node of state.nodes) {
    if (seen.has(node.group)) continue;
    seen.add(node.group);
    ctx.fillStyle = 'rgba(255,255,255,.42)';
    ctx.fillText(String(node.group || 'group').toUpperCase(), node.x, -22);
  }
}

function drawEdges(ctx) {
  ctx.strokeStyle = 'rgba(255,255,255,.14)';
  ctx.lineWidth = 1.2;
  const byId = new Map(state.nodes.map(n => [n.id, n]));
  for (const [s, t] of state.edges) {
    const a = byId.get(s), b = byId.get(t);
    if (!a || !b) continue;
    ctx.beginPath();
    ctx.moveTo(a.x + a.w, a.y + a.h / 2);
    const mx = (a.x + a.w + b.x) / 2;
    ctx.bezierCurveTo(mx, a.y + a.h / 2, mx, b.y + b.h / 2, b.x, b.y + b.h / 2);
    ctx.stroke();
  }
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function drawNode(ctx, node) {
  const selected = state.selected?.id === node.id;
  const color = colors[node.group] || '#d9dde5';
  ctx.save();
  ctx.shadowColor = 'rgba(0,0,0,.25)';
  ctx.shadowBlur = 18;
  ctx.fillStyle = selected ? 'rgba(155,140,255,.22)' : 'rgba(32,36,44,.94)';
  ctx.strokeStyle = selected ? color : 'rgba(255,255,255,.14)';
  ctx.lineWidth = selected ? 2 : 1;
  roundRect(ctx, node.x, node.y, node.w, node.h, 16);
  ctx.fill(); ctx.stroke();
  ctx.shadowBlur = 0;
  ctx.fillStyle = color;
  roundRect(ctx, node.x + 12, node.y + 13, 10, 10, 5); ctx.fill();
  ctx.fillStyle = '#f5f6f8';
  ctx.font = '700 13px Inter, system-ui';
  wrapText(ctx, node.label, node.x + 30, node.y + 23, node.w - 42, 16, 2);
  ctx.fillStyle = 'rgba(245,246,248,.56)';
  ctx.font = '12px Inter, system-ui';
  wrapText(ctx, node.type || node.group || 'node', node.x + 14, node.y + node.h - 17, node.w - 28, 14, 1);
  ctx.restore();
}

function wrapText(ctx, text, x, y, maxWidth, lineHeight, maxLines) {
  const words = String(text || '').split(/\s+/);
  let line = '', lines = [];
  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && line) { lines.push(line); line = word; }
    else line = test;
  }
  if (line) lines.push(line);
  lines = lines.slice(0, maxLines);
  lines.forEach((l, i) => ctx.fillText(i === maxLines - 1 && words.length > l.split(/\s+/).length ? `${l}…` : l, x, y + i * lineHeight));
}

function screenToWorld(event) {
  const rect = el('mapCanvas').getBoundingClientRect();
  return {
    x: (event.clientX - rect.left - state.transform.x) / state.transform.scale,
    y: (event.clientY - rect.top - state.transform.y) / state.transform.scale
  };
}

function hitTest(point) {
  for (let i = state.nodes.length - 1; i >= 0; i--) {
    const n = state.nodes[i];
    if (point.x >= n.x && point.x <= n.x + n.w && point.y >= n.y && point.y <= n.y + n.h) return n;
  }
  return null;
}

function pointerDown(event) {
  const point = screenToWorld(event);
  const node = hitTest(point);
  if (node) {
    state.selected = node;
    state.dragging = { id: node.id, dx: point.x - node.x, dy: point.y - node.y };
    renderInspector(node);
  } else {
    state.panning = { x: event.clientX, y: event.clientY, tx: state.transform.x, ty: state.transform.y };
  }
  el('mapCanvas').setPointerCapture(event.pointerId);
  drawMap();
}

function pointerMove(event) {
  if (state.dragging) {
    const node = state.nodes.find(n => n.id === state.dragging.id);
    const p = screenToWorld(event);
    node.x = p.x - state.dragging.dx;
    node.y = p.y - state.dragging.dy;
    drawMap();
  } else if (state.panning) {
    state.transform.x = state.panning.tx + (event.clientX - state.panning.x);
    state.transform.y = state.panning.ty + (event.clientY - state.panning.y);
    drawMap();
  }
}

function pointerUp() { state.dragging = null; state.panning = null; }

function wheel(event) {
  event.preventDefault();
  const rect = el('mapCanvas').getBoundingClientRect();
  const mx = event.clientX - rect.left, my = event.clientY - rect.top;
  const old = state.transform.scale;
  const next = Math.max(.22, Math.min(2.5, old * (event.deltaY < 0 ? 1.08 : .92)));
  const wx = (mx - state.transform.x) / old;
  const wy = (my - state.transform.y) / old;
  state.transform.scale = next;
  state.transform.x = mx - wx * next;
  state.transform.y = my - wy * next;
  drawMap();
}

function renderInspector(node) {
  el('inspectorContent').innerHTML = `<div class="inspect-card"><h3>${esc(node.label)}</h3><div class="inspect-meta"><span class="pill">${esc(node.group)}</span><span class="pill">${esc(node.type)}</span></div><p>${esc(node.desc || 'Sem descrição.')}</p><pre>${esc(JSON.stringify(node.raw || node, null, 2))}</pre></div>`;
}

boot().catch(error => {
  document.body.innerHTML = `<pre style="padding:24px;color:#fff;background:#111;height:100vh;overflow:auto">${esc(error.stack || error.message)}</pre>`;
});

"""Standalone interactive dashboard renderer for Product Management AI."""
from __future__ import annotations

import datetime as _dt
import json
from typing import Any


def _safe_json(data: dict[str, Any]) -> str:
    payload = json.dumps(data, ensure_ascii=False, separators=(",", ":"))
    return (
        payload
        .replace("<", "\\u003c")
        .replace(">", "\\u003e")
        .replace("&", "\\u0026")
        .replace("\u2028", "\\u2028")
        .replace("\u2029", "\\u2029")
    )


def render_dashboard_html(data: dict[str, Any]) -> str:
    title = str(data.get("project", {}).get("name", "Product"))
    generated = _dt.datetime.now().strftime("%Y-%m-%d %H:%M")
    html = DASHBOARD_HTML.replace("__PM_AI_TITLE__", _escape_text(title))
    html = html.replace("__PM_AI_GENERATED_AT__", generated)
    html = html.replace("__PM_AI_DATA__", _safe_json(data))
    return html


def _escape_text(value: str) -> str:
    return (
        value.replace("&", "&amp;")
        .replace("<", "&lt;")
        .replace(">", "&gt;")
        .replace('"', "&quot;")
    )


DASHBOARD_HTML = r"""<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Genial Product OS · __PM_AI_TITLE__</title>
<style>
:root{
  --bg:#0b0b10; --bg2:#111118; --panel:rgba(22,22,31,.82); --panel2:rgba(30,30,42,.88);
  --card:#181820; --green:#9b87f5; --green2:#a78bfa; --mint:#ececff; --text:#f7f7fb;
  --muted:#a4a3b5; --muted2:#737287; --line:rgba(231,231,255,.10); --line2:rgba(167,139,250,.34);
  --amber:#f6c177; --red:#f87171; --blue:#7dd3fc; --purple:#a78bfa; --orange:#fb923c;
  --shadow:0 28px 90px rgba(0,0,0,.38); --radius:22px;
}
*{box-sizing:border-box} html,body{height:100%}
body{margin:0;font-family:Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont,"Segoe UI",Arial,sans-serif;color:var(--text);background:
  radial-gradient(circle at 8% 0%,rgba(124,58,237,.18),transparent 35%),
  radial-gradient(circle at 92% 8%,rgba(14,165,233,.12),transparent 38%),
  linear-gradient(135deg,#09090f 0%,#111118 45%,#07070b 100%);overflow:hidden}
body::before{content:"";position:fixed;inset:0;pointer-events:none;background-image:linear-gradient(rgba(255,255,255,.028) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.018) 1px,transparent 1px);background-size:44px 44px;mask-image:linear-gradient(to bottom,rgba(0,0,0,.8),transparent 90%)}
.app{display:grid;grid-template-rows:auto 1fr;height:100vh;position:relative;z-index:1}.topbar{display:flex;align-items:center;justify-content:space-between;gap:20px;padding:22px 28px 18px;border-bottom:1px solid var(--line);background:rgba(10,10,16,.84);backdrop-filter:blur(18px)}
.brand{display:flex;align-items:center;gap:16px;min-width:0}.mark{width:52px;height:52px;border-radius:18px;background:linear-gradient(145deg,rgba(124,58,237,.28),rgba(14,165,233,.08));border:1px solid var(--line2);display:grid;place-items:center;box-shadow:0 0 38px rgba(124,58,237,.22)}
.mark span{font-size:26px;font-weight:950;color:var(--green);text-shadow:0 0 22px rgba(167,139,250,.55)}.brand h1{margin:0;font-size:24px;letter-spacing:-.04em;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.brand p{margin:4px 0 0;color:var(--muted);font-size:13px}.brand strong{color:var(--green2)}
.top-actions{display:flex;align-items:center;gap:10px;flex-wrap:wrap;justify-content:flex-end}.button{border:1px solid var(--line2);background:rgba(255,255,255,.035);color:var(--text);padding:10px 13px;border-radius:14px;cursor:pointer;font-weight:700;transition:.18s;box-shadow:0 12px 35px rgba(0,0,0,.18)}.button:hover{border-color:rgba(167,139,250,.62);transform:translateY(-1px);background:rgba(124,58,237,.11)}.button.primary{background:linear-gradient(135deg,rgba(124,58,237,.22),rgba(14,165,233,.10));color:var(--green2)}
.shell{display:grid;grid-template-columns:284px minmax(0,1fr) 346px;gap:18px;padding:18px;overflow:hidden}.sidebar,.inspector,.main{min-height:0}.sidebar,.inspector{border:1px solid var(--line);background:var(--panel);backdrop-filter:blur(18px);border-radius:var(--radius);box-shadow:var(--shadow);overflow:auto}.sidebar{padding:14px}.main{overflow:auto;border-radius:var(--radius)}
.nav-title{padding:10px 10px 8px;color:var(--muted);font-size:12px;text-transform:uppercase;letter-spacing:.14em}.tab{width:100%;display:flex;align-items:center;justify-content:space-between;gap:10px;border:1px solid transparent;background:transparent;color:var(--text);border-radius:16px;padding:13px 14px;cursor:pointer;text-align:left;font-weight:800;margin:4px 0}.tab small{color:var(--muted);font-weight:700}.tab:hover,.tab.active{border-color:var(--line2);background:rgba(124,58,237,.10)}.tab.active{box-shadow:inset 0 0 0 1px rgba(167,139,250,.16);color:var(--green2)}
.panel{display:none}.panel.active{display:block}.card{border:1px solid var(--line);background:var(--panel);backdrop-filter:blur(18px);border-radius:var(--radius);box-shadow:var(--shadow);padding:22px;margin-bottom:18px}.hero{position:relative;overflow:hidden;padding:30px}.hero::after{content:"";position:absolute;inset:auto -20% -60% 35%;height:260px;background:radial-gradient(circle,rgba(0,245,138,.22),transparent 58%);pointer-events:none}.kicker{color:var(--green2);text-transform:uppercase;letter-spacing:.18em;font-size:12px;font-weight:900}.hero h2{font-size:42px;line-height:1.02;letter-spacing:-.06em;margin:10px 0 10px;max-width:860px}.hero p{color:var(--muted);max-width:820px;font-size:15px;line-height:1.7}.grid{display:grid;gap:14px}.metrics{grid-template-columns:repeat(4,minmax(0,1fr))}.metric{background:linear-gradient(180deg,rgba(31,31,43,.95),rgba(17,17,24,.9));border:1px solid var(--line);border-radius:20px;padding:18px}.metric span{display:block;color:var(--muted);font-size:12px;text-transform:uppercase;letter-spacing:.12em}.metric strong{display:block;font-size:34px;letter-spacing:-.05em;color:var(--green2);margin-top:7px}.section-title{display:flex;align-items:end;justify-content:space-between;gap:20px;margin-bottom:14px}.section-title h2{margin:0;font-size:24px;letter-spacing:-.03em}.section-title p{margin:4px 0 0;color:var(--muted)}
.chips{display:flex;flex-wrap:wrap;gap:8px}.chip{border:1px solid var(--line2);background:rgba(255,255,255,.035);color:var(--mint);border-radius:999px;padding:7px 10px;font-size:12px;font-weight:800}.chip.green{background:rgba(124,58,237,.13);color:var(--green2)}.chip.amber{color:var(--amber);border-color:rgba(255,209,102,.3)}
.canvas{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));grid-auto-rows:minmax(188px,auto);gap:12px}.block{position:relative;overflow:hidden;background:linear-gradient(180deg,rgba(31,31,43,.95),rgba(17,17,24,.9));border:1px solid var(--line);border-radius:20px;padding:16px}.block::before{content:"";position:absolute;inset:0 0 auto;height:3px;background:linear-gradient(90deg,var(--purple),rgba(125,211,252,.3),transparent)}.block h3{margin:0 0 10px;color:var(--green2);font-size:14px;text-transform:uppercase;letter-spacing:.08em}.block ul{margin:0;padding-left:18px;color:var(--mint);line-height:1.45}.block li{margin:7px 0}.vp{grid-column:3;grid-row:1/span 2}.segments{grid-column:5;grid-row:1/span 2}.cost{grid-column:1/span 2}.revenue{grid-column:4/span 2}
.toolbar{display:flex;gap:10px;align-items:center;justify-content:space-between;flex-wrap:wrap;margin-bottom:12px}.input{width:min(460px,100%);background:rgba(9,9,15,.78);border:1px solid var(--line2);border-radius:15px;color:var(--text);padding:12px 14px;outline:none}.input:focus{border-color:rgba(167,139,250,.68);box-shadow:0 0 0 4px rgba(124,58,237,.12)}.graph-wrap{position:relative;height:680px;background:radial-gradient(circle at 26% 16%,rgba(124,58,237,.12),transparent 42%),radial-gradient(circle at 80% 35%,rgba(14,165,233,.08),transparent 36%),#0a0a10;border:1px solid var(--line);border-radius:22px;overflow:hidden}.graph-empty{position:absolute;inset:0;display:grid;place-items:center;color:var(--muted)}svg.graph{width:100%;height:100%;display:block}.edge{stroke:rgba(190,180,255,.24);stroke-width:1.4}.edge.active{stroke:var(--purple);stroke-width:2.4}.node{cursor:grab}.node:active{cursor:grabbing}.node circle{stroke:rgba(237,233,254,.72);stroke-width:1.2;filter:drop-shadow(0 0 12px rgba(124,58,237,.20))}.node text{fill:#f2fff7;font-size:11px;font-weight:800;text-shadow:0 1px 2px #000;pointer-events:none}.node.dim{opacity:.16}.node.hidden-node{display:none}.node.active circle{stroke:var(--purple);stroke-width:3;filter:drop-shadow(0 0 22px rgba(124,58,237,.45))}.legend{display:flex;flex-wrap:wrap;gap:8px;margin-top:10px}.legend-item{display:flex;align-items:center;gap:6px;color:var(--muted);font-size:12px}.dot{width:10px;height:10px;border-radius:999px;background:var(--green)}
.split{display:grid;grid-template-columns:1.1fr .9fr;gap:16px}.list{display:grid;gap:10px}.item{border:1px solid var(--line);background:rgba(255,255,255,.025);border-radius:18px;padding:14px;cursor:pointer}.item:hover{border-color:var(--line2);background:rgba(124,58,237,.08)}.item h3{margin:0 0 8px;font-size:16px;color:var(--mint)}.item p{margin:6px 0;color:var(--muted);line-height:1.48}.table{width:100%;border-collapse:separate;border-spacing:0 8px}.table th{color:var(--muted);font-size:12px;text-align:left;text-transform:uppercase;letter-spacing:.1em;padding:0 10px}.table td{background:rgba(255,255,255,.025);border-top:1px solid var(--line);border-bottom:1px solid var(--line);padding:12px 10px;color:var(--mint);font-size:13px}.table td:first-child{border-left:1px solid var(--line);border-radius:14px 0 0 14px}.table td:last-child{border-right:1px solid var(--line);border-radius:0 14px 14px 0}.file-row{cursor:pointer}.file-row:hover td{background:rgba(124,58,237,.08)}
.inspector{padding:18px}.inspector h2{margin:0 0 12px}.inspect-box{border:1px solid var(--line);background:rgba(3,8,5,.55);border-radius:18px;padding:14px;white-space:pre-wrap;word-break:break-word;color:var(--mint);font-size:12px;line-height:1.55}.inspect-help{color:var(--muted);line-height:1.6}.footer{color:var(--muted2);font-size:12px;margin-top:14px}.doc-hero h2{max-width:980px}.doc-grid{grid-template-columns:1.15fr .85fr .9fr}.doc-card h2{font-size:21px}.doc-card p,.doc-card li{color:var(--muted);line-height:1.72}.doc-note{border:1px solid var(--line);background:rgba(255,255,255,.025);border-radius:16px;padding:12px;margin:10px 0}.doc-note strong{display:block;color:var(--mint);margin-bottom:6px}.doc-note span{color:var(--muted);line-height:1.48}.doc-steps{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px}.doc-steps div{border:1px solid var(--line);background:rgba(255,255,255,.025);border-radius:18px;padding:16px}.doc-steps strong{display:block;color:var(--mint);margin-bottom:8px}.doc-steps span{color:var(--muted);line-height:1.45}.pulse{display:inline-block;width:9px;height:9px;border-radius:999px;background:var(--purple);box-shadow:0 0 0 0 rgba(167,139,250,.7);animation:pulse 1.8s infinite}@keyframes pulse{70%{box-shadow:0 0 0 10px rgba(167,139,250,0)}}
@media(max-width:1180px){body{overflow:auto}.app{height:auto}.shell{grid-template-columns:1fr}.sidebar,.inspector{position:relative;max-height:none}.metrics{grid-template-columns:repeat(2,minmax(0,1fr))}.canvas{grid-template-columns:1fr}.vp,.segments,.cost,.revenue{grid-column:auto;grid-row:auto}.split{grid-template-columns:1fr}.doc-grid,.doc-steps{grid-template-columns:1fr}.graph-wrap{height:560px}.topbar{align-items:flex-start;flex-direction:column}.brand h1{white-space:normal}.main{overflow:visible}}
@media(max-width:620px){.metrics{grid-template-columns:1fr}.hero h2{font-size:32px}.topbar{padding:18px}.shell{padding:12px}.card{padding:16px}.brand{align-items:flex-start}.mark{width:46px;height:46px}}
</style>
</head>
<body>
<div class="app">
  <header class="topbar">
    <div class="brand">
      <div class="mark"><span>G</span></div>
      <div>
        <h1>Genial Product OS · __PM_AI_TITLE__</h1>
        <p><strong>Product Management AI</strong> criado por Bruno Costa · eusoubrunocosta.tech · eusoubrunocosta.ai</p>
      </div>
    </div>
    <div class="top-actions">
      <button class="button" id="openJson">Ver JSON</button>
      <button class="button" id="downloadReport">Exportar resumo</button>
      <button class="button primary" id="resetAll">Resetar visual</button>
    </div>
  </header>
  <div class="shell">
    <aside class="sidebar">
      <div class="nav-title">Produto</div>
      <button class="tab active" data-panel="docs">Documentação <small>Aprender</small></button>
      <button class="tab" data-panel="overview">Overview <small>Resumo</small></button>
      <button class="tab" data-panel="mindmap">Mapa mental <small>Produto</small></button>
      <button class="tab" data-panel="architecture">Arquitetura <small>Grafo</small></button>
      <button class="tab" data-panel="canvas">Business Canvas <small>Modelo</small></button>
      <button class="tab" data-panel="improvements">Melhorias <small>PM</small></button>
      <button class="tab" data-panel="files">Arquivos <small>Código</small></button>
      <div class="nav-title">Status</div>
      <div class="item"><span class="pulse"></span> Dashboard gerado em<br><strong>__PM_AI_GENERATED_AT__</strong></div>
      <div class="footer">Clique em cards, linhas e nós para inspecionar. Arraste os nós no grafo. Use scroll para zoom.</div>
    </aside>
    <main class="main">
      <section class="panel active" id="docs"></section>
      <section class="panel" id="overview"></section>
      <section class="panel" id="mindmap"></section>
      <section class="panel" id="architecture"></section>
      <section class="panel" id="canvas"></section>
      <section class="panel" id="improvements"></section>
      <section class="panel" id="files"></section>
    </main>
    <aside class="inspector">
      <h2>Inspector</h2>
      <div id="inspector" class="inspect-help">Clique em qualquer nó, arquivo, canvas ou melhoria para ver detalhes aqui.</div>
    </aside>
  </div>
</div>
<script id="pm-ai-data" type="application/json">__PM_AI_DATA__</script>
<script>
(() => {
  const data = JSON.parse(document.getElementById('pm-ai-data').textContent);
  const $ = (q, root=document) => root.querySelector(q);
  const $$ = (q, root=document) => [...root.querySelectorAll(q)];
  const esc = (v) => String(v ?? '').replace(/[&<>"']/g, s => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[s]));
  const fmt = (n) => Number(n || 0).toLocaleString('pt-BR');
  const colors = {project:'#00f58a',product:'#00f58a',file:'#64ffb1',symbol:'#8ecae6',dependency:'#ffd166',frontend:'#ff9f1c',backend:'#90be6d',database:'#c77dff',api:'#4cc9f0',config:'#adb5bd',quality:'#ff6b6b',business:'#00f58a',architecture:'#8ecae6',growth:'#ffd166',improvement:'#ff6b6b',layer:'#64ffb1',value:'#00f58a'};
  let activePanel = 'overview';
  let graphState = new Map();
  let mindState = new Map();

  function setInspector(title, payload){
    $('#inspector').innerHTML = `<div class="inspect-box"><strong>${esc(title)}</strong>\n\n${esc(typeof payload === 'string' ? payload : JSON.stringify(payload, null, 2))}</div>`;
  }
  function chip(text, cls=''){ return `<span class="chip ${cls}">${esc(text)}</span>`; }
  function list(items){ return `<ul>${(items || []).map(x => `<li>${esc(x)}</li>`).join('')}</ul>`; }
  function card(title, body, extra='') { return `<div class="card ${extra}"><div class="section-title"><div><h2>${esc(title)}</h2></div></div>${body}</div>`; }

  function renderDocs(){
    const p = data.project || {};
    const improvements = data.improvements || [];
    const layers = data.architecture?.layers || [];
    const canvas = data.business_canvas || {};
    $('#docs').innerHTML = `
      <div class="card hero doc-hero"><div class="kicker">Living product documentation</div><h2>Uma documentação bonita para entender, ensinar e melhorar ${esc(p.name || 'o produto')}.</h2><p>Essa visão foi pensada para PMs, founders, engenharia e pessoas não técnicas. Comece pela narrativa do produto, depois navegue para mapa mental, arquitetura, canvas e arquivos.</p></div>
      <div class="grid doc-grid">
        <div class="card doc-card"><div class="kicker">1 · Produto</div><h2>O que este produto parece ser</h2><p>${esc((canvas['Value Propositions'] || ['Produto em análise'])[0])}</p><div class="chips">${(layers || []).slice(0,6).map(x=>chip(x)).join('')}</div></div>
        <div class="card doc-card"><div class="kicker">2 · Próxima conversa</div><h2>Perguntas para o time</h2><ul><li>Qual problema de usuário este repositório resolve hoje?</li><li>O que precisa ficar óbvio para alguém novo entender em 10 minutos?</li><li>Quais partes são core do produto e quais são suporte?</li><li>Que melhoria geraria valor mais rápido?</li></ul></div>
        <div class="card doc-card"><div class="kicker">3 · Melhorias</div><h2>O que olhar primeiro</h2>${improvements.slice(0,4).map(i=>`<div class="doc-note"><strong>${esc(i.title)}</strong><span>${esc(i.action)}</span></div>`).join('') || '<p class="inspect-help">Nenhuma melhoria detectada.</p>'}</div>
      </div>
      <div class="card"><div class="section-title"><div><h2>Como usar esta tela</h2><p>Use como um caderno de produto interativo.</p></div></div><div class="doc-steps"><div><strong>Mapa mental</strong><span>Entenda o produto sem entrar no código.</span></div><div><strong>Arquitetura</strong><span>Veja arquivos, símbolos e dependências.</span></div><div><strong>Canvas</strong><span>Discuta modelo de negócio e valor.</span></div><div><strong>Arquivos</strong><span>Procure pontos específicos para documentar ou melhorar.</span></div></div></div>
    `;
  }

  function renderOverview(){
    const p = data.project || {};
    const langs = Object.entries(data.summary?.loc_by_language || {}).sort((a,b)=>b[1]-a[1]).slice(0,10);
    const layers = data.architecture?.layers || [];
    const signals = Object.entries(data.architecture?.signals || {}).sort((a,b)=>b[1]-a[1]).slice(0,12);
    $('#overview').innerHTML = `
      <div class="card hero">
        <div class="kicker">Product intelligence workspace</div>
        <h2>${esc(p.name || 'Produto')} organizado como documentação viva, arquitetura e estratégia.</h2>
        <p>Uma experiência visual para documentar, aprender e tomar decisões. A ideia é transformar qualquer repositório em um mapa de produto compreensível para founder, PM, engenharia e operação.</p>
      </div>
      <div class="grid metrics">
        <div class="metric"><span>Arquivos analisados</span><strong>${fmt(p.files_scanned)}</strong></div>
        <div class="metric"><span>Linhas de código/docs</span><strong>${fmt(p.total_lines)}</strong></div>
        <div class="metric"><span>Nós no grafo</span><strong>${fmt(data.graph?.nodes?.length)}</strong></div>
        <div class="metric"><span>Melhorias sugeridas</span><strong>${fmt(data.improvements?.length)}</strong></div>
      </div>
      ${card('Camadas detectadas', `<div class="chips">${layers.map(x=>chip(x,'green')).join('') || '<p class="inspect-help">Nenhuma camada forte detectada.</p>'}</div>`)}
      <div class="split">
        ${card('Linguagens principais', `<div class="chips">${langs.map(([k,v])=>chip(`${k} · ${fmt(v)} linhas`)).join('')}</div>`)}
        ${card('Sinais de arquitetura', `<div class="chips">${signals.map(([k,v])=>chip(`${k} · ${v}`,'amber')).join('') || '<p class="inspect-help">Sem sinais fortes.</p>'}</div>`)}
      </div>
      ${card('Riscos percebidos', data.risks?.length ? list(data.risks) : '<p class="inspect-help">Nenhum risco crítico detectado automaticamente.</p>')}
    `;
  }

  function renderCanvas(){
    const c = data.business_canvas || {};
    const block = (cls, title, items) => `<div class="block ${cls}" data-kind="canvas" data-title="${esc(title)}"><h3>${esc(title)}</h3>${list(items)}</div>`;
    $('#canvas').innerHTML = `
      <div class="card hero"><div class="kicker">Business model canvas</div><h2>Modelo de negócio inferido a partir do produto.</h2><p>É uma hipótese automática. Use para conversar com founder, PM, comercial e engenharia e validar com dados reais.</p></div>
      <div class="card"><div class="canvas">
        ${block('', 'Key Partners', c['Key Partners'])}
        ${block('', 'Key Activities', c['Key Activities'])}
        ${block('vp', 'Value Propositions', c['Value Propositions'])}
        ${block('', 'Customer Relationships', c['Customer Relationships'])}
        ${block('segments', 'Customer Segments', c['Customer Segments'])}
        ${block('', 'Key Resources', c['Key Resources'])}
        ${block('', 'Channels', c['Channels'])}
        ${block('cost', 'Cost Structure', c['Cost Structure'])}
        ${block('revenue', 'Revenue Streams', c['Revenue Streams'])}
      </div></div>`;
    $$('.block', $('#canvas')).forEach(el => el.onclick = () => setInspector(el.dataset.title, c[el.dataset.title] || []));
  }

  function renderImprovements(){
    const items = data.improvements || [];
    $('#improvements').innerHTML = `
      <div class="card hero"><div class="kicker">PM hard mode</div><h2>Melhorias priorizáveis para produto, código e operação.</h2><p>Transforme qualquer item abaixo em PRD, backlog, experimento Lean ou sprint.</p></div>
      <div class="card"><div class="list">${items.map((i,idx)=>`<div class="item improvement" data-index="${idx}"><h3>${esc(i.title)}</h3><div class="chips">${chip(i.area || 'Produto','green')}</div><p><strong>Por quê:</strong> ${esc(i.why)}</p><p><strong>Ação:</strong> ${esc(i.action)}</p></div>`).join('') || '<p class="inspect-help">Nenhuma melhoria detectada.</p>'}</div></div>`;
    $$('.improvement').forEach(el => el.onclick = () => setInspector('Melhoria recomendada', items[Number(el.dataset.index)]));
  }

  function renderFiles(){
    const files = data.files || [];
    $('#files').innerHTML = `
      <div class="card hero"><div class="kicker">Codebase browser</div><h2>Arquivos analisados com linguagem, tamanho e tags.</h2><p>Busque por diretório, linguagem, tag ou nome de arquivo. Clique numa linha para inspecionar.</p></div>
      <div class="card"><div class="toolbar"><input class="input" id="fileSearch" placeholder="Buscar arquivo, linguagem, tag..."/><div class="chips"><span class="chip green">${fmt(files.length)} arquivos</span></div></div><div id="fileTable"></div></div>`;
    const render = () => {
      const q = ($('#fileSearch')?.value || '').toLowerCase();
      const filtered = files.filter(f => JSON.stringify(f).toLowerCase().includes(q)).slice(0,360);
      $('#fileTable').innerHTML = `<table class="table"><thead><tr><th>Arquivo</th><th>Linguagem</th><th>Linhas</th><th>Tags</th></tr></thead><tbody>${filtered.map((f,idx)=>`<tr class="file-row" data-path="${esc(f.path)}"><td>${esc(f.path)}</td><td>${esc(f.language)}</td><td>${fmt(f.lines)}</td><td>${esc((f.tags || []).join(', '))}</td></tr>`).join('')}</tbody></table>`;
      $$('.file-row', $('#fileTable')).forEach(row => row.onclick = () => setInspector('Arquivo', files.find(f => f.path === row.dataset.path) || row.dataset.path));
    };
    $('#fileSearch').oninput = render;
    render();
  }

  function buildMindData(){
    const nodes = [{id:'product',label:data.project?.name || 'Produto',group:'product',type:'product'}];
    const edges = [];
    const hubs = [['business','Business', 'business'],['architecture','Architecture','architecture'],['quality','Melhorias','quality'],['growth','Growth','growth'],['code','Código','file']];
    hubs.forEach(([id,label,group]) => { nodes.push({id,label,group,type:'hub'}); edges.push({source:'product',target:id}); });
    (data.business_canvas?.['Value Propositions'] || []).slice(0,5).forEach((label,i)=>{ nodes.push({id:'vp'+i,label,group:'value'}); edges.push({source:'business',target:'vp'+i}); });
    (data.architecture?.layers || []).forEach((label,i)=>{ nodes.push({id:'layer'+i,label,group:'layer'}); edges.push({source:'architecture',target:'layer'+i}); });
    (data.improvements || []).slice(0,8).forEach((item,i)=>{ nodes.push({id:'imp'+i,label:item.title,group:'improvement',item}); edges.push({source:'quality',target:'imp'+i}); });
    Object.entries(data.summary?.languages || {}).slice(0,8).forEach(([label,count],i)=>{ nodes.push({id:'lang'+i,label:`${label} (${count})`,group:'file'}); edges.push({source:'code',target:'lang'+i}); });
    return {nodes,edges};
  }

  function renderMindmap(){
    $('#mindmap').innerHTML = `
      <div class="card hero"><div class="kicker">Visual thinking</div><h2>Mapa mental do produto.</h2><p>Uma visão executiva: negócio, arquitetura, código, growth e oportunidades de melhoria.</p></div>
      <div class="card"><div class="toolbar"><div class="chips">${chip('Arraste nós','green')}${chip('Clique para inspecionar')}${chip('Scroll para zoom')}</div><button class="button" id="resetMind">Resetar mapa</button></div><div id="mindGraph" class="graph-wrap"></div></div>`;
    drawNetwork('#mindGraph', buildMindData(), mindState, 'mind');
    $('#resetMind').onclick = () => { mindState = new Map(); drawNetwork('#mindGraph', buildMindData(), mindState, 'mind'); };
  }

  function renderArchitecture(){
    $('#architecture').innerHTML = `
      <div class="card hero"><div class="kicker">Architecture graph</div><h2>Grafo interativo do repositório.</h2><p>Arquivos, símbolos, dependências e relações detectadas. Busque, arraste, dê zoom e clique para entender a lógica.</p></div>
      <div class="card"><div class="toolbar"><input class="input" id="graphSearch" placeholder="Buscar nó, arquivo, símbolo, dependência..."/><div><button class="button" id="zoomIn">Zoom +</button><button class="button" id="zoomOut">Zoom -</button><button class="button" id="resetGraph">Resetar</button></div></div><div id="archGraph" class="graph-wrap"></div><div class="legend" id="legend"></div></div>`;
    const graph = {nodes:data.graph?.nodes || [], edges:data.graph?.edges || []};
    const draw = () => drawNetwork('#archGraph', graph, graphState, 'arch', $('#graphSearch').value || '');
    $('#graphSearch').oninput = draw;
    $('#resetGraph').onclick = () => { graphState = new Map(); draw(); };
    $('#zoomIn').onclick = () => graphZoom('#archGraph', 1.18);
    $('#zoomOut').onclick = () => graphZoom('#archGraph', .84);
    $('#legend').innerHTML = Object.entries(colors).slice(0,11).map(([k,c])=>`<span class="legend-item"><span class="dot" style="background:${c}"></span>${esc(k)}</span>`).join('');
    draw();
  }

  function stableHash(str){ let h=0; for(let i=0;i<str.length;i++) h=(h*31+str.charCodeAt(i))|0; return Math.abs(h); }
  function computeLayout(nodes, state, width, height, mode){
    const cx=width/2, cy=height/2;
    const groups = [...new Set(nodes.map(n => n.group || n.type || 'file'))];
    nodes.forEach((n,i)=>{
      if(state.has(n.id)) return;
      if(i===0){ state.set(n.id,{x:cx,y:cy}); return; }
      const gi = Math.max(groups.indexOf(n.group || n.type || 'file'),0);
      const ring = 120 + (gi % 5) * 78 + Math.floor(i/60)*42;
      const angle = ((stableHash(n.id) % 360) / 360) * Math.PI*2 + (i % 11)*0.12;
      state.set(n.id,{x:cx + Math.cos(angle)*ring, y:cy + Math.sin(angle)*ring});
    });
  }
  function drawNetwork(selector, graph, state, mode, filter=''){
    const box = $(selector);
    const width = Math.max(box.clientWidth, 820);
    const height = box.clientHeight || 680;
    const q = filter.toLowerCase().trim();
    const nodesAll = graph.nodes || [];
    const edgesAll = graph.edges || [];
    const visible = nodesAll.filter(n => !q || JSON.stringify(n).toLowerCase().includes(q)).slice(0,650);
    const ids = new Set(visible.map(n=>n.id));
    const edges = edgesAll.filter(e => ids.has(e.source) && ids.has(e.target)).slice(0,1200);
    if(!visible.length){ box.innerHTML = '<div class="graph-empty">Nenhum nó encontrado.</div>'; return; }
    computeLayout(visible, state, width, height, mode);
    const tx = Number(box.dataset.tx || 0), ty = Number(box.dataset.ty || 0), scale = Number(box.dataset.scale || 1);
    const edgeSvg = edges.map(e => { const s=state.get(e.source), t=state.get(e.target); if(!s||!t) return ''; return `<line class="edge" data-s="${esc(e.source)}" data-t="${esc(e.target)}" x1="${s.x}" y1="${s.y}" x2="${t.x}" y2="${t.y}"/>`; }).join('');
    const nodeSvg = visible.map(n => { const p=state.get(n.id); const g=n.group || n.type || 'file'; const r = n.type === 'project' || n.type === 'product' ? 30 : n.type === 'hub' ? 25 : n.type === 'file' ? 17 : 15; const label = (n.label || n.id || '').slice(0,54); return `<g class="node" data-id="${esc(n.id)}" transform="translate(${p.x},${p.y})"><circle r="${r}" fill="${colors[g] || '#64ffb1'}" fill-opacity=".23"></circle><text x="${r+7}" y="4">${esc(label)}</text></g>`; }).join('');
    box.innerHTML = `<svg class="graph" viewBox="0 0 ${width} ${height}" preserveAspectRatio="xMidYMid meet"><g class="viewport" transform="translate(${tx} ${ty}) scale(${scale})">${edgeSvg}${nodeSvg}</g></svg>`;
    bindGraphEvents(box, graph, state, mode, filter);
  }
  function bindGraphEvents(box, graph, state, mode, filter){
    let drag = null, pan = null;
    const svg = $('svg', box); const view = $('.viewport', box);
    function redraw(){ drawNetwork('#'+box.id, graph, state, mode, filter); }
    $$('.node', box).forEach(el => {
      el.addEventListener('pointerdown', ev => { ev.stopPropagation(); const id=el.dataset.id; const p=state.get(id); drag={id,startX:ev.clientX,startY:ev.clientY,x:p.x,y:p.y}; el.setPointerCapture(ev.pointerId); });
      el.addEventListener('click', ev => { ev.stopPropagation(); const node=(graph.nodes||[]).find(n=>n.id===el.dataset.id); setInspector(node?.label || 'Nó', node || el.dataset.id); $$('.node', box).forEach(n=>n.classList.remove('active')); el.classList.add('active'); });
    });
    svg.addEventListener('pointerdown', ev => { pan={x:ev.clientX,y:ev.clientY,tx:Number(box.dataset.tx||0),ty:Number(box.dataset.ty||0)}; svg.setPointerCapture(ev.pointerId); });
    svg.addEventListener('pointermove', ev => {
      if(drag){ const scale=Number(box.dataset.scale||1); state.set(drag.id,{x:drag.x+(ev.clientX-drag.startX)/scale,y:drag.y+(ev.clientY-drag.startY)/scale}); redraw(); return; }
      if(pan){ box.dataset.tx = pan.tx + (ev.clientX-pan.x); box.dataset.ty = pan.ty + (ev.clientY-pan.y); view.setAttribute('transform', `translate(${box.dataset.tx} ${box.dataset.ty}) scale(${Number(box.dataset.scale||1)})`); }
    });
    svg.addEventListener('pointerup', () => { drag=null; pan=null; });
    svg.addEventListener('wheel', ev => { ev.preventDefault(); graphZoom('#'+box.id, ev.deltaY < 0 ? 1.08 : .92); }, {passive:false});
  }
  function graphZoom(selector, factor){
    const box=$(selector); if(!box) return;
    const current = Number(box.dataset.scale || 1);
    box.dataset.scale = Math.max(.35, Math.min(3.2, current * factor));
    const view = $('.viewport', box);
    if(view) view.setAttribute('transform', `translate(${Number(box.dataset.tx||0)} ${Number(box.dataset.ty||0)}) scale(${Number(box.dataset.scale||1)})`);
  }

  function setPanel(id){
    activePanel = id;
    $$('.tab').forEach(t => t.classList.toggle('active', t.dataset.panel === id));
    $$('.panel').forEach(p => p.classList.toggle('active', p.id === id));
    if(id === 'mindmap') renderMindmap();
    if(id === 'architecture') renderArchitecture();
  }
  $$('.tab').forEach(btn => btn.onclick = () => setPanel(btn.dataset.panel));
  $('#resetAll').onclick = () => { graphState = new Map(); mindState = new Map(); renderMindmap(); renderArchitecture(); setInspector('Reset', 'Visualizações reiniciadas.'); };
  $('#openJson').onclick = () => setInspector('JSON completo', data);
  $('#downloadReport').onclick = () => {
    const lines = [`# ${data.project?.name || 'Produto'} · Product Management AI`, '', `Arquivos: ${fmt(data.project?.files_scanned)}`, `Linhas: ${fmt(data.project?.total_lines)}`, '', '## Melhorias', ...(data.improvements || []).map(i => `- ${i.title}: ${i.action}`)];
    const blob = new Blob([lines.join('\n')], {type:'text/markdown'});
    const url = URL.createObjectURL(blob); const a=document.createElement('a'); a.href=url; a.download='pm-ai-summary.md'; a.click(); URL.revokeObjectURL(url);
  };
  renderDocs(); renderOverview(); renderCanvas(); renderImprovements(); renderFiles(); renderMindmap(); renderArchitecture(); setPanel('docs');
})();
</script>
</body>
</html>
"""

"""Standalone professional workspace renderer for Product Management AI."""
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


def _escape_text(value: str) -> str:
    return (
        value.replace("&", "&amp;")
        .replace("<", "&lt;")
        .replace(">", "&gt;")
        .replace('"', "&quot;")
    )


def render_dashboard_html(data: dict[str, Any]) -> str:
    title = str(data.get("project", {}).get("name", "Product"))
    generated = _dt.datetime.now().strftime("%Y-%m-%d %H:%M")
    html = DASHBOARD_HTML.replace("__PM_AI_TITLE__", _escape_text(title))
    html = html.replace("__PM_AI_GENERATED_AT__", generated)
    html = html.replace("__PM_AI_DATA__", _safe_json(data))
    return html


DASHBOARD_HTML = r"""<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Genial Product Workspace · __PM_AI_TITLE__</title>
<style>
:root{
  --bg:#0c0d10; --surface:#111318; --surface2:#171a22; --card:#1c2029; --card2:#222735;
  --text:#f4f6fb; --muted:#9aa4b2; --muted2:#6f7988; --line:#2b313d; --line2:#3a4352;
  --accent:#8b5cf6; --accent2:#22d3ee; --ok:#34d399; --warn:#f59e0b; --danger:#fb7185;
  --shadow:0 28px 80px rgba(0,0,0,.38); --radius:18px;
}
*{box-sizing:border-box} html,body{height:100%} body{margin:0;background:radial-gradient(circle at 14% 0%,rgba(139,92,246,.16),transparent 34%),radial-gradient(circle at 86% 6%,rgba(34,211,238,.11),transparent 35%),var(--bg);color:var(--text);font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",Arial,sans-serif;overflow:hidden}
button,input,select{font:inherit}.app{height:100vh;display:grid;grid-template-columns:270px minmax(0,1fr) 330px;grid-template-rows:66px minmax(0,1fr)}
.top{grid-column:1/4;display:flex;align-items:center;justify-content:space-between;padding:0 22px;border-bottom:1px solid var(--line);background:rgba(12,13,16,.88);backdrop-filter:blur(16px)}
.brand{display:flex;align-items:center;gap:12px;min-width:0}.logo{width:38px;height:38px;border-radius:12px;background:linear-gradient(135deg,var(--accent),var(--accent2));display:grid;place-items:center;color:white;font-weight:950;box-shadow:0 12px 42px rgba(139,92,246,.32)}.brand h1{font-size:16px;margin:0;letter-spacing:-.02em;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.brand p{font-size:12px;color:var(--muted);margin:2px 0 0}.actions{display:flex;align-items:center;gap:8px}.btn{border:1px solid var(--line2);background:var(--surface2);color:var(--text);border-radius:12px;padding:9px 12px;cursor:pointer;font-weight:750}.btn:hover{border-color:var(--accent);background:#202536}.btn.primary{background:linear-gradient(135deg,rgba(139,92,246,.28),rgba(34,211,238,.14));border-color:rgba(139,92,246,.55)}
.side,.inspect{min-height:0;overflow:auto;background:rgba(17,19,24,.92);border-right:1px solid var(--line)}.inspect{border-left:1px solid var(--line);border-right:0;padding:16px}.side{padding:14px}.main{min-height:0;overflow:auto;padding:18px}.navLabel{font-size:11px;color:var(--muted2);text-transform:uppercase;letter-spacing:.14em;padding:11px 8px 7px}.tab{width:100%;border:1px solid transparent;background:transparent;color:var(--muted);border-radius:13px;padding:11px 12px;text-align:left;cursor:pointer;font-weight:760;display:flex;justify-content:space-between;gap:8px;margin:2px 0}.tab:hover,.tab.active{color:var(--text);background:#191d26;border-color:var(--line2)}.tab.active{box-shadow:inset 3px 0 0 var(--accent)}.tab small{font-weight:700;color:var(--muted2)}
.panel{display:none}.panel.active{display:block}.hero{background:linear-gradient(135deg,rgba(139,92,246,.14),rgba(34,211,238,.07)),var(--surface);border:1px solid var(--line);border-radius:var(--radius);box-shadow:var(--shadow);padding:24px;margin-bottom:16px}.eyebrow{font-size:12px;color:var(--accent2);text-transform:uppercase;letter-spacing:.15em;font-weight:900}.hero h2{font-size:34px;line-height:1.05;letter-spacing:-.055em;margin:8px 0 10px}.hero p{color:var(--muted);line-height:1.62;max-width:900px;margin:0}.grid{display:grid;gap:14px}.metrics{grid-template-columns:repeat(4,minmax(0,1fr))}.metric,.card{background:rgba(17,19,24,.86);border:1px solid var(--line);border-radius:var(--radius);box-shadow:var(--shadow)}.metric{padding:16px}.metric span{display:block;font-size:11px;color:var(--muted2);text-transform:uppercase;letter-spacing:.12em}.metric strong{display:block;margin-top:7px;font-size:30px;letter-spacing:-.05em}.card{padding:18px;margin-bottom:16px}.card h3,.card h2{margin:0 0 12px}.card p{color:var(--muted);line-height:1.55}.split{display:grid;grid-template-columns:1fr 1fr;gap:14px}.chips{display:flex;flex-wrap:wrap;gap:8px}.chip{border:1px solid var(--line2);background:#171b24;color:#cbd5e1;border-radius:999px;padding:6px 9px;font-size:12px;font-weight:760}.chip.accent{color:#ddd6fe;border-color:rgba(139,92,246,.46);background:rgba(139,92,246,.12)}.chip.cyan{color:#cffafe;border-color:rgba(34,211,238,.35);background:rgba(34,211,238,.1)}.chip.warn{color:#fde68a;border-color:rgba(245,158,11,.38);background:rgba(245,158,11,.1)}
.docGrid{display:grid;grid-template-columns:1.05fr .95fr;gap:14px}.docStep{display:flex;gap:12px;align-items:flex-start;padding:13px;border:1px solid var(--line);border-radius:15px;background:#151922;margin:9px 0}.docStep b{min-width:30px;height:30px;border-radius:10px;background:rgba(139,92,246,.18);display:grid;place-items:center;color:#ddd6fe}.docStep p{margin:0;color:var(--muted)}
.toolbar{display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;margin-bottom:12px}.tools{display:flex;align-items:center;gap:8px;flex-wrap:wrap}.input,.select{background:#0d1016;border:1px solid var(--line2);border-radius:12px;color:var(--text);padding:10px 12px;outline:0}.input{min-width:280px}.input:focus,.select:focus{border-color:var(--accent)}
.board{height:690px;border:1px solid var(--line);border-radius:18px;background:#0a0c11;position:relative;overflow:hidden;box-shadow:inset 0 0 0 1px rgba(255,255,255,.018)}.boardHelp{position:absolute;left:14px;bottom:14px;color:var(--muted2);font-size:12px;z-index:4;background:rgba(12,13,16,.72);border:1px solid var(--line);border-radius:12px;padding:8px 10px}.world{position:absolute;left:0;top:0;transform-origin:0 0}.edges{position:absolute;left:0;top:0;pointer-events:none}.node{position:absolute;border:1px solid var(--line2);background:#181d27;color:var(--text);border-radius:14px;padding:10px 11px;box-shadow:0 12px 30px rgba(0,0,0,.28);cursor:grab;user-select:none;min-width:150px;max-width:240px}.node:active{cursor:grabbing}.node.active{border-color:var(--accent2);box-shadow:0 0 0 3px rgba(34,211,238,.12),0 18px 46px rgba(0,0,0,.36)}.node.dim{opacity:.22}.node .type{font-size:10px;text-transform:uppercase;letter-spacing:.12em;color:var(--muted2);font-weight:900;margin-bottom:4px}.node .title{font-size:13px;font-weight:850;line-height:1.25;white-space:normal;overflow:hidden;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical}.node .meta{font-size:11px;color:var(--muted);margin-top:5px}.node.project{background:linear-gradient(135deg,rgba(139,92,246,.23),rgba(34,211,238,.12)),#181d27;border-color:rgba(139,92,246,.5)}.node.backend{border-color:rgba(52,211,153,.34)}.node.frontend{border-color:rgba(34,211,238,.34)}.node.dependency{border-color:rgba(245,158,11,.36)}.node.symbol{border-color:rgba(251,113,133,.3)}.laneLabel{position:absolute;color:var(--muted2);font-size:11px;text-transform:uppercase;letter-spacing:.16em;font-weight:900}
.canvasGrid{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));grid-auto-rows:minmax(170px,auto);gap:12px}.canvasBlock{background:#151922;border:1px solid var(--line);border-radius:16px;padding:15px;cursor:pointer}.canvasBlock:hover{border-color:var(--accent)}.canvasBlock h3{margin:0 0 10px;font-size:12px;text-transform:uppercase;letter-spacing:.12em;color:#c4b5fd}.canvasBlock ul{margin:0;padding-left:17px;color:#dbe4f0;line-height:1.45}.vp{grid-column:3;grid-row:1/span 2}.segments{grid-column:5;grid-row:1/span 2}.cost{grid-column:1/span 2}.revenue{grid-column:4/span 2}
.list{display:grid;gap:10px}.item{background:#151922;border:1px solid var(--line);border-radius:16px;padding:14px;cursor:pointer}.item:hover{border-color:var(--accent)}.item h3{margin:0 0 8px}.item p{margin:6px 0;color:var(--muted);line-height:1.5}.table{width:100%;border-collapse:separate;border-spacing:0 8px}.table th{font-size:11px;color:var(--muted2);text-transform:uppercase;letter-spacing:.1em;text-align:left;padding:0 9px}.table td{font-size:13px;color:#dbe4f0;background:#151922;border-top:1px solid var(--line);border-bottom:1px solid var(--line);padding:11px 9px}.table td:first-child{border-left:1px solid var(--line);border-radius:12px 0 0 12px}.table td:last-child{border-right:1px solid var(--line);border-radius:0 12px 12px 0}.fileRow{cursor:pointer}.fileRow:hover td{background:#1a2030}
.inspect h2{margin:0 0 10px}.inspectText{color:var(--muted);line-height:1.6}.inspectBox{background:#0d1016;border:1px solid var(--line);border-radius:15px;padding:13px;white-space:pre-wrap;word-break:break-word;font-size:12px;line-height:1.55;color:#dbe4f0}.footerNote{font-size:12px;color:var(--muted2);margin-top:12px}
@media(max-width:1180px){body{overflow:auto}.app{display:block;height:auto}.top{position:sticky;top:0;z-index:10}.side,.inspect{border:0;border-bottom:1px solid var(--line);max-height:none}.main{overflow:visible}.metrics{grid-template-columns:repeat(2,1fr)}.docGrid,.split{grid-template-columns:1fr}.canvasGrid{grid-template-columns:1fr}.vp,.segments,.cost,.revenue{grid-column:auto;grid-row:auto}.board{height:560px}}
</style>
</head>
<body>
<div class="app">
  <header class="top">
    <div class="brand"><div class="logo">G</div><div><h1>Genial Product Workspace · __PM_AI_TITLE__</h1><p>Product Management AI · Bruno Costa · eusoubrunocosta.tech · eusoubrunocosta.ai</p></div></div>
    <div class="actions"><button class="btn" id="btnExport">Exportar resumo</button><button class="btn" id="btnJson">JSON</button><button class="btn primary" id="btnReset">Reset visual</button></div>
  </header>
  <aside class="side">
    <div class="navLabel">Workspace</div>
    <button class="tab active" data-panel="docs">Documentação <small>guia</small></button>
    <button class="tab" data-panel="arch">Arquitetura <small>board</small></button>
    <button class="tab" data-panel="mind">Mapa mental <small>produto</small></button>
    <button class="tab" data-panel="canvas">Business Canvas <small>modelo</small></button>
    <button class="tab" data-panel="improvements">Melhorias <small>PM</small></button>
    <button class="tab" data-panel="files">Arquivos <small>repo</small></button>
    <div class="navLabel">Como usar</div>
    <div class="item"><p>Use o board como um Miro/Obsidian simples: arraste cards, dê zoom com scroll, arraste o fundo para navegar e clique para inspecionar.</p></div>
  </aside>
  <main class="main">
    <section id="docs" class="panel active"></section>
    <section id="arch" class="panel"></section>
    <section id="mind" class="panel"></section>
    <section id="canvas" class="panel"></section>
    <section id="improvements" class="panel"></section>
    <section id="files" class="panel"></section>
  </main>
  <aside class="inspect"><h2>Inspector</h2><div id="inspector" class="inspectText">Clique em um card, nó, arquivo ou bloco do canvas para ver detalhes.</div><div class="footerNote">Gerado em __PM_AI_GENERATED_AT__</div></aside>
</div>
<script id="pm-ai-data" type="application/json">__PM_AI_DATA__</script>
<script>
(() => {
  const data = JSON.parse(document.getElementById('pm-ai-data').textContent);
  const $ = (q, r=document) => r.querySelector(q); const $$ = (q, r=document) => [...r.querySelectorAll(q)];
  const esc = v => String(v ?? '').replace(/[&<>"']/g, s => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[s]));
  const fmt = n => Number(n || 0).toLocaleString('pt-BR');
  const groups = ['project','frontend','backend','api','database','config','dependency','file','symbol','other'];
  const groupLabel = {project:'Produto',frontend:'Front-end',backend:'Back-end',api:'APIs',database:'Dados',config:'Config',dependency:'Dependências',file:'Arquivos',symbol:'Símbolos',other:'Outros'};
  const groupColor = {project:'#8b5cf6',frontend:'#22d3ee',backend:'#34d399',api:'#38bdf8',database:'#a78bfa',config:'#94a3b8',dependency:'#f59e0b',file:'#64748b',symbol:'#fb7185',other:'#94a3b8'};
  const state = { arch:{scale:.86,tx:24,ty:24,nodes:new Map(),mode:'essencial',query:''}, mind:{scale:1,tx:40,ty:40,nodes:new Map(),mode:'mind',query:''} };

  function inspect(title, payload){ $('#inspector').innerHTML = `<div class="inspectBox"><strong>${esc(title)}</strong>\n\n${esc(typeof payload === 'string' ? payload : JSON.stringify(payload,null,2))}</div>`; }
  const chip = (x, cls='') => `<span class="chip ${cls}">${esc(x)}</span>`;
  const list = xs => `<ul>${(xs||[]).map(x=>`<li>${esc(x)}</li>`).join('')}</ul>`;

  function setPanel(id){ $$('.tab').forEach(t=>t.classList.toggle('active',t.dataset.panel===id)); $$('.panel').forEach(p=>p.classList.toggle('active',p.id===id)); if(id==='arch') renderArch(); if(id==='mind') renderMind(); }
  $$('.tab').forEach(t => t.onclick = () => setPanel(t.dataset.panel));

  function renderDocs(){
    const p=data.project||{}, langs=Object.entries(data.summary?.loc_by_language||{}).sort((a,b)=>b[1]-a[1]).slice(0,8), layers=data.architecture?.layers||[];
    $('#docs').innerHTML = `<div class="hero"><div class="eyebrow">Documentation workspace</div><h2>Entenda o produto antes de mexer no código.</h2><p>Este workspace organiza o repositório em visão de produto, arquitetura, negócio, oportunidades e arquivos. Foi feito para PMs, founders, designers e engenharia trabalharem na mesma leitura.</p></div>
    <div class="grid metrics"><div class="metric"><span>Arquivos</span><strong>${fmt(p.files_scanned)}</strong></div><div class="metric"><span>Linhas</span><strong>${fmt(p.total_lines)}</strong></div><div class="metric"><span>Nós</span><strong>${fmt(data.graph?.nodes?.length)}</strong></div><div class="metric"><span>Melhorias</span><strong>${fmt(data.improvements?.length)}</strong></div></div>
    <div class="docGrid"><div class="card"><h3>Roteiro de leitura</h3><div class="docStep"><b>1</b><p>Comece pela aba <strong>Arquitetura</strong> em modo Essencial para entender os blocos sem embolar.</p></div><div class="docStep"><b>2</b><p>Abra o <strong>Mapa mental</strong> para entender negócio, tecnologia e melhorias como árvore de produto.</p></div><div class="docStep"><b>3</b><p>Use o <strong>Business Canvas</strong> para revisar cliente, proposta de valor, canais, receita e custos.</p></div><div class="docStep"><b>4</b><p>Transforme as <strong>Melhorias</strong> em PRD, backlog e experimentos.</p></div></div>
    <div class="card"><h3>Camadas detectadas</h3><div class="chips">${layers.map(x=>chip(x,'accent')).join('') || '<p class="inspectText">Nenhuma camada forte detectada.</p>'}</div><h3 style="margin-top:18px">Linguagens</h3><div class="chips">${langs.map(([k,v])=>chip(`${k} · ${fmt(v)} linhas`,'cyan')).join('')}</div></div></div>
    <div class="card"><h3>Riscos</h3>${data.risks?.length ? list(data.risks) : '<p class="inspectText">Nenhum risco crítico detectado automaticamente.</p>'}</div>`;
  }

  function nodeGroup(n){ const g=(n.group||n.type||'file').toLowerCase(); if(g.includes('front')) return 'frontend'; if(g.includes('back')) return 'backend'; if(g.includes('api')) return 'api'; if(g.includes('data')) return 'database'; if(g.includes('config')) return 'config'; if(g.includes('depend')) return 'dependency'; if(g.includes('symbol')) return 'symbol'; if(g.includes('project')||g.includes('product')) return 'project'; if(g.includes('file')) return 'file'; return 'other'; }
  function labelOf(n){ return n.label || n.path || n.name || n.id || 'Node'; }
  function buildArchGraph(mode, query){
    const q=query.toLowerCase().trim(); let nodes=(data.graph?.nodes||[]).map(n=>({...n,_group:nodeGroup(n),_label:labelOf(n)})); let edges=data.graph?.edges||[];
    if(mode==='essencial') nodes = nodes.filter(n => ['project','frontend','backend','api','database','config','dependency','file'].includes(n._group) && n._group !== 'symbol').slice(0,180);
    if(mode==='arquivos') nodes = nodes.filter(n => ['project','file','config','dependency'].includes(n._group)).slice(0,260);
    if(mode==='completo') nodes = nodes.slice(0,520);
    if(q) nodes = nodes.filter(n => JSON.stringify(n).toLowerCase().includes(q));
    const ids=new Set(nodes.map(n=>n.id)); edges=edges.filter(e=>ids.has(e.source)&&ids.has(e.target)); return {nodes,edges};
  }
  function buildMindGraph(){
    const nodes=[{id:'product',_label:data.project?.name||'Produto',_group:'project'}], edges=[]; const hubs=[['business','Negócio','project'],['architecture','Arquitetura','api'],['quality','Melhorias','symbol'],['code','Código','file'],['growth','Growth','dependency']];
    hubs.forEach(([id,label,g])=>{nodes.push({id,_label:label,_group:g});edges.push({source:'product',target:id});});
    (data.business_canvas?.['Value Propositions']||[]).slice(0,6).forEach((x,i)=>{nodes.push({id:'vp'+i,_label:x,_group:'project'});edges.push({source:'business',target:'vp'+i});});
    (data.architecture?.layers||[]).slice(0,10).forEach((x,i)=>{nodes.push({id:'layer'+i,_label:x,_group:'api'});edges.push({source:'architecture',target:'layer'+i});});
    (data.improvements||[]).slice(0,8).forEach((x,i)=>{nodes.push({id:'imp'+i,_label:x.title,_group:'symbol',item:x});edges.push({source:'quality',target:'imp'+i});});
    Object.entries(data.summary?.languages||{}).slice(0,8).forEach(([x,c],i)=>{nodes.push({id:'lang'+i,_label:`${x} (${c})`,_group:'file'});edges.push({source:'code',target:'lang'+i});});
    return {nodes,edges};
  }
  function layoutNodes(graph, boardState, kind){
    const byGroup = {}; graph.nodes.forEach(n => (byGroup[n._group] ||= []).push(n));
    const laneGap=300, rowGap=96, top=70, left=40; let maxRows=0;
    const order = kind==='mind' ? ['project','api','symbol','file','dependency'] : groups;
    order.forEach((g,gi)=>{ const arr=byGroup[g]||[]; maxRows=Math.max(maxRows,arr.length); arr.forEach((n,i)=>{ if(!boardState.nodes.has(n.id)){ const x=left+gi*laneGap+(i%2)*18; const y=top+i*rowGap; boardState.nodes.set(n.id,{x,y,w:g==='project'?230:190,h:66}); } }); });
    return {width: Math.max(1500, left+order.length*laneGap+260), height: Math.max(760, top+maxRows*rowGap+180), order};
  }
  function renderBoard(containerId, graph, boardState, kind){
    const root = $('#'+containerId); const meta=layoutNodes(graph, boardState, kind); root.innerHTML=`<div class="world" style="width:${meta.width}px;height:${meta.height}px"><canvas class="edges" width="${meta.width}" height="${meta.height}"></canvas></div><div class="boardHelp">Arraste cards · arraste o fundo · scroll = zoom · clique = detalhes</div>`;
    const world=$('.world',root); const canvas=$('canvas',root); const ctx=canvas.getContext('2d'); const ids=new Set(graph.nodes.map(n=>n.id)); const nodeById=new Map(graph.nodes.map(n=>[n.id,n]));
    meta.order.forEach((g,gi)=>{ if(!graph.nodes.some(n=>n._group===g)) return; const lab=document.createElement('div'); lab.className='laneLabel'; lab.style.left=(40+gi*300)+'px'; lab.style.top='22px'; lab.textContent=groupLabel[g]||g; world.appendChild(lab); });
    graph.nodes.forEach(n=>{ const p=boardState.nodes.get(n.id); const el=document.createElement('div'); el.className=`node ${n._group}`; el.dataset.id=n.id; el.style.left=p.x+'px'; el.style.top=p.y+'px'; el.style.width=p.w+'px'; el.innerHTML=`<div class="type">${esc(groupLabel[n._group]||n._group)}</div><div class="title">${esc(n._label)}</div><div class="meta">${esc(n.path||n.type||n.group||'')}</div>`; world.appendChild(el); });
    function applyTransform(){ world.style.transform=`translate(${boardState.tx}px,${boardState.ty}px) scale(${boardState.scale})`; }
    function drawEdges(){ ctx.clearRect(0,0,meta.width,meta.height); ctx.lineWidth=1.3; ctx.strokeStyle='rgba(148,163,184,.28)'; graph.edges.forEach(e=>{ if(!ids.has(e.source)||!ids.has(e.target)) return; const a=boardState.nodes.get(e.source), b=boardState.nodes.get(e.target); if(!a||!b) return; ctx.beginPath(); ctx.moveTo(a.x+a.w,a.y+a.h/2); const mid=(a.x+a.w+b.x)/2; ctx.bezierCurveTo(mid,a.y+a.h/2,mid,b.y+b.h/2,b.x,b.y+b.h/2); ctx.stroke(); }); }
    applyTransform(); drawEdges();
    let drag=null, pan=null;
    world.querySelectorAll('.node').forEach(el=>{
      el.addEventListener('pointerdown',ev=>{ev.stopPropagation(); const p=boardState.nodes.get(el.dataset.id); drag={id:el.dataset.id,el,p0:{...p},sx:ev.clientX,sy:ev.clientY}; el.setPointerCapture(ev.pointerId);});
      el.addEventListener('click',ev=>{ev.stopPropagation(); world.querySelectorAll('.node').forEach(x=>x.classList.remove('active')); el.classList.add('active'); inspect(labelOf(nodeById.get(el.dataset.id)||{}), nodeById.get(el.dataset.id));});
    });
    root.addEventListener('pointerdown',ev=>{ if(ev.target.closest && ev.target.closest('.node')) return; pan={sx:ev.clientX,sy:ev.clientY,tx:boardState.tx,ty:boardState.ty}; root.setPointerCapture(ev.pointerId); });
    root.onpointermove=ev=>{ if(drag){ const p=boardState.nodes.get(drag.id); p.x=drag.p0.x+(ev.clientX-drag.sx)/boardState.scale; p.y=drag.p0.y+(ev.clientY-drag.sy)/boardState.scale; drag.el.style.left=p.x+'px'; drag.el.style.top=p.y+'px'; drawEdges(); } else if(pan){ boardState.tx=pan.tx+(ev.clientX-pan.sx); boardState.ty=pan.ty+(ev.clientY-pan.sy); applyTransform(); } };
    root.onpointerup=()=>{drag=null;pan=null}; root.onpointercancel=()=>{drag=null;pan=null};
    root.onwheel=ev=>{ ev.preventDefault(); const old=boardState.scale; const next=Math.max(.35,Math.min(2.4,old*(ev.deltaY<0?1.08:.92))); const rect=root.getBoundingClientRect(); const mx=ev.clientX-rect.left, my=ev.clientY-rect.top; boardState.tx=mx-(mx-boardState.tx)*(next/old); boardState.ty=my-(my-boardState.ty)*(next/old); boardState.scale=next; applyTransform(); };
  }
  function renderArch(){ $('#arch').innerHTML=`<div class="hero"><div class="eyebrow">Architecture board</div><h2>Mapa arrastável por domínio, sem embolar.</h2><p>Comece no modo Essencial. Se quiser profundidade, mude para Arquivos ou Completo. Cada card é arrastável; o fundo faz pan; scroll dá zoom.</p></div><div class="card"><div class="toolbar"><div class="tools"><input id="archSearch" class="input" placeholder="Filtrar por arquivo, símbolo, dependência..."/><select id="archMode" class="select"><option value="essencial">Essencial</option><option value="arquivos">Arquivos</option><option value="completo">Completo</option></select></div><div class="tools"><button class="btn" id="archReset">Reset layout</button><button class="btn" id="archFit">Centralizar</button></div></div><div id="archBoard" class="board"></div></div>`; const draw=()=>{state.arch.mode=$('#archMode').value;state.arch.query=$('#archSearch').value;renderBoard('archBoard',buildArchGraph(state.arch.mode,state.arch.query),state.arch,'arch')}; $('#archSearch').oninput=draw; $('#archMode').onchange=()=>{state.arch.nodes=new Map();draw()}; $('#archReset').onclick=()=>{state.arch.nodes=new Map();draw()}; $('#archFit').onclick=()=>{state.arch.tx=24;state.arch.ty=24;state.arch.scale=.86;draw()}; draw(); }
  function renderMind(){ $('#mind').innerHTML=`<div class="hero"><div class="eyebrow">Mind map</div><h2>Mapa mental editável do produto.</h2><p>Organiza valor, arquitetura, código e oportunidades. Arraste os cards para montar sua leitura.</p></div><div class="card"><div class="toolbar"><div class="chips"><span class="chip accent">Board livre</span><span class="chip cyan">Cards arrastáveis</span></div><button class="btn" id="mindReset">Reset layout</button></div><div id="mindBoard" class="board"></div></div>`; $('#mindReset').onclick=()=>{state.mind.nodes=new Map();renderMind()}; renderBoard('mindBoard',buildMindGraph(),state.mind,'mind'); }
  function renderCanvas(){ const c=data.business_canvas||{}; const block=(cls,title,items)=>`<div class="canvasBlock ${cls}" data-title="${esc(title)}"><h3>${esc(title)}</h3>${list(items)}</div>`; $('#canvas').innerHTML=`<div class="hero"><div class="eyebrow">Business model canvas</div><h2>Hipótese de negócio do produto.</h2><p>Use como canvas de conversa. Clique em cada bloco para abrir no inspector.</p></div><div class="card"><div class="canvasGrid">${block('', 'Key Partners', c['Key Partners'])}${block('', 'Key Activities', c['Key Activities'])}${block('vp','Value Propositions',c['Value Propositions'])}${block('', 'Customer Relationships', c['Customer Relationships'])}${block('segments','Customer Segments',c['Customer Segments'])}${block('', 'Key Resources', c['Key Resources'])}${block('', 'Channels', c['Channels'])}${block('cost','Cost Structure',c['Cost Structure'])}${block('revenue','Revenue Streams',c['Revenue Streams'])}</div></div>`; $$('.canvasBlock').forEach(el=>el.onclick=()=>inspect(el.dataset.title,c[el.dataset.title]||[])); }
  function renderImprovements(){ const items=data.improvements||[]; $('#improvements').innerHTML=`<div class="hero"><div class="eyebrow">Product opportunities</div><h2>Melhorias transformáveis em PRD, sprint ou experimento.</h2></div><div class="card"><div class="list">${items.map((x,i)=>`<div class="item" data-i="${i}"><h3>${esc(x.title)}</h3><div class="chips">${chip(x.area||'Produto','accent')}</div><p><strong>Por quê:</strong> ${esc(x.why)}</p><p><strong>Ação:</strong> ${esc(x.action)}</p></div>`).join('')||'<p class="inspectText">Nenhuma melhoria detectada.</p>'}</div></div>`; $$('.item', $('#improvements')).forEach(el=>el.onclick=()=>inspect('Melhoria',items[Number(el.dataset.i)])); }
  function renderFiles(){ const files=data.files||[]; $('#files').innerHTML=`<div class="hero"><div class="eyebrow">Repository browser</div><h2>Arquivos analisados.</h2><p>Busque e clique para entender cada arquivo.</p></div><div class="card"><div class="toolbar"><input id="fileSearch" class="input" placeholder="Buscar arquivo, linguagem, tag..."/><span class="chip cyan">${fmt(files.length)} arquivos</span></div><div id="fileTable"></div></div>`; const draw=()=>{const q=($('#fileSearch').value||'').toLowerCase();const rows=files.filter(f=>JSON.stringify(f).toLowerCase().includes(q)).slice(0,350);$('#fileTable').innerHTML=`<table class="table"><thead><tr><th>Arquivo</th><th>Linguagem</th><th>Linhas</th><th>Tags</th></tr></thead><tbody>${rows.map(f=>`<tr class="fileRow" data-path="${esc(f.path)}"><td>${esc(f.path)}</td><td>${esc(f.language)}</td><td>${fmt(f.lines)}</td><td>${esc((f.tags||[]).join(', '))}</td></tr>`).join('')}</tbody></table>`; $$('.fileRow').forEach(r=>r.onclick=()=>inspect('Arquivo',files.find(f=>f.path===r.dataset.path)||r.dataset.path));}; $('#fileSearch').oninput=draw; draw(); }
  $('#btnJson').onclick=()=>inspect('JSON completo',data); $('#btnReset').onclick=()=>{state.arch.nodes=new Map();state.mind.nodes=new Map();state.arch.tx=24;state.arch.ty=24;state.arch.scale=.86;state.mind.tx=40;state.mind.ty=40;state.mind.scale=1; if($('#arch').classList.contains('active')) renderArch(); if($('#mind').classList.contains('active')) renderMind(); inspect('Reset','Layout reiniciado.');}; $('#btnExport').onclick=()=>{const lines=[`# ${data.project?.name||'Produto'} · Product Management AI`,'',`Arquivos: ${fmt(data.project?.files_scanned)}`,`Linhas: ${fmt(data.project?.total_lines)}`,'','## Melhorias',...(data.improvements||[]).map(x=>`- ${x.title}: ${x.action}`)];const blob=new Blob([lines.join('\n')],{type:'text/markdown'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='pm-ai-summary.md';a.click();URL.revokeObjectURL(url);};
  renderDocs(); renderCanvas(); renderImprovements(); renderFiles(); renderArch(); renderMind(); setPanel('docs');
})();
</script>
</body>
</html>"""
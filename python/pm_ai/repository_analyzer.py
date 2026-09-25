#!/usr/bin/env python3
"""Repository analyzer for Product Management AI.

Scans a local codebase and produces:
- product/architecture JSON
- Markdown PM report
- standalone interactive HTML dashboard

No external Python dependencies are required.
"""
from __future__ import annotations

import argparse
import ast
import html
import json
import os
import re
from collections import Counter, defaultdict
from dataclasses import dataclass
from pathlib import Path
from typing import Any

IGNORE_DIRS = {
    ".git", "node_modules", "dist", "build", ".next", ".nuxt", ".turbo", ".cache",
    "coverage", "__pycache__", ".venv", "venv", "env", ".idea", ".vscode",
    "target", "vendor", ".pytest_cache", ".mypy_cache", "Pods", "DerivedData"
}
TEXT_EXTENSIONS = {
    ".js", ".jsx", ".ts", ".tsx", ".mjs", ".cjs", ".py", ".go", ".rs", ".java",
    ".kt", ".swift", ".php", ".rb", ".cs", ".html", ".css", ".scss", ".vue", ".svelte",
    ".json", ".md", ".yml", ".yaml", ".toml", ".xml", ".sql", ".sh", ".ps1", ".env", ".dockerfile"
}
LANG_BY_EXT = {
    ".js": "JavaScript", ".jsx": "JavaScript", ".mjs": "JavaScript", ".cjs": "JavaScript",
    ".ts": "TypeScript", ".tsx": "TypeScript", ".py": "Python", ".go": "Go", ".rs": "Rust",
    ".java": "Java", ".kt": "Kotlin", ".swift": "Swift", ".php": "PHP", ".rb": "Ruby",
    ".cs": "C#", ".html": "HTML", ".css": "CSS", ".scss": "CSS", ".vue": "Vue", ".svelte": "Svelte",
    ".sql": "SQL", ".md": "Markdown", ".json": "JSON", ".yml": "YAML", ".yaml": "YAML"
}
CODE_EXTS = {".js", ".jsx", ".ts", ".tsx", ".mjs", ".cjs", ".py", ".go", ".rs", ".java", ".php", ".rb", ".cs", ".vue", ".svelte"}
MAX_FILE_BYTES = 750_000
MAX_SYMBOLS_PER_FILE = 80

@dataclass
class FileInfo:
    path: str
    name: str
    ext: str
    language: str
    size: int
    lines: int
    kind: str
    tags: list[str]
    imports: list[str]
    symbols: list[dict[str, Any]]
    routes: list[str]
    snippet: str = ""


def safe_read(path: Path) -> str:
    try:
        if path.stat().st_size > MAX_FILE_BYTES:
            return ""
        return path.read_text(encoding="utf-8", errors="ignore")
    except Exception:
        return ""


def relpath(path: Path, root: Path) -> str:
    return str(path.relative_to(root)).replace("\\", "/")


def iter_files(root: Path, max_files: int) -> list[Path]:
    files: list[Path] = []
    for current_root, dirs, filenames in os.walk(root):
        dirs[:] = [d for d in dirs if d not in IGNORE_DIRS and not d.startswith(".")]
        for name in filenames:
            p = Path(current_root) / name
            if p.suffix.lower() in TEXT_EXTENSIONS or name in {"Dockerfile", "Makefile", "Procfile"}:
                files.append(p)
                if len(files) >= max_files:
                    return files
    return files


def classify(path: Path, text: str) -> tuple[str, list[str]]:
    name = path.name.lower()
    p = str(path).lower().replace("\\", "/")
    tags: list[str] = []
    kind = "source"
    if name in {"package.json", "pyproject.toml", "requirements.txt", "dockerfile", "docker-compose.yml", "compose.yml"}:
        kind = "config"
    elif name.endswith((".test.ts", ".test.js", ".spec.ts", ".spec.js", "_test.py")) or "/test" in p or "/tests" in p:
        kind = "test"
        tags.append("quality")
    elif name.endswith(".md"):
        kind = "docs"
    elif "route" in name or "controller" in name or "api" in p:
        tags.append("api")
    if re.search(r"express\(|fastapi|flask|django|next/server|createServer|router\.", text, re.I):
        tags.append("backend")
    if re.search(r"react|vue|svelte|angular|solid-js|tailwind|vite|next\b|remix", text, re.I):
        tags.append("frontend")
    if re.search(r"postgres|mysql|sqlite|mongo|redis|supabase|prisma|typeorm|sequelize", text, re.I):
        tags.append("data")
    if re.search(r"openai|anthropic|llm|embedding|vector|langchain|ai-sdk|vercel/ai", text, re.I):
        tags.append("ai")
    if re.search(r"auth|jwt|oauth|session|password|permission|role", text, re.I):
        tags.append("auth")
    if re.search(r"stripe|checkout|billing|subscription|payment", text, re.I):
        tags.append("monetization")
    if re.search(r"sentry|posthog|analytics|telemetry|logger|log\.", text, re.I):
        tags.append("observability")
    return kind, sorted(set(tags))


def parse_python(text: str) -> tuple[list[str], list[dict[str, Any]], list[str]]:
    imports: list[str] = []
    symbols: list[dict[str, Any]] = []
    routes: list[str] = []
    try:
        tree = ast.parse(text)
    except Exception:
        return imports, symbols, routes
    for node in ast.walk(tree):
        if isinstance(node, ast.Import):
            imports.extend(alias.name.split(".")[0] for alias in node.names)
        elif isinstance(node, ast.ImportFrom) and node.module:
            imports.append(node.module.split(".")[0])
        elif isinstance(node, ast.ClassDef):
            symbols.append({"type": "class", "name": node.name, "line": node.lineno})
        elif isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef)):
            symbols.append({"type": "function", "name": node.name, "line": node.lineno})
            for dec in node.decorator_list:
                raw = ast.unparse(dec) if hasattr(ast, "unparse") else ""
                if re.search(r"(get|post|put|patch|delete|route)\(", raw):
                    routes.append(raw)
    return sorted(set(imports)), symbols[:MAX_SYMBOLS_PER_FILE], routes


def parse_js_like(text: str) -> tuple[list[str], list[dict[str, Any]], list[str]]:
    imports = []
    for pattern in [r"import\s+(?:.+?\s+from\s+)?['\"]([^'\"]+)['\"]", r"require\(['\"]([^'\"]+)['\"]\)"]:
        imports.extend(re.findall(pattern, text))
    symbols: list[dict[str, Any]] = []
    for pattern, typ in [
        (r"(?:export\s+)?(?:async\s+)?function\s+([A-Za-z0-9_$]+)", "function"),
        (r"(?:export\s+)?class\s+([A-Za-z0-9_$]+)", "class"),
        (r"(?:const|let|var)\s+([A-Za-z0-9_$]+)\s*=\s*(?:async\s*)?\(?[^=]*?\)?\s*=>", "function"),
        (r"export\s+default\s+function\s*([A-Za-z0-9_$]*)", "function"),
    ]:
        for m in re.finditer(pattern, text):
            name = m.group(1) or "default"
            line = text.count("\n", 0, m.start()) + 1
            symbols.append({"type": typ, "name": name, "line": line})
    route_patterns = [
        r"(?:app|router)\.(get|post|put|patch|delete)\(['\"]([^'\"]+)",
        r"export\s+(?:async\s+)?function\s+(GET|POST|PUT|PATCH|DELETE)\b",
    ]
    routes: list[str] = []
    for pattern in route_patterns:
        for match in re.finditer(pattern, text):
            routes.append(" ".join(g for g in match.groups() if g))
    return sorted(set(imports)), symbols[:MAX_SYMBOLS_PER_FILE], routes


def analyze_file(path: Path, root: Path) -> FileInfo:
    text = safe_read(path)
    ext = path.suffix.lower()
    language = LANG_BY_EXT.get(ext, "Other")
    if path.name == "Dockerfile":
        language = "Dockerfile"
    lines = len(text.splitlines()) if text else 0
    kind, tags = classify(path, text)
    imports: list[str] = []
    symbols: list[dict[str, Any]] = []
    routes: list[str] = []
    if ext == ".py":
        imports, symbols, routes = parse_python(text)
    elif ext in {".js", ".jsx", ".ts", ".tsx", ".mjs", ".cjs", ".vue", ".svelte"}:
        imports, symbols, routes = parse_js_like(text)
    snippet = "\n".join([line.strip() for line in text.splitlines()[:30] if line.strip()][:10])
    return FileInfo(relpath(path, root), path.name, ext, language, path.stat().st_size, lines, kind, tags, imports, symbols, routes, snippet)


def read_json(path: Path) -> dict[str, Any]:
    try:
        return json.loads(path.read_text(encoding="utf-8", errors="ignore"))
    except Exception:
        return {}


def detect_frameworks(root: Path, files: list[FileInfo]) -> dict[str, Any]:
    frameworks: dict[str, Any] = {"frontend": [], "backend": [], "data": [], "ai": [], "tools": []}
    pkg = read_json(root / "package.json") if (root / "package.json").exists() else {}
    deps = {**pkg.get("dependencies", {}), **pkg.get("devDependencies", {})}
    def has(name: str) -> bool:
        return name in deps
    mapping = [
        ("frontend", "React", has("react")), ("frontend", "Next.js", has("next")), ("frontend", "Vue", has("vue")),
        ("frontend", "Svelte", has("svelte")), ("frontend", "Vite", has("vite")), ("backend", "Express", has("express")),
        ("backend", "NestJS", has("@nestjs/core")), ("data", "Prisma", has("prisma") or has("@prisma/client")),
        ("data", "Supabase", has("@supabase/supabase-js")), ("ai", "Vercel AI SDK", has("ai")),
        ("ai", "OpenAI", has("openai")), ("tools", "TypeScript", has("typescript")), ("tools", "Vitest", has("vitest")),
        ("tools", "Jest", has("jest")), ("tools", "Playwright", has("@playwright/test")),
    ]
    for category, name, ok in mapping:
        if ok:
            frameworks[category].append(name)
    req = (root / "requirements.txt")
    pyproject = (root / "pyproject.toml")
    py_text = (safe_read(req) + "\n" + safe_read(pyproject)).lower()
    py_map = [("backend", "FastAPI", "fastapi"), ("backend", "Flask", "flask"), ("backend", "Django", "django"), ("data", "SQLAlchemy", "sqlalchemy"), ("ai", "LangChain", "langchain"), ("ai", "OpenAI", "openai")]
    for category, name, key in py_map:
        if key in py_text:
            frameworks[category].append(name)
    for category in frameworks:
        frameworks[category] = sorted(set(frameworks[category]))
    return frameworks


def build_graph(root: Path, files: list[FileInfo]) -> dict[str, Any]:
    nodes: list[dict[str, Any]] = [{"id": "project", "label": root.name, "type": "project", "group": "product"}]
    edges: list[dict[str, Any]] = []
    dirs: set[str] = set()
    for f in files:
        parts = f.path.split("/")
        parent = "project"
        cumulative = []
        for part in parts[:-1]:
            cumulative.append(part)
            did = "dir:" + "/".join(cumulative)
            if did not in dirs:
                dirs.add(did)
                nodes.append({"id": did, "label": part, "type": "directory", "group": "structure"})
                edges.append({"source": parent, "target": did, "label": "contains"})
            parent = did
        fid = "file:" + f.path
        nodes.append({"id": fid, "label": f.name, "type": f.kind, "group": (f.tags[0] if f.tags else f.language), "meta": {"path": f.path, "lines": f.lines, "language": f.language, "tags": f.tags}})
        edges.append({"source": parent, "target": fid, "label": "contains"})
        for s in f.symbols[:12]:
            sid = "symbol:" + f.path + ":" + s["name"]
            nodes.append({"id": sid, "label": s["name"], "type": s["type"], "group": "logic", "meta": {"line": s.get("line"), "file": f.path}})
            edges.append({"source": fid, "target": sid, "label": "defines"})
        for imp in f.imports[:12]:
            iid = "import:" + imp
            if not any(n["id"] == iid for n in nodes):
                nodes.append({"id": iid, "label": imp, "type": "dependency", "group": "dependency"})
            edges.append({"source": fid, "target": iid, "label": "imports"})
    return {"nodes": nodes[:900], "edges": edges[:1400]}


def infer_canvas(root: Path, files: list[FileInfo], frameworks: dict[str, Any]) -> dict[str, list[str]]:
    pkg = read_json(root / "package.json") if (root / "package.json").exists() else {}
    readme = ""
    for name in ["README.md", "readme.md"]:
        if (root / name).exists():
            readme = safe_read(root / name)
            break
    text = (pkg.get("description", "") + "\n" + readme).lower()
    product_name = pkg.get("name") or root.name
    customers = []
    if re.search(r"school|education|curso|aluno|teacher|student|educa", text):
        customers.extend(["Gestores de educação", "Escolas, cursos e operações pedagógicas"])
    if re.search(r"developer|cli|repository|code|agent|codex", text):
        customers.extend(["Times de produto e engenharia", "Fundadores técnicos e não técnicos"])
    if re.search(r"sales|crm|lead|marketing|campanha", text):
        customers.extend(["Times de marketing e vendas", "Operações com funil comercial"])
    customers = customers or ["Usuários que precisam resolver o problema central do produto", "Equipe interna que opera e melhora o produto"]
    value = []
    if pkg.get("description"):
        value.append(pkg["description"])
    value.extend(["Reduz incerteza antes de construir", "Transforma código e documentação em visão de produto", "Mostra arquitetura, riscos e oportunidades em formato visual"])
    channels = ["GitHub", "CLI npm", "Documentação", "Comunidade e conteúdo técnico"]
    revenue = ["Open source para adoção", "Serviços de diagnóstico e implementação", "Versão Pro/Enterprise futura", "Templates, consultoria e aceleração"]
    activities = ["Análise de repositórios", "Discovery e priorização", "Geração de PRD, backlog e roadmap", "Visualização de arquitetura e Business Canvas"]
    resources = ["CLI Node.js", "Analisador Python", "Skills de PM", "Playbooks e templates", "Dashboard visual standalone"]
    partners = ["Comunidade open source", "Product Managers", "Times de engenharia", "Ferramentas de IA e automação"]
    costs = ["Manutenção do CLI", "Evolução dos analisadores", "Documentação", "Suporte e comunidade"]
    metrics = ["GitHub stars", "Instalações npm", "Repos analisados", "Tempo até diagnóstico", "Issues/PRs da comunidade"]
    return {
        "Product": [str(product_name)],
        "Customer Segments": sorted(set(customers)),
        "Value Propositions": value[:6],
        "Channels": channels,
        "Customer Relationships": ["Autoatendimento via CLI", "Guias para leigos", "Workflows para PMs experientes", "Comunidade e exemplos"],
        "Revenue Streams": revenue,
        "Key Activities": activities,
        "Key Resources": resources,
        "Key Partners": partners,
        "Cost Structure": costs,
        "Key Metrics": metrics,
        "Framework Signals": [item for values in frameworks.values() for item in values][:12]
    }


def infer_architecture(files: list[FileInfo], frameworks: dict[str, Any]) -> dict[str, Any]:
    tags = Counter(tag for f in files for tag in f.tags)
    layers = []
    if tags["frontend"] or frameworks["frontend"]:
        layers.append("Frontend/UI")
    if tags["backend"] or frameworks["backend"]:
        layers.append("Backend/API")
    if tags["data"] or frameworks["data"]:
        layers.append("Data layer")
    if tags["ai"] or frameworks["ai"]:
        layers.append("AI/Automation layer")
    if tags["observability"]:
        layers.append("Observability")
    if not layers:
        layers.append("Documentação/CLI/Library")
    return {"layers": layers, "signals": dict(tags), "frameworks": frameworks}


def improvements(files: list[FileInfo], architecture: dict[str, Any], root: Path) -> list[dict[str, str]]:
    names = {f.name.lower() for f in files}
    kinds = Counter(f.kind for f in files)
    items = []
    def add(area, title, why, action):
        items.append({"area": area, "title": title, "why": why, "action": action})
    if "readme.md" not in names:
        add("Documentation", "Criar README forte", "Sem README fica difícil entender proposta, instalação e valor.", "Adicionar visão, quickstart, exemplos, roadmap e contribuição.")
    if kinds["test"] == 0:
        add("Quality", "Adicionar testes", "Não foram detectados testes claros.", "Criar testes para fluxo principal e comandos críticos.")
    if ".github/workflows/ci.yml" not in {f.path.lower() for f in files}:
        add("DevEx", "Adicionar CI", "Sem validação automática, contribuições ficam mais arriscadas.", "Criar GitHub Actions com lint/test/build.")
    if not architecture["frameworks"].get("tools"):
        add("DevEx", "Padronizar ferramentas", "Não há sinais fortes de toolchain de qualidade.", "Adicionar scripts de test, lint, format e doctor.")
    if architecture["signals"].get("auth") and not architecture["signals"].get("observability"):
        add("Reliability", "Adicionar observabilidade", "Fluxos com autenticação precisam de logs e auditoria.", "Mapear eventos, erros e métricas de sessão.")
    if architecture["signals"].get("ai"):
        add("AI Product", "Criar avaliação de qualidade da IA", "Produtos com IA precisam medir precisão, custo, latência e segurança.", "Adicionar evals, golden datasets e fallback de modelos.")
    add("Product", "Gerar PRD vivo", "A análise técnica precisa virar decisão de produto.", "Conectar achados a problema, ICP, métrica, backlog e roadmap.")
    add("Architecture", "Mapear dependências críticas", "Dependências escondidas viram risco de entrega.", "Revisar os nós centrais do grafo e documentar ownership.")
    return items[:10]


def analyze(root: Path, max_files: int) -> dict[str, Any]:
    root = root.resolve()
    paths = iter_files(root, max_files=max_files)
    files = [analyze_file(p, root) for p in paths]
    lang_counter = Counter(f.language for f in files)
    ext_counter = Counter(f.ext or f.name for f in files)
    loc_by_language = defaultdict(int)
    for f in files:
        loc_by_language[f.language] += f.lines
    frameworks = detect_frameworks(root, files)
    architecture = infer_architecture(files, frameworks)
    canvas = infer_canvas(root, files, frameworks)
    graph = build_graph(root, files)
    risks = []
    if len(files) > 500:
        risks.append("Repositório grande: priorize análise por domínio ou pacote.")
    if architecture["signals"].get("auth"):
        risks.append("Há sinais de autenticação/permissão: revisar segurança e LGPD.")
    if architecture["signals"].get("monetization"):
        risks.append("Há sinais de pagamento/receita: revisar integridade de cobrança e auditoria.")
    if architecture["signals"].get("ai"):
        risks.append("Há camada de IA: medir custo, latência, qualidade e segurança de prompts.")
    data = {
        "schema": "pm-ai.repository-analysis.v1",
        "project": {"name": root.name, "path": str(root), "files_scanned": len(files), "total_lines": sum(f.lines for f in files)},
        "summary": {"languages": dict(lang_counter), "extensions": dict(ext_counter), "loc_by_language": dict(sorted(loc_by_language.items(), key=lambda x: -x[1]))},
        "architecture": architecture,
        "business_canvas": canvas,
        "improvements": improvements(files, architecture, root),
        "risks": risks,
        "graph": graph,
        "files": [f.__dict__ for f in files[:1000]],
    }
    return data


def md_table(headers, rows):
    out = ["| " + " | ".join(headers) + " |", "| " + " | ".join(["---"] * len(headers)) + " |"]
    for row in rows:
        out.append("| " + " | ".join(str(c).replace("|", "/") for c in row) + " |")
    return "\n".join(out)


def render_markdown(data: dict[str, Any]) -> str:
    project = data["project"]
    lines = [
        f"# Product & Repository Analysis: {project['name']}", "",
        "## Executive summary", "",
        f"- Files scanned: **{project['files_scanned']}**",
        f"- Total lines: **{project['total_lines']}**",
        f"- Main architecture layers: {', '.join(data['architecture']['layers'])}", "",
        "## Language mix", "",
        md_table(["Language", "Files", "Lines"], [[lang, data['summary']['languages'].get(lang, 0), lines] for lang, lines in data['summary']['loc_by_language'].items()]), "",
        "## Architecture signals", "",
        md_table(["Signal", "Count"], sorted(data['architecture']['signals'].items(), key=lambda x: -x[1])) if data['architecture']['signals'] else "No strong signals detected.", "",
        "## Business Model Canvas hypothesis", "",
    ]
    for key, values in data["business_canvas"].items():
        if key == "Product":
            continue
        lines.extend([f"### {key}", "", *[f"- {v}" for v in values], ""])
    lines.extend(["## Improvement opportunities", ""])
    for item in data["improvements"]:
        lines.extend([f"### {item['title']}", f"- Area: {item['area']}", f"- Why: {item['why']}", f"- Action: {item['action']}", ""])
    if data["risks"]:
        lines.extend(["## Risks", "", *[f"- {r}" for r in data["risks"]], ""])
    lines.extend(["## Next PM actions", "", "1. Validar o Business Canvas com alguém que conhece o produto.", "2. Escolher as três melhorias com maior impacto em usuário ou receita.", "3. Converter melhorias em PRD/backlog com critério de aceite.", "4. Rodar nova análise após a próxima entrega.", ""])
    return "\n".join(lines)



def render_html(data: dict[str, Any]) -> str:
    payload = html.escape(json.dumps(data, ensure_ascii=False))
    title = html.escape(data["project"]["name"])
    template = """<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Product Management AI Dashboard - __TITLE__</title>
<style>
:root{--bg:#07110c;--panel:#0f1b14;--panel2:#14281d;--green:#00ff88;--soft:#a7f3d0;--text:#eefcf4;--muted:#9db7a8;--line:#234634;--warn:#ffd166}
*{box-sizing:border-box}body{margin:0;font-family:Inter,ui-sans-serif,system-ui,Segoe UI,Arial,sans-serif;background:radial-gradient(circle at top left,#143821,#07110c 42%);color:var(--text)}
header{padding:28px 32px;border-bottom:1px solid var(--line);position:sticky;top:0;z-index:3;backdrop-filter:blur(14px);background:rgba(7,17,12,.86)}
.brand{display:flex;align-items:center;gap:16px}.logo{color:var(--green);font-weight:900;font-size:34px;letter-spacing:-1px;text-shadow:0 0 24px rgba(0,255,136,.45)}.subtitle{color:var(--muted);margin-top:4px}.pill{display:inline-flex;border:1px solid var(--line);border-radius:999px;padding:6px 10px;color:var(--soft);background:rgba(0,255,136,.08);margin:4px}
main{display:grid;grid-template-columns:280px 1fr 330px;gap:18px;padding:18px}nav,aside,section.card{background:rgba(15,27,20,.92);border:1px solid var(--line);border-radius:22px;box-shadow:0 24px 80px rgba(0,0,0,.25)}
nav{padding:14px;height:calc(100vh - 126px);position:sticky;top:104px}button.tab{width:100%;text-align:left;background:transparent;color:var(--text);border:1px solid transparent;padding:12px;border-radius:14px;cursor:pointer;margin:3px 0}button.tab.active,button.tab:hover{border-color:var(--green);background:rgba(0,255,136,.08)}.content{min-width:0}.card{padding:20px;margin-bottom:18px}.grid{display:grid;gap:12px}.metrics{grid-template-columns:repeat(4,minmax(0,1fr))}.metric{background:var(--panel2);border:1px solid var(--line);border-radius:18px;padding:16px}.metric strong{display:block;font-size:28px;color:var(--green)}h1,h2,h3{margin:0 0 12px}h2{color:var(--soft)}.muted{color:var(--muted)}
.canvas{display:grid;grid-template-columns:repeat(5,1fr);grid-auto-rows:minmax(150px,auto);gap:10px}.block{background:linear-gradient(180deg,#12281b,#0c1811);border:1px solid var(--line);border-radius:16px;padding:14px}.block h3{color:var(--green);font-size:15px}.block ul{padding-left:18px}.vp{grid-column:3;grid-row:1/span 2}.seg{grid-column:5;grid-row:1/span 2}.cost{grid-column:1/span 2}.rev{grid-column:4/span 2}
#graph,#mindmap{width:100%;min-height:640px;background:#06100b;border:1px solid var(--line);border-radius:18px;overflow:hidden}.node{cursor:pointer}.node circle{stroke:#d1fae5;stroke-width:1}.node text{fill:#eafff3;font-size:11px;pointer-events:none}.edge{stroke:#315c42;stroke-opacity:.72}.search{width:100%;padding:12px 14px;border-radius:14px;border:1px solid var(--line);background:#07110c;color:var(--text);margin:0 0 12px}aside{padding:18px;height:calc(100vh - 126px);position:sticky;top:104px;overflow:auto}.list-item{padding:12px;border:1px solid var(--line);border-radius:14px;margin:8px 0;background:rgba(255,255,255,.02)}pre{white-space:pre-wrap;word-break:break-word;background:#07110c;border:1px solid var(--line);padding:12px;border-radius:14px;color:#c9ffe0}.hidden{display:none}a{color:var(--green)}@media(max-width:1100px){main{grid-template-columns:1fr}nav,aside{position:relative;height:auto;top:0}.metrics{grid-template-columns:repeat(2,1fr)}.canvas{grid-template-columns:1fr}.vp,.seg,.cost,.rev{grid-column:auto;grid-row:auto}}
</style>
</head>
<body>
<header><div class="brand"><div class="logo">Genial</div><div><h1>Product Management AI</h1><div class="subtitle">Visual repository intelligence by Bruno Costa ? eusoubrunocosta.tech ? eusoubrunocosta.ai</div></div></div></header>
<main><nav><button class="tab active" data-view="overview">Overview</button><button class="tab" data-view="mind">Mapa mental</button><button class="tab" data-view="architecture">Grafo de arquitetura</button><button class="tab" data-view="canvas">Business Canvas</button><button class="tab" data-view="improvements">Melhorias</button><button class="tab" data-view="files">Arquivos</button></nav><div class="content"><section id="overview" class="card view"></section><section id="mind" class="card view hidden"><h2>Mapa mental do produto</h2><div id="mindmap"></div></section><section id="architecture" class="card view hidden"><h2>Grafo de arquitetura</h2><input id="graphSearch" class="search" placeholder="Filtrar n?, arquivo, depend?ncia..."/><div id="graph"></div></section><section id="canvas" class="card view hidden"></section><section id="improvements" class="card view hidden"></section><section id="files" class="card view hidden"></section></div><aside><h2>Inspector</h2><div id="inspector" class="muted">Clique em um n? do grafo para ver detalhes.</div></aside></main>
<script id="analysis-data" type="application/json">__PAYLOAD__</script>
<script>
const data=JSON.parse(document.getElementById('analysis-data').textContent);const $=q=>document.querySelector(q);const esc=v=>String(v??'').replace(/[&<>]/g,s=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[s]));
document.querySelectorAll('.tab').forEach(btn=>btn.onclick=()=>{document.querySelectorAll('.tab').forEach(b=>b.classList.remove('active'));btn.classList.add('active');document.querySelectorAll('.view').forEach(v=>v.classList.add('hidden'));$('#'+btn.dataset.view).classList.remove('hidden');if(btn.dataset.view==='architecture')drawGraph();if(btn.dataset.view==='mind')drawMind();});
function list(items){return '<ul>'+(items||[]).map(i=>'<li>'+esc(i)+'</li>').join('')+'</ul>'}
function overview(){const langs=Object.entries(data.summary.loc_by_language||{}).slice(0,8).map(([k,v])=>`<span class="pill">${esc(k)} ? ${v} lines</span>`).join('');$('#overview').innerHTML=`<h2>Resumo executivo</h2><div class="grid metrics"><div class="metric"><strong>${data.project.files_scanned}</strong><span>arquivos</span></div><div class="metric"><strong>${data.project.total_lines}</strong><span>linhas</span></div><div class="metric"><strong>${data.graph.nodes.length}</strong><span>n?s</span></div><div class="metric"><strong>${data.improvements.length}</strong><span>melhorias</span></div></div><h3>Camadas detectadas</h3><p>${data.architecture.layers.map(x=>`<span class="pill">${esc(x)}</span>`).join('')}</p><h3>Linguagens</h3><p>${langs}</p><h3>Riscos</h3>${data.risks.length?list(data.risks):'<p class="muted">Nenhum risco cr?tico inferido automaticamente.</p>'}`}
function canvas(){const c=data.business_canvas;const block=(cls,title,items)=>`<div class="block ${cls}"><h3>${title}</h3>${list(items)}</div>`;$('#canvas').innerHTML=`<h2>Business Model Canvas inferido</h2><p class="muted">Hip?tese autom?tica. Valide com usu?rios, stakeholders e dados reais.</p><div class="canvas">${block('','Key Partners',c['Key Partners'])}${block('','Key Activities',c['Key Activities'])}${block('vp','Value Propositions',c['Value Propositions'])}${block('','Customer Relationships',c['Customer Relationships'])}${block('seg','Customer Segments',c['Customer Segments'])}${block('','Key Resources',c['Key Resources'])}${block('','Channels',c['Channels'])}${block('cost','Cost Structure',c['Cost Structure'])}${block('rev','Revenue Streams',c['Revenue Streams'])}</div>`}
function improvements(){$('#improvements').innerHTML='<h2>Melhorias recomendadas</h2>'+data.improvements.map(i=>`<div class="list-item"><h3>${esc(i.title)}</h3><p><span class="pill">${esc(i.area)}</span></p><p><b>Por qu?:</b> ${esc(i.why)}</p><p><b>A??o:</b> ${esc(i.action)}</p></div>`).join('')}
function files(){$('#files').innerHTML='<h2>Arquivos analisados</h2><input id="fileSearch" class="search" placeholder="Buscar arquivo..."/> <div id="fileList"></div>';const render=()=>{const q=($('#fileSearch').value||'').toLowerCase();$('#fileList').innerHTML=data.files.filter(f=>f.path.toLowerCase().includes(q)).slice(0,250).map(f=>`<div class="list-item"><b>${esc(f.path)}</b><p class="muted">${esc(f.language)} ? ${f.lines} lines ? ${esc((f.tags||[]).join(', '))}</p></div>`).join('')};$('#fileSearch').oninput=render;render()}
function inspect(item){$('#inspector').innerHTML=`<pre>${esc(JSON.stringify(item,null,2))}</pre>`}function drawGraph(){drawNetwork('#graph',data.graph.nodes,data.graph.edges,$('#graphSearch')?.value||'')}
function drawMind(){const nodes=[{id:'product',label:data.project.name,type:'product',group:'product'},{id:'business',label:'Business',group:'business'},{id:'architecture',label:'Architecture',group:'architecture'},{id:'quality',label:'Quality',group:'quality'},{id:'growth',label:'Growth',group:'growth'}];const edges=[{source:'product',target:'business'},{source:'product',target:'architecture'},{source:'product',target:'quality'},{source:'product',target:'growth'}];(data.business_canvas['Value Propositions']||[]).slice(0,5).forEach((v,i)=>{nodes.push({id:'vp'+i,label:v,group:'value'});edges.push({source:'business',target:'vp'+i})});data.architecture.layers.forEach((v,i)=>{nodes.push({id:'layer'+i,label:v,group:'layer'});edges.push({source:'architecture',target:'layer'+i})});data.improvements.slice(0,6).forEach((v,i)=>{nodes.push({id:'imp'+i,label:v.title,group:'improvement'});edges.push({source:'quality',target:'imp'+i})});drawNetwork('#mindmap',nodes,edges,'')}
function drawNetwork(selector,nodes,edges,filter){const box=document.querySelector(selector);const w=box.clientWidth||900,h=640,q=(filter||'').toLowerCase();const visible=nodes.filter(n=>!q||JSON.stringify(n).toLowerCase().includes(q));const ids=new Set(visible.map(n=>n.id));const shownEdges=edges.filter(e=>ids.has(e.source)&&ids.has(e.target));const center={x:w/2,y:h/2};const angleStep=Math.PI*2/Math.max(visible.length-1,1);const placed=new Map();visible.forEach((n,i)=>{if(i===0)placed.set(n.id,center);else{const r=120+(i%5)*58,a=i*angleStep;placed.set(n.id,{x:center.x+Math.cos(a)*r,y:center.y+Math.sin(a)*r})}});const edgeSvg=shownEdges.map(e=>{const s=placed.get(e.source),t=placed.get(e.target);if(!s||!t)return'';return`<line class="edge" x1="${s.x}" y1="${s.y}" x2="${t.x}" y2="${t.y}"/>`}).join('');const nodeSvg=visible.map(n=>{const p=placed.get(n.id);const radius=n.type==='project'||n.type==='product'?28:18;const color=n.group==='dependency'?'#ffd166':n.group==='ai'?'#8ecae6':n.group==='backend'?'#90be6d':n.group==='frontend'?'#f9844a':'#00ff88';return`<g class="node" data-id="${esc(n.id)}" transform="translate(${p.x},${p.y})"><circle r="${radius}" fill="${color}" fill-opacity=".22"></circle><text x="${radius+5}" y="4">${esc(n.label).slice(0,42)}</text></g>`}).join('');box.innerHTML=`<svg width="100%" height="${h}" viewBox="0 0 ${w} ${h}">${edgeSvg}${nodeSvg}</svg>`;box.querySelectorAll('.node').forEach(el=>el.onclick=()=>inspect(visible.find(n=>n.id===el.dataset.id)))}
$('#graphSearch')?.addEventListener('input',drawGraph);overview();canvas();improvements();files();
</script>
</body>
</html>"""
    return template.replace("__PAYLOAD__", payload).replace("__TITLE__", title)


def write_outputs(data: dict[str, Any], output: Path, report: Path | None, visual: Path | None) -> None:
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")
    if report:
        report.parent.mkdir(parents=True, exist_ok=True)
        report.write_text(render_markdown(data), encoding="utf-8")
    if visual:
        visual.parent.mkdir(parents=True, exist_ok=True)
        visual.write_text(render_html(data), encoding="utf-8")


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="Analyze a repository as a product and architecture system.")
    parser.add_argument("--path", default=".", help="Repository/project path to analyze")
    parser.add_argument("--output", default=".pm-ai/outputs/repository-analysis.json", help="JSON output path")
    parser.add_argument("--report", default=".pm-ai/outputs/repository-analysis.md", help="Markdown report output path")
    parser.add_argument("--visual", default=".pm-ai/outputs/repository-dashboard.html", help="Standalone HTML dashboard output path")
    parser.add_argument("--max-files", type=int, default=2500, help="Maximum text files to scan")
    args = parser.parse_args(argv)
    target = Path(args.path).resolve()
    if not target.exists():
        raise SystemExit(f"Path not found: {target}")
    data = analyze(target, max_files=args.max_files)
    write_outputs(data, Path(args.output), Path(args.report) if args.report else None, Path(args.visual) if args.visual else None)
    print(json.dumps({"ok": True, "project": data["project"], "output": args.output, "report": args.report, "visual": args.visual}, ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

# Product Management AI

**Genial Labs AI · Bruno Costa · eusoubrunocosta.tech · eusoubrunocosta.ai**

Um sistema operacional de produto para quem quer sair de ideia, código solto ou produto confuso e chegar em clareza, MVP, roadmap, arquitetura, canvas e melhoria contínua. Criado para conectar visão de negócio, Product Management, engenharia e IA.

Product Management AI é um produto independente: um sistema operacional de Product Management com CLI npm, skills, playbooks e templates para analisar, prototipar, validar, lançar MVPs e melhorar produtos existentes.

Ele foi desenhado para dois públicos ao mesmo tempo:

1. Pessoa leiga que tem uma ideia e precisa de caminho guiado para chegar a um MVP validável.
2. Product Manager experiente que quer acelerar discovery, PRD, roadmap, métricas, backlog, Scrum, Lean, growth e melhoria contínua.

## O que vem no repositório

- CLI `pm-ai` em Node.js, sem dependências externas.
- Skills independentes para Codex, Claude Code, ChatGPT ou agentes próprios.
- Playbooks de Discovery, Product Audit, MVP Sprint, Roadmap, Scrum e Lean Experiment.
- Templates de PRD, Lean Canvas, entrevista, métricas, roadmap, sprint, retrospectiva e backlog.
- Documentação para iniciantes, PMs seniores e agentes de engenharia.

## Instalação local

cd "C:\Users\WINDOWS\OneDrive\Apps\Product Management AI"
npm install
npm test
npm link
pm-ai --help

## Sem instalar globalmente

node ./bin/pm-ai.js --help
node ./bin/pm-ai.js diagnose --input examples/sample-brief.md --output examples/sample-diagnosis.generated.md

## Comandos principais

- `pm-ai init` cria workspace e Product Brief.
- `pm-ai team` lista a equipe de produto AI.
- `pm-ai skills` lista skills disponíveis.
- `pm-ai skill principal-pm` imprime uma skill específica.
- `pm-ai workflows` lista playbooks executáveis.
- `pm-ai diagnose --input PRODUCT_BRIEF.md --output product-diagnosis.md` gera diagnóstico.
- `pm-ai run mvp-sprint --input PRODUCT_BRIEF.md --output mvp-plan.md` executa um workflow.
- `pm-ai template prd --output PRD.md` copia template.

## Time de produto incluído

- Principal Product Manager
- Product Discovery Lead
- MVP Architect
- UX Researcher
- Product Designer
- Product Data Analyst
- Agile Coach / Scrum Master
- Growth PM
- Tech Lead Liaison
- Product Ops
- Team Orchestrator

## Fluxo recomendado

1. Rode `pm-ai init`.
2. Preencha `PRODUCT_BRIEF.md`.
3. Rode diagnóstico.
4. Rode discovery.
5. Reduza escopo com MVP Sprint.
6. Gere PRD e backlog.
7. Use as skills específicas para aprofundar cada etapa.

## Estado atual

Produto local e privado para validação. O `package.json` está com `private: true` para evitar publicação acidental no npm.


## Análise visual de repositórios

Além de skills e playbooks, o Product Management AI agora analisa um repositório inteiro e gera:

- Mapa mental do produto.
- Grafo visual de arquitetura, arquivos, símbolos e dependências.
- Business Model Canvas inferido automaticamente.
- Relatório Markdown para PM, founder e engenharia.
- JSON estruturado para agentes e automações.
- Dashboard HTML interativo, standalone e sem dependências externas.

```bash
pm-ai analyze-repo --path . --output .pm-ai/outputs/analysis.json --report .pm-ai/outputs/report.md --visual .pm-ai/outputs/dashboard.html
```

Depois abra o arquivo HTML gerado no navegador.

## Branding

Ao abrir o CLI, a marca `Genial` aparece em verde no terminal. O projeto nasce com assinatura da Genial Labs AI e direção de Bruno Costa.

## Python + Node

- Node.js entrega a experiência de CLI, npm e integração com agentes.
- Python entrega a camada de análise de repositórios, AST, heurísticas e futuras análises de dados/IA.

## Founder story

Este produto nasceu da prática de construir, estudar e melhorar produtos reais. Bruno Costa não veio da stack tradicional de programação; a proposta é justamente criar uma ponte para que founders, gestores, PMs e times técnicos consigam entender produtos com mais profundidade, mesmo quando começam fora da engenharia.

Leia mais em `docs/founder-story.md`.

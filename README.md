# Startup AI OS

**Startup AI OS** é um sistema operacional para criar, auditar, digitalizar e escalar empresas com uma stack completa de negócio, produto, engenharia, dados, IA, DevOps, MLOps, growth e operação.

Ele nasceu como Product Management AI, mas o escopo evoluiu: o objetivo agora é replicar a estrutura de uma empresa de tecnologia moderna para dois cenários:

1. **Criar empresas de tecnologia do zero**, com metodologia de startup, MVP, discovery, PRD, arquitetura, dados, GTM, growth e operação.
2. **Transformar empresas tradicionais**, trazendo processos físicos para o digital, criando produtos, automações, dados, IA e rotinas de melhoria contínua.

O antigo nome Product Management AI continua como camada interna de produto. O produto maior agora é o **Startup AI OS**.

## O que vem no repositório

- CLI `startup-ai` com alias compatível `pm-ai`.
- App local em Node: `startup-ai serve --path .`.
- Product Intelligence Graph com mapa 3D, leitura de código, Git e versões.
- Business Model Canvas, Value Proposition Canvas, PV, PUV e oferta.
- Stack completa de empresa: Strategy, Product, UX, Engineering, Data/AI/MLOps, DevOps, Growth, Ops, Finance/Legal e People.
- Skills independentes para agentes como Codex, Claude Code, ChatGPT ou agentes próprios.
- Playbooks para discovery, MVP, roadmap, Scrum, Lean, growth, operação e transformação digital.
- Templates para PRD, Lean Canvas, Business Canvas, PUV, PV, backlog, métricas, experimentos e operating model.

## Instalação local

```bash
cd "C:\Users\WINDOWS\OneDrive\Apps\Product Management AI"
npm install
npm test
npm link
startup-ai --help
```

## Rodar o app visual

```bash
startup-ai serve --path .
```

Depois abra o endereço que aparecer no terminal, normalmente:

```text
http://127.0.0.1:4738
```

## Comandos principais

- `startup-ai startup-stack` lista a stack completa da empresa.
- `startup-ai serve --path .` abre o workspace visual.
- `startup-ai analyze-repo --path .` analisa um repositório.
- `startup-ai diagnose --input PRODUCT_BRIEF.md` gera diagnóstico.
- `startup-ai run mvp-sprint --input PRODUCT_BRIEF.md` cria plano de MVP.
- `startup-ai template startup-canvas --output STARTUP_CANVAS.md` copia template.
- `pm-ai ...` continua funcionando como alias antigo.

## Estado atual

Produto privado/local para validação. `private: true` continua ativo para evitar publicação acidental no npm enquanto o Startup AI OS amadurece.


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

# Repository Analysis

Product Management AI agora também funciona como analisador visual de repositórios.

## O que ele faz

- Varre um repositório local sem depender de serviços externos.
- Detecta linguagens, arquivos, símbolos, imports, rotas, frameworks e sinais de arquitetura.
- Gera um JSON estruturado para agentes e automações.
- Gera um relatório Markdown com leitura de produto, arquitetura, riscos e melhorias.
- Gera um dashboard HTML standalone com mapa mental, grafo de arquitetura e Business Model Canvas.

## Comando

```bash
pm-ai analyze-repo --path . --output .pm-ai/outputs/analysis.json --report .pm-ai/outputs/report.md --visual .pm-ai/outputs/dashboard.html
```

## Por que Python e Node juntos

Node fica responsável pelo CLI, distribuição npm e experiência do desenvolvedor. Python fica responsável pela análise de código porque é forte para parsing, AST, automação, dados e futura integração com modelos e notebooks.

## Saídas

- `repository-analysis.json`: base para agentes, dashboards e futuras integrações.
- `repository-analysis.md`: relatório para PM, founder e engenharia.
- `repository-dashboard.html`: tela visual interativa, sem dependências externas.

## Próximas evoluções planejadas

- Análise semântica com embeddings locais ou remotos.
- Mapa de domínio por bounded contexts.
- Detecção de fluxos de usuário e jornadas.
- Importação para Obsidian como notas e grafo.
- Comparação entre versões para mostrar evolução do produto.


## Dashboard V2

A visualiza??o HTML foi redesenhada para ser uma ferramenta real de explora??o de produto:

- Navega??o lateral por Overview, Mapa Mental, Arquitetura, Business Canvas, Melhorias e Arquivos.
- Inspector fixo para explicar o n?, arquivo ou item selecionado.
- Grafo SVG standalone com zoom, pan, drag and drop e busca.
- Business Model Canvas em grid visual para discuss?o estrat?gica.
- Exporta??o r?pida de um resumo Markdown pelo pr?prio dashboard.

O HTML ? standalone e n?o depende de CDN, servidor ou internet.

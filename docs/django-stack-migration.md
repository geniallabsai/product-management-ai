# Migração para Django/Python Stack

O protótipo Node foi útil para validar ideias, mas o produto final deve usar uma stack mais robusta para consultores e empresas.

## Stack final recomendada

- Django: backend, modelos, admin, autenticação, templates e APIs.
- HTMX/Alpine: front-end leve e responsivo sem excesso de SPA.
- Postgres: dados de clientes, projetos, diagnósticos e execuções.
- Redis + Celery: filas para scraping, análise de repositórios, agentes e pipelines.
- LangGraph/LangChain: orquestração de agentes e workflows.
- Python ML stack: pandas, scikit-learn, MLflow, DVC quando necessário.
- Docker: empacotamento e deploy.

## Domínios do produto

1. Clientes e projetos
2. Diagnóstico e maturidade
3. Mapa de processos OTE
4. Caixa de ferramentas do arquiteto
5. IA, agentes e providers
6. ML/MLOps e decisão de fine-tuning
7. GTM e growth
8. Kanban de entrega
9. Repositório/código opcional

## Regra de arquitetura

Código é evidência técnica. O ponto de partida é o negócio: processos, pessoas, dados, canais, operação, stack, IA e crescimento.

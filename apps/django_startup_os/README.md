# Startup AI OS · Django Stack

Stack robusta para transformar o protótipo em produto SaaS/local para consultores.

## Stack alvo

- Python + Django
- HTMX/Alpine para UI leve
- Postgres para dados principais
- Redis + Celery para filas
- LangGraph/LangChain para agentes
- Providers OpenAI/Gemini/Anthropic/OpenAI-compatible/local harness
- MLOps: MLflow/DVC opcional por projeto

## Rodar depois de instalar dependências

```bash
cd apps/django_startup_os
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver 127.0.0.1:8000
```

from django.http import JsonResponse

TOOLBOX = {
    'business': ['Business Model Canvas', 'Value Proposition Canvas', 'SWOT', 'Eisenhower'],
    'process': ['SIPOC', 'BPMN-lite', 'OTE map', 'SOP generator'],
    'ai': ['RAG', 'fine-tuning decision', 'local LLM', 'LangGraph agents'],
    'mlops': ['Python', 'MLflow', 'DVC', 'Celery pipelines'],
    'gtm': ['ICP', 'PUV', 'funnels', 'growth experiments'],
}

def toolbox_api(request):
    return JsonResponse({'ok': True, 'toolbox': TOOLBOX})

import json
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from .services.process_analyzer import analyze_processes

@csrf_exempt
def process_diagnosis_api(request):
    if request.method != 'POST':
        return JsonResponse({'ok': False, 'error': 'POST required'}, status=405)
    payload = json.loads(request.body or '{}')
    return JsonResponse({'ok': True, 'diagnostics': analyze_processes(payload.get('processes', []))})

import json
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from .services.kanban_builder import build_delivery_kanban

@csrf_exempt
def kanban_api(request):
    if request.method != 'POST':
        return JsonResponse({'ok': False, 'error': 'POST required'}, status=405)
    payload = json.loads(request.body or '{}')
    return JsonResponse({'ok': True, 'kanban': build_delivery_kanban(payload.get('objective', ''), payload.get('horizon', '90 dias'))})

from django.http import JsonResponse

PROVIDERS = ['offline', 'openai', 'gemini', 'anthropic', 'openai-compatible', 'local-harness']

def providers_api(request):
    return JsonResponse({'ok': True, 'providers': PROVIDERS})

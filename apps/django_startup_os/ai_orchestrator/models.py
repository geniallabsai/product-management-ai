from django.db import models
from projects.models import Engagement

class AIProvider(models.Model):
    provider = models.CharField(max_length=80)
    model = models.CharField(max_length=160, blank=True)
    base_url = models.URLField(blank=True)
    api_key_env = models.CharField(max_length=120, blank=True)
    is_active = models.BooleanField(default=True)

class AgentRun(models.Model):
    engagement = models.ForeignKey(Engagement, on_delete=models.CASCADE, related_name='agent_runs', null=True, blank=True)
    agent_name = models.CharField(max_length=120)
    prompt = models.TextField()
    result = models.TextField(blank=True)
    metadata = models.JSONField(default=dict)
    created_at = models.DateTimeField(auto_now_add=True)

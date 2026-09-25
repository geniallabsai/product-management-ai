from django.db import models
from projects.models import Engagement

class MLDecision(models.Model):
    engagement = models.ForeignKey(Engagement, on_delete=models.CASCADE, related_name='ml_decisions')
    should_use_ml = models.BooleanField(default=False)
    should_finetune = models.BooleanField(default=False)
    should_use_rag = models.BooleanField(default=True)
    local_ai_candidate = models.BooleanField(default=False)
    recommendation = models.JSONField(default=dict)

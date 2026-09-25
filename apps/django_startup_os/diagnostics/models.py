from django.db import models
from projects.models import Engagement

class BusinessDossier(models.Model):
    engagement = models.ForeignKey(Engagement, on_delete=models.CASCADE, related_name='dossiers')
    source = models.CharField(max_length=40, default='manual')
    maturity_score = models.DecimalField(max_digits=4, decimal_places=2, default=0)
    maturity_level = models.CharField(max_length=80, blank=True)
    content = models.JSONField(default=dict)
    markdown = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

class ProcessMap(models.Model):
    engagement = models.ForeignKey(Engagement, on_delete=models.CASCADE, related_name='process_maps')
    name = models.CharField(max_length=180)
    ote_layer = models.CharField(max_length=40, choices=[('operational','Operacional'),('tactical','Tático'),('strategic','Estratégico')])
    owner = models.CharField(max_length=120, blank=True)
    failure_modes = models.JSONField(default=list)
    ai_opportunity = models.TextField(blank=True)
    metric = models.CharField(max_length=120, blank=True)

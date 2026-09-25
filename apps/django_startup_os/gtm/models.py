from django.db import models
from projects.models import Engagement

class GTMPlan(models.Model):
    engagement = models.ForeignKey(Engagement, on_delete=models.CASCADE, related_name='gtm_plans')
    icp = models.TextField(blank=True)
    offer = models.TextField(blank=True)
    channels = models.JSONField(default=list)
    objections = models.JSONField(default=list)
    experiments = models.JSONField(default=list)

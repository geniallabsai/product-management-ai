from django.db import models
from clients.models import Client

class Engagement(models.Model):
    client = models.ForeignKey(Client, on_delete=models.CASCADE, related_name='engagements')
    name = models.CharField(max_length=180)
    objective = models.TextField(blank=True)
    horizon = models.CharField(max_length=80, default='90 dias')
    status = models.CharField(max_length=40, default='discovery')
    budget = models.CharField(max_length=120, blank=True)
    team = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

class Deliverable(models.Model):
    engagement = models.ForeignKey(Engagement, on_delete=models.CASCADE, related_name='deliverables')
    title = models.CharField(max_length=180)
    description = models.TextField(blank=True)
    owner = models.CharField(max_length=120, blank=True)
    due_date = models.DateField(null=True, blank=True)
    status = models.CharField(max_length=40, default='backlog')

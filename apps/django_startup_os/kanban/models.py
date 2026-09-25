from django.db import models
from projects.models import Engagement

class KanbanCard(models.Model):
    engagement = models.ForeignKey(Engagement, on_delete=models.CASCADE, related_name='kanban_cards')
    lane = models.CharField(max_length=40, default='backlog')
    title = models.CharField(max_length=180)
    description = models.TextField(blank=True)
    owner = models.CharField(max_length=120, blank=True)
    priority = models.CharField(max_length=40, default='medium')
    order = models.PositiveIntegerField(default=0)

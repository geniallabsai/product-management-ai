from django.db import models

class ToolDefinition(models.Model):
    domain = models.CharField(max_length=80)
    name = models.CharField(max_length=140)
    purpose = models.TextField()
    when_to_use = models.TextField(blank=True)
    default_stack = models.JSONField(default=list)

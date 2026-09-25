from django.db import models

class Client(models.Model):
    name = models.CharField(max_length=180)
    company_type = models.CharField(max_length=80, blank=True)
    industry = models.CharField(max_length=120, blank=True)
    website = models.URLField(blank=True)
    instagram = models.URLField(blank=True)
    linkedin = models.URLField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

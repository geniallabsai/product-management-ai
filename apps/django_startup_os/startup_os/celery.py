import os
from celery import Celery
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'startup_os.settings')
app = Celery('startup_os')
app.config_from_object('django.conf:settings', namespace='CELERY')
app.autodiscover_tasks()

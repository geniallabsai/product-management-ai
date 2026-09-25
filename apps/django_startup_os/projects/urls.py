from django.urls import path
from .views import kanban_api
urlpatterns = [path('kanban/', kanban_api, name='kanban_api')]

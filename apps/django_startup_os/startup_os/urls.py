from django.contrib import admin
from django.urls import path, include
from core.views import home

urlpatterns = [
    path('', home, name='home'),
    path('admin/', admin.site.urls),
    path('diagnostics/', include('diagnostics.urls')),
    path('projects/', include('projects.urls')),
    path('ai/', include('ai_orchestrator.urls')),
    path('toolbox/', include('toolbox.urls')),
]

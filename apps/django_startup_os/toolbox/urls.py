from django.urls import path
from .views import toolbox_api
urlpatterns = [path('', toolbox_api, name='toolbox_api')]

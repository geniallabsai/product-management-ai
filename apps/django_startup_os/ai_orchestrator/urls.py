from django.urls import path
from .views import providers_api
urlpatterns = [path('providers/', providers_api, name='providers_api')]

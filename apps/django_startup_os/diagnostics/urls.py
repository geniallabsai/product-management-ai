from django.urls import path
from .views import process_diagnosis_api
urlpatterns = [path('processes/', process_diagnosis_api, name='process_diagnosis_api')]

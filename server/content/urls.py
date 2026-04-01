from django.urls import path
from . import views

urlpatterns = [
    path('service-area/', views.service_area_detail),
    path('service-area/check/', views.service_area_check),
]

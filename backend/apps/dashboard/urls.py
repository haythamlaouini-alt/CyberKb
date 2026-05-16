from django.urls import path
from . import views

urlpatterns = [
    path('', views.admin_dashboard, name='admin-dashboard'),
    path('me/', views.learner_dashboard, name='learner-dashboard'),
]
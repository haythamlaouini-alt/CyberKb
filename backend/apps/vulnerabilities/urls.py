from django.urls import path
from . import views

urlpatterns = [
    path('', views.VulnerabilityListView.as_view(), name='vulnerability-list'),
    path('categories/', views.VulnerabilityCategoryListView.as_view(), name='vuln-categories'),
    path('<slug:slug>/', views.VulnerabilityDetailView.as_view(), name='vulnerability-detail'),
]
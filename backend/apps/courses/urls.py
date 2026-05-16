from django.urls import path
from . import views

urlpatterns = [
    path('', views.CourseListView.as_view(), name='course-list'),
    path('<slug:slug>/', views.CourseDetailView.as_view(), name='course-detail'),
    path('<slug:slug>/modules/', views.ModuleListView.as_view(), name='module-list'),
    path('<slug:slug>/enroll/', views.enroll_course, name='course-enroll'),
    path('modules/<int:pk>/', views.ModuleDetailView.as_view(), name='module-detail'),
    path('modules/<int:pk>/complete/', views.complete_module, name='module-complete'),
]